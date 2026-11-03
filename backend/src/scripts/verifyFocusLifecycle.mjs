import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { prisma } from "../lib/prisma.js";
import { calculateActiveDurationSeconds } from "../services/focusSession.service.js";
import { chromium } from "../../../frontend/node_modules/playwright/index.mjs";

const BASE_URL = "http://localhost:5173";
const API_BASE = "http://localhost:3000";

function parseTimerToSeconds(str) {
  const parts = str.trim().split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return Number(str) || 0;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function run() {
  console.log("================================================================================");
  console.log("       FocusFlow — Focus Mode End-to-End Lifecycle Verification");
  console.log("================================================================================\n");

  // Step 0: Record baseline database state
  console.log("🔍 STEP 0: Inspect Baseline Database State...");
  const initialSessionCount = await prisma.studySession.count();
  const initialUserCount = await prisma.user.count();
  const existingPreExistingSessions = await prisma.studySession.findMany({
    select: { id: true, title: true, userId: true },
  });
  console.log(`  Existing users in DB: ${initialUserCount}`);
  console.log(`  Existing sessions in DB: ${initialSessionCount}`);
  console.log(`  Existing session IDs:`, existingPreExistingSessions.map(s => `${s.id} ("${s.title}")`));
  console.log("  CONFIRMED: Pre-existing records will not be touched.\n");

  // Step 1: Launch Browser
  console.log("🚀 STEP 1: Launch Playwright Headless Browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Monitor console errors
  const pageErrors = [];
  page.on("pageerror", (err) => {
    console.error(`  [Browser PageError] ${err.message}`);
    pageErrors.push(err.message);
  });

  const timestamp = Date.now();
  const testUserEmail = `qa_focus_${timestamp}@focusflow.test`;
  const testUserName = `Focus QA Tester ${timestamp}`;
  const testPassword = "Password123!";

  let disposableUserId = null;
  let disposableSubjectId = null;
  let disposableTopicId = null;
  let sessionAId = null;
  let sessionBId = null;
  let sessionCId = null;
  let sessionDId = null;
  let foreignUserId = null;

  try {
    // Step 2: Create disposable test user via Frontend Signup
    console.log(`\n👤 STEP 2: Create Isolated Disposable Test User (${testUserEmail})...`);
    await page.goto(`${BASE_URL}/signup`, { waitUntil: "networkidle" });

    // Fill signup form
    await page.fill('input[name="name"]', testUserName);
    await page.fill('input[name="email"]', testUserEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.check('input[name="acceptTerms"]');

    // Submit form
    await Promise.all([
      page.waitForURL((url) => url.pathname.includes("/onboarding") || url.pathname.includes("/app")),
      page.click('button[type="submit"]'),
    ]);

    // Query DB for newly created user
    const createdUser = await prisma.user.findUnique({
      where: { email: testUserEmail },
    });
    assert(Boolean(createdUser), `Disposable user created in DB with ID: ${createdUser?.id}`);
    disposableUserId = createdUser.id;

    // Create Subject, Topic, and 2 Study Sessions via Prisma
    console.log("\n📚 STEP 2b: Create Test Subject, Topic, and Scheduled Study Sessions...");
    const subject = await prisma.subject.create({
      data: {
        name: `QA Algorithms ${timestamp}`,
        userId: disposableUserId,
        color: "#3b82f6",
      },
    });
    disposableSubjectId = subject.id;
    console.log(`  Created disposable subject ID: ${disposableSubjectId} ("${subject.name}")`);

    const topic = await prisma.topic.create({
      data: {
        name: `QA Dynamic Programming ${timestamp}`,
        subjectId: disposableSubjectId,
      },
    });
    disposableTopicId = topic.id;
    console.log(`  Created disposable topic ID: ${disposableTopicId} ("${topic.name}")`);

    const sessionA = await prisma.studySession.create({
      data: {
        title: `QA Session A - Lifecycle ${timestamp}`,
        date: new Date("2026-11-02T00:00:00.000Z"),
        startTime: "10:00",
        endTime: "11:00",
        duration: 60,
        status: "upcoming",
        userId: disposableUserId,
        subjectId: disposableSubjectId,
        topicId: disposableTopicId,
      },
    });
    sessionAId = sessionA.id;
    console.log(`  Created Session A ID: ${sessionAId} ("${sessionA.title}")`);

    const sessionB = await prisma.studySession.create({
      data: {
        title: `QA Session B - Cancellation ${timestamp}`,
        date: new Date("2026-11-02T00:00:00.000Z"),
        startTime: "11:00",
        endTime: "12:00",
        duration: 60,
        status: "upcoming",
        userId: disposableUserId,
        subjectId: disposableSubjectId,
        topicId: disposableTopicId,
      },
    });
    sessionBId = sessionB.id;
    console.log(`  Created Session B ID: ${sessionBId} ("${sessionB.title}")`);

    // ========================================================================
    // SECTION 3: TEST SESSION A - COMPLETE LIFECYCLE
    // ========================================================================
    console.log("\n================================================================================");
    console.log("⏱️  SECTION 3: Test Session A — Complete Lifecycle");
    console.log("================================================================================\n");

    // 1. Navigate to Session A Focus Mode
    console.log(`1. Navigating to Focus Mode for Session A (/app/focus/${sessionAId})...`);
    await page.goto(`${BASE_URL}/app/focus/${sessionAId}`, { waitUntil: "networkidle" });
    await page.waitForSelector(`text=${sessionA.title}`);

    const startBtn = page.locator('button:has-text("Start session")');
    await startBtn.waitFor({ state: "visible" });
    assert(await startBtn.isVisible(), 'Start session button is visible for upcoming session');

    // 2. Start the scheduled session
    console.log('2. Clicking "Start session"...');
    await startBtn.click();

    // Verify UI updates to in-progress
    await page.waitForSelector('text=In focus', { timeout: 10000 });
    const pauseBtn = page.locator('button:has-text("Pause")');
    await pauseBtn.waitFor({ state: "visible" });
    assert(await pauseBtn.isVisible(), 'UI transitioned to in-progress: "In focus" badge & "Pause" button visible');

    // 3. Database verification of start
    console.log('3. Verifying Database state after start...');
    let dbSessionA = await prisma.studySession.findUnique({ where: { id: sessionAId } });
    assert(dbSessionA.status === "in-progress", `DB status is "in-progress" (actual: "${dbSessionA.status}")`);
    assert(dbSessionA.startedAt instanceof Date, `DB startedAt is populated: ${dbSessionA.startedAt?.toISOString()}`);
    assert(dbSessionA.activeStartedAt instanceof Date, `DB activeStartedAt is populated: ${dbSessionA.activeStartedAt?.toISOString()}`);
    assert(dbSessionA.activeDurationSeconds === 0, `DB activeDurationSeconds is 0 (actual: ${dbSessionA.activeDurationSeconds})`);
    assert(dbSessionA.pausedAt === null, `DB pausedAt is null`);
    assert(dbSessionA.completedAt === null, `DB completedAt is null`);

    // 4. Let the timer run for at least 10 seconds
    console.log("4. Letting timer run for ~12 seconds in browser...");
    await page.waitForTimeout(12000);
    const timerElem = page.locator('[role="timer"]');
    const timerTextAfterRun = await timerElem.innerText();
    const elapsedSeconds1 = parseTimerToSeconds(timerTextAfterRun);
    console.log(`   Browser displayed timer: ${timerTextAfterRun} (${elapsedSeconds1} seconds)`);
    assert(elapsedSeconds1 >= 10, `Timer ran for >= 10 seconds (actual: ${elapsedSeconds1}s)`);

    // 5. Pause the session
    console.log('5. Clicking "Pause" button in UI...');
    await pauseBtn.click();

    // Verify UI updates to paused
    await page.waitForSelector('text=Paused', { timeout: 10000 });
    const resumeBtn = page.locator('button:has-text("Resume")');
    await resumeBtn.waitFor({ state: "visible" });
    assert(await resumeBtn.isVisible(), 'UI transitioned to paused: "Paused" badge & "Resume" button visible');

    // 6. Verify accumulated active duration > 0 in DB
    // 7. Verify activeStartedAt is cleared
    console.log('6 & 7. Verifying DB state after pause...');
    dbSessionA = await prisma.studySession.findUnique({ where: { id: sessionAId } });
    assert(dbSessionA.status === "paused", `DB status is "paused" (actual: "${dbSessionA.status}")`);
    assert(dbSessionA.activeDurationSeconds >= 10, `DB activeDurationSeconds is >= 10 (actual: ${dbSessionA.activeDurationSeconds}s)`);
    assert(dbSessionA.activeStartedAt === null, `DB activeStartedAt is cleared (null)`);
    assert(dbSessionA.pausedAt instanceof Date, `DB pausedAt is populated: ${dbSessionA.pausedAt?.toISOString()}`);
    const pausedActiveDuration = dbSessionA.activeDurationSeconds;

    // 8. Wait while paused for at least 5 seconds
    console.log("8. Waiting while paused for ~6 seconds...");
    await page.waitForTimeout(6000);

    // 9. Verify paused time is not added
    console.log("9. Verifying paused time was not added...");
    dbSessionA = await prisma.studySession.findUnique({ where: { id: sessionAId } });
    assert(
      dbSessionA.activeDurationSeconds === pausedActiveDuration,
      `DB activeDurationSeconds remained strictly constant while paused: ${dbSessionA.activeDurationSeconds}s === ${pausedActiveDuration}s`
    );
    const timerTextWhilePaused = await timerElem.innerText();
    const elapsedSecondsWhilePaused = parseTimerToSeconds(timerTextWhilePaused);
    console.log(`   Browser displayed timer during pause: ${timerTextWhilePaused} (${elapsedSecondsWhilePaused}s)`);
    assert(
      Math.abs(elapsedSecondsWhilePaused - pausedActiveDuration) <= 1,
      `Browser timer matches accumulated active duration and did not increment during pause`
    );

    // 10. Resume the session
    console.log('10. Clicking "Resume" button in UI...');
    await resumeBtn.click();
    await page.waitForSelector('text=In focus', { timeout: 10000 });
    assert(await page.locator('button:has-text("Pause")').isVisible(), 'UI resumed to "In focus" state');

    // Verify DB resumed
    dbSessionA = await prisma.studySession.findUnique({ where: { id: sessionAId } });
    assert(dbSessionA.status === "in-progress", `DB status is "in-progress" after resume`);
    assert(dbSessionA.activeStartedAt instanceof Date, `DB activeStartedAt is repopulated: ${dbSessionA.activeStartedAt?.toISOString()}`);
    assert(dbSessionA.pausedAt === null, `DB pausedAt is reset to null`);

    // 11. Let it run again for at least 10 seconds
    console.log("11. Letting timer run for ~12 seconds after resume...");
    await page.waitForTimeout(12000);
    const timerTextAfterResume = await timerElem.innerText();
    const elapsedSeconds2 = parseTimerToSeconds(timerTextAfterResume);
    console.log(`    Browser displayed timer: ${timerTextAfterResume} (${elapsedSeconds2}s)`);
    assert(elapsedSeconds2 >= pausedActiveDuration + 10, `Timer increased by >= 10s (actual: ${elapsedSeconds2}s)`);

    // 12. Refresh the browser
    console.log("12. Refreshing browser page...");
    await page.reload({ waitUntil: "networkidle" });

    // 13. Verify active session is recovered
    console.log("13. Verifying active session recovered after refresh...");
    await page.waitForSelector(`text=${sessionA.title}`, { timeout: 10000 });
    await page.waitForSelector('text=In focus', { timeout: 10000 });
    assert(await page.locator('text=In focus').isVisible(), 'Active session recovered with "In focus" badge');
    assert(await page.locator('button:has-text("Pause")').isVisible(), 'Pause button available after refresh');

    // 14. Verify displayed timer is consistent with backend duration
    console.log("14. Checking timer consistency with backend duration...");
    dbSessionA = await prisma.studySession.findUnique({ where: { id: sessionAId } });
    const backendCalcDuration = calculateActiveDurationSeconds(dbSessionA, new Date());
    const refreshedTimerText = await page.locator('[role="timer"]').innerText();
    const refreshedTimerSeconds = parseTimerToSeconds(refreshedTimerText);
    console.log(`    Displayed timer: ${refreshedTimerText} (${refreshedTimerSeconds}s) vs Backend calculated: ${backendCalcDuration}s`);
    assert(
      Math.abs(refreshedTimerSeconds - backendCalcDuration) <= 2,
      `Displayed timer (${refreshedTimerSeconds}s) matches backend calculated duration (${backendCalcDuration}s) within 2s tolerance`
    );

    // 15. Complete the session
    console.log('15. Completing the session via UI...');
    await page.click('button:has-text("Complete")');

    // Verify dialog appears
    await page.waitForSelector('text=Complete this session?', { timeout: 5000 });
    assert(await page.locator('text=Complete this session?').isVisible(), 'Confirmation dialog opened');

    // Click confirm in dialog
    const confirmCompleteBtn = page.locator('div[role="dialog"] button:has-text("Complete session")');
    await confirmCompleteBtn.click();

    // 16. Verify status is completed in UI
    console.log("16. Verifying UI completed state...");
    await page.waitForSelector('text=Session finished', { timeout: 10000 });
    assert(await page.locator('text=Session finished').isVisible(), 'UI displays "Session finished" badge');
    assert(await page.locator('button:has-text("Return to My Day")').isVisible(), '"Return to My Day" button is visible');
    const finalDisplayedTime = await page.locator('[role="timer"]').innerText();
    const finalDisplayedSeconds = parseTimerToSeconds(finalDisplayedTime);
    console.log(`    Final study time displayed: ${finalDisplayedTime} (${finalDisplayedSeconds}s)`);

    // 17. Verify actualDurationSeconds in DB
    // 18. Verify completedAt is populated
    // 19. Verify active timing fields cleared
    console.log("17, 18 & 19. Verifying Database state after completion...");
    dbSessionA = await prisma.studySession.findUnique({ where: { id: sessionAId } });
    assert(dbSessionA.status === "completed", `DB status is "completed" (actual: "${dbSessionA.status}")`);
    assert(typeof dbSessionA.actualDurationSeconds === "number", `DB actualDurationSeconds is number: ${dbSessionA.actualDurationSeconds}s`);
    assert(dbSessionA.actualDurationSeconds >= 20, `DB actualDurationSeconds is >= 20s (actual: ${dbSessionA.actualDurationSeconds}s)`);
    assert(
      Math.abs(dbSessionA.actualDurationSeconds - finalDisplayedSeconds) <= 1,
      `DB actualDurationSeconds (${dbSessionA.actualDurationSeconds}s) matches final displayed timer (${finalDisplayedSeconds}s)`
    );
    assert(dbSessionA.activeDurationSeconds === dbSessionA.actualDurationSeconds, `DB activeDurationSeconds equals actualDurationSeconds (${dbSessionA.activeDurationSeconds}s)`);
    assert(dbSessionA.completedAt instanceof Date, `DB completedAt is populated: ${dbSessionA.completedAt?.toISOString()}`);
    assert(dbSessionA.activeStartedAt === null, `DB activeStartedAt is cleared (null)`);
    assert(dbSessionA.pausedAt === null, `DB pausedAt is cleared (null)`);
    assert(dbSessionA.cancelledAt === null, `DB cancelledAt is null`);
    console.log("✅ SECTION 3 PASSED: Session A Complete Lifecycle successfully verified!\n");


    // ========================================================================
    // SECTION 4: TEST SESSION B - CANCELLATION LIFECYCLE
    // ========================================================================
    console.log("================================================================================");
    console.log("🚫 SECTION 4: Test Session B — Cancellation Lifecycle");
    console.log("================================================================================\n");

    // 1. Navigate to Session B Focus Mode
    console.log(`1. Navigating to Focus Mode for Session B (/app/focus/${sessionBId})...`);
    await page.goto(`${BASE_URL}/app/focus/${sessionBId}`, { waitUntil: "networkidle" });
    await page.waitForSelector(`text=${sessionB.title}`);

    const startBtnB = page.locator('button:has-text("Start session")');
    await startBtnB.waitFor({ state: "visible" });
    await startBtnB.click();
    await page.waitForSelector('text=In focus', { timeout: 10000 });
    assert(await page.locator('text=In focus').isVisible(), 'Session B started: "In focus" badge visible');

    // 2. Let run for at least 10 seconds
    console.log("2. Running Session B for ~12 seconds...");
    await page.waitForTimeout(12000);

    // 3. Pause it
    console.log('3. Pausing Session B...');
    await page.click('button:has-text("Pause")');
    await page.waitForSelector('text=Paused', { timeout: 10000 });
    assert(await page.locator('text=Paused').isVisible(), 'Session B paused');
    let dbSessionB = await prisma.studySession.findUnique({ where: { id: sessionBId } });
    assert(dbSessionB.activeDurationSeconds >= 10, `Session B paused with >= 10s active duration (actual: ${dbSessionB.activeDurationSeconds}s)`);

    // 4. Resume it
    console.log('4. Resuming Session B...');
    await page.click('button:has-text("Resume")');
    await page.waitForSelector('text=In focus', { timeout: 10000 });
    assert(await page.locator('text=In focus').isVisible(), 'Session B resumed');

    // 5. Let it run again for at least 10 seconds
    console.log("5. Running Session B for another ~11 seconds...");
    await page.waitForTimeout(11000);

    // 6. Cancel it
    console.log('6. Clicking "Cancel" button in UI...');
    await page.click('button:has-text("Cancel")');

    // Verify dialog appears
    await page.waitForSelector('text=Cancel this session?', { timeout: 5000 });
    assert(await page.locator('text=Cancel this session?').isVisible(), 'Cancel confirmation dialog opened');

    const confirmCancelBtn = page.locator('div[role="dialog"] button:has-text("Cancel session")');
    await confirmCancelBtn.click();

    // 7. Verify status is cancelled in UI
    console.log("7. Verifying UI cancelled state...");
    await page.waitForSelector('text=Session finished', { timeout: 10000 });
    assert(await page.locator('text=Session finished').isVisible(), 'UI displays "Session finished" badge');
    assert(await page.locator('button:has-text("Return to My Day")').isVisible(), '"Return to My Day" button is visible');
    const cancelledDisplayTime = await page.locator('[role="timer"]').innerText();
    const cancelledDisplaySeconds = parseTimerToSeconds(cancelledDisplayTime);
    console.log(`   Final cancelled study time displayed: ${cancelledDisplayTime} (${cancelledDisplaySeconds}s)`);

    // 8-12. Database verification for Session B
    console.log("8-12. Verifying Database state for Session B after cancellation...");
    dbSessionB = await prisma.studySession.findUnique({ where: { id: sessionBId } });
    assert(dbSessionB.status === "cancelled", `DB status is "cancelled" (actual: "${dbSessionB.status}")`);
    assert(dbSessionB.activeDurationSeconds >= 20, `DB activeDurationSeconds is preserved: ${dbSessionB.activeDurationSeconds}s`);
    assert(dbSessionB.actualDurationSeconds === dbSessionB.activeDurationSeconds, `DB actualDurationSeconds matches activeDurationSeconds: ${dbSessionB.actualDurationSeconds}s`);
    assert(
      Math.abs(dbSessionB.actualDurationSeconds - cancelledDisplaySeconds) <= 1,
      `DB actualDurationSeconds matches browser timer display`
    );
    assert(dbSessionB.cancelledAt instanceof Date, `DB cancelledAt is populated: ${dbSessionB.cancelledAt?.toISOString()}`);
    assert(dbSessionB.completedAt === null, `DB completedAt is null`);
    assert(dbSessionB.activeStartedAt === null, `DB activeStartedAt is cleared (null)`);
    assert(dbSessionB.pausedAt === null, `DB pausedAt is cleared (null)`);
    assert(dbSessionB.status !== "completed", `Session B is explicitly NOT counted as completed`);
    console.log("✅ SECTION 4 PASSED: Session B Cancellation Lifecycle successfully verified!\n");


    // ========================================================================
    // SECTION 5: CONFLICT AND RECOVERY TESTS
    // ========================================================================
    console.log("================================================================================");
    console.log("🛡️  SECTION 5: Conflict and Recovery Tests");
    console.log("================================================================================\n");

    // Create disposable Session C and Session D
    const sessionC = await prisma.studySession.create({
      data: {
        title: `QA Session C - Active Conflict ${timestamp}`,
        date: new Date("2026-11-02T00:00:00.000Z"),
        startTime: "13:00",
        endTime: "14:00",
        duration: 60,
        status: "upcoming",
        userId: disposableUserId,
        subjectId: disposableSubjectId,
        topicId: disposableTopicId,
      },
    });
    sessionCId = sessionC.id;

    const sessionD = await prisma.studySession.create({
      data: {
        title: `QA Session D - Second Active Attempt ${timestamp}`,
        date: new Date("2026-11-02T00:00:00.000Z"),
        startTime: "14:00",
        endTime: "15:00",
        duration: 60,
        status: "upcoming",
        userId: disposableUserId,
        subjectId: disposableSubjectId,
        topicId: disposableTopicId,
      },
    });
    sessionDId = sessionD.id;

    // Start Session C
    console.log("5.1: Starting Session C via UI...");
    await page.goto(`${BASE_URL}/app/focus/${sessionCId}`, { waitUntil: "networkidle" });
    await page.click('button:has-text("Start session")');
    await page.waitForSelector('text=In focus', { timeout: 10000 });
    assert(await page.locator('text=In focus').isVisible(), 'Session C is now active (in-progress)');

    // Verify user cannot start a second active session (API check)
    console.log("5.1b: Attempting to start second session (Session D) via backend API...");
    // Get cookies from browser context to test authenticated API call
    const cookies = await context.cookies();
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");

    const conflictStartResponse = await fetch(`${API_BASE}/api/session/${sessionDId}/focus/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
    });
    const conflictStartData = await conflictStartResponse.json();
    console.log(`   Backend response status: ${conflictStartResponse.status}`, conflictStartData);
    assert(conflictStartResponse.status === 409, `Backend rejected second active session with 409 Conflict`);
    assert(
      conflictStartData.error === "Another study session is already active",
      `Error message confirms: "${conflictStartData.error}"`
    );

    // 5.2 Opening another session while one is active offers to open the current session
    console.log(`5.2: Navigating to Session D route (/app/focus/${sessionDId}) in browser while Session C is active...`);
    await page.goto(`${BASE_URL}/app/focus/${sessionDId}`, { waitUntil: "networkidle" });
    await page.waitForSelector('text=Another session is already active', { timeout: 10000 });
    assert(
      await page.locator('text=Another session is already active').isVisible(),
      'Conflict view rendered: "Another session is already active"'
    );
    assert(
      await page.locator('text=FocusFlow keeps one active study session at a time. Open the current session to continue.').isVisible(),
      'Helpful explanation displayed'
    );
    const openActiveBtn = page.locator('button:has-text("Open active session")');
    assert(await openActiveBtn.isVisible(), '"Open active session" button is present');

    console.log('     Clicking "Open active session" button...');
    await openActiveBtn.click();
    await page.waitForURL((url) => url.pathname.includes(`/app/focus/${sessionCId}`), { timeout: 10000 });
    assert(page.url().includes(`/app/focus/${sessionCId}`), `Browser redirected to active session C: ${page.url()}`);
    await page.waitForSelector(`text=${sessionC.title}`, { timeout: 10000 });
    assert(await page.locator(`text=${sessionC.title}`).isVisible(), 'Session C is displayed');

    // 5.3 Refresh restores current paused session
    console.log("5.3: Pausing Session C and refreshing browser...");
    await page.click('button:has-text("Pause")');
    await page.waitForSelector('text=Paused', { timeout: 10000 });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector('text=Paused', { timeout: 10000 });
    assert(await page.locator('text=Paused').isVisible(), 'Browser refresh restored paused session C in "Paused" state');
    assert(await page.locator('button:has-text("Resume")').isVisible(), '"Resume" button is present after refresh');

    // 5.4 Leaving Focus Mode does not pause or complete the session
    console.log("5.4: Testing Leaving Focus Mode behavior...");
    await page.click('button:has-text("Resume")');
    await page.waitForSelector('text=In focus', { timeout: 10000 });

    console.log('     Clicking "Exit Focus Mode" in header...');
    await page.click('button:has-text("Exit Focus Mode")');
    await page.waitForSelector('text=Leave Focus Mode?', { timeout: 5000 });
    assert(await page.locator('text=Leave Focus Mode?').isVisible(), 'Exit confirmation dialog appeared');
    assert(
      await page.locator('text=Your session will continue tracking in the background. Leaving does not complete or cancel it.').isVisible(),
      'Dialog correctly informs user that session continues tracking'
    );

    console.log('     Confirming "Leave Focus Mode"...');
    await page.click('div[role="dialog"] button:has-text("Leave Focus Mode")');
    await page.waitForURL((url) => url.pathname.includes("/app/day"), { timeout: 10000 });
    assert(page.url().includes("/app/day"), `Navigated away to My Day: ${page.url()}`);

    // Verify in DB that Session C is STILL in-progress and tracking!
    const dbSessionCAfterExit = await prisma.studySession.findUnique({ where: { id: sessionCId } });
    assert(dbSessionCAfterExit.status === "in-progress", `DB session status is STILL "in-progress" after exiting UI`);
    assert(dbSessionCAfterExit.activeStartedAt instanceof Date, `DB activeStartedAt is STILL populated and running`);
    assert(dbSessionCAfterExit.pausedAt === null, `DB pausedAt is null (not paused)`);
    assert(dbSessionCAfterExit.completedAt === null, `DB completedAt is null (not completed)`);
    assert(dbSessionCAfterExit.cancelledAt === null, `DB cancelledAt is null (not cancelled)`);

    // Clean up Session C by cancelling it
    await fetch(`${API_BASE}/api/session/${sessionCId}/focus/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    });

    // 5.5 Repeated completion does not double-count
    console.log("5.5: Testing repeated completion idempotency on Session A...");
    const dbSessionABeforeRepeat = await prisma.studySession.findUnique({ where: { id: sessionAId } });
    const repeatCompleteResponse = await fetch(`${API_BASE}/api/session/${sessionAId}/focus/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    });
    const repeatCompleteData = await repeatCompleteResponse.json();
    assert(repeatCompleteResponse.status === 200, `Repeated completion returned 200 OK`);
    assert(
      repeatCompleteData.session.actualDurationSeconds === dbSessionABeforeRepeat.actualDurationSeconds,
      `Repeated completion preserved actualDurationSeconds: ${repeatCompleteData.session.actualDurationSeconds}s === ${dbSessionABeforeRepeat.actualDurationSeconds}s`
    );
    assert(
      new Date(repeatCompleteData.session.completedAt).getTime() === dbSessionABeforeRepeat.completedAt.getTime(),
      `Repeated completion preserved original completedAt timestamp`
    );

    // 5.6 Unauthorized access is rejected
    console.log("5.6: Testing unauthorized access rejections...");
    const unauthActiveResponse = await fetch(`${API_BASE}/api/session/focus/active`);
    assert(unauthActiveResponse.status === 401, `GET /api/session/focus/active without auth returns 401 Unauthorized (actual: ${unauthActiveResponse.status})`);

    const unauthStartResponse = await fetch(`${API_BASE}/api/session/${sessionAId}/focus/start`, {
      method: "POST",
    });
    assert(unauthStartResponse.status === 401, `POST /api/session/:id/focus/start without auth returns 401 Unauthorized (actual: ${unauthStartResponse.status})`);

    // Foreign user isolation test
    const foreignUser = await prisma.user.create({
      data: {
        name: "Foreign QA User",
        email: `foreign_qa_${timestamp}@focusflow.test`,
      },
    });
    foreignUserId = foreignUser.id;
    const { generateToken } = await import("../utils/authToken.js");
    const foreignToken = generateToken(foreignUserId);
    const foreignCookie = `token=${foreignToken}`;

    const foreignAccessResponse = await fetch(`${API_BASE}/api/session/${sessionAId}/focus/start`, {
      method: "POST",
      headers: { Cookie: foreignCookie },
    });
    assert(foreignAccessResponse.status === 404, `Access to Session A by foreign user returns 404 (actual: ${foreignAccessResponse.status})`);
    console.log("✅ SECTION 5 PASSED: Conflict and Recovery tests fully verified!\n");


    // ========================================================================
    // SECTION 6: DETAILED DATABASE VERIFICATION
    // ========================================================================
    console.log("================================================================================");
    console.log("📊 SECTION 6: Database Verification Snapshot");
    console.log("================================================================================\n");

    const finalSessionA = await prisma.studySession.findUnique({ where: { id: sessionAId } });
    const finalSessionB = await prisma.studySession.findUnique({ where: { id: sessionBId } });

    console.log("Session A (Complete Lifecycle):");
    console.table({
      id: finalSessionA.id,
      title: finalSessionA.title,
      status: finalSessionA.status,
      duration: `${finalSessionA.duration} min (planned)`,
      activeDurationSeconds: `${finalSessionA.activeDurationSeconds}s`,
      actualDurationSeconds: `${finalSessionA.actualDurationSeconds}s`,
      startedAt: finalSessionA.startedAt?.toISOString(),
      activeStartedAt: finalSessionA.activeStartedAt ? finalSessionA.activeStartedAt.toISOString() : "null (cleared)",
      pausedAt: finalSessionA.pausedAt ? finalSessionA.pausedAt.toISOString() : "null (cleared)",
      completedAt: finalSessionA.completedAt?.toISOString(),
      cancelledAt: finalSessionA.cancelledAt ? finalSessionA.cancelledAt.toISOString() : "null",
    });

    console.log("\nSession B (Cancellation Lifecycle):");
    console.table({
      id: finalSessionB.id,
      title: finalSessionB.title,
      status: finalSessionB.status,
      duration: `${finalSessionB.duration} min (planned)`,
      activeDurationSeconds: `${finalSessionB.activeDurationSeconds}s`,
      actualDurationSeconds: `${finalSessionB.actualDurationSeconds}s`,
      startedAt: finalSessionB.startedAt?.toISOString(),
      activeStartedAt: finalSessionB.activeStartedAt ? finalSessionB.activeStartedAt.toISOString() : "null (cleared)",
      pausedAt: finalSessionB.pausedAt ? finalSessionB.pausedAt.toISOString() : "null (cleared)",
      completedAt: finalSessionB.completedAt ? finalSessionB.completedAt.toISOString() : "null",
      cancelledAt: finalSessionB.cancelledAt?.toISOString(),
    });

  } finally {
    // ========================================================================
    // SECTION 7: CLEANUP
    // ========================================================================
    console.log("\n================================================================================");
    console.log("🧹 SECTION 7: Cleanup of Disposable Records");
    console.log("================================================================================\n");

    if (sessionAId) {
      await prisma.studySession.delete({ where: { id: sessionAId } }).catch(() => {});
      console.log(`  Deleted disposable Session A: ${sessionAId}`);
    }
    if (sessionBId) {
      await prisma.studySession.delete({ where: { id: sessionBId } }).catch(() => {});
      console.log(`  Deleted disposable Session B: ${sessionBId}`);
    }
    if (sessionCId) {
      await prisma.studySession.delete({ where: { id: sessionCId } }).catch(() => {});
      console.log(`  Deleted disposable Session C: ${sessionCId}`);
    }
    if (sessionDId) {
      await prisma.studySession.delete({ where: { id: sessionDId } }).catch(() => {});
      console.log(`  Deleted disposable Session D: ${sessionDId}`);
    }
    if (disposableTopicId) {
      await prisma.topic.delete({ where: { id: disposableTopicId } }).catch(() => {});
      console.log(`  Deleted disposable Topic: ${disposableTopicId}`);
    }
    if (disposableSubjectId) {
      await prisma.subject.delete({ where: { id: disposableSubjectId } }).catch(() => {});
      console.log(`  Deleted disposable Subject: ${disposableSubjectId}`);
    }
    if (disposableUserId) {
      await prisma.user.delete({ where: { id: disposableUserId } }).catch(() => {});
      console.log(`  Deleted disposable User: ${disposableUserId} (${testUserEmail})`);
    }
    if (foreignUserId) {
      await prisma.user.delete({ where: { id: foreignUserId } }).catch(() => {});
      console.log(`  Deleted foreign test user: ${foreignUserId}`);
    }

    // Verify existing database records untouched
    const finalSessionCount = await prisma.studySession.count();
    const finalUserCount = await prisma.user.count();
    const remainingSessions = await prisma.studySession.findMany({ select: { id: true, title: true } });

    console.log(`\n  Post-cleanup verification:`);
    console.log(`  Sessions in DB: ${finalSessionCount} (baseline was: ${initialSessionCount})`);
    console.log(`  Users in DB: ${finalUserCount} (baseline was: ${initialUserCount})`);
    console.log(`  Remaining sessions in DB:`, remainingSessions.map(s => `${s.id} ("${s.title}")`));

    assert(finalSessionCount === initialSessionCount, `Session count matches baseline exactly (${finalSessionCount} === ${initialSessionCount})`);
    assert(finalUserCount === initialUserCount, `User count matches baseline exactly (${finalUserCount} === ${initialUserCount})`);
    console.log("  ✓ Pre-existing records confirmed 100% untouched!\n");

    await browser.close();
    await prisma.$disconnect();
  }

  console.log("================================================================================");
  console.log("🎉 ALL E2E LIFECYCLE, CONFLICT, RECOVERY, AND DB VERIFICATIONS PASSED!");
  console.log("================================================================================\n");
}

run().catch((err) => {
  console.error("\n❌ E2E VERIFICATION FAILED:", err);
  process.exit(1);
});
