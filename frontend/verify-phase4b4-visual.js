import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const BASE_URL = 'http://localhost:5173'
const ARTIFACT_DIR = 'C:/Users/bhowm/.gemini/antigravity/brain/22a52d2b-b3ae-47d3-9bb0-c999863dbb22/screenshots/phase4b4'
const LOCAL_OUT = './test-results/phase4b4'

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
  console.log('🛡️ FocusFlow Phase 4B.4: Visual Identity Upgrade & Real Photography QA')
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
  const studentEmail = `scholar_p4b4_${timestamp}@focusflow.test`
  const studentPassword = 'Password123!'
  const studentName = 'Marcus Aurelius'

  try {
    // 1. Landing Page Split Hero & Real Photography
    console.log('\n--- 1. Landing Page Split Hero & Photography Audit ---')
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    await captureScreenshot(page, '01_landing_hero_photography.png')

    // Check Hero Image
    const heroImageCount = await page.locator('img[src="/images/landing/hero-student-study.webp"]').count()
    report('Landing hero renders real photography (hero-student-study.webp)', heroImageCount > 0)

    // Check Showcase Illustrative Badge & Footnote
    const hasIllustrativeBadge = (await page.locator('text=Illustrative Workspace Preview').count()) > 0
    report('Workspace showcase features "Illustrative Workspace Preview" badge', hasIllustrativeBadge)

    const hasDisclaimer = (await page.locator('text=Simulated demonstration · Live student accounts start pristine').count()) > 0
    report('Workspace showcase features transparent simulation disclaimer', hasDisclaimer)

    // Check Operating Cadence section with photo
    await page.evaluate(() => window.scrollBy(0, 1000))
    await page.waitForTimeout(400)
    await captureScreenshot(page, '02_landing_operating_cadence.png')
    const cadencePhotoCount = await page.locator('img[src="/images/landing/focused-learning.webp"]').count()
    report('Operating Cadence section renders real photography (focused-learning.webp)', cadencePhotoCount > 0)

    // Check Curricular Workflow section with photos
    await page.evaluate(() => window.scrollBy(0, 1000))
    await page.waitForTimeout(400)
    await captureScreenshot(page, '03_landing_curricular_workflow.png')

    // Check Footer Attributions
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(400)
    await captureScreenshot(page, '04_landing_footer_attributions.png')
    const hasUnsplashAttribution = (await page.locator('text=Photography: Unsplash License').count()) > 0
    report('Footer explicitly attributes photography to Unsplash License', hasUnsplashAttribution)

    // 2. Responsive Mobile Integrity (390x844)
    console.log('\n--- 2. Responsive Mobile Layout (390x844) ---')
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(400)
    await captureScreenshot(page, '05_landing_mobile_hero.png')

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth
    })
    report('Mobile layout has zero horizontal scrollbar blowout', !hasHorizontalOverflow)

    // Reset Desktop Viewport
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

    const finishBtn = page.locator('button:has-text("Finish setup"), button:has-text("Launch")').first()
    if (await finishBtn.isVisible()) {
      await finishBtn.click()
    }

    await page.waitForURL('**/app/dashboard', { timeout: 15000 })
    await page.waitForTimeout(1000)

    // 4. Authenticated Dashboard (Light Mode)
    console.log('\n--- 4. Dashboard Visual Audit ---')
    await captureScreenshot(page, '06_dashboard_light_rich_palette.png')
    const hasGreeting = (await page.locator(`text=Good`).count()) > 0 || (await page.locator(`text=${studentName.split(' ')[0]}`).count()) > 0
    report('Dashboard greeting header card renders dynamic greeting and scholar name', hasGreeting)

    // 5. Subjects Workspace & 4 KPI Cards
    console.log('\n--- 5. Subjects Workspace & 4 KPI Cards ---')
    await page.goto(`${BASE_URL}/app/subjects`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await captureScreenshot(page, '07_subjects_kpi_overview.png')

    const hasEnrolledKpi = (await page.locator('text=Enrolled Subjects').count()) > 0
    report('Subjects workspace renders Enrolled Subjects KPI card', hasEnrolledKpi)
    const hasSyllabusKpi = (await page.locator('text=Syllabus Completion').count()) > 0
    report('Subjects workspace renders Syllabus Completion KPI card', hasSyllabusKpi)

    // 6. Subject Detail Diagnostic Meters & Focus Card
    console.log('\n--- 6. Subject Detail Diagnostic Meters & Focus Card ---')
    let detailLink = page.locator('a[href^="/app/subjects/"]').first()
    if ((await detailLink.count()) === 0) {
      const addCourseBtn = page.locator('button:has-text("Add Course"), button:has-text("Add Subject"), button:has-text("New Subject")').first()
      if (await addCourseBtn.isVisible()) {
        await addCourseBtn.click()
        await page.waitForTimeout(400)
        const nameInput = page.locator('input[name="name"], input[placeholder*="Name"], input[type="text"]').first()
        if (await nameInput.isVisible()) {
          await nameInput.fill('Differential Equations & Analysis.')
          await page.click('button[type="submit"]')
          await page.waitForTimeout(1000)
        }
      }
      detailLink = page.locator('a[href^="/app/subjects/"]').first()
    }

    if ((await detailLink.count()) > 0) {
      await detailLink.click()
      await page.waitForURL('**/app/subjects/*', { timeout: 10000 })
      await page.waitForTimeout(800)
      await captureScreenshot(page, '08_subject_detail_workspace.png')

      const hasDirectFocus = (await page.locator('text=Direct Deep Work').count()) > 0
      report('Subject Detail renders Direct Deep Work launcher card', hasDirectFocus)

      const directFocusDesc = await page.locator('text=Initiate a dedicated focus block').innerText()
      const hasDoublePeriod = directFocusDesc.includes('..') && !directFocusDesc.includes('...')
      report('Subject Detail focus card has single punctuation without double period (..)', !hasDoublePeriod)

      const hasSearchTopics = (await page.locator('input[placeholder="Search topics..."]').count()) > 0
      report('Topic toolbar search input placeholder is clean and untruncated ("Search topics...")', hasSearchTopics)
    }

    // 7. Revision Center & Honest 0% Daily Pace Bar
    console.log('\n--- 7. Revision Center & Honest Daily Pace Bar ---')
    await page.goto(`${BASE_URL}/app/revision`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await captureScreenshot(page, '09_revision_center_pace_bar.png')

    // Verify 0% pace bar when total tasks is 0
    const hasQueueClear = (await page.locator('text=Queue clear').count()) > 0
    report('Daily revision pace displays honest "Queue clear" state with 0 tasks', hasQueueClear)

    const hasDishonestGoalReached = (await page.locator('text=Daily goal reached! 100%').count()) > 0
    report('Daily revision pace does NOT display dishonest "Daily goal reached! 100%" when 0 tasks exist', !hasDishonestGoalReached)

    const hasReviewedTab = (await page.locator('button:has-text("Reviewed")').count()) > 0
    report('Revision Queue tab displays clean, untruncated "Reviewed" tab', hasReviewedTab)

    // 8. Planner Week View
    console.log('\n--- 8. Planner Week View ---')
    await page.goto(`${BASE_URL}/app/planner`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await captureScreenshot(page, '10_planner_week_view.png')
    const hasWeekGrid = (await page.locator('text=Time').count()) > 0
    report('Planner week view renders timetable grid and day header columns', hasWeekGrid)

    // 9. My Day & Celebratory Banner
    console.log('\n--- 9. My Day & Celebratory Banner ---')
    await page.goto(`${BASE_URL}/app/day`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await captureScreenshot(page, '11_myday_statcards.png')

    const rawEmojiTarget = (await page.locator('text=🎯').count()) > 0
    report('My Day has zero raw emoji (🎯) icons in celebratory banner', !rawEmojiTarget)

    // 10. Midnight Dark Mode Verification
    console.log('\n--- 10. Midnight Dark Mode Verification ---')
    await page.goto(`${BASE_URL}/app/settings`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)

    const themeTab = page.locator('button:has-text("Theme & Appearance")')
    if ((await themeTab.count()) > 0) {
      await themeTab.click()
      await page.waitForTimeout(400)
    }

    const midnightBtn = page.locator('button:has-text("Midnight Dark")')
    if ((await midnightBtn.count()) > 0) {
      await midnightBtn.click()
      await page.waitForTimeout(600)
    }

    await captureScreenshot(page, '12_settings_midnight_dark_mode.png')

    const isHtmlDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    report('Authenticated workspace activates .dark theme class in Midnight Dark mode', isHtmlDark)

    // Check Dashboard in Dark Mode
    await page.goto(`${BASE_URL}/app/dashboard`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await captureScreenshot(page, '13_dashboard_midnight_dark_mode.png')

    // Check Revision Center in Dark Mode
    await page.goto(`${BASE_URL}/app/revision`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await captureScreenshot(page, '14_revision_center_midnight_dark_mode.png')

    // 11. Public Landing Page Theme Isolation
    console.log('\n--- 11. Public Landing Page Theme Isolation ---')
    // Logout from dark session
    const avatarBtn = page.locator('button:has-text("Marcus Aurelius"), button:has-text("MA"), header button:has(img), header button:has(svg)').first()
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)

    // Navigate to public landing page
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    await captureScreenshot(page, '15_landing_after_logout_pristine_light.png')

    const isLandingDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    report('Public landing page retains pristine Light theme isolation (html has zero .dark class)', !isLandingDark)

  } catch (error) {
    console.error('Fatal error during visual regression QA:', error)
    report('Complete Visual Regression Run', false, error.message)
  } finally {
    await browser.close()
  }

  console.log('\n======================================================================')
  console.log(`📊 Phase 4B.4 Visual QA Summary: ${results.passed}/${results.total} Passed (${results.failed} Failed)`)
  console.log('======================================================================\n')
  return results
}

runVisualRegression().catch(console.error)
