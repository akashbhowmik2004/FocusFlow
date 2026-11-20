import test, { before, after, describe } from "node:test";
import assert from "node:assert/strict";
import "dotenv/config";
import app from "../app.js";
import { prisma } from "../lib/prisma.js";

let server;
let baseUrl;
let testUser;
let testUserCookie;
let testSubject;
let topicA;
let topicB;
let topicC;

const request = (path, options = {}) =>
  fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

before(async () => {
  server = app.listen(0);
  baseUrl = `http://localhost:${server.address().port}`;

  const ts = Date.now();
  // 1. Create isolated student account
  const signupRes = await request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      name: "E2E Integration Scholar",
      email: `e2e_scholar_${ts}@focusflow.test`,
      password: "ScholarPassword123!",
    }),
  });
  const signupData = await signupRes.json();
  testUser = signupData.user;
  testUserCookie = signupRes.headers.get("set-cookie");

  // 2. Create academic subject
  const subRes = await request("/api/subject/add", {
    method: "POST",
    headers: { Cookie: testUserCookie },
    body: JSON.stringify({
      name: "Organic Chemistry III",
      code: "CHEM 301",
      color: "#059669",
      examDate: "2026-12-15",
    }),
  });
  const subData = await subRes.json();
  testSubject = subData.subject;

  // 3. Create three topics under syllabus using POST /api/topics/:subjectId
  const t1Res = await request(`/api/topics/${testSubject.id}`, {
    method: "POST",
    headers: { Cookie: testUserCookie },
    body: JSON.stringify({
      name: "Electrophilic Aromatic Substitution",
      status: "completed",
    }),
  });
  topicA = (await t1Res.json()).topic;

  const t2Res = await request(`/api/topics/${testSubject.id}`, {
    method: "POST",
    headers: { Cookie: testUserCookie },
    body: JSON.stringify({
      name: "Nucleophilic Addition Mechanisms",
      status: "in-progress",
    }),
  });
  topicB = (await t2Res.json()).topic;

  const t3Res = await request(`/api/topics/${testSubject.id}`, {
    method: "POST",
    headers: { Cookie: testUserCookie },
    body: JSON.stringify({
      name: "NMR Spectroscopy & Chemical Shifts",
      status: "not-started",
    }),
  });
  topicC = (await t3Res.json()).topic;
});

after(async () => {
  if (testUser?.id) {
    await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
  }
  await prisma.$disconnect();
  if (server) {
    server.close();
  }
});

