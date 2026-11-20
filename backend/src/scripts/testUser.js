import "dotenv/config";
import app from "../app.js";

async function runUserTests() {
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`User test server running at ${baseUrl}`);

  let testPassed = 0;
  let testFailed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      testPassed++;
    } else {
      console.error(`[FAIL] ${message}`);
      testFailed++;
    }
  }

  try {
    // Test 1: GET /api/user without auth should return 401
    const unauthRes = await fetch(`${baseUrl}/api/user`);
    const unauthData = await unauthRes.json();
    assert(
      unauthRes.status === 401 && unauthData.message.includes("Authentication required"),
      "GET /api/user without auth returns 401"
    );

    // Test 2: Sign up a new test user to get cookie
    const testEmail1 = `user_test_${Date.now()}@focusflow.test`;
    const initialPassword = "initialPassword123!";
    const signupRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Initial Student",
        email: testEmail1,
        password: initialPassword,
      }),
    });
    const signupCookie = signupRes.headers.get("set-cookie");
    assert(signupRes.status === 201 && signupCookie, "Test user 1 signed up successfully");

    // Test 3: GET /api/user with auth cookie
    const userRes = await fetch(`${baseUrl}/api/user`, {
      headers: { Cookie: signupCookie },
    });
    const userData = await userRes.json();
    assert(
      userRes.status === 200 &&
      userData.user &&
      userData.user.email === testEmail1 &&
      userData.user.passwordHash === undefined,
      "GET /api/user returns 200 with safe user details (no passwordHash)"
    );

    // Test 4: PUT /api/user/update with empty body returns 400
    const emptyUpdateRes = await fetch(`${baseUrl}/api/user/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: signupCookie,
      },
      body: JSON.stringify({}),
    });
    assert(emptyUpdateRes.status === 400, "PUT /api/user/update with empty body returns 400");

    // Test 5: PUT /api/user/update with invalid dailyStudyHours (e.g. 50) returns 400
    const invalidHoursRes = await fetch(`${baseUrl}/api/user/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: signupCookie,
      },
      body: JSON.stringify({ dailyStudyHours: 50 }),
    });
    assert(invalidHoursRes.status === 400, "PUT /api/user/update with dailyStudyHours > 24 returns 400");

    // Test 6: PUT /api/user/update with valid profile and study preferences
    const validUpdateRes = await fetch(`${baseUrl}/api/user/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: signupCookie,
      },
      body: JSON.stringify({
        name: "Updated Name",
        studyGoal: "Score 4.0 GPA",
        dailyStudyHours: 6,
        preferredStartTime: "08:30",
        preferredEndTime: "17:30",
        reminderEnabled: false,
      }),
    });
    const validUpdateData = await validUpdateRes.json();
    assert(
      validUpdateRes.status === 200 &&
      validUpdateData.user &&
      validUpdateData.user.name === "Updated Name" &&
      validUpdateData.user.studyGoal === "Score 4.0 GPA" &&
      validUpdateData.user.dailyStudyHours === 6 &&
      validUpdateData.user.reminderEnabled === false &&
      validUpdateData.user.passwordHash === undefined,
      "PUT /api/user/update correctly updates user details and returns safe user object"
    );

    // Test 7: Email uniqueness on update - signup second user
    const testEmail2 = `user_test_2_${Date.now()}@focusflow.test`;
    const signupRes2 = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Second Student",
        email: testEmail2,
        password: "password123!",
      }),
    });
    assert(signupRes2.status === 201, "Test user 2 signed up successfully");

    // Try to update user 1's email to user 2's email
    const duplicateEmailRes = await fetch(`${baseUrl}/api/user/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: signupCookie,
      },
      body: JSON.stringify({ email: testEmail2 }),
    });
    assert(duplicateEmailRes.status === 409, "PUT /api/user/update with already taken email returns 409 Conflict");

    // Test 8: PUT /api/user/update-password with wrong current password
    const wrongCurrentRes = await fetch(`${baseUrl}/api/user/update-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: signupCookie,
      },
      body: JSON.stringify({
        currentPassword: "wrongCurrentPassword!",
        newPassword: "freshPassword123!",
        confirmPassword: "freshPassword123!",
      }),
    });
    assert(wrongCurrentRes.status === 400, "PUT /api/user/update-password with wrong current password returns 400");

    // Test 9: PUT /api/user/update-password with mismatched confirmation
    const mismatchRes = await fetch(`${baseUrl}/api/user/update-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: signupCookie,
      },
      body: JSON.stringify({
        currentPassword: initialPassword,
        newPassword: "freshPassword123!",
        confirmPassword: "differentPassword123!",
      }),
    });
    assert(mismatchRes.status === 400, "PUT /api/user/update-password with mismatched confirmPassword returns 400");

    // Test 10: PUT /api/user/update-password with same password
    const samePassRes = await fetch(`${baseUrl}/api/user/update-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: signupCookie,
      },
      body: JSON.stringify({
        currentPassword: initialPassword,
        newPassword: initialPassword,
        confirmPassword: initialPassword,
      }),
    });
    assert(samePassRes.status === 400, "PUT /api/user/update-password with same password returns 400");

    // Test 11: PUT /api/user/update-password with valid parameters
    const newPassword = "newSecurePassword456!";
    const validPassRes = await fetch(`${baseUrl}/api/user/update-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: signupCookie,
      },
      body: JSON.stringify({
        currentPassword: initialPassword,
        newPassword,
        confirmPassword: newPassword,
      }),
    });
    const validPassData = await validPassRes.json();
    assert(
      validPassRes.status === 200 && validPassData.message.includes("Password updated successfully"),
      "PUT /api/user/update-password updates password successfully"
    );

    // Test 12: Verify login with new password succeeds and old password fails
    const oldLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail1, password: initialPassword }),
    });
    assert(oldLoginRes.status === 401, "Login with old password now fails with 401");

    const newLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail1, password: newPassword }),
    });
    assert(newLoginRes.status === 200, "Login with new password succeeds with 200");
    const newCookie = newLoginRes.headers.get("set-cookie");

    // Test 13: PUT /api/user/theme is retired and returns 404
    const retiredThemeRes = await fetch(`${baseUrl}/api/user/theme`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: newCookie,
      },
      body: JSON.stringify({ theme: "dark" }),
    });
    assert(retiredThemeRes.status === 404, "PUT /api/user/theme is retired and returns 404 Not Found");

    // Test 17: PUT /api/user/update with dailyStudyHours: 0 (configured rest / zero target)
    const zeroHoursRes = await fetch(`${baseUrl}/api/user/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: newCookie,
      },
      body: JSON.stringify({ dailyStudyHours: 0 }),
    });
    const zeroHoursData = await zeroHoursRes.json();
    assert(
      zeroHoursRes.status === 200 &&
      zeroHoursData.user &&
      zeroHoursData.user.dailyStudyHours === 0,
      "PUT /api/user/update accepts dailyStudyHours: 0 as a valid target"
    );

    // Test 18: GET /api/user/export returns structured academic backup
    const exportRes = await fetch(`${baseUrl}/api/user/export`, {
      headers: { Cookie: newCookie },
    });
    const exportData = await exportRes.json();
    assert(
      exportRes.status === 200 &&
      exportData.exportedAt &&
      exportData.user &&
      exportData.user.email === testEmail1 &&
      Array.isArray(exportData.subjects) &&
      Array.isArray(exportData.sessions),
      "GET /api/user/export returns structured academic backup JSON"
    );

    // Test 19a: DELETE /api/user/account without confirmation token returns 400
    const unconfirmedDeleteRes = await fetch(`${baseUrl}/api/user/account`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Cookie: newCookie,
      },
      body: JSON.stringify({}),
    });
    assert(
      unconfirmedDeleteRes.status === 400,
      "DELETE /api/user/account without confirmation returns 400 safeguard rejection"
    );

    // Test 19b: DELETE /api/user/account with valid confirmation token wipes user and clears auth cookie
    const deleteRes = await fetch(`${baseUrl}/api/user/account`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Cookie: newCookie,
      },
      body: JSON.stringify({ confirmation: "DELETE" }),
    });
    const deleteCookie = deleteRes.headers.get("set-cookie");
    const deleteData = await deleteRes.json();
    assert(
      deleteRes.status === 200 &&
      deleteData.message.includes("permanently deleted") &&
      deleteCookie &&
      deleteCookie.includes("token=;"),
      "DELETE /api/user/account with DELETE token deletes user and clears auth cookie"
    );

    // Test 20: Verify deleted user cannot authenticate
    const postDeleteUserRes = await fetch(`${baseUrl}/api/user`, {
      headers: { Cookie: newCookie },
    });
    assert(
      postDeleteUserRes.status === 401,
      "Deleted user cannot access /api/user"
    );

    console.log(`\nUser test results: ${testPassed} passed, ${testFailed} failed.`);
  } catch (err) {
    console.error("Test error:", err);
    testFailed++;
  } finally {
    server.close();
    const { prisma } = await import("../lib/prisma.js");
    await prisma.$disconnect();
    process.exit(testFailed === 0 ? 0 : 1);
  }
}

runUserTests();
