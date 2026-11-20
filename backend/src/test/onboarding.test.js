import test, { before, after, describe } from "node:test";
import assert from "node:assert/strict";
import "dotenv/config";
import app from "../app.js";
import { prisma } from "../lib/prisma.js";

let server;
let baseUrl;
let testUserEmail = `onboarding_test_${Date.now()}@example.com`;
let otherUserEmail = `other_user_${Date.now()}@example.com`;
let authCookie;
let createdUser;
let otherUser;

const request = (path, options = {}, cookie = null) =>
  fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(cookie !== null ? (cookie ? { Cookie: cookie } : {}) : (authCookie ? { Cookie: authCookie } : {})),
      ...(options.headers || {}),
    },
  });

before(async () => {
  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;

  // Create an existing "other user" to verify profile ownership scoping
  otherUser = await prisma.user.create({
    data: {
      name: "Original Scholar",
      email: otherUserEmail,
      institution: "Harvard University",
      degree: "B.A. Philosophy",
      onboardingCompleted: true,
      onboardingCompletedAt: new Date(),
    },
  });
});

after(async () => {
  if (createdUser?.id) {
    await prisma.user.delete({ where: { id: createdUser.id } }).catch(() => {});
  }
  if (otherUser?.id) {
    await prisma.user.delete({ where: { id: otherUser.id } }).catch(() => {});
  }
  if (server) {
    server.close();
  }
});