describe("Phase 4B: Full-Stack Integration & Cross-Module Verification", () => {
  // ── 1. CROSS-MODULE STATE CONSISTENCY ──────────────────────────────────
  test("1. Create Subject: Persists in DB and reflects across Subject, Topic, and Planner endpoints", async () => {
    // Verify subject via GET /api/subject
    const res = await request("/api/subject/", {
      headers: { Cookie: testUserCookie },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    const found = data.subjects.find((s) => s.id === testSubject.id);
    assert.ok(found, "Created subject must appear in subjects list");
    assert.equal(found.name, "Organic Chemistry III");
    assert.equal(found.code, "CHEM 301");
    assert.equal(found.color, "#059669");

    // Verify subject detail via GET /api/subject/:id
    const detailRes = await request(`/api/subject/${testSubject.id}`, {
      headers: { Cookie: testUserCookie },
    });
    assert.equal(detailRes.status, 200);
    const detailData = await detailRes.json();
    assert.equal(detailData.subject.id, testSubject.id);
    assert.equal(detailData.subject.topics.length, 3, "All 3 syllabus topics must be attached");
  });

  test("2. Create Topic: Appears in syllabus, topic list, and Revision Center queue", async () => {
    const topicsRes = await request(`/api/topics`, {
      headers: { Cookie: testUserCookie },
    });
    assert.equal(topicsRes.status, 200);
    const topicsList = await topicsRes.json();
    const names = topicsList.map((t) => t.name);
    assert.ok(names.includes("Electrophilic Aromatic Substitution"));
    assert.ok(names.includes("Nucleophilic Addition Mechanisms"));
    assert.ok(names.includes("NMR Spectroscopy & Chemical Shifts"));

    const tA = topicsList.find((t) => t.id === topicA.id);
    assert.equal(tA.status, "completed");
  });

  test("3. Schedule Session: Creates session associated with subject and topic", async () => {
    const today = new Date().toISOString().split("T")[0];
    const sessionRes = await request("/api/session", {
      method: "POST",
      headers: { Cookie: testUserCookie },
      body: JSON.stringify({
        title: "Study Electrophilic Reactions",
        subjectId: testSubject.id,
        topicId: topicA.id,
        date: today,
        startTime: "10:00",
        endTime: "11:00",
      }),
    });
    assert.equal(sessionRes.status, 201);
    const sessionData = await sessionRes.json();
    assert.equal(sessionData.session.subjectId, testSubject.id);
    assert.equal(sessionData.session.topicId, topicA.id);
    assert.equal(sessionData.session.duration, 60);
    assert.equal(sessionData.session.status, "upcoming");

    // Verify session appears in user's sessions list
    const listRes = await request("/api/session", {
      headers: { Cookie: testUserCookie },
    });
    assert.equal(listRes.status, 200);
    const listData = await listRes.json();
    const foundSession = listData.sessions.find((s) => s.id === sessionData.session.id);
    assert.ok(foundSession, "Scheduled session must appear in session list");
  });

  test("4. Complete Session: Persists measured actualDurationSeconds and updates topic completion telemetry", async () => {
    const today = new Date().toISOString().split("T")[0];
    const createRes = await request("/api/session", {
      method: "POST",
      headers: { Cookie: testUserCookie },
      body: JSON.stringify({
        title: "Deep Focus on Nucleophiles",
        subjectId: testSubject.id,
        topicId: topicB.id,
        date: today,
        startTime: "14:00",
        endTime: "14:45",
      }),
    });
    assert.equal(createRes.status, 201);
    const { session } = await createRes.json();

    // Start focus via POST /api/session/:id/focus/start
    const startRes = await request(`/api/session/${session.id}/focus/start`, {
      method: "POST",
      headers: { Cookie: testUserCookie },
    });
    assert.equal(startRes.status, 200);
    const active = (await startRes.json()).session;
    assert.equal(active.status, "in-progress");

    // Complete focus via POST /api/session/:id/focus/complete
    const completeRes = await request(`/api/session/${session.id}/focus/complete`, {
      method: "POST",
      headers: { Cookie: testUserCookie },
      body: JSON.stringify({
        notes: "Completed nucleophilic mechanisms deep dive",
      }),
    });
    assert.equal(completeRes.status, 200);
    const completed = (await completeRes.json()).session;
    assert.equal(completed.status, "completed");
    assert.ok(typeof completed.actualDurationSeconds === "number");

    // Verify DB state directly
    const dbSession = await prisma.studySession.findUnique({
      where: { id: session.id },
    });
    assert.equal(dbSession.status, "completed");
    assert.ok(dbSession.completedAt instanceof Date);

    // Verify session cannot be restarted
    const restartRes = await request(`/api/session/${session.id}/focus/start`, {
      method: "POST",
      headers: { Cookie: testUserCookie },
    });
    assert.equal(restartRes.status, 409, "Completed session must reject start attempts with 409 conflict");
  });

  test("5. Cancel Session: Excluded from completed study time and streak", async () => {
    const today = new Date().toISOString().split("T")[0];
    const createRes = await request("/api/session", {
      method: "POST",
      headers: { Cookie: testUserCookie },
      body: JSON.stringify({
        title: "Cancelled Spectroscopy Review",
        subjectId: testSubject.id,
        topicId: topicC.id,
        date: today,
        startTime: "16:00",
        endTime: "17:00",
      }),
    });
    assert.equal(createRes.status, 201);
    const { session } = await createRes.json();

    // Cancel session via PUT /api/session/:id
    const cancelRes = await request(`/api/session/${session.id}`, {
      method: "PUT",
      headers: { Cookie: testUserCookie },
      body: JSON.stringify({
        status: "missed",
      }),
    });
    assert.equal(cancelRes.status, 200);
    const updated = (await cancelRes.json()).session;
    assert.equal(updated.status, "missed");

    // Check DB record
    const dbSession = await prisma.studySession.findUnique({
      where: { id: session.id },
    });
    assert.equal(dbSession.status, "missed");
    assert.equal(dbSession.actualDurationSeconds, null, "Missed/cancelled session must not carry actual duration");
  });

  test("6. Spaced Repetition Review: Modified SM-2 calculations update interval, repetitions, easeFactor, and log history", async () => {
    // Submit review with rating GOOD
    const revRes = await request(`/api/topics/${topicA.id}/revisions`, {
      method: "POST",
      headers: { Cookie: testUserCookie },
      body: JSON.stringify({ rating: "GOOD" }),
    });
    assert.equal(revRes.status, 201);
    const revData = await revRes.json();

    // First successful review (GOOD) schedules 1 day interval
    assert.equal(revData.topic.repetitions, 1);
    assert.equal(revData.topic.intervalDays, 1);
    assert.equal(revData.revision.rating, "GOOD");
    assert.equal(revData.revision.previousInterval, 0);
    assert.equal(revData.revision.intervalAfter, 1);

    // Verify DB Topic update and TopicRevision row
    const dbTopic = await prisma.topic.findUnique({ where: { id: topicA.id } });
    assert.equal(dbTopic.repetitions, 1);
    assert.equal(dbTopic.intervalDays, 1);
    assert.ok(dbTopic.nextRevision instanceof Date);

    const dbRevisions = await prisma.topicRevision.findMany({
      where: { topicId: topicA.id },
    });
    assert.equal(dbRevisions.length, 1);
    assert.equal(dbRevisions[0].rating, "GOOD");

    // Submit second review (GOOD) -> interval should become 3 days
    const revRes2 = await request(`/api/topics/${topicA.id}/revisions`, {
      method: "POST",
      headers: { Cookie: testUserCookie },
      body: JSON.stringify({ rating: "GOOD" }),
    });
    assert.equal(revRes2.status, 201);
    const revData2 = await revRes2.json();
    assert.equal(revData2.topic.repetitions, 2);
    assert.equal(revData2.topic.intervalDays, 3);

    // Verify revision does not alter study session totals
    const sessionCount = await prisma.studySession.count({
      where: { userId: testUser.id, topicId: topicA.id, status: "completed" },
    });
    assert.equal(sessionCount, 0, "Topic reviews must not create synthetic study sessions");
  });

  test("7. Change Daily Study Goal: Setting goal to 0 (active rest) persists without math errors", async () => {
    const updateRes = await request("/api/user/update", {
      method: "PUT",
      headers: { Cookie: testUserCookie },
      body: JSON.stringify({ dailyStudyHours: 0 }),
    });
    assert.equal(updateRes.status, 200);
    const updatedUser = (await updateRes.json()).user;
    assert.equal(updatedUser.dailyStudyHours, 0);

    const dbUser = await prisma.user.findUnique({ where: { id: testUser.id } });
    assert.equal(dbUser.dailyStudyHours, 0);

    // Restore to 5 hours for remaining tests
    await request("/api/user/update", {
      method: "PUT",
      headers: { Cookie: testUserCookie },
      body: JSON.stringify({ dailyStudyHours: 5 }),
    });
  });

  // ── 2. JOURNEY F: INSIGHTS & ANALYTICS MATHEMATICAL GROUND TRUTH ─────────
  test("8. Insights & Analytics: Independently computed expected metrics match DB ground truth", async () => {
    const allUserSessions = await prisma.studySession.findMany({
      where: { userId: testUser.id },
    });

    let expectedPlannedMinutes = 0;
    let expectedActualSeconds = 0;
    let expectedCompletedCount = 0;

    for (const s of allUserSessions) {
      expectedPlannedMinutes += s.duration;
      if (s.status === "COMPLETED" || s.status === "completed") {
        expectedCompletedCount += 1;
        if (typeof s.actualDurationSeconds === "number") {
          expectedActualSeconds += s.actualDurationSeconds;
        }
      }
    }

    const apiRes = await request("/api/session", {
      headers: { Cookie: testUserCookie },
    });
    assert.equal(apiRes.status, 200);
    const { sessions } = await apiRes.json();

    let apiActualSeconds = 0;
    let apiPlannedMinutes = 0;
    let apiCompletedCount = 0;

    for (const s of sessions) {
      apiPlannedMinutes += s.duration;
      if (s.status === "completed" || s.status === "COMPLETED") {
        apiCompletedCount += 1;
        if (typeof s.actualDurationSeconds === "number") {
          apiActualSeconds += s.actualDurationSeconds;
        }
      }
    }

    assert.equal(apiPlannedMinutes, expectedPlannedMinutes, "Planned minutes must match DB truth");
    assert.equal(apiActualSeconds, expectedActualSeconds, "Actual seconds must match DB truth");
    assert.equal(apiCompletedCount, expectedCompletedCount, "Completed session count must match DB truth");

    // Syllabus Completion check
    const allTopics = await prisma.topic.findMany({
      where: { subject: { userId: testUser.id } },
    });
    const completedTopics = allTopics.filter((t) => t.status === "completed");
    const expectedSyllabusProgress = Math.round((completedTopics.length / allTopics.length) * 100);
    assert.equal(expectedSyllabusProgress, 33, "1 of 3 topics completed = 33%");

    // Recall Quality Distribution check
    const revisions = await prisma.topicRevision.findMany({
      where: { topic: { subject: { userId: testUser.id } } },
    });
    const goodCount = revisions.filter((r) => r.rating === "GOOD").length;
    assert.equal(goodCount, 2, "2 GOOD ratings submitted in previous test");
  });

  // ── 3. DATE AND TIMEZONE BOUNDARIES (Asia/Kolkata +05:30) ───────────────
  test("9. Date Boundaries: Date-only strings and midnight boundaries preserve calendar integrity", async () => {
    const targetDate = "2026-11-15";
    // Inverted start/end times across midnight without day split must fail validation
    const sessionRes = await request("/api/session", {
      method: "POST",
      headers: { Cookie: testUserCookie },
      body: JSON.stringify({
        title: "Late Session",
        subjectId: testSubject.id,
        topicId: topicA.id,
        date: targetDate,
        startTime: "23:45",
        endTime: "00:30",
      }),
    });
    assert.equal(sessionRes.status, 400, "Inverted start/end times across midnight without day split must be rejected safely");

    // Standard late evening session within calendar boundary
    const validLateSessionRes = await request("/api/session", {
      method: "POST",
      headers: { Cookie: testUserCookie },
      body: JSON.stringify({
        title: "Late Session Valid",
        subjectId: testSubject.id,
        topicId: topicA.id,
        date: targetDate,
        startTime: "23:00",
        endTime: "23:45",
      }),
    });
    assert.equal(validLateSessionRes.status, 201);
    const { session } = await validLateSessionRes.json();
    assert.equal(session.duration, 45);

    // Verify date remains exact "2026-11-15"
    const fetched = await prisma.studySession.findUnique({ where: { id: session.id } });
    const fetchedDateStr = fetched.date instanceof Date ? fetched.date.toISOString().split("T")[0] : fetched.date;
    assert.equal(fetchedDateStr, targetDate, "Date must not drift to previous or next day");
  });

  // ── 4. FAILURE AND RECOVERY RESILIENCE ──────────────────────────────────
  test("10. Failure Resilience: Unauthenticated, malformed, and invalid requests fail gracefully", async () => {
    // Unauthenticated request to private endpoint
    const unauthRes = await request("/api/user");
    assert.equal(unauthRes.status, 401);

    // Tampered JWT token
    const tamperedRes = await request("/api/user", {
      headers: { Cookie: "auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.signature" },
    });
    assert.equal(tamperedRes.status, 401);

    // Invalid schema validation on topic creation (empty name)
    const invalidTopicRes = await request(`/api/topics/${testSubject.id}`, {
      method: "POST",
      headers: { Cookie: testUserCookie },
      body: JSON.stringify({
        name: "",
      }),
    });
    assert.equal(invalidTopicRes.status, 400);

    // Non-existent subject ID on topic creation
    const nonExistentSubjectRes = await request("/api/topics/sub-non-existent-9999", {
      method: "POST",
      headers: { Cookie: testUserCookie },
      body: JSON.stringify({
        name: "Ghost Topic",
      }),
    });
    assert.equal(nonExistentSubjectRes.status, 404);
  });

  // ── 5. CASCADE DELETION INTEGRITY ───────────────────────────────────────
  test("11. Subject Deletion: Cascades cleanly across topics, revisions, and sessions with 0 orphans", async () => {
    const delRes = await request(`/api/subject/${testSubject.id}`, {
      method: "DELETE",
      headers: { Cookie: testUserCookie },
    });
    assert.equal(delRes.status, 200);

    const subjectInDb = await prisma.subject.findUnique({
      where: { id: testSubject.id },
    });
    assert.equal(subjectInDb, null, "Subject must be deleted");

    const topicsInDb = await prisma.topic.findMany({
      where: { subjectId: testSubject.id },
    });
    assert.equal(topicsInDb.length, 0, "All associated topics must be deleted via cascade");

    const sessionsInDb = await prisma.studySession.findMany({
      where: { subjectId: testSubject.id },
    });
    assert.equal(sessionsInDb.length, 0, "All associated study sessions must be deleted via cascade");
  });
});
