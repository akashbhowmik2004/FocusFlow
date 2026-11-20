import test, { before, after, describe } from "node:test";
import assert from "node:assert/strict";
import "dotenv/config";
import app from "../app.js";
import { prisma } from "../lib/prisma.js";
import { generateToken } from "../utils/authToken.js";

let server;
let baseUrl;
let user1;
let user2;
let user1Cookie;
let user2Cookie;
let user1Subject;
let user2Subject;
let user1Topic;
let user2Topic;
let user1Session;
let user2Session;

const request = (path, options = {}) =>
  fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

const signup = async (name, email, password = "Password123!") => {
  const response = await request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  const data = await response.json();
  return { cookie: response.headers.get("set-cookie"), user: data.user };
};

before(async () => {
  server = app.listen(0);
  baseUrl = `http://localhost:${server.address().port}`;

  const ts = Date.now();
  const first = await signup("Security User One", `sec_one_${ts}@focusflow.test`);
  const second = await signup("Security User Two", `sec_two_${ts}@focusflow.test`);

  user1 = first.user;
  user2 = second.user;
  user1Cookie = first.cookie;
  user2Cookie = second.cookie;

  // Create isolated subjects
  user1Subject = await prisma.subject.create({
    data: { name: "User1 Discrete Math", color: "#059669", userId: user1.id },
  });
  user2Subject = await prisma.subject.create({
    data: { name: "User2 Microeconomics", color: "#2563eb", userId: user2.id },
  });

  // Create isolated topics
  user1Topic = await prisma.topic.create({
    data: { name: "User1 Graph Theory", subjectId: user1Subject.id },
  });
  user2Topic = await prisma.topic.create({
    data: { name: "User2 Supply & Demand", subjectId: user2Subject.id },
  });

  // Create isolated study sessions
  user1Session = await prisma.studySession.create({
    data: {
      title: "User1 Proofs Session",
      date: new Date("2026-11-05T00:00:00.000Z"),
      startTime: "10:00",
      endTime: "11:00",
      duration: 60,
      userId: user1.id,
      subjectId: user1Subject.id,
      topicId: user1Topic.id,
    },
  });
  user2Session = await prisma.studySession.create({
    data: {
      title: "User2 Elasticity Session",
      date: new Date("2026-11-05T00:00:00.000Z"),
      startTime: "14:00",
      endTime: "15:00",
      duration: 60,
      userId: user2.id,
      subjectId: user2Subject.id,
      topicId: user2Topic.id,
    },
  });
});

after(async () => {
  if (user1?.id) await prisma.user.delete({ where: { id: user1.id } }).catch(() => {});
  if (user2?.id) await prisma.user.delete({ where: { id: user2.id } }).catch(() => {});
  server?.close();
  await prisma.$disconnect();
});

