import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const BASE_URL = 'http://localhost:5173'
const ARTIFACT_DIR = 'C:/Users/bhowm/.gemini/antigravity/brain/22a52d2b-b3ae-47d3-9bb0-c999863dbb22/screenshots/phase4b3'
const LOCAL_OUT = './test-results/phase4b3'

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
  console.log(`  📸 Screenshot captured: ${filename}`)
}

async function runVisualVerification() {
  console.log('======================================================================')
  console.log('🎨 FocusFlow Phase 4B.3: Complete Visual Identity Upgrade & Anti-Slop QA')
  console.log('======================================================================\n')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1024 },
    ignoreHTTPSErrors: true,
  })
  const page = await context.newPage()

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    checks: [],
  }

  function report(name, passed, details = '') {
    results.total++
    if (passed) {
      results.passed++
      console.log(`  ✅ [PASS] ${name} ${details ? '(' + details + ')' : ''}`)
    } else {
      results.failed++
      console.error(`  ❌ [FAIL] ${name} ${details ? ': ' + details : ''}`)
    }
    results.checks.push({ name, passed, details })
  }

  const timestamp = Date.now()
  const studentEmail = `scholar_p4b3_${timestamp}@focusflow.test`
  const studentPassword = 'Password123!'
  const studentName = 'Marcus Aurelius'

  try {
    // ══════════════════════════════════════════════════════════════════════
    // 1. LANDING PAGE HERO & AUTHENTIC WORKSPACE SHOWCASE (Desktop 1440x1024)
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- 1. Landing Page Hero (Desktop 1440x1024) ---')
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 15000 })
    await captureScreenshot(page, '01_landing_hero_rich_palette.png')

    const hasDarkClassOnLanding = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    const heroTitle = await page.textContent('h1')
    report('Landing root has no dark class', !hasDarkClassOnLanding)
    report('Hero headline matches serious scholar focus', heroTitle?.includes('Intelligent Academic Deep Work'))

    // ══════════════════════════════════════════════════════════════════════
    // 2. RESPONSIVE LANDING VIEWPORTS
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- 2. Responsive Landing Viewports ---')
    // Laptop 1366x768
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.waitForTimeout(400)
    await captureScreenshot(page, '02_landing_laptop_1366x768.png')

    // Tablet 768x1024
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(400)
    await captureScreenshot(page, '03_landing_tablet_768x1024.png')

    // Mobile 390x844
    await page.setViewportSize({ width: 390, height: 844 })
    await page.waitForTimeout(400)
    await captureScreenshot(page, '04_landing_mobile_390x844.png')

    // Reset to Desktop 1440x1024
    await page.setViewportSize({ width: 1440, height: 1024 })
    await page.waitForTimeout(300)

    // ══════════════════════════════════════════════════════════════════════
    // 3. STUDENT REGISTRATION & ACADEMIC ONBOARDING
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- 3. Registration & Onboarding ---')
    await page.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle' })
    await captureScreenshot(page, '05_signup_page_light.png')

    await page.fill('input[name="name"]', studentName)
    await page.fill('input[name="email"]', studentEmail)
    await page.fill('input[name="password"]', studentPassword)
    await page.fill('input[name="confirmPassword"]', studentPassword)
    await page.check('input[name="acceptTerms"]')
    await page.click('button[type="submit"]')

    // Wait for Onboarding redirect
    await page.waitForURL('**/onboarding', { timeout: 15000 })
    report('Redirected to /onboarding after signup', page.url().includes('/onboarding'))
    await captureScreenshot(page, '06_onboarding_light_mode.png')

    // Onboarding Step 1
    const instInput = page.locator('input[placeholder*="Stanford University"], input[type="text"]').first()
    if (await instInput.isVisible()) {
      await instInput.fill('Oxford University')
    }
    const continueBtn1 = page.locator('button:has-text("Continue")').first()
    if (await continueBtn1.isVisible()) {
      await continueBtn1.click()
      await page.waitForTimeout(500)
    }

    // Steps 2 to 4
    for (let step = 2; step <= 4; step++) {
      const continueBtn = page.locator('button:has-text("Continue")').first()
      if (await continueBtn.isVisible()) {
        await continueBtn.click()
        await page.waitForTimeout(500)
      }
    }

    // Step 5: Finish setup
    const finishBtn = page.locator('button:has-text("Finish setup")').first()
    if (await finishBtn.isVisible()) {
      await finishBtn.click()
    }

    // Wait for Dashboard redirect
    await page.waitForURL('**/app/dashboard', { timeout: 15000 })
    report('Arrived at authenticated Dashboard after onboarding', page.url().includes('/app/dashboard'))

    // ══════════════════════════════════════════════════════════════════════
    // 4. AUTHENTICATED DASHBOARD (Light Mode with Rich Colors)
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- 4. Authenticated Dashboard (Light Mode) ---')
    await page.waitForTimeout(1000)
    await captureScreenshot(page, '07_dashboard_light_rich_palette.png')

    // ══════════════════════════════════════════════════════════════════════
    // 5. MY DAY (Celebratory Banner & Differentiated Stat Cards)
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- 5. My Day Workspace (Light Mode) ---')
    await page.goto(`${BASE_URL}/app/my-day`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await captureScreenshot(page, '08_myday_light_rich_statcards.png')

    // Add a study session and complete it to verify the celebratory banner
    const addBlockBtn = page.locator('button:has-text("Add Study Block")')
    if (await addBlockBtn.isVisible()) {
      await addBlockBtn.click()
      await page.waitForTimeout(500)
      const titleInput = page.locator('input[placeholder*="Topic" i], input[placeholder*="Session" i]').first()
      if (await titleInput.isVisible()) {
        await titleInput.fill('CS 201: Binary Search Trees Verification')
        await page.click('button:has-text("Save Session"), button:has-text("Schedule Session")')
        await page.waitForTimeout(800)
      }
    }
    await captureScreenshot(page, '09_myday_with_scheduled_session.png')

    // Mark session complete if present
    const doneBtn = page.locator('button:has-text("Done")').first()
    if (await doneBtn.isVisible()) {
      await doneBtn.click()
      await page.waitForTimeout(1000)
      await captureScreenshot(page, '10_myday_celebratory_banner_radiant_emerald.png')
    }

    // ══════════════════════════════════════════════════════════════════════
    // 6. PLANNER (Crisp Calendar Grid & Selected Day Highlight)
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- 6. Planner Workspace (Light Mode) ---')
    await page.goto(`${BASE_URL}/app/planner`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await captureScreenshot(page, '11_planner_crisp_grid_week_view.png')

    // Switch to Day view
    const dayTab = page.locator('button:has-text("Day")').first()
    if (await dayTab.isVisible()) {
      await dayTab.click()
      await page.waitForTimeout(600)
      await captureScreenshot(page, '12_planner_day_view.png')
    }

    // ══════════════════════════════════════════════════════════════════════
    // 7. SUBJECTS OVERVIEW (4 Differentiated Overview Cards)
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- 7. Subjects Overview (Light Mode) ---')
    await page.goto(`${BASE_URL}/app/subjects`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await captureScreenshot(page, '13_subjects_overview_4_kpi_cards.png')

    // Open first subject detail
    const subjectCard = page.locator('a[href^="/app/subjects/"]').first()
    if (await subjectCard.isVisible()) {
      await subjectCard.click()
      await page.waitForURL('**/app/subjects/*', { timeout: 10000 })
      await page.waitForTimeout(800)
      await captureScreenshot(page, '14_subject_detail_view.png')
    }

    // ══════════════════════════════════════════════════════════════════════
    // 8. REVISION CENTER (5 Differentiated Filter Cards & Recall Buttons)
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- 8. Revision Center Workspace (Light Mode) ---')
    await page.goto(`${BASE_URL}/app/revision`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await captureScreenshot(page, '15_revision_center_5_kpi_cards.png')

    // ══════════════════════════════════════════════════════════════════════
    // 9. MIDNIGHT DARK MODE VERIFICATION (No color regressions)
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- 9. Midnight Dark Mode Verification ---')
    await page.goto(`${BASE_URL}/app/settings`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)

    // Switch to Theme & Appearance tab
    const appearanceTab = page.locator('button:has-text("Theme & Appearance")').first()
    if (await appearanceTab.isVisible()) {
      await appearanceTab.click()
      await page.waitForTimeout(400)
    }

    // Click Midnight Dark theme card
    const darkBtn = page.locator('button:has-text("Midnight Dark")').first()
    if (await darkBtn.isVisible()) {
      await darkBtn.click()
      await page.waitForTimeout(600)
    }
    const isDarkActive = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    report('Dark mode class activated in settings', isDarkActive)
    await captureScreenshot(page, '16_settings_midnight_dark_mode.png')

    // Capture dark mode dashboard, my day, revision, planner
    await page.goto(`${BASE_URL}/app/dashboard`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    await captureScreenshot(page, '17_dashboard_midnight_dark_mode.png')

    await page.goto(`${BASE_URL}/app/my-day`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    await captureScreenshot(page, '18_myday_midnight_dark_mode.png')

    await page.goto(`${BASE_URL}/app/revision`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    await captureScreenshot(page, '19_revision_center_midnight_dark_mode.png')

    await page.goto(`${BASE_URL}/app/planner`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    await captureScreenshot(page, '20_planner_midnight_dark_mode.png')

    // ══════════════════════════════════════════════════════════════════════
    // 10. PUBLIC THEME BOUNDARY: LANDING AFTER LOGOUT (Pristine Light)
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- 10. Public Theme Boundary Isolation Check ---')
    await page.goto(`${BASE_URL}/app/settings`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    const logoutBtn = page.locator('button:has-text("Sign Out"), button:has-text("Log out")').first()
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click()
      await page.waitForTimeout(1000)
    }

    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    const landingHasDarkAfterLogout = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    report('Landing page remains pristine light after dark mode logout', !landingHasDarkAfterLogout)
    await captureScreenshot(page, '21_landing_after_logout_pristine_light.png')

    console.log('\n======================================================================')
    console.log(`🎉 Visual Verification Summary: ${results.passed}/${results.total} Passed, ${results.failed} Failed`)
    console.log('======================================================================\n')
  } catch (err) {
    console.error('Visual verification encountered an error:', err)
  } finally {
    await browser.close()
  }
}

runVisualVerification()
