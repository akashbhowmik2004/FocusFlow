import test, { describe, before, after } from "node:test";
import assert from "node:assert/strict";
import "dotenv/config";
import app from "../app.js";
import { prisma } from "../lib/prisma.js";

let server;
let baseUrl;
let user1Cookie;
let user2Cookie;
let user1Id;
let user2Id;
let user1SubjectId;
let user2SubjectId;

before(async () => {
  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;

  // Create User 1
  const email1 = `rev_user1_${Date.now()}@focusflow.test`;
  const res1 = await fetch(`${baseUrl}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Revision Tester 1",
      email: email1,
      password: "Password123!",
    }),
  });
  user1Cookie = res1.headers.get("set-cookie");
  const data1 = await res1.json();
  user1Id = data1.user.id;

  // Create User 2
  const email2 = `rev_user2_${Date.now()}@focusflow.test`;
  const res2 = await fetch(`${baseUrl}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Revision Tester 2",
      email: email2,
      password: "Password123!",
    }),
  });
  user2Cookie = res2.headers.get("set-cookie");
  const data2 = await res2.json();
  user2Id = data2.user.id;

  // Create Subject for User 1
  const sub1 = await prisma.subject.create({
    data: {
      name: "Computer Architecture",
      userId: user1Id,
    },
  });
  user1SubjectId = sub1.id;

  // Create Subject for User 2
  const sub2 = await prisma.subject.create({
    data: {
      name: "Organic Chemistry",
      userId: user2Id,
    },
  });
  user2SubjectId = sub2.id;
});

after(async () => {
  server.close();
  // Clean up test data
  if (user1Id) {
    await prisma.user.delete({ where: { id: user1Id } }).catch(() => {});
  }
  if (user2Id) {
    await prisma.user.delete({ where: { id: user2Id } }).catch(() => {});
  }
  await prisma.$disconnect();
});

