import "dotenv/config";
import { prisma } from "../lib/prisma.js";

async function runExplain() {
  console.log("Setting up scale test fixture for EXPLAIN ANALYZE profiling...");

  // Create isolated user for scale testing
  const scaleUser = await prisma.user.create({
    data: {
      name: "Scale Benchmark User",
      email: `scale_user_${Date.now()}@focusflow.test`,
      passwordHash: "dummyHash",
    },
  });
  const userId = scaleUser.id;

  try {
    // 10 subjects
    const subjectData = [];
    for (let i = 1; i <= 10; i++) {
      subjectData.push({
        name: `Scale Subject ${i}`,
        code: `CS${i}00`,
        color: "#3b82f6",
        userId,
      });
    }
    await prisma.subject.createMany({ data: subjectData });
    const subjects = await prisma.subject.findMany({ where: { userId }, select: { id: true } });

    // 300 topics
    const topicData = [];
    const now = new Date();
    for (let i = 1; i <= 300; i++) {
      const sub = subjects[i % subjects.length];
      const nextRev = new Date(now.getTime() + (i % 30 - 15) * 86400000); // half due, half future
      topicData.push({
        name: `Scale Topic ${i}`,
        status: i % 3 === 0 ? "completed" : "in-progress",
        subjectId: sub.id,
        nextRevision: nextRev,
        repetitions: i % 6,
        intervalDays: (i % 6) * 3,
        easeFactor: 2.5,
      });
    }
    await prisma.topic.createMany({ data: topicData });
    const topics = await prisma.topic.findMany({
      where: { subject: { userId } },
      select: { id: true, subjectId: true },
    });

    // 2,000 revisions
    const revisionData = [];
    for (let i = 1; i <= 2000; i++) {
      const top = topics[i % topics.length];
      revisionData.push({
        topicId: top.id,
        rating: "GOOD",
        intervalAfter: 3,
        repetitionsAfter: 2,
        reviewedAt: new Date(now.getTime() - (i % 60) * 86400000),
      });
    }
    await prisma.topicRevision.createMany({ data: revisionData });

    // 5,000 historical study sessions
    const sessionData = [];
    const statuses = ["completed", "completed", "completed", "cancelled", "upcoming"];
    for (let i = 1; i <= 5000; i++) {
      const top = topics[i % topics.length];
      const status = statuses[i % statuses.length];
      const dayOffset = (i % 120 - 60) * 86400000;
      const d = new Date(now.getTime() + dayOffset);
      const dateOnly = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

      sessionData.push({
        title: `Scale Session ${i}`,
        date: dateOnly,
        startTime: "10:00",
        endTime: "11:30",
        duration: 90,
        status,
        actualDurationSeconds: status === "completed" ? 5400 : null,
        completedAt: status === "completed" ? new Date(d.getTime() + 5400000) : null,
        userId,
        subjectId: top.subjectId,
        topicId: top.id,
      });
    }

    // Insert in batches of 1000
    for (let b = 0; b < sessionData.length; b += 1000) {
      await prisma.studySession.createMany({
        data: sessionData.slice(b, b + 1000),
      });
    }

    console.log(`Successfully seeded fixture: 10 subjects, 300 topics, 2,000 revisions, 5,000 sessions.`);

    console.log("\n-----------------------------------------------------------");
    console.log("QUERY 1: Active Focus Session Recovery");
    console.log("WHERE userId = $1 AND status IN ('in-progress', 'paused') ORDER BY startedAt ASC LIMIT 1");
    const q1 = await prisma.$queryRawUnsafe(`
      EXPLAIN (ANALYZE, BUFFERS)
      SELECT "id", "title", "status", "activeDurationSeconds", "startedAt"
      FROM "StudySession"
      WHERE "userId" = '${userId}' AND "status" IN ('in-progress', 'paused')
      ORDER BY "startedAt" ASC
      LIMIT 1;
    `);
    q1.forEach((row) => console.log(row["QUERY PLAN"]));

    console.log("\n-----------------------------------------------------------");
    console.log("QUERY 2: Date-Range Planner Query");
    console.log("WHERE userId = $1 AND date >= $2 AND date <= $3 ORDER BY date ASC, startTime ASC");
    const q2 = await prisma.$queryRawUnsafe(`
      EXPLAIN (ANALYZE, BUFFERS)
      SELECT "id", "title", "date", "startTime", "endTime", "status"
      FROM "StudySession"
      WHERE "userId" = '${userId}' AND "date" >= '${new Date(now.getTime() - 7 * 86400000).toISOString().split("T")[0]}' AND "date" <= '${now.toISOString().split("T")[0]}'
      ORDER BY "date" ASC, "startTime" ASC;
    `);
    q2.forEach((row) => console.log(row["QUERY PLAN"]));

    console.log("\n-----------------------------------------------------------");
    console.log("QUERY 3: Revision Queue (Due Topics)");
    console.log("WHERE subjectId IN (...) AND nextRevision <= NOW() ORDER BY nextRevision ASC");
    const q3 = await prisma.$queryRawUnsafe(`
      EXPLAIN (ANALYZE, BUFFERS)
      SELECT "Topic"."id", "Topic"."name", "Topic"."nextRevision"
      FROM "Topic"
      JOIN "Subject" ON "Topic"."subjectId" = "Subject"."id"
      WHERE "Subject"."userId" = '${userId}' AND "Topic"."nextRevision" <= NOW()
      ORDER BY "Topic"."nextRevision" ASC;
    `);
    q3.forEach((row) => console.log(row["QUERY PLAN"]));

    console.log("\n-----------------------------------------------------------");
    console.log("QUERY 4: Completed Sessions for Analytics Aggregation");
    console.log("WHERE userId = $1 AND status = 'completed'");
    const q4 = await prisma.$queryRawUnsafe(`
      EXPLAIN (ANALYZE, BUFFERS)
      SELECT COUNT(*), SUM("actualDurationSeconds")
      FROM "StudySession"
      WHERE "userId" = '${userId}' AND "status" = 'completed';
    `);
    q4.forEach((row) => console.log(row["QUERY PLAN"]));

  } finally {
    console.log("\nCleaning up scale user...");
    await prisma.user.delete({ where: { id: userId } });
    console.log("Cleanup complete.");
  }
}

runExplain()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Explain failed:", err);
    process.exit(1);
  });