describe("FocusFlow Authentication & Academic Onboarding Lifecycle Contract", () => {
  test("1. New student registration creates user with onboardingCompleted = false and onboardingCompletedAt = null", async () => {
    const res = await request("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        name: "Alex Rivera",
        email: testUserEmail,
        password: "Password123!",
      }),
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.user);
    assert.equal(data.user.name, "Alex Rivera");
    assert.equal(data.user.email, testUserEmail);
    assert.equal(data.user.onboardingCompleted, false);
    assert.equal(data.user.onboardingCompletedAt, null);
    assert.equal(data.user.institution, null);
    assert.equal(data.user.academicYear, null);
    assert.equal(data.user.currentSemester, null);

    authCookie = res.headers.get("set-cookie");
    createdUser = data.user;
  });

  test("2. GET /api/auth/me and GET /api/user reflect onboardingCompleted = false for fresh user", async () => {
    const meRes = await request("/api/auth/me");
    assert.equal(meRes.status, 200);
    const meData = await meRes.json();
    assert.equal(meData.user.onboardingCompleted, false);
    assert.equal(meData.user.onboardingCompletedAt, null);

    const userRes = await request("/api/user");
    assert.equal(userRes.status, 200);
    const userData = await userRes.json();
    assert.equal(userData.user.onboardingCompleted, false);
    assert.equal(userData.user.id, createdUser.id);
  });

  test("3. Incomplete onboarding: partial data save keeps onboardingCompleted = false and preserves data", async () => {
    // Save Step 1 data partially without completing onboarding
    const partialProfile = {
      name: "Alex Rivera",
      institution: "Stanford University",
      degree: "B.S. Computer Science",
      department: "School of Engineering",
      academicYear: 3,
      currentSemester: 5,
      onboardingCompleted: false,
    };

    const res = await request("/api/user/onboarding", {
      method: "PUT",
      body: JSON.stringify(partialProfile),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.user);
    assert.equal(data.user.onboardingCompleted, false);
    assert.equal(data.user.onboardingCompletedAt, null);
    assert.equal(data.user.institution, "Stanford University");
    assert.equal(data.user.degree, "B.S. Computer Science");
    assert.equal(data.user.academicYear, 3);
    assert.equal(data.user.currentSemester, 5);

    // Verify GET /api/user also returns the partial data while incomplete
    const verifyRes = await request("/api/user");
    const verifyData = await verifyRes.json();
    assert.equal(verifyData.user.onboardingCompleted, false);
    assert.equal(verifyData.user.institution, "Stanford University");
    assert.equal(verifyData.user.degree, "B.S. Computer Science");
  });

  test("4. Incomplete onboarding resumes on new session login without losing partial data", async () => {
    // Simulate user logging in again after closing browser
    const loginRes = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: testUserEmail,
        password: "Password123!",
      }),
    }, "");

    assert.equal(loginRes.status, 200);
    const loginData = await loginRes.json();
    assert.equal(loginData.user.onboardingCompleted, false);
    assert.equal(loginData.user.institution, "Stanford University");
    assert.equal(loginData.user.degree, "B.S. Computer Science");
    assert.equal(loginData.user.currentSemester, 5);

    // Update cookie from login
    authCookie = loginRes.headers.get("set-cookie");
  });

  test("5. Invalid academic information is rejected with 400 Bad Request", async () => {
    // Case A: academicYear out of range (min is 1)
    const res1 = await request("/api/user/onboarding", {
      method: "PUT",
      body: JSON.stringify({ academicYear: 0 }),
    });
    assert.equal(res1.status, 400);

    // Case B: targetCgpa greater than 10
    const res2 = await request("/api/user/onboarding", {
      method: "PUT",
      body: JSON.stringify({ targetCgpa: 15.5 }),
    });
    assert.equal(res2.status, 400);

    // Case C: defaultFocusDuration out of bounds (> 180 min)
    const res3 = await request("/api/user/onboarding", {
      method: "PUT",
      body: JSON.stringify({ defaultFocusDuration: 240 }),
    });
    assert.equal(res3.status, 400);

    // Case D: invalid date format
    const res4 = await request("/api/user/onboarding", {
      method: "PUT",
      body: JSON.stringify({ semesterStartDate: "not-a-date" }),
    });
    assert.equal(res4.status, 400);
  });

  test("6. User cannot modify another user's academic profile via payload tampering", async () => {
    // Attempt to pass otherUser.id in payload
    const maliciousPayload = {
      userId: otherUser.id,
      id: otherUser.id,
      institution: "MIT (Hacked)",
      degree: "B.S. Physics",
      academicYear: 1,
      currentSemester: 1,
      onboardingCompleted: false,
    };

    const res = await request("/api/user/onboarding", {
      method: "PUT",
      body: JSON.stringify(maliciousPayload),
    });
    assert.equal(res.status, 200);

    // Verify otherUser was NOT modified
    const untouchedOther = await prisma.user.findUnique({
      where: { id: otherUser.id },
    });
    assert.equal(untouchedOther.institution, "Harvard University");
    assert.equal(untouchedOther.degree, "B.A. Philosophy");
    assert.equal(untouchedOther.onboardingCompleted, true);
  });

  test("7. Successful onboarding completion persists all academic data and records onboardingCompletedAt", async () => {
    const fullAcademicProfile = {
      institution: "Stanford University",
      degree: "B.S. Computer Science",
      department: "School of Engineering",
      academicYear: 3,
      currentSemester: 5,
      academicSession: "2026-2027",
      semesterStartDate: "2026-09-01",
      semesterEndDate: "2026-12-20",
      expectedGraduationYear: 2028,
      studyGoal: "Master Distributed Systems & Graduate Summa Cum Laude",
      secondaryGoals: ["Build OS Kernel", "Research LLM Inference"],
      customGoal: "Publish research paper in OSDI",
      targetCgpa: 3.95,
      dailyStudyHours: 6,
      preferredStartTime: "08:30",
      preferredEndTime: "18:00",
      defaultFocusDuration: 45,
      defaultBreakDuration: 10,
      onboardingCompleted: true,
    };

    const res = await request("/api/user/onboarding", {
      method: "PUT",
      body: JSON.stringify(fullAcademicProfile),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.user);
    assert.equal(data.user.onboardingCompleted, true);
    assert.ok(data.user.onboardingCompletedAt);
    assert.equal(data.user.institution, "Stanford University");
    assert.equal(data.user.degree, "B.S. Computer Science");
    assert.equal(data.user.department, "School of Engineering");
    assert.equal(data.user.academicYear, 3);
    assert.equal(data.user.currentSemester, 5);
    assert.equal(data.user.academicSession, "2026-2027");
    assert.equal(data.user.expectedGraduationYear, 2028);
    assert.equal(data.user.dailyStudyHours, 6);
    assert.equal(data.user.defaultFocusDuration, 45);
    assert.equal(data.user.defaultBreakDuration, 10);
    assert.equal(data.user.targetCgpa, 3.95);
    assert.deepEqual(data.user.secondaryGoals, ["Build OS Kernel", "Research LLM Inference"]);
  });

  test("8. Multiple onboarding submissions are idempotent and do not create duplicate records", async () => {
    const duplicateSubmission = {
      institution: "Stanford University",
      degree: "B.S. Computer Science",
      onboardingCompleted: true,
    };

    const res1 = await request("/api/user/onboarding", {
      method: "PUT",
      body: JSON.stringify(duplicateSubmission),
    });
    assert.equal(res1.status, 200);

    const res2 = await request("/api/user/onboarding", {
      method: "POST",
      body: JSON.stringify(duplicateSubmission),
    });
    assert.equal(res2.status, 200);

    const userInDb = await prisma.user.findUnique({
      where: { id: createdUser.id },
    });
    assert.equal(userInDb.onboardingCompleted, true);
    assert.equal(userInDb.institution, "Stanford University");
  });

  test("9. Existing user login returns onboardingCompleted = true and skips onboarding", async () => {
    const res = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: testUserEmail,
        password: "Password123!",
      }),
    }, "");

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.user.onboardingCompleted, true);
    assert.ok(data.user.onboardingCompletedAt);
  });

  test("10. Logout and subsequent login do not restart onboarding", async () => {
    // Logout
    const logoutRes = await request("/api/auth/logout", { method: "POST" });
    assert.equal(logoutRes.status, 200);

    // Login again
    const loginRes = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: testUserEmail,
        password: "Password123!",
      }),
    }, "");

    assert.equal(loginRes.status, 200);
    const loginData = await loginRes.json();
    assert.equal(loginData.user.onboardingCompleted, true);
    assert.ok(loginData.user.onboardingCompletedAt);

    // Verify GET /api/auth/me with restored session
    const meRes = await request("/api/auth/me", {}, loginRes.headers.get("set-cookie"));
    assert.equal(meRes.status, 200);
    const meData = await meRes.json();
    assert.equal(meData.user.onboardingCompleted, true);
    assert.ok(meData.user.onboardingCompletedAt);
  });

  test("11. Existing users created before academic onboarding remain compatible", async () => {
    // Create an old user simulating pre-existing active student
    const legacyEmail = `legacy_student_${Date.now()}@example.com`;
    const passwordHash = await (await import("bcrypt")).default.hash("Password123!", 10);
    const legacyUser = await prisma.user.create({
      data: {
        name: "Legacy Scholar",
        email: legacyEmail,
        passwordHash,
        createdAt: new Date("2026-10-01T00:00:00.000Z"),
        onboardingCompleted: false, // simulating pre-migration default
        subjects: {
          create: {
            name: "Classical Mechanics",
          },
        },
      },
    });

    try {
      const loginRes = await request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: legacyEmail,
          password: "Password123!",
        }),
      }, "");

      assert.equal(loginRes.status, 200);
      const data = await loginRes.json();
      assert.equal(data.user.onboardingCompleted, true);
      assert.ok(data.user.onboardingCompletedAt);
    } finally {
      await prisma.user.delete({ where: { id: legacyUser.id } }).catch(() => {});
    }
  });
});