describe("Spaced Repetition Revision API (POST /api/topics/:id/revisions)", () => {
  test("1. Successful revision with AGAIN resets repetition cycle and schedules next day", async () => {
    // Create topic with existing repetition history
    const topic = await prisma.topic.create({
      data: {
        name: "Cache Coherence Protocols",
        subjectId: user1SubjectId,
        repetitions: 3,
        intervalDays: 8,
        easeFactor: 2.5,
      },
    });

    const res = await fetch(`${baseUrl}/api/topics/${topic.id}/revisions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: user1Cookie,
      },
      body: JSON.stringify({ rating: "AGAIN" }),
    });

    assert.equal(res.status, 201);
    const body = await res.json();

    assert.equal(body.message, "Revision saved successfully");
    assert.equal(body.topic.id, topic.id);
    assert.equal(body.topic.repetitions, 0);
    assert.equal(body.topic.intervalDays, 1);
    assert.equal(body.topic.easeFactor, 1.7);
    assert.equal(
      body.topic.scheduleType,
      undefined,
      "scheduleType is not hardcoded when not in database",
    );
    assert.ok(body.topic.lastRevised);
    assert.ok(body.topic.nextRevision);

    assert.equal(body.revision.rating, "AGAIN");
    assert.equal(body.revision.previousInterval, 8);
    assert.equal(body.revision.intervalAfter, 1);
    assert.ok(body.revision.nextRevisionAt);

    // Verify DB state
    const dbTopic = await prisma.topic.findUnique({ where: { id: topic.id } });
    assert.equal(dbTopic.repetitions, 0);
    assert.equal(dbTopic.intervalDays, 1);
    assert.equal(dbTopic.easeFactor, 1.7);

    const dbRevisions = await prisma.topicRevision.findMany({
      where: { topicId: topic.id },
    });
    assert.equal(dbRevisions.length, 1);
    assert.equal(dbRevisions[0].rating, "AGAIN");
    assert.equal(dbRevisions[0].source, "RECALL_ASSESSMENT");
    assert.equal(dbRevisions[0].previousInterval, 8);
    assert.equal(dbRevisions[0].intervalAfter, 1);
    assert.equal(dbRevisions[0].repetitionsAfter, 0);
  });

  test("2. Successful revision with HARD increases interval cautiously", async () => {
    const topic = await prisma.topic.create({
      data: {
        name: "Branch Prediction",
        subjectId: user1SubjectId,
        repetitions: 1,
        intervalDays: 3,
        easeFactor: 2.5,
      },
    });

    const res = await fetch(`${baseUrl}/api/topics/${topic.id}/revisions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: user1Cookie,
      },
      body: JSON.stringify({ rating: "HARD" }),
    });

    assert.equal(res.status, 201);
    const body = await res.json();

    assert.equal(body.topic.repetitions, 2);
    // Math.max(1, Math.ceil(3 * 1.2)) = 4
    assert.equal(body.topic.intervalDays, 4);
    assert.equal(body.topic.easeFactor, 2.36);
    assert.equal(body.revision.rating, "HARD");
    assert.equal(body.revision.previousInterval, 3);
    assert.equal(body.revision.intervalAfter, 4);

    // Verify DB persistence: exactly one TopicRevision created
    const dbRevisions = await prisma.topicRevision.findMany({
      where: { topicId: topic.id },
    });
    assert.equal(
      dbRevisions.length,
      1,
      "Successful review creates exactly one TopicRevision record",
    );
    assert.equal(dbRevisions[0].intervalAfter, 4);
  });

  test("3. Successful revision with GOOD follows progressive spaced intervals (1 -> 3 -> 8)", async () => {
    const topic = await prisma.topic.create({
      data: {
        name: "Pipelining & Hazards",
        subjectId: user1SubjectId,
        repetitions: 0,
        intervalDays: 0,
        easeFactor: 2.5,
      },
    });

    // 1st revision with GOOD
    const res1 = await fetch(`${baseUrl}/api/topics/${topic.id}/revisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user1Cookie },
      body: JSON.stringify({ rating: "GOOD" }),
    });
    assert.equal(res1.status, 201);
    const body1 = await res1.json();
    assert.equal(body1.topic.repetitions, 1);
    assert.equal(body1.topic.intervalDays, 1);
    assert.equal(body1.revision.previousInterval, 0);
    assert.equal(body1.revision.intervalAfter, 1);

    const count1 = await prisma.topicRevision.count({
      where: { topicId: topic.id },
    });
    assert.equal(count1, 1, "Exactly one revision record after first review");

    // 2nd revision with GOOD
    const res2 = await fetch(`${baseUrl}/api/topics/${topic.id}/revisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user1Cookie },
      body: JSON.stringify({ rating: "GOOD" }),
    });
    assert.equal(res2.status, 201);
    const body2 = await res2.json();
    assert.equal(body2.topic.repetitions, 2);
    assert.equal(body2.topic.intervalDays, 3);
    assert.equal(body2.revision.previousInterval, 1);
    assert.equal(body2.revision.intervalAfter, 3);

    const count2 = await prisma.topicRevision.count({
      where: { topicId: topic.id },
    });
    assert.equal(count2, 2, "Exactly two revision records after second review");

    // 3rd revision with GOOD
    const res3 = await fetch(`${baseUrl}/api/topics/${topic.id}/revisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user1Cookie },
      body: JSON.stringify({ rating: "GOOD" }),
    });
    assert.equal(res3.status, 201);
    const body3 = await res3.json();
    assert.equal(body3.topic.repetitions, 3);
    assert.equal(body3.topic.intervalDays, 8);
    assert.equal(body3.revision.previousInterval, 3);
    assert.equal(body3.revision.intervalAfter, 8);

    const count3 = await prisma.topicRevision.count({
      where: { topicId: topic.id },
    });
    assert.equal(
      count3,
      3,
      "Exactly three revision records after third review",
    );
  });

  test("4. Successful revision with EASY gives longer interval bonus", async () => {
    const topic = await prisma.topic.create({
      data: {
        name: "Binary Arithmetic",
        subjectId: user1SubjectId,
        repetitions: 0,
        intervalDays: 0,
        easeFactor: 2.5,
      },
    });

    // 1st revision with EASY: 0 repetitions -> interval 4, easeFactor 2.6
    const res1 = await fetch(`${baseUrl}/api/topics/${topic.id}/revisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user1Cookie },
      body: JSON.stringify({ rating: "EASY" }),
    });
    assert.equal(res1.status, 201);
    const body1 = await res1.json();
    assert.equal(body1.topic.repetitions, 1);
    assert.equal(body1.topic.intervalDays, 4);
    assert.equal(body1.topic.easeFactor, 2.6);
    assert.equal(body1.revision.previousInterval, 0);
    assert.equal(body1.revision.intervalAfter, 4);

    const count1 = await prisma.topicRevision.count({
      where: { topicId: topic.id },
    });
    assert.equal(count1, 1, "Exactly one revision record after first review");

    // 2nd revision with EASY: Math.round(4 * (2.7 + 0.3)) = 12
    const res2 = await fetch(`${baseUrl}/api/topics/${topic.id}/revisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user1Cookie },
      body: JSON.stringify({ rating: "EASY" }),
    });
    assert.equal(res2.status, 201);
    const body2 = await res2.json();
    assert.equal(body2.topic.repetitions, 2);
    assert.equal(body2.topic.intervalDays, 12);
    assert.equal(body2.revision.previousInterval, 4);
    assert.equal(body2.revision.intervalAfter, 12);

    const count2 = await prisma.topicRevision.count({
      where: { topicId: topic.id },
    });
    assert.equal(count2, 2, "Exactly two revision records after second review");
  });

  test("5. Missing rating returns 400 Bad Request with validation errors", async () => {
    const topic = await prisma.topic.create({
      data: {
        name: "Virtual Memory",
        subjectId: user1SubjectId,
      },
    });

    const res = await fetch(`${baseUrl}/api/topics/${topic.id}/revisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user1Cookie },
      body: JSON.stringify({}),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.message, "Validation failed");
    assert.ok(Array.isArray(body.errors));
    assert.ok(body.errors.some((e) => e.field === "rating"));
  });

  test("6. Invalid rating returns 400 Bad Request and rejects unexpected fields", async () => {
    const topic = await prisma.topic.create({
      data: {
        name: "TLB & Page Tables",
        subjectId: user1SubjectId,
      },
    });

    // Invalid rating enum value
    const res1 = await fetch(`${baseUrl}/api/topics/${topic.id}/revisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user1Cookie },
      body: JSON.stringify({ rating: "PERFECT" }),
    });
    assert.equal(res1.status, 400);
    const body1 = await res1.json();
    assert.equal(body1.message, "Validation failed");

    // Unexpected extra fields should be rejected (strict schema)
    const res2 = await fetch(`${baseUrl}/api/topics/${topic.id}/revisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user1Cookie },
      body: JSON.stringify({
        rating: "GOOD",
        repetitions: 99,
        intervalDays: 100,
      }),
    });
    assert.equal(res2.status, 400);
    const body2 = await res2.json();
    assert.equal(body2.message, "Validation failed");
  });

  test("7. Unauthenticated request returns 401 Unauthorized", async () => {
    const topic = await prisma.topic.create({
      data: {
        name: "Instruction Sets",
        subjectId: user1SubjectId,
      },
    });

    const res = await fetch(`${baseUrl}/api/topics/${topic.id}/revisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: "GOOD" }),
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.ok(body.message.includes("Authentication required"));
  });

  test("8. Nonexistent topic returns 404 Not Found", async () => {
    const res = await fetch(
      `${baseUrl}/api/topics/cm99999999999999999999999/revisions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: user1Cookie },
        body: JSON.stringify({ rating: "GOOD" }),
      },
    );

    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.message, "Topic not found");
  });

  test("9. Another user's topic returns 404 Not Found (ownership check)", async () => {
    // Topic belongs to User 2
    const topicUser2 = await prisma.topic.create({
      data: {
        name: "Reaction Mechanisms",
        subjectId: user2SubjectId,
      },
    });

    // User 1 attempts to revise User 2's topic
    const res = await fetch(
      `${baseUrl}/api/topics/${topicUser2.id}/revisions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: user1Cookie },
        body: JSON.stringify({ rating: "GOOD" }),
      },
    );

    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.message, "Topic not found");

    // Verify User 2's topic was not modified
    const dbTopic = await prisma.topic.findUnique({
      where: { id: topicUser2.id },
    });
    assert.equal(dbTopic.repetitions, 0);
  });

  test("10. Topic update and history creation rollback when one database operation fails", async () => {
    const topic = await prisma.topic.create({
      data: {
        name: "Superscalar Execution",
        subjectId: user1SubjectId,
        repetitions: 2,
        intervalDays: 5,
        easeFactor: 2.5,
      },
    });

    // Intercept transaction to simulate database failure during revision history creation
    const originalTx = prisma.$transaction;
    prisma.$transaction = async function (fn, options) {
      return originalTx.call(
        this,
        async (tx) => {
          tx.topicRevision.create = async function () {
            throw new Error("Simulated database failure during revision history creation");
          };
          return fn(tx);
        },
        options
      );
    };

    let res;
    try {
      res = await fetch(`${baseUrl}/api/topics/${topic.id}/revisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: user1Cookie },
        body: JSON.stringify({ rating: "GOOD" }),
      });
    } finally {
      prisma.$transaction = originalTx;
    }

    // Endpoint must return 500 when transaction fails
    assert.equal(res.status, 500);

    // Verify atomic rollback in real PostgreSQL database:
    // Topic must retain exact original state, and no TopicRevision row must exist
    const dbTopic = await prisma.topic.findUnique({ where: { id: topic.id } });
    assert.equal(dbTopic.repetitions, 2);
    assert.equal(dbTopic.intervalDays, 5);
    assert.equal(dbTopic.easeFactor, 2.5);

    const revisions = await prisma.topicRevision.findMany({
      where: { topicId: topic.id },
    });
    assert.equal(revisions.length, 0);
  });

  test("11. Concurrent revision requests cannot overwrite one another's algorithm state", async () => {
    const topic = await prisma.topic.create({
      data: {
        name: "Memory Hierarchy & Caching",
        subjectId: user1SubjectId,
        repetitions: 0,
        intervalDays: 0,
        easeFactor: 2.5,
      },
    });

    // Fire 2 simultaneous revision requests
    const [resA, resB] = await Promise.all([
      fetch(`${baseUrl}/api/topics/${topic.id}/revisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: user1Cookie },
        body: JSON.stringify({ rating: "GOOD" }),
      }),
      fetch(`${baseUrl}/api/topics/${topic.id}/revisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: user1Cookie },
        body: JSON.stringify({ rating: "GOOD" }),
      }),
    ]);

    // Both requests must complete successfully thanks to retry handling / serialization
    assert.equal(resA.status, 201);
    assert.equal(resB.status, 201);

    // Verify that the topic reached 2 repetitions and did not overwrite back to 1
    const dbTopic = await prisma.topic.findUnique({ where: { id: topic.id } });
    assert.equal(dbTopic.repetitions, 2);
    assert.equal(dbTopic.intervalDays, 3);

    // Verify both revisions exist in history
    const dbRevisions = await prisma.topicRevision.findMany({
      where: { topicId: topic.id },
      orderBy: { reviewedAt: "asc" },
    });
    assert.equal(dbRevisions.length, 2);
    assert.equal(dbRevisions[0].repetitionsAfter, 1);
    assert.equal(dbRevisions[1].repetitionsAfter, 2);
  });

  test("12. Correct previous and new interval history across multiple reviews", async () => {
    const topic = await prisma.topic.create({
      data: {
        name: "Register Allocation Algorithms",
        subjectId: user1SubjectId,
        repetitions: 0,
        intervalDays: 0,
        easeFactor: 2.5,
      },
    });

    // Revision 1: GOOD
    const r1 = await fetch(`${baseUrl}/api/topics/${topic.id}/revisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user1Cookie },
      body: JSON.stringify({ rating: "GOOD" }),
    });
    assert.equal(r1.status, 201);

    // Revision 2: GOOD
    const r2 = await fetch(`${baseUrl}/api/topics/${topic.id}/revisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user1Cookie },
      body: JSON.stringify({ rating: "GOOD" }),
    });
    assert.equal(r2.status, 201);

    // Revision 3: HARD
    const r3 = await fetch(`${baseUrl}/api/topics/${topic.id}/revisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user1Cookie },
      body: JSON.stringify({ rating: "HARD" }),
    });
    assert.equal(r3.status, 201);

    // Revision 4: AGAIN
    const r4 = await fetch(`${baseUrl}/api/topics/${topic.id}/revisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user1Cookie },
      body: JSON.stringify({ rating: "AGAIN" }),
    });
    assert.equal(r4.status, 201);

    // Check revision history chain
    const revisions = await prisma.topicRevision.findMany({
      where: { topicId: topic.id },
      orderBy: { createdAt: "asc" },
    });

    assert.equal(revisions.length, 4);

    // Rev 1 (GOOD): prev 0 -> after 1
    assert.equal(revisions[0].previousInterval, 0);
    assert.equal(revisions[0].intervalAfter, 1);
    assert.equal(revisions[0].repetitionsAfter, 1);

    // Rev 2 (GOOD): prev 1 -> after 3
    assert.equal(revisions[1].previousInterval, 1);
    assert.equal(revisions[1].intervalAfter, 3);
    assert.equal(revisions[1].repetitionsAfter, 2);

    // Rev 3 (HARD): prev 3 -> after 4 (ceil(3 * 1.2))
    assert.equal(revisions[2].previousInterval, 3);
    assert.equal(revisions[2].intervalAfter, 4);
    assert.equal(revisions[2].repetitionsAfter, 3);

    // Rev 4 (AGAIN): prev 4 -> after 1, repetitions reset to 0
    assert.equal(revisions[3].previousInterval, 4);
    assert.equal(revisions[3].intervalAfter, 1);
    assert.equal(revisions[3].repetitionsAfter, 0);
  });

  test("Supports singular /api/topic/:id/revisions route alias", async () => {
    const topic = await prisma.topic.create({
      data: {
        name: "Route Alias Check",
        subjectId: user1SubjectId,
      },
    });

    const res = await fetch(`${baseUrl}/api/topic/${topic.id}/revisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user1Cookie },
      body: JSON.stringify({ rating: "GOOD" }),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.message, "Revision saved successfully");
    assert.equal(body.topic.id, topic.id);
  });
});
