process.env.NODE_ENV = "test";
process.env.RATE_LIMIT_MAX = "10000";
import "dotenv/config";
import { prisma } from "../lib/prisma.js";

function calculatePercentiles(samples) {
  if (samples.length === 0) return { min: 0, p50: 0, p95: 0, max: 0, avg: 0 };
  const sorted = [...samples].sort((a, b) => a - b);
  const p50Index = Math.floor(sorted.length * 0.5);
  const p95Index = Math.min(Math.floor(sorted.length * 0.95), sorted.length - 1);
  const sum = sorted.reduce((acc, v) => acc + v, 0);

  return {
    min: Number(sorted[0].toFixed(2)),
    p50: Number(sorted[p50Index].toFixed(2)),
    p95: Number(sorted[p95Index].toFixed(2)),
    max: Number(sorted[sorted.length - 1].toFixed(2)),
    avg: Number((sum / sorted.length).toFixed(2)),
  };
}

async function benchmarkEndpoint(baseUrl, cookie, method, path, iterations = 30) {
  const samples = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        Cookie: cookie,
        "Content-Type": "application/json",
      },
    });
    const duration = performance.now() - start;
    if (!res.ok && res.status !== 200 && res.status !== 201) {
      const text = await res.text();
      throw new Error(`Endpoint ${path} failed with status ${res.status}: ${text}`);
    }
    await res.json();
    samples.push(duration);
  }
  return calculatePercentiles(samples);
}

export async function runBenchmark(iterations = 30) {
  const { default: app } = await import("../app.js");
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  console.log(`\n======================================================`);
  console.log(`Starting FocusFlow API Benchmark (${iterations} iterations per endpoint)`);
  console.log(`Server bound to: ${baseUrl}`);
  console.log(`======================================================\n`);

  // Create isolated benchmark user
  const benchmarkEmail = `perf_${Date.now()}@focusflow.test`;
  const signupRes = await fetch(`${baseUrl}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Benchmark Student",
      email: benchmarkEmail,
      password: "StrongPassword123!",
    }),
  });

  const cookie = signupRes.headers.get("set-cookie")?.split(";")[0] || "";
  const userData = await signupRes.json();
  const userId = userData.user.id;

  // Seed standard realistic workspace: 5 subjects, 25 topics, 40 sessions
  const createdSubjects = [];
  for (let s = 1; s <= 5; s++) {
    const sub = await prisma.subject.create({
      data: {
        name: `Subject ${s}`,
        code: `SUB${s}01`,
        color: "#3b82f6",
        userId,
      },
    });
    createdSubjects.push(sub);

    for (let t = 1; t <= 5; t++) {
      const topic = await prisma.topic.create({
        data: {
          name: `Topic ${s}.${t}`,
          status: t % 2 === 0 ? "in-progress" : "completed",
          subjectId: sub.id,
          nextRevision: new Date(Date.now() + (t - 2) * 86400000),
          repetitions: t,
          intervalDays: t * 2,
          easeFactor: 2.5,
        },
      });

      // add revisions
      await prisma.topicRevision.create({
        data: {
          topicId: topic.id,
          rating: "GOOD",
          intervalAfter: t * 2,
          repetitionsAfter: t,
        },
      });
    }
  }

  // Seed study sessions
  for (let d = 0; d < 40; d++) {
    const dayOffset = (d - 20) * 86400000;
    const dateStr = new Date(Date.now() + dayOffset).toISOString().split("T")[0];
    const sub = createdSubjects[d % createdSubjects.length];

    await prisma.studySession.create({
      data: {
        title: `Study Session ${d + 1}`,
        date: new Date(`${dateStr}T00:00:00.000Z`),
        startTime: "09:00",
        endTime: "10:30",
        duration: 90,
        status: d < 30 ? "completed" : "upcoming",
        actualDurationSeconds: d < 30 ? 5400 : null,
        completedAt: d < 30 ? new Date(Date.now() + dayOffset + 5400000) : null,
        userId,
        subjectId: sub.id,
      },
    });
  }

  console.log(`Seeded isolated test data for benchmark: User ID = ${userId}`);

  const endpoints = [
    { name: "GET /api/user (Profile Details)", path: "/api/user" },
    { name: "GET /api/subject (Subjects + Topics + Revisions)", path: "/api/subject" },
    { name: "GET /api/topics (All User Topics)", path: "/api/topics" },
    { name: "GET /api/session (All Study Sessions)", path: "/api/session" },
    { name: "GET /api/session/focus/active (Active Focus Session Recovery)", path: "/api/session/focus/active" },
  ];

  const results = {};

  for (const ep of endpoints) {
    process.stdout.write(`Benchmarking ${ep.name}... `);
    const stats = await benchmarkEndpoint(baseUrl, cookie, "GET", ep.path, iterations);
    results[ep.name] = stats;
    console.log(`p50: ${stats.p50}ms | p95: ${stats.p95}ms | min: ${stats.min}ms | max: ${stats.max}ms`);
  }

  // Clean up benchmark user and relations
  await prisma.user.delete({ where: { id: userId } });
  server.close();

  console.log(`\n======================================================`);
  console.log(`Benchmark Summary Table:`);
  console.table(results);
  console.log(`======================================================\n`);

  return results;
}

if (process.argv[1]?.endsWith("benchmarkBaseline.js")) {
  runBenchmark(40)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Benchmark failed:", err);
      process.exit(1);
    });
}