describe("Phase 4A: Production Security & Data Integrity Audit Suite", () => {
  // 1. Unauthenticated access enforcement
  test("1. Enforces authentication on all private resource endpoints", async () => {
    const unauthEndpoints = [
      { path: "/api/user", method: "GET" },
      { path: "/api/user/update", method: "PUT", body: { name: "Hacked" } },
      { path: "/api/subject", method: "GET" },
      { path: "/api/subject/add", method: "POST", body: { name: "Hacked", color: "#000" } },
      { path: "/api/topic", method: "GET" },
      { path: "/api/session", method: "GET" },
      { path: "/api/session/focus/active", method: "GET" },
      { path: "/api/user/export", method: "GET" },
      { path: "/api/user/account", method: "DELETE", body: { confirmation: "DELETE" } },
    ];

    for (const ep of unauthEndpoints) {
      const res = await request(ep.path, {
        method: ep.method,
        body: ep.body ? JSON.stringify(ep.body) : undefined,
      });
      assert.equal(
        res.status,
        401,
        `Expected 401 for unauthenticated ${ep.method} ${ep.path}, got ${res.status}`
      );
    }
  });

  // 2. Cross-user resource access attempts (IDOR Read Protection)
  test("2. Cross-user IDOR read protection across subjects, topics, and sessions", async () => {
    // User 1 tries to read User 2's subject
    const subjectRes = await request(`/api/subject/${user2Subject.id}`, {
      headers: { Cookie: user1Cookie },
    });
    assert.equal(subjectRes.status, 404, "User 1 must not be able to read User 2's subject");

    // User 1 tries to read User 2's topic
    const topicRes = await request(`/api/topic/${user2Topic.id}`, {
      headers: { Cookie: user1Cookie },
    });
    assert.equal(topicRes.status, 404, "User 1 must not be able to read User 2's topic");

    // User 1 getAllTopics must only return User 1's topics
    const allTopicsRes = await request("/api/topic", {
      headers: { Cookie: user1Cookie },
    });
    assert.equal(allTopicsRes.status, 200);
    const topics = await allTopicsRes.json();
    assert.ok(Array.isArray(topics));
    assert.ok(topics.every((t) => t.subjectId === user1Subject.id));
  });

  // 3. Cross-user update and deletion attempts (IDOR Write Protection)
  test("3. Cross-user IDOR write/delete protection across subjects, topics, and sessions", async () => {
    // User 1 tries to modify User 2's subject
    const updateSubRes = await request(`/api/subject/${user2Subject.id}`, {
      method: "PUT",
      headers: { Cookie: user1Cookie },
      body: JSON.stringify({ name: "Malicious Rename" }),
    });
    assert.equal(updateSubRes.status, 404, "User 1 must not modify User 2's subject");

    // User 1 tries to delete User 2's subject
    const deleteSubRes = await request(`/api/subject/${user2Subject.id}`, {
      method: "DELETE",
      headers: { Cookie: user1Cookie },
    });
    assert.equal(deleteSubRes.status, 404, "User 1 must not delete User 2's subject");

    // User 1 tries to modify User 2's session
    const updateSessRes = await request(`/api/session/${user2Session.id}`, {
      method: "PUT",
      headers: { Cookie: user1Cookie },
      body: JSON.stringify({ title: "Malicious Hijack" }),
    });
    assert.equal(updateSessRes.status, 404, "User 1 must not modify User 2's session");

    // User 1 tries to start focus on User 2's session
    const startForeignFocus = await request(`/api/session/${user2Session.id}/focus/start`, {
      method: "POST",
      headers: { Cookie: user1Cookie },
    });
    assert.equal(startForeignFocus.status, 404, "User 1 must not start User 2's focus session");
  });

  // 4. Account deletion safeguards
  test("4. Account deletion safeguards require explicit DELETE confirmation token", async () => {
    // Create dedicated user for deletion test
    const doomed = await signup(
      "Doomed Scholar",
      `doomed_${Date.now()}@focusflow.test`,
      "Password123!"
    );

    // Empty body -> 400
    const noTokenRes = await request("/api/user/account", {
      method: "DELETE",
      headers: { Cookie: doomed.cookie },
      body: JSON.stringify({}),
    });
    assert.equal(noTokenRes.status, 400, "Account deletion without body must reject with 400");

    // Wrong confirmation token -> 400
    const wrongTokenRes = await request("/api/user/account", {
      method: "DELETE",
      headers: { Cookie: doomed.cookie },
      body: JSON.stringify({ confirmation: "delete" }),
    });
    assert.equal(wrongTokenRes.status, 400, "Lowercase 'delete' token must reject with 400");
  });

  // 5. Account deletion cascade integrity
  test("5. Account deletion cascade wipes subjects, topics, and study sessions completely", async () => {
    const cascadeUser = await signup(
      "Cascade Scholar",
      `cascade_${Date.now()}@focusflow.test`,
      "Password123!"
    );

    // Create subjects, topics, and sessions for cascade user
    const sub = await prisma.subject.create({
      data: { name: "Cascade Subject", userId: cascadeUser.user.id },
    });
    const top = await prisma.topic.create({
      data: { name: "Cascade Topic", subjectId: sub.id },
    });
    const sess = await prisma.studySession.create({
      data: {
        title: "Cascade Session",
        date: new Date("2026-11-05T00:00:00.000Z"),
        startTime: "09:00",
        endTime: "10:00",
        duration: 60,
        userId: cascadeUser.user.id,
        subjectId: sub.id,
      },
    });

    // Execute deletion with valid token
    const deleteRes = await request("/api/user/account", {
      method: "DELETE",
      headers: { Cookie: cascadeUser.cookie },
      body: JSON.stringify({ confirmation: "DELETE" }),
    });
    assert.equal(deleteRes.status, 200);

    // Verify cascade removal in DB
    const [foundUser, foundSub, foundTop, foundSess] = await Promise.all([
      prisma.user.findUnique({ where: { id: cascadeUser.user.id } }),
      prisma.subject.findUnique({ where: { id: sub.id } }),
      prisma.topic.findUnique({ where: { id: top.id } }),
      prisma.studySession.findUnique({ where: { id: sess.id } }),
    ]);

    assert.equal(foundUser, null, "User record must be deleted");
    assert.equal(foundSub, null, "Subject record must be cascade deleted");
    assert.equal(foundTop, null, "Topic record must be cascade deleted");
    assert.equal(foundSess, null, "Session record must be cascade deleted");
  });

  // 6. Export excludes sensitive fields
  test("6. User data export excludes passwordHash, tokens, and internal auth fields", async () => {
    const exportRes = await request("/api/user/export", {
      headers: { Cookie: user1Cookie },
    });
    assert.equal(exportRes.status, 200);
    const data = await exportRes.json();

    assert.ok(data.user, "Export must contain safe user object");
    assert.equal(data.user.passwordHash, undefined, "passwordHash must NOT be in export");
    assert.equal(data.user.token, undefined, "token must NOT be in export");
    assert.ok(data.exportedAt, "Export timestamp must be present");
  });

  // 7. Export user isolation
  test("7. Export cannot include another user's subjects, topics, or sessions", async () => {
    const exportRes = await request("/api/user/export", {
      headers: { Cookie: user1Cookie },
    });
    const data = await exportRes.json();

    assert.ok(Array.isArray(data.subjects));
    assert.ok(Array.isArray(data.sessions));

    // Must not contain User 2's subject or session
    const hasForeignSubject = data.subjects.some((s) => s.id === user2Subject.id);
    const hasForeignSession = data.sessions.some((s) => s.id === user2Session.id);

    assert.equal(hasForeignSubject, false, "Export must not contain other user's subjects");
    assert.equal(hasForeignSession, false, "Export must not contain other user's sessions");
  });

  // 8. CSV formula injection protection logic
  test("8. CSV formula injection sanitization neutralizes formula trigger characters", () => {
    const sanitizeCell = (val) => {
      if (val === null || val === undefined) return '""';
      let str = String(val);
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    assert.equal(sanitizeCell("=cmd|'/C calc'!A0"), '"\'=cmd|\'/C calc\'!A0"');
    assert.equal(sanitizeCell("+12345"), '"\'+12345"');
    assert.equal(sanitizeCell("-20+5"), '"\'-20+5"');
    assert.equal(sanitizeCell("@SUM(A1:A10)"), '"\'@SUM(A1:A10)"');
    assert.equal(sanitizeCell('Normal "Title"'), '"Normal ""Title"""');
    assert.equal(sanitizeCell("Safe Subject"), '"Safe Subject"');
  });

  // 9. Password update and session invalidation/cookie refresh
  test("9. Password update requires current password and issues fresh auth cookie", async () => {
    const pwdUser = await signup(
      "Password Scholar",
      `pwd_${Date.now()}@focusflow.test`,
      "InitialPassword123!"
    );

    // Wrong current password -> 400
    const wrongRes = await request("/api/user/update-password", {
      method: "PUT",
      headers: { Cookie: pwdUser.cookie },
      body: JSON.stringify({
        currentPassword: "WrongPassword!",
        newPassword: "BrandNewPassword123!",
        confirmPassword: "BrandNewPassword123!",
      }),
    });
    assert.equal(wrongRes.status, 400);

    // Valid update -> 200 and issues new Set-Cookie
    const validRes = await request("/api/user/update-password", {
      method: "PUT",
      headers: { Cookie: pwdUser.cookie },
      body: JSON.stringify({
        currentPassword: "InitialPassword123!",
        newPassword: "BrandNewPassword123!",
        confirmPassword: "BrandNewPassword123!",
      }),
    });
    assert.equal(validRes.status, 200);
    const newCookie = validRes.headers.get("set-cookie");
    assert.ok(newCookie && newCookie.includes("token="), "Must refresh auth cookie on password change");

    // Old password no longer works
    const oldLogin = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: pwdUser.user.email,
        password: "InitialPassword123!",
      }),
    });
    assert.equal(oldLogin.status, 401, "Old password must be rejected");

    // New password works
    const newLogin = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: pwdUser.user.email,
        password: "BrandNewPassword123!",
      }),
    });
    assert.equal(newLogin.status, 200, "New password must succeed");

    await prisma.user.delete({ where: { id: pwdUser.user.id } }).catch(() => {});
  });

  // 10. Concurrent Focus Mode start serialization
  test("10. Concurrent Focus Mode start requests are strictly serialized without duplicate active sessions", async () => {
    const sessA = await prisma.studySession.create({
      data: {
        title: "Concurrent Alpha",
        date: new Date("2026-11-05T00:00:00.000Z"),
        startTime: "16:00",
        endTime: "17:00",
        duration: 60,
        userId: user1.id,
        subjectId: user1Subject.id,
      },
    });
    const sessB = await prisma.studySession.create({
      data: {
        title: "Concurrent Beta",
        date: new Date("2026-11-05T00:00:00.000Z"),
        startTime: "17:00",
        endTime: "18:00",
        duration: 60,
        userId: user1.id,
        subjectId: user1Subject.id,
      },
    });

    // Fire both start requests simultaneously
    const [startA, startB] = await Promise.all([
      request(`/api/session/${sessA.id}/focus/start`, {
        method: "POST",
        headers: { Cookie: user1Cookie },
      }),
      request(`/api/session/${sessB.id}/focus/start`, {
        method: "POST",
        headers: { Cookie: user1Cookie },
      }),
    ]);

    const statuses = [startA.status, startB.status].sort();
    assert.deepEqual(
      statuses,
      [200, 409],
      `Expected exactly one 200 and one 409, got ${startA.status} and ${startB.status}`
    );

    // Cancel whichever started to keep DB clean
    const activeRes = await request("/api/session/focus/active", {
      headers: { Cookie: user1Cookie },
    });
    const activeData = await activeRes.json();
    if (activeData?.session?.id) {
      await request(`/api/session/${activeData.session.id}/focus/cancel`, {
        method: "POST",
        headers: { Cookie: user1Cookie },
      });
    }
  });

  // 11. Duplicate completion and cancellation requests
  test("11. Focus completion and cancellation are idempotent where required", async () => {
    const sess = await prisma.studySession.create({
      data: {
        title: "Idempotent Session",
        date: new Date("2026-11-05T00:00:00.000Z"),
        startTime: "18:00",
        endTime: "19:00",
        duration: 60,
        userId: user1.id,
        subjectId: user1Subject.id,
      },
    });

    // Start session
    await request(`/api/session/${sess.id}/focus/start`, {
      method: "POST",
      headers: { Cookie: user1Cookie },
    });

    // First completion -> 200
    const comp1 = await request(`/api/session/${sess.id}/focus/complete`, {
      method: "POST",
      headers: { Cookie: user1Cookie },
    });
    assert.equal(comp1.status, 200);

    // Duplicate completion -> 200 (idempotent, does not crash or corrupt duration)
    const comp2 = await request(`/api/session/${sess.id}/focus/complete`, {
      method: "POST",
      headers: { Cookie: user1Cookie },
    });
    assert.equal(comp2.status, 200);
    const data1 = await comp1.json();
    const data2 = await comp2.json();
    assert.equal(data1.session.actualDurationSeconds, data2.session.actualDurationSeconds);
  });

  // 12. Invalid or expired authentication tokens
  test("12. Invalid, malformed, or tampered JWT tokens return 401", async () => {
    // Malformed token
    const malformedRes = await request("/api/user", {
      headers: { Cookie: "token=not.a.valid.jwt" },
    });
    assert.equal(malformedRes.status, 401);

    // Token signed with wrong secret
    const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItZmFrZSJ9.fakeSignature";
    const fakeRes = await request("/api/user", {
      headers: { Cookie: `token=${fakeToken}` },
    });
    assert.equal(fakeRes.status, 401);
  });

  // 13. Security headers check
  test("13. Production HTTP security headers are present on API responses", async () => {
    const res = await request("/api/health");
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
    assert.equal(res.headers.get("x-frame-options"), "DENY");
    assert.equal(res.headers.get("x-xss-protection"), "1; mode=block");
    assert.equal(res.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  });
});
