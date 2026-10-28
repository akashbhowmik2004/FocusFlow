import "dotenv/config";
import app from "../app.js";

async function runTests() {
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`Test server running at ${baseUrl}`);

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

  try {
    // Test 1: GET /api/auth/me without auth should return 401
    const unauthRes = await fetch(`${baseUrl}/api/auth/me`);
    const unauthData = await unauthRes.json();
    assert(
      unauthRes.status === 401 && unauthData.message.includes("Authentication required"),
      "GET /api/auth/me without auth returns 401 Unauthorized"
    );

    // Test 2: POST /api/auth/login with wrong password should return 401
    const wrongLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nonexistent@focusflow.test", password: "wrongpassword" }),
    });
    assert(wrongLoginRes.status === 401, "POST /api/auth/login with invalid email returns 401");

    // Test 3: Sign up a new test user
    const testEmail = `tester_${Date.now()}@focusflow.test`;
    const signupRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Student",
        email: testEmail,
        password: "securePassword123!",
      }),
    });
    const signupData = await signupRes.json();
    assert(signupRes.status === 201 && signupData.user.email === testEmail, "POST /api/auth/signup creates account");

    const cookieHeader = signupRes.headers.get("set-cookie");
    assert(cookieHeader && cookieHeader.includes("token="), "Signup sets auth token cookie");

    // Test 4: Access protected route with the cookie from signup
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: cookieHeader },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200 && meData.user.email === testEmail, "GET /api/auth/me with cookie returns user profile");

    // Test 5: Login with the registered test user
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "securePassword123!",
      }),
    });
    const loginData = await loginRes.json();
    const loginCookie = loginRes.headers.get("set-cookie");
    assert(
      loginRes.status === 200 && loginData.user.email === testEmail && loginCookie.includes("token="),
      "POST /api/auth/login succeeds with correct password and sets cookie"
    );

    // Test 6: Logout
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: loginCookie },
    });
    const logoutCookie = logoutRes.headers.get("set-cookie");
    assert(
      logoutRes.status === 200 && logoutCookie.includes("Max-Age=0") || logoutCookie.includes("Expires="),
      "POST /api/auth/logout clears auth cookie"
    );

    // Test 7: Google auth initiation redirect
    const googleAuthRes = await fetch(`${baseUrl}/api/auth/google`, {
      redirect: "manual",
    });
    const redirectLocation = googleAuthRes.headers.get("location");
    assert(
      googleAuthRes.status === 302 && redirectLocation.includes("accounts.google.com/o/oauth2/v2/auth"),
      "GET /api/auth/google initiates Google OAuth redirect with OAuth URL"
    );
    assert(
      redirectLocation.includes("client_id=612528180490-vvgtuspq96ssae1uf1lrqo6i15pdohj9"),
      "Google OAuth URL contains GOOGLE_CLIENT_ID"
    );

    console.log(`\nResults: ${testPassed} passed, ${testFailed} failed.`);
  } catch (error) {
    console.error("Test execution error:", error);
    testFailed++;
  } finally {
    server.close();
    const { prisma } = await import("../lib/prisma.js");
    await prisma.$disconnect();
    process.exit(testFailed === 0 ? 0 : 1);
  }
}

runTests();
