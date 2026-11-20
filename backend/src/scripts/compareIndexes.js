import "dotenv/config";
import { prisma } from "../lib/prisma.js";

async function compareWithIndexes() {
  console.log("Setting up scale test fixture to test candidate indexes...");

  const scaleUser = await prisma.user.create({
    data: {
      name: "Index Benchmark User",
      email: `idx_user_${Date.now()}@focusflow.test`,
      passwordHash: "dummyHash",
    },
  });
  const userId = scaleUser.id;

  try {
    // 10 subjects
    const subjectData = [];
    for (let i = 1; i <= 10; i++) {
      subjectData.push({
        name: `Idx Subject ${i}`,
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
      const nextRev = new Date(now.getTime() + (i % 30 - 15) * 86400000);
      topicData.push({
        name: `Idx Topic ${i}`,
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
        title: `Idx Session ${i}`,
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

    for (let b = 0; b < sessionData.length; b += 1000) {
      await prisma.studySession.createMany({
        data: sessionData.slice(b, b + 1000),
      });
    }

    // Baseline before index
    console.log("\n--- BEFORE ADDING CANDIDATE INDEX ---");
    const beforeSession = await prisma.$queryRawUnsafe(`
      EXPLAIN (ANALYZE, BUFFERS)
      SELECT COUNT(*), SUM("actualDurationSeconds")
      FROM "StudySession"
      WHERE "userId" = '${userId}' AND "status" = 'completed';
    `);
    beforeSession.forEach((r) => console.log(r["QUERY PLAN"]));

    // Create candidate index
    console.log("\nCreating candidate compound index: StudySession(userId, status, date)...");
    await prisma.$executeRawUnsafe(`
      CREATE INDEX "StudySession_userId_status_date_idx" ON "StudySession" ("userId", "status", "date");
    `);

    // Create topic nextRevision index
    console.log("Creating candidate index: Topic(nextRevision)...");
    await prisma.$executeRawUnsafe(`
      CREATE INDEX "Topic_nextRevision_idx" ON "Topic" ("nextRevision");
    `);

    console.log("\n--- AFTER ADDING CANDIDATE INDEX: StudySession ---");
    const afterSession = await prisma.$queryRawUnsafe(`
      EXPLAIN (ANALYZE, BUFFERS)
      SELECT COUNT(*), SUM("actualDurationSeconds")
      FROM "StudySession"
      WHERE "userId" = '${userId}' AND "status" = 'completed';
    `);
    afterSession.forEach((r) => console.log(r["QUERY PLAN"]));

    console.log("\n--- AFTER ADDING CANDIDATE INDEX: Topic nextRevision ---");
    const afterTopic = await prisma.$queryRawUnsafe(`
      EXPLAIN (ANALYZE, BUFFERS)
      SELECT "Topic"."id", "Topic"."name", "Topic"."nextRevision"
      FROM "Topic"
      JOIN "Subject" ON "Topic"."subjectId" = "Subject"."id"
      WHERE "Subject"."userId" = '${userId}' AND "Topic"."nextRevision" <= NOW()
      ORDER BY "Topic"."nextRevision" ASC;
    `);
    afterTopic.forEach((r) => console.log(r["QUERY PLAN"]));

    // Cleanup candidate indexes
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "StudySession_userId_status_date_idx";`);
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "Topic_nextRevision_idx";`);

  } finally {
    console.log("\nCleaning up scale user...");
    await prisma.user.delete({ where: { id: userId } });
    console.log("Cleanup complete.");
  }
}

compareWithIndexes()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
