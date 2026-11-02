import "dotenv/config";
import express from "express";
import { rateLimit } from "express-rate-limit";
import { generalRateLimiter, authRateLimiter, createCustomRateLimiter } from "../middleware/rateLimit.middleware.js";
import app from "../app.js";

async function runRateLimitTests() {
  console.log("Starting backend rate limit tests...");
  let testPassed = 0;
  let testFailed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      testPassed++;
    } else {
      console.error(`[FAIL] ${message}`);
      testFailed++;
    }
  }

  // Test 1: Verify rate limiting headers on live app
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    const res = await fetch(`${baseUrl}/api/health`);
    assert(res.status === 200, "GET /api/health succeeds through generalRateLimiter");
    const hasRateLimitHeader =
      res.headers.has("ratelimit-limit") ||
      res.headers.has("ratelimit-remaining") ||
      res.headers.has("ratelimit-reset") ||
      res.headers.has("ratelimit");
    assert(hasRateLimitHeader, "Rate limit standard headers are included on responses");
  } finally {
    server.close();
  }

  // Test 2: Verify custom rate limiter enforces 429 on exceeding limit
  const testApp = express();
  const testLimiter = createCustomRateLimiter({
    windowMs: 5000,
    max: 2,
    message: "Custom limit reached: Please slow down.",
  });
  testApp.use("/api/test-limit", testLimiter, (req, res) => res.json({ ok: true }));

  const testServer = testApp.listen(0);
  const testUrl = `http://localhost:${testServer.address().port}/api/test-limit`;

  try {
    const req1 = await fetch(testUrl);
    assert(req1.status === 200, "1st request within limit succeeds with 200");

    const req2 = await fetch(testUrl);
    assert(req2.status === 200, "2nd request within limit succeeds with 200");

    const req3 = await fetch(testUrl);
    assert(req3.status === 429, "3rd request exceeding limit returns 429 Too Many Requests");

    const retryAfter = req3.headers.get("retry-after");
    assert(!!retryAfter && parseInt(retryAfter, 10) > 0, "429 response contains Retry-After header in seconds");

    const body = await req3.json();
    assert(
      body.status === 429 &&
        body.retryAfter > 0 &&
        body.message.includes("Custom limit reached"),
      "429 response body contains status 429, retryAfter, and descriptive message"
    );
  } finally {
    testServer.close();
  }

  console.log(`\nRate limit test results: ${testPassed} passed, ${testFailed} failed.`);
  if (testFailed > 0) {
    process.exit(1);
  }
}

runRateLimitTests();
