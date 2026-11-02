import test, { before, after, describe } from "node:test";
import assert from "node:assert/strict";
import "dotenv/config";
import app from "../app.js";
import { prisma } from "../lib/prisma.js";
import { calculateActiveDurationSeconds } from "../services/focusSession.service.js";

let server;
let baseUrl;
let user1Id;
let user2Id;
let user1Cookie;
let user2Cookie;
let user1SubjectId;
let user2SubjectId;

const request = (path, options = {}) =>
  fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

const signup = async (name, email) => {
  const response = await request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password: "Password123!" }),
  });
  const data = await response.json();
  return { cookie: response.headers.get("set-cookie"), user: data.user };
};

const createSession = (userId, subjectId, title) =>
  prisma.studySession.create({
    data: {
      title,
      date: new Date("2026-11-02T00:00:00.000Z"),
      startTime: "10:00",
      endTime: "11:00",
      duration: 60,
      userId,
      subjectId,
    },
  });

before(async () => {
  server = app.listen(0);
  baseUrl = `http://localhost:${server.address().port}`;

  const first = await signup(
    "Focus Tester One",
    `focus_one_${Date.now()}@focusflow.test`,
  );
  const second = await signup(
    "Focus Tester Two",
    `focus_two_${Date.now()}@focusflow.test`,
  );
  user1Cookie = first.cookie;
  user2Cookie = second.cookie;
  user1Id = first.user.id;
  user2Id = second.user.id;

  const subjects = await Promise.all([
    prisma.subject.create({ data: { name: "Algorithms", userId: user1Id } }),
    prisma.subject.create({ data: { name: "Chemistry", userId: user2Id } }),
  ]);
  user1SubjectId = subjects[0].id;
  user2SubjectId = subjects[1].id;
});

after(async () => {
  if (user1Id) await prisma.user.delete({ where: { id: user1Id } }).catch(() => {});
  if (user2Id) await prisma.user.delete({ where: { id: user2Id } }).catch(() => {});
  server?.close();
  await prisma.$disconnect();
});

describe("Focus Mode session lifecycle", () => {
  test("calculates only active time and keeps legacy manual completion untracked", async () => {
    const started = new Date("2026-11-02T10:00:00.000Z");
    assert.equal(
      calculateActiveDurationSeconds(
        { activeDurationSeconds: 30, activeStartedAt: started },
        new Date("2026-11-02T10:00:12.900Z"),
      ),
      42,
    );
    assert.equal(
      calculateActiveDurationSeconds(
        { activeDurationSeconds: 42, activeStartedAt: null },
        new Date(),
      ),
      42,
    );

    const manual = await createSession(user1Id, user1SubjectId, "Manual completion");
    const response = await request(`/api/session/${manual.id}`, {
      method: "PUT",
      headers: { Cookie: user1Cookie },
      body: JSON.stringify({ status: "completed" }),
    });
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.session.actualDurationSeconds, null);
  });

  test("supports start, pause, resume, completion, and idempotent completion", async () => {
    const session = await createSession(user1Id, user1SubjectId, "Timed session");

    const start = await request(`/api/session/${session.id}/focus/start`, {
      method: "POST",
      headers: { Cookie: user1Cookie },
    });
    const started = await start.json();
    assert.equal(start.status, 200);
    assert.equal(started.session.status, "in-progress");
    assert.equal(started.session.activeDurationSeconds, 0);

    await new Promise((resolve) => setTimeout(resolve, 1100));
    const pause = await request(`/api/session/${session.id}/focus/pause`, {
      method: "POST",
      headers: { Cookie: user1Cookie },
    });
    const paused = await pause.json();
    assert.equal(pause.status, 200);
    assert.equal(paused.session.status, "paused");
    assert.ok(paused.session.activeDurationSeconds >= 1);

    const repeatedPause = await request(`/api/session/${session.id}/focus/pause`, {
      method: "POST",
      headers: { Cookie: user1Cookie },
    });
    assert.equal(repeatedPause.status, 409);

    await new Promise((resolve) => setTimeout(resolve, 1100));
    const resume = await request(`/api/session/${session.id}/focus/resume`, {
      method: "POST",
      headers: { Cookie: user1Cookie },
    });
    assert.equal(resume.status, 200);

    await new Promise((resolve) => setTimeout(resolve, 1100));
    const complete = await request(`/api/session/${session.id}/focus/complete`, {
      method: "POST",
      headers: { Cookie: user1Cookie },
    });
    const completed = await complete.json();
    assert.equal(complete.status, 200);
    assert.equal(completed.session.status, "completed");
    assert.ok(completed.session.actualDurationSeconds >= 2);

    const repeated = await request(`/api/session/${session.id}/focus/complete`, {
      method: "POST",
      headers: { Cookie: user1Cookie },
    });
    const repeatedData = await repeated.json();
    assert.equal(repeated.status, 200);
    assert.equal(
      repeatedData.session.actualDurationSeconds,
      completed.session.actualDurationSeconds,
    );
  });

  test("supports cancellation and excludes cancelled sessions from completion", async () => {
    const session = await createSession(user1Id, user1SubjectId, "Cancelled session");
    await request(`/api/session/${session.id}/focus/start`, {
      method: "POST",
      headers: { Cookie: user1Cookie },
    });
    await new Promise((resolve) => setTimeout(resolve, 1100));
    const response = await request(`/api/session/${session.id}/focus/cancel`, {
      method: "POST",
      headers: { Cookie: user1Cookie },
    });
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.session.status, "cancelled");
    assert.ok(data.session.actualDurationSeconds >= 1);

    const complete = await request(`/api/session/${session.id}/focus/complete`, {
      method: "POST",
      headers: { Cookie: user1Cookie },
    });
    assert.equal(complete.status, 409);
  });

  test("enforces active-session uniqueness and ownership", async () => {
    const first = await createSession(user1Id, user1SubjectId, "Concurrent one");
    const second = await createSession(user1Id, user1SubjectId, "Concurrent two");
    const [firstStart, secondStart] = await Promise.all([
      request(`/api/session/${first.id}/focus/start`, {
        method: "POST",
        headers: { Cookie: user1Cookie },
      }),
      request(`/api/session/${second.id}/focus/start`, {
        method: "POST",
        headers: { Cookie: user1Cookie },
      }),
    ]);
    assert.deepEqual(
      [firstStart.status, secondStart.status].sort(),
      [200, 409],
    );

    const active = await request("/api/session/focus/active", {
      headers: { Cookie: user1Cookie },
    });
    const activeData = await active.json();
    assert.equal(active.status, 200);
    assert.ok(activeData.session);

    const foreign = await request(`/api/session/${first.id}/focus/start`, {
      method: "POST",
      headers: { Cookie: user2Cookie },
    });
    assert.equal(foreign.status, 404);

    await request(`/api/session/${activeData.session.id}/focus/cancel`, {
      method: "POST",
      headers: { Cookie: user1Cookie },
    });
  });

  test("rejects mismatched topic associations", async () => {
    const topic = await prisma.topic.create({
      data: { name: "Foreign topic", subjectId: user2SubjectId },
    });
    const session = await prisma.studySession.create({
      data: {
        title: "Mismatched topic",
        date: new Date("2026-11-02T00:00:00.000Z"),
        startTime: "12:00",
        endTime: "13:00",
        duration: 60,
        userId: user1Id,
        subjectId: user1SubjectId,
        topicId: topic.id,
      },
    });
    const response = await request(`/api/session/${session.id}/focus/start`, {
      method: "POST",
      headers: { Cookie: user1Cookie },
    });
    assert.equal(response.status, 404);
  });
});
