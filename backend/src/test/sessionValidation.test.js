import test, { before, after, describe } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import app from "../app.js";
import { prisma } from "../lib/prisma.js";
import {
  parseTimeToMinutes,
  sessionSchema,
  sessionUpdateSchema,
} from "../schemas/session.schema.js";

let server;
let baseUrl;
let userId;
let authCookie;
let subjectId;

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

  const email = `session_val_${Date.now()}@focusflow.test`;
  const res = await request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      name: "Session Validation User",
      email,
      password: "Password123!",
    }),
  });
  const data = await res.json();
  authCookie = res.headers.get("set-cookie");
  userId = data.user.id;

  const subject = await prisma.subject.create({
    data: {
      name: "Computer Science",
      code: "CS101",
      userId,
    },
  });
  subjectId = subject.id;
});

after(async () => {
  if (userId) {
    await prisma.user.delete({ where: { id: userId } }).catch(() => {});
  }
  server?.close();
  await prisma.$disconnect();
});

describe("Backend Session Duration Schema Validation", () => {
  test("parseTimeToMinutes converts HH:MM properly", () => {
    assert.equal(parseTimeToMinutes("00:00"), 0);
    assert.equal(parseTimeToMinutes("09:00"), 540);
    assert.equal(parseTimeToMinutes("14:30"), 870);
    assert.equal(parseTimeToMinutes("23:59"), 1439);
    assert.equal(parseTimeToMinutes("24:00"), null);
    assert.equal(parseTimeToMinutes("invalid"), null);
  });

  test("derives duration when duration is omitted in payload", () => {
    const parsed = sessionSchema.safeParse({
      title: "Algorithms",
      subjectId: "sub-1",
      date: "2026-11-03",
      startTime: "09:00",
      endTime: "10:30",
    });
    assert.equal(parsed.success, true);
    assert.equal(parsed.data.duration, 90);
  });

  test("accepts matching duration in payload", () => {
    const parsed = sessionSchema.safeParse({
      title: "Algorithms",
      subjectId: "sub-1",
      date: "2026-11-03",
      startTime: "14:00",
      endTime: "15:30",
      duration: 90,
    });
    assert.equal(parsed.success, true);
    assert.equal(parsed.data.duration, 90);
  });

  test("rejects inconsistent duration in payload", () => {
    const parsed = sessionSchema.safeParse({
      title: "Algorithms",
      subjectId: "sub-1",
      date: "2026-11-03",
      startTime: "09:00",
      endTime: "10:00",
      duration: 90, // should be 60
    });
    assert.equal(parsed.success, false);
    assert.match(parsed.error.issues[0].message, /Duration must match/i);
  });

  test("rejects equal start and end time", () => {
    const parsed = sessionSchema.safeParse({
      title: "Algorithms",
      subjectId: "sub-1",
      date: "2026-11-03",
      startTime: "10:00",
      endTime: "10:00",
    });
    assert.equal(parsed.success, false);
    assert.match(parsed.error.issues[0].message, /End time must be later than start time/i);
  });

  test("rejects end time earlier than start time", () => {
    const parsed = sessionSchema.safeParse({
      title: "Algorithms",
      subjectId: "sub-1",
      date: "2026-11-03",
      startTime: "11:00",
      endTime: "10:00",
    });
    assert.equal(parsed.success, false);
    assert.match(parsed.error.issues[0].message, /End time cannot be earlier than start time/i);
  });
});

describe("Backend Session API Integration (POST /api/session & PUT /api/session/:id)", () => {
  let createdSessionId;

  test("POST /api/session auto-calculates duration when omitted", async () => {
    const res = await request("/api/session", {
      method: "POST",
      headers: { Cookie: authCookie },
      body: JSON.stringify({
        title: "Database Indexing",
        subjectId,
        date: "2026-11-03",
        startTime: "13:00",
        endTime: "14:20",
      }),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.session.duration, 80); // 13:00 to 14:20 = 80 min
    createdSessionId = body.session.id;
  });

  test("POST /api/session rejects inconsistent duration with 400", async () => {
    const res = await request("/api/session", {
      method: "POST",
      headers: { Cookie: authCookie },
      body: JSON.stringify({
        title: "Malicious Duration Session",
        subjectId,
        date: "2026-11-03",
        startTime: "09:00",
        endTime: "10:00",
        duration: 120, // Inconsistent with 60 min difference
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    const errorText = JSON.stringify(body);
    assert.match(errorText, /Duration must match/i);
  });

  test("POST /api/session rejects equal start and end time with 400", async () => {
    const res = await request("/api/session", {
      method: "POST",
      headers: { Cookie: authCookie },
      body: JSON.stringify({
        title: "Zero Length Session",
        subjectId,
        date: "2026-11-03",
        startTime: "10:00",
        endTime: "10:00",
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    const errorText = JSON.stringify(body);
    assert.match(errorText, /End time must be later than start time/i);
  });

  test("POST /api/session rejects earlier end time with 400", async () => {
    const res = await request("/api/session", {
      method: "POST",
      headers: { Cookie: authCookie },
      body: JSON.stringify({
        title: "Negative Length Session",
        subjectId,
        date: "2026-11-03",
        startTime: "15:00",
        endTime: "14:00",
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    const errorText = JSON.stringify(body);
    assert.match(errorText, /End time cannot be earlier than start time/i);
  });

  test("PUT /api/session/:id automatically recalculates duration when times are updated", async () => {
    const res = await request(`/api/session/${createdSessionId}`, {
      method: "PUT",
      headers: { Cookie: authCookie },
      body: JSON.stringify({
        startTime: "15:30",
        endTime: "18:30",
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.session.duration, 180); // 15:30 to 18:30 = 180 min
  });

  test("PUT /api/session/:id rejects inconsistent duration with 400", async () => {
    const res = await request(`/api/session/${createdSessionId}`, {
      method: "PUT",
      headers: { Cookie: authCookie },
      body: JSON.stringify({
        startTime: "10:00",
        endTime: "11:00",
        duration: 999,
      }),
    });

    assert.equal(res.status, 400);
  });

  test("PUT /api/session/:id rejects invalid earlier end time with 400", async () => {
    const res = await request(`/api/session/${createdSessionId}`, {
      method: "PUT",
      headers: { Cookie: authCookie },
      body: JSON.stringify({
        startTime: "16:00",
        endTime: "15:00",
      }),
    });

    assert.equal(res.status, 400);
  });
});
