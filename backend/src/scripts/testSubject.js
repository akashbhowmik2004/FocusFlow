import "dotenv/config";
import app from "../app.js";

async function runSubjectTests() {
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`Subject test server running at ${baseUrl}`);

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
    // 1. Unauthenticated request should return 401
    const unauthRes = await fetch(`${baseUrl}/api/subject/`);
    assert(unauthRes.status === 401, "GET /api/subject/ without auth returns 401");

    // 2. Sign up a test user
    const testEmail = `subj_test_${Date.now()}@focusflow.test`;
    const signupRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Subject Student",
        email: testEmail,
        password: "Password123!",
      }),
    });
    const cookie = signupRes.headers.get("set-cookie");
    assert(signupRes.status === 201 && cookie, "Test user registered for subject tests");

    // 3. POST /api/subject/add with missing name returns 400
    const invalidRes = await fetch(`${baseUrl}/api/subject/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ color: "#3b82f6" }),
    });
    assert(invalidRes.status === 400, "POST /api/subject/add without name returns 400");

    // 4. POST /api/subject/add with valid data and ISO date string returns 201
    const createRes = await fetch(`${baseUrl}/api/subject/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        name: "Operating Systems",
        code: "CS350",
        color: "#10b981",
        examDate: "2026-12-10",
      }),
    });
    const createData = await createRes.json();
    assert(
      createRes.status === 201 &&
        createData.subject &&
        createData.subject.name === "Operating Systems" &&
        createData.subject.code === "CS350",
      "POST /api/subject/add creates subject and coerces date string"
    );
    const subjectId = createData.subject.id;

    // 5. GET /api/subject/ returns user's subjects
    const listRes = await fetch(`${baseUrl}/api/subject/`, {
      headers: { Cookie: cookie },
    });
    const listData = await listRes.json();
    assert(
      listRes.status === 200 &&
        Array.isArray(listData.subjects) &&
        listData.subjects.some((s) => s.id === subjectId),
      "GET /api/subject/ returns list containing newly created subject"
    );

    // 6. GET /api/subject/:id returns single subject
    const getRes = await fetch(`${baseUrl}/api/subject/${subjectId}`, {
      headers: { Cookie: cookie },
    });
    const getData = await getRes.json();
    assert(
      getRes.status === 200 && getData.subject && getData.subject.id === subjectId,
      "GET /api/subject/:id returns subject details"
    );

    // 7. PUT /api/subject/:id updates subject details
    const updateRes = await fetch(`${baseUrl}/api/subject/${subjectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        name: "Advanced Operating Systems & Kernel",
        color: "#6366f1",
      }),
    });
    const updateData = await updateRes.json();
    assert(
      updateRes.status === 200 &&
        updateData.subject &&
        updateData.subject.id === subjectId &&
        updateData.subject.name === "Advanced Operating Systems & Kernel",
      "PUT /api/subject/:id updates subject and returns updated object with ID"
    );

    // 8. DELETE /api/subject/:id deletes subject
    const deleteRes = await fetch(`${baseUrl}/api/subject/${subjectId}`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    });
    assert(deleteRes.status === 200, "DELETE /api/subject/:id deletes subject successfully");

    // 9. GET /api/subject/:id after deletion returns 404
    const getDeletedRes = await fetch(`${baseUrl}/api/subject/${subjectId}`, {
      headers: { Cookie: cookie },
    });
    assert(getDeletedRes.status === 404, "GET /api/subject/:id returns 404 after deletion");
  } catch (err) {
    console.error("Test execution error:", err);
    testFailed++;
  } finally {
    server.close();
    console.log(`\nSubject test results: ${testPassed} passed, ${testFailed} failed.`);
    if (testFailed > 0) {
      process.exit(1);
    }
  }
}

runSubjectTests();
