import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const BASE_URL = 'http://localhost:5173'
const ARTIFACT_DIR = 'C:/Users/bhowm/.gemini/antigravity/brain/63d4d251-5504-49ed-9ea8-7b827a34b3d1/screenshots'
const LOCAL_OUT = './test-results/onboarding-e2e'

for (const dir of [ARTIFACT_DIR, LOCAL_OUT]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

async function captureScreenshot(page, filename) {
  const localPath = path.join(LOCAL_OUT, filename)
  const artifactPath = path.join(ARTIFACT_DIR, filename)
  await page.screenshot({ path: localPath, fullPage: false })
  fs.copyFileSync(localPath, artifactPath)
  console.log(`  📸 Screenshot saved: ${filename}`)
}

async function runE2E() {
  console.log('======================================================================')
  console.log('🎓 FocusFlow: Authentication & Academic Onboarding End-to-End Suite')
  console.log('======================================================================\n')

  const browser = await chromium.launch({ headless: true })

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    failures: [],
  }

  function reportPass(journeyName, stepName) {
    results.total++
    results.passed++
    console.log(`  [PASS] ${journeyName} -> ${stepName}`)
  }

  function reportFail(journeyName, stepName, error) {
    results.total++
    results.failed++
    const msg = `[FAIL] ${journeyName} -> ${stepName}: ${error?.message || error}`
    results.failures.push(msg)
    console.error(`  ❌ ${msg}`)
  }

  try {
    // =========================================================================
    // JOURNEY 1: New Student Registration -> Onboarding Wizard -> Dashboard
    // =========================================================================
    console.log('\n--- Journey 1: New Student Registration & Full Onboarding ---')
    const context1 = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      ignoreHTTPSErrors: true,
    })
    const page1 = await context1.newPage()

    const uniqueId = Date.now()
    const studentName = 'Ada Lovelace'
    const studentEmail = `ada_flow_${uniqueId}@mit.edu`
    const studentPassword = 'Password123!@#'

    // 1. Visit signup page
    await page1.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle' })
    await captureScreenshot(page1, '01-signup-page.png')
    reportPass('Journey 1', 'Loaded Signup Page')

    // 2. Fill registration form
    await page1.fill('#full-name', studentName)
    await page1.fill('#email', studentEmail)
    await page1.fill('#password', studentPassword)
    await page1.fill('#confirm-password', studentPassword)
    await page1.check('input[type="checkbox"]')
    await captureScreenshot(page1, '02-signup-form-filled.png')

    // 3. Submit registration form
    await Promise.all([
      page1.waitForURL('**/onboarding', { timeout: 10000 }),
      page1.click('button[type="submit"]'),
    ])
    await captureScreenshot(page1, '03-redirected-to-onboarding-step1.png')
    reportPass('Journey 1', 'New user signup redirects to /onboarding')

    // 4. Verify Step 1 elements (Name pre-filled, validation rejection on empty institution)
    const nameInput = page1.locator('input[placeholder="e.g. Alex Rivera"]')
    await nameInput.waitFor({ state: 'visible', timeout: 5000 })
    const initialName = await nameInput.inputValue()
    if (initialName === studentName) {
      reportPass('Journey 1', 'Step 1: Student full name pre-populated')
    } else {
      reportFail('Journey 1', 'Step 1: Student full name', `Expected "${studentName}", got "${initialName}"`)
    }

    // Test client-side validation rejection on empty institution
    const institutionInput = page1.locator('input[placeholder="e.g. Stanford University, MIT, Oxford"]')
    await institutionInput.fill('')
    await page1.click('button:has-text("Continue")')
    const validationError = page1.locator('text=University or college is required')
    await validationError.waitFor({ state: 'visible', timeout: 3000 })
    await captureScreenshot(page1, '04-step1-validation-error.png')
    reportPass('Journey 1', 'Step 1: Rejects empty institution with validation message')

    // Fill valid institution and degree
    await institutionInput.fill('Massachusetts Institute of Technology')
    const degreeInput = page1.locator('input[placeholder="e.g. B.S. Computer Science"]')
    await degreeInput.fill('B.S. in Electrical Engineering & Computer Science')
    const deptInput = page1.locator('input[placeholder="e.g. School of Engineering"]')
    await deptInput.fill('Department of Electrical Engineering and Computer Science')

    await captureScreenshot(page1, '05-step1-filled-valid.png')

    // Advance to Step 2
    await page1.click('button:has-text("Continue")')
    await page1.waitForSelector('text=Term timeline', { timeout: 5000 })
    await captureScreenshot(page1, '06-onboarding-step2.png')
    reportPass('Journey 1', 'Step 2: Advanced to Term timeline')

    // Advance to Step 3
    await page1.click('button:has-text("Continue")')
    await page1.waitForSelector('text=Academic goals', { timeout: 5000 })
    await captureScreenshot(page1, '07-onboarding-step3.png')
    reportPass('Journey 1', 'Step 3: Advanced to Academic goals')

    // Advance to Step 4
    await page1.click('button:has-text("Continue")')
    await page1.waitForSelector('text=Study cadence', { timeout: 5000 })
    await captureScreenshot(page1, '08-onboarding-step4.png')
    reportPass('Journey 1', 'Step 4: Advanced to Study cadence')

    // Advance to Step 5
    await page1.click('button:has-text("Continue")')
    await page1.waitForSelector('text=Course syllabus', { timeout: 5000 })
    await captureScreenshot(page1, '09-onboarding-step5.png')
    reportPass('Journey 1', 'Step 5: Advanced to Course syllabus')

    // Complete Onboarding
    await Promise.all([
      page1.waitForURL('**/app/dashboard', { timeout: 10000 }),
      page1.click('button:has-text("Finish setup & enter workspace")'),
    ])
    await captureScreenshot(page1, '10-dashboard-first-arrival.png')
    reportPass('Journey 1', 'Completed onboarding redirects to /app/dashboard')

    // 5. Test Refresh on Dashboard
    await page1.reload({ waitUntil: 'networkidle' })
    const currentUrl = page1.url()
    if (currentUrl.includes('/app/dashboard')) {
      reportPass('Journey 1', 'Session restoration: Browser refresh stays on /app/dashboard')
    } else {
      reportFail('Journey 1', 'Session restoration', `Expected /app/dashboard after refresh, got ${currentUrl}`)
    }
    await captureScreenshot(page1, '11-dashboard-after-refresh.png')

    // 6. Test Logout using sidebar button
    const signOutBtn = page1.locator('button[title="Sign out"]')
    await signOutBtn.waitFor({ state: 'visible', timeout: 5000 })
    await signOutBtn.click()
    await page1.waitForURL('**/login', { timeout: 10000 })
    reportPass('Journey 1', 'User logged out and redirected to /login')

    // 7. Login with newly onboarded user -> Must go DIRECTLY to Dashboard, skipping onboarding
    await page1.fill('#email-field', studentEmail)
    await page1.fill('#password-field', studentPassword)
    await Promise.all([
      page1.waitForURL('**/app/dashboard', { timeout: 10000 }),
      page1.click('button[type="submit"]'),
    ])
    await captureScreenshot(page1, '12-login-direct-to-dashboard.png')
    reportPass('Journey 1', 'Returning user login skips onboarding and enters Dashboard directly')

    await context1.close()

    // =========================================================================
    // JOURNEY 2: Incomplete Onboarding -> Close Context -> Relogin -> Resume
    // =========================================================================
    console.log('\n--- Journey 2: Incomplete Onboarding & Resuming Progress ---')
    const context2 = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      ignoreHTTPSErrors: true,
    })
    const page2 = await context2.newPage()

    const partialEmail = `partial_scholar_${Date.now()}@cmu.edu`
    const partialPassword = 'Password123!@#'

    // 1. Signup new user
    await page2.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle' })
    await page2.fill('#full-name', 'Charles Babbage')
    await page2.fill('#email', partialEmail)
    await page2.fill('#password', partialPassword)
    await page2.fill('#confirm-password', partialPassword)
    await page2.check('input[type="checkbox"]')

    await Promise.all([
      page2.waitForURL('**/onboarding', { timeout: 10000 }),
      page2.click('button[type="submit"]'),
    ])
    reportPass('Journey 2', 'Signup successful, lands on /onboarding Step 1')

    // 2. Fill Step 1 partially and click Continue (which saves progress to backend)
    const pInst = page2.locator('input[placeholder="e.g. Stanford University, MIT, Oxford"]')
    await pInst.fill('Carnegie Mellon University')
    const pDegree = page2.locator('input[placeholder="e.g. B.S. Computer Science"]')
    await pDegree.fill('M.S. in Automated Science')
    const pDept = page2.locator('input[placeholder="e.g. School of Engineering"]')
    await pDept.fill('School of Computer Science')

    await page2.click('button:has-text("Continue")')
    await page2.waitForSelector('text=Term timeline', { timeout: 5000 })
    await captureScreenshot(page2, '13-partial-progress-step2-reached.png')
    reportPass('Journey 2', 'Saved Step 1 and reached Step 2')

    // 3. Simulate closing browser / ending session without finishing
    await context2.close()
    console.log('  [INFO] Simulated user closing the browser mid-onboarding.')

    // 4. Reopen in a clean context (e.g. next day or new tab) and login
    const context2b = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      ignoreHTTPSErrors: true,
    })
    const page2b = await context2b.newPage()

    await page2b.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' })
    await page2b.fill('#email-field', partialEmail)
    await page2b.fill('#password-field', partialPassword)

    // User should be redirected to /onboarding because onboardingCompleted is still false
    await Promise.all([
      page2b.waitForURL('**/onboarding', { timeout: 10000 }),
      page2b.click('button[type="submit"]'),
    ])
    await captureScreenshot(page2b, '14-relogin-resumes-onboarding.png')
    reportPass('Journey 2', 'Login with incomplete onboarding returns user to /onboarding')

    // 5. Verify the user resumes at Step 2 (Term timeline) because Step 1 was already filled
    await page2b.waitForSelector('text=Term timeline', { timeout: 5000 })
    reportPass('Journey 2', 'Onboarding auto-resumes at Step 2 with Step 1 data preserved')

    // Click "Back" to check that Step 1 preserved our data
    await page2b.click('button:has-text("Back")')
    await page2b.waitForSelector('text=Academic identity', { timeout: 5000 })
    const preservedInst = await page2b.locator('input[placeholder="e.g. Stanford University, MIT, Oxford"]').inputValue()
    const preservedDegree = await page2b.locator('input[placeholder="e.g. B.S. Computer Science"]').inputValue()

    if (preservedInst === 'Carnegie Mellon University' && preservedDegree === 'M.S. in Automated Science') {
      reportPass('Journey 2', 'Step 1 saved data was accurately preserved across sessions')
    } else {
      reportFail('Journey 2', 'Data preservation', `Expected CMU and M.S., got "${preservedInst}", "${preservedDegree}"`)
    }
    await captureScreenshot(page2b, '15-step1-preserved-data.png')

    // Finish onboarding
    await page2b.click('button:has-text("Continue")') // to step 2
    await page2b.click('button:has-text("Continue")') // to step 3
    await page2b.click('button:has-text("Continue")') // to step 4
    await page2b.click('button:has-text("Continue")') // to step 5
    await Promise.all([
      page2b.waitForURL('**/app/dashboard', { timeout: 10000 }),
      page2b.click('button:has-text("Finish setup & enter workspace")'),
    ])
    await captureScreenshot(page2b, '16-resumed-user-dashboard.png')
    reportPass('Journey 2', 'Resumed onboarding completed and redirected to Dashboard')

    await context2b.close()

    // =========================================================================
    // JOURNEY 3: Existing Historical User Login (dev@focusflow.local)
    // =========================================================================
    console.log('\n--- Journey 3: Existing Backward-Compatible User Login ---')
    const context3 = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      ignoreHTTPSErrors: true,
    })
    const page3 = await context3.newPage()

    await page3.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' })
    await page3.fill('#email-field', 'dev@focusflow.local')
    await page3.fill('#password-field', 'DevFocusFlow2026!')

    await Promise.all([
      page3.waitForURL('**/app/dashboard', { timeout: 10000 }),
      page3.click('button[type="submit"]'),
    ])
    await captureScreenshot(page3, '17-existing-user-direct-dashboard.png')
    reportPass('Journey 3', 'Existing pre-migration user logs in directly to Dashboard without seeing onboarding')

    await context3.close()

  } catch (err) {
    reportFail('Suite Execution', 'Fatal Error', err)
  } finally {
    await browser.close()
  }

  console.log('\n======================================================================')
  console.log(`Results: ${results.passed} passed, ${results.failed} failed out of ${results.total} steps.`)
  console.log('======================================================================\n')

  if (results.failed > 0) {
    console.error('Failures encountered:')
    results.failures.forEach((f) => console.error(`  - ${f}`))
    process.exit(1)
  }
}

runE2E()
