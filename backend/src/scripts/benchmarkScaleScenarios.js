process.env.NODE_ENV = "test";
process.env.RATE_LIMIT_MAX = "100000";
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

async function benchmarkReq(baseUrl, cookie, path, iterations = 20) {
  const samples = [];
  let byteSize = 0;
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const res = await fetch(`${baseUrl}${path}`, {
      headers: { Cookie: cookie },
    });
    const duration = performance.now() - start;
    if (!res.ok) {
      throw new Error(`Request to ${path} failed with status ${res.status}`);
    }
    const buf = await res.arrayBuffer();
    if (i === 0) byteSize = buf.byteLength;
    samples.push(duration);
  }
  const stats = calculatePercentiles(samples);
  stats.payloadKB = Number((byteSize / 1024).toFixed(2));
  return stats;
}

export async function runScaleScenarios() {
  const { default: app } = await import("../app.js");
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  console.log(`\n================================================================`);
  console.log(`FocusFlow Academic Scale Benchmark Runner`);
  console.log(`Server bound to: ${baseUrl}`);
  console.log(`================================================================\n`);

  const scenarios = [
    { name: "Scenario 1 (Light): 5 subjects, 50 topics, 100 sessions, 50 revisions", subjects: 5, topics: 50, sessions: 100, revisions: 50 },
    { name: "Scenario 2 (Medium): 10 subjects, 300 topics, 500 sessions, 250 revisions", subjects: 10, topics: 300, sessions: 500, revisions: 250 },
    { name: "Scenario 3 (Heavy/Large): 20 subjects, 1,000 topics, 5,000 sessions, 2,000 revisions", subjects: 20, topics: 1000, sessions: 5000, revisions: 2000 },
  ];

  const overallResults = {};

  for (const sc of scenarios) {
    console.log(`\n>>> Preparing ${sc.name}...`);
    const email = `scale_${Date.now()}_${sc.subjects}@focusflow.test`;
    const signupRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `Student ${sc.subjects}`,
        email,
        password: "SecurePassword123!",
      }),
    });
    const cookie = signupRes.headers.get("set-cookie")?.split(";")[0] || "";
    const userData = await signupRes.json();
    const userId = userData.user.id;

    // 1. Create subjects
    const subCreates = [];
    for (let s = 1; s <= sc.subjects; s++) {
      subCreates.push({
        name: `Course ${s}`,
        code: `CRS${s}`,
        color: "#3b82f6",
        userId,
      });
    }
    await prisma.subject.createMany({ data: subCreates });
    const createdSubs = await prisma.subject.findMany({ where: { userId }, select: { id: true } });

    // 2. Create topics
    const topicCreates = [];
    const now = new Date();
    for (let t = 1; t <= sc.topics; t++) {
      const sub = createdSubs[t % createdSubs.length];
      topicCreates.push({
        name: `Syllabus Topic ${t}`,
        status: t % 3 === 0 ? "completed" : t % 3 === 1 ? "in-progress" : "not-started",
        subjectId: sub.id,
        nextRevision: new Date(now.getTime() + ((t % 20) - 5) * 86400000),
        repetitions: t % 5,
        intervalDays: (t % 5) * 3,
        easeFactor: 2.5,
      });
    }
    // Batch in chunks of 500
    for (let i = 0; i < topicCreates.length; i += 500) {
      await prisma.topic.createMany({ data: topicCreates.slice(i, i + 500) });
    }
    const createdTopics = await prisma.topic.findMany({
      where: { subject: { userId } },
      select: { id: true, subjectId: true },
    });

    // 3. Create revisions
    const revCreates = [];
    for (let r = 1; r <= sc.revisions; r++) {
      const top = createdTopics[r % createdTopics.length];
      revCreates.push({
        topicId: top.id,
        rating: "GOOD",
        intervalAfter: 4,
        repetitionsAfter: 2,
        reviewedAt: new Date(now.getTime() - (r % 60) * 86400000),
      });
    }
    for (let i = 0; i < revCreates.length; i += 500) {
      await prisma.topicRevision.createMany({ data: revCreates.slice(i, i + 500) });
    }

    // 4. Create study sessions
    const sessCreates = [];
    for (let ss = 1; ss <= sc.sessions; ss++) {
      const top = createdTopics[ss % createdTopics.length];
      const d = new Date(now.getTime() - (ss % 120) * 86400000);
      const isComp = ss % 4 !== 0;
      sessCreates.push({
        title: `Study Session ${ss}`,
        date: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())),
        startTime: "14:00",
        endTime: "15:00",
        duration: 60,
        status: isComp ? "completed" : "upcoming",
        actualDurationSeconds: isComp ? 3600 : null,
        completedAt: isComp ? new Date(d.getTime() + 3600000) : null,
        userId,
        subjectId: top.subjectId,
        topicId: top.id,
      });
    }
    for (let i = 0; i < sessCreates.length; i += 1000) {
      await prisma.studySession.createMany({ data: sessCreates.slice(i, i + 1000) });
    }

    console.log(`Seeded: ${sc.subjects} subjects, ${sc.topics} topics, ${sc.revisions} revisions, ${sc.sessions} sessions.`);

    const scenarioStats = {};
    const endpoints = [
      { name: "GET /api/user", path: "/api/user" },
      { name: "GET /api/subject", path: "/api/subject" },
      { name: "GET /api/topics", path: "/api/topics" },
      { name: "GET /api/session", path: "/api/session" },
      { name: "GET /api/session/focus/active", path: "/api/session/focus/active" },
    ];

    for (const ep of endpoints) {
      process.stdout.write(`Benchmarking ${ep.name}... `);
      const stats = await benchmarkReq(baseUrl, cookie, ep.path, 15);
      scenarioStats[ep.name] = stats;
      console.log(`p50: ${stats.p50}ms | p95: ${stats.p95}ms | payload: ${stats.payloadKB} KB`);
    }

    overallResults[sc.name] = scenarioStats;

    // Cleanup user
    await prisma.user.delete({ where: { id: userId } });
    console.log(`Cleaned up user for ${sc.name}.`);
  }

  server.close();

  console.log(`\n================================================================`);
  console.log(`All Workloads Finished. Overall Results:`);
  console.log(JSON.stringify(overallResults, null, 2));
  console.log(`================================================================\n`);

  return overallResults;
}

runScaleScenarios()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Scale benchmark error:", err);
    process.exit(1);
  });
