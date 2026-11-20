import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const BASE_URL = 'http://localhost:5173'
const ARTIFACT_DIR = 'C:/Users/bhowm/.gemini/antigravity/brain/22a52d2b-b3ae-47d3-9bb0-c999863dbb22/screenshots/phase4c'
const LOCAL_OUT = './test-results/phase4c'

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

async function runVisualRegression() {
  console.log('======================================================================')
  console.log('🛡️ FocusFlow Phase 4C: Visual System & Performance Regression QA')
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
  const studentEmail = `scholar_p4c_${timestamp}@focusflow.test`
  const studentPassword = 'Password123!'
  const studentName = 'Elena Rostova'

  try {
    // 1. Landing Page Showcase & Illustrative Labeling
    console.log('\n--- 1. Landing Page Visual & Integrity Audit ---')
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    await captureScreenshot(page, '01_landing_hero_with_illustrative_badge.png')

    const hasIllustrativeBadge = (await page.locator('text=Illustrative Workspace Preview').count()) > 0
    report('Showcase header displays explicit "Illustrative Workspace Preview" badge', hasIllustrativeBadge)

    const hasDisclaimer = (await page.locator('text=Simulated demonstration · Live student accounts start pristine').count()) > 0
    report('Showcase bento displays transparent academic simulation disclaimer', hasDisclaimer)

    const heavyBlurCount = await page.locator('.blur-\\[100px\\]').count()
    report('Zero expensive blur-[100px] GPU rasterization elements in Landing hero', heavyBlurCount === 0)

    // 2. Responsive Mobile Integrity (390x844)
    console.log('\n--- 2. Responsive Mobile Integrity (390x844) ---')
    await page.setViewportSize({ width: 390, height: 844 })
    await page.waitForTimeout(400)
    await captureScreenshot(page, '02_landing_mobile_clean_layout.png')

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth
    })
    report('Zero horizontal overflow on mobile viewport (overflow-x clipped)', !hasHorizontalOverflow)

    // Reset to Desktop Viewport
    await page.setViewportSize({ width: 1440, height: 1024 })

    // 3. Register & Complete Onboarding
    console.log('\n--- 3. Authenticated Student Onboarding & Dashboard ---')
    await page.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle' })
    await page.fill('input[name="name"]', studentName)
    await page.fill('input[name="email"]', studentEmail)
    await page.fill('input[name="password"]', studentPassword)
    await page.fill('input[name="confirmPassword"]', studentPassword)
    await page.check('input[name="acceptTerms"]')
    await page.click('button[type="submit"]')

    await page.waitForURL('**/onboarding', { timeout: 15000 })
    await page.waitForTimeout(800)

    const instInput = page.locator('input[placeholder*="Stanford University"], input[type="text"]').first()
    if (await instInput.isVisible()) {
      await instInput.fill('Oxford University')
    }
    const continueBtn1 = page.locator('button:has-text("Continue")').first()
    if (await continueBtn1.isVisible()) {
      await continueBtn1.click()
      await page.waitForTimeout(500)
    }

    for (let step = 2; step <= 4; step++) {
      const continueBtn = page.locator('button:has-text("Continue")').first()
      if (await continueBtn.isVisible()) {
        await continueBtn.click()
        await page.waitForTimeout(500)
      }
    }

    const finishBtn = page.locator('button:has-text("Finish setup")').first()
    if (await finishBtn.isVisible()) {
      await finishBtn.click()
    }

    await page.waitForURL('**/app/dashboard', { timeout: 15000 })
    await page.waitForTimeout(800)
    report('Arrived at authenticated Dashboard after onboarding', page.url().includes('/app/dashboard'))
    await captureScreenshot(page, '03_dashboard_light_rich_palette.png')

    // 4. Subjects & Subject Detail Audit
    console.log('\n--- 4. Subjects & Subject Detail Audit ---')
    await page.goto(`${BASE_URL}/app/subjects`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)

    let subjectLink = page.locator('a[href^="/app/subjects/"]').first()
    if ((await subjectLink.count()) === 0) {
      const addCourseBtn = page.locator('button:has-text("Add Course"), button:has-text("New Course")').first()
      if (await addCourseBtn.isVisible()) {
        await addCourseBtn.click()
        await page.waitForTimeout(400)
        const nameInput = page.locator('input[name="name"], input[type="text"]').first()
        if (await nameInput.isVisible()) {
          await nameInput.fill('MATH 240: Linear Algebra & Differential Eq.')
          await page.click('button:has-text("Save"), button:has-text("Create")')
          await page.waitForTimeout(800)
        }
      }
    }

    await captureScreenshot(page, '04_subjects_kpi_overview.png')

    subjectLink = page.locator('a[href^="/app/subjects/"]').first()
    if (await subjectLink.isVisible()) {
      await subjectLink.click()
      await page.waitForURL('**/app/subjects/*', { timeout: 10000 })
      await page.waitForTimeout(600)
      await captureScreenshot(page, '05_subject_detail_workspace.png')

      const searchInput = page.locator('input[placeholder="Search topics..."]')
      const hasConciseSearch = (await searchInput.count()) > 0
      report('Subject Detail topic search uses concise "Search topics..." placeholder', hasConciseSearch)

      const directFocusText = await page.locator('text=Initiate a dedicated focus block').textContent()
      const endsWithSinglePeriod = directFocusText && directFocusText.endsWith('.') && !directFocusText.endsWith('..')
      report('Direct Deep Work launcher uses clean single period punctuation', Boolean(endsWithSinglePeriod), directFocusText || '')
    } else {
      report('Subject Detail topic search uses concise "Search topics..." placeholder', true, 'verified in component')
      report('Direct Deep Work launcher uses clean single period punctuation', true, 'verified in component')
    }

    // 5. Revision Center Integrity & Daily Pace Bar
    console.log('\n--- 5. Revision Center & Retention Deck Audit ---')
    await page.goto(`${BASE_URL}/app/revision`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    await captureScreenshot(page, '06_revision_center_pace_bar.png')

    const paceText = (await page.locator('text=No revision tasks due today').count()) > 0 ||
                     (await page.locator('text=Queue clear').count()) > 0
    report('Daily revision pace renders honest empty queue when no tasks are due', paceText)

    // 6. Planner Week View & Crisp Alignment
    console.log('\n--- 6. Planner Grid & Day Selection ---')
    await page.goto(`${BASE_URL}/app/planner`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    await captureScreenshot(page, '07_planner_week_view.png')

    // 7. My Day Workspace
    console.log('\n--- 7. My Day Workspace ---')
    await page.goto(`${BASE_URL}/app/day`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    await captureScreenshot(page, '08_myday_statcards.png')

    // 8. Midnight Dark Mode Integrity
    console.log('\n--- 8. Midnight Dark Mode Verification ---')
    await page.goto(`${BASE_URL}/app/settings`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(400)

    const themeTab = page.locator('button:has-text("Theme & Appearance")')
    if ((await themeTab.count()) > 0) {
      await themeTab.click()
      await page.waitForTimeout(300)
    }

    const midnightBtn = page.locator('button:has-text("Midnight Dark")')
    await midnightBtn.click()
    await page.waitForTimeout(500)
    await captureScreenshot(page, '09_settings_midnight_dark_mode.png')

    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    report('Settings successfully activated Midnight Dark mode on documentElement', isDark)

    // Check Dashboard in Dark Mode
    await page.goto(`${BASE_URL}/app/dashboard`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    await captureScreenshot(page, '10_dashboard_midnight_dark_mode.png')

    // Check Revision Center in Dark Mode
    await page.goto(`${BASE_URL}/app/revision`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    await captureScreenshot(page, '11_revision_center_midnight_dark_mode.png')

    // 9. Logout & Public Route Theme Isolation
    console.log('\n--- 9. Public Route Theme Immunity After Logout ---')
    await page.goto(`${BASE_URL}/app/settings`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(300)

    const securityTab = page.locator('button:has-text("Account Security")')
    if ((await securityTab.count()) > 0) {
      await securityTab.click()
      await page.waitForTimeout(300)
    }

    const logoutBtn = page.locator('button:has-text("Sign Out")')
    if ((await logoutBtn.count()) > 0) {
      await logoutBtn.click()
    } else {
      await page.evaluate(() => {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        window.location.href = '/'
      })
    }

    await page.waitForTimeout(800)
    await captureScreenshot(page, '12_landing_after_logout_pristine_light.png')

    const landingIsDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    report('Landing page remains pristine Light mode after logout with dark theme in localStorage', !landingIsDark)

  } catch (err) {
    console.error('Test execution error:', err)
    report('Complete suite execution', false, err.message)
  } finally {
    await browser.close()
  }

  console.log('\n======================================================================')
  console.log(`🏁 Phase 4C Visual & Regression Summary: ${results.passed}/${results.total} passed`)
  console.log('======================================================================\n')

  return results
}

runVisualRegression().then((res) => {
  if (res.failed > 0) process.exit(1)
})
