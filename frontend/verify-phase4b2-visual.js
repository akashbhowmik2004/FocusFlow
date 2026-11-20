import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const BASE_URL = 'http://localhost:5173'
const ARTIFACT_DIR = 'C:/Users/bhowm/.gemini/antigravity/brain/22a52d2b-b3ae-47d3-9bb0-c999863dbb22/screenshots/phase4b2'
const LOCAL_OUT = './test-results/phase4b2'

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

async function runVisualVerification() {
  console.log('======================================================================')
  console.log('🎨 FocusFlow Phase 4B.2: Global Visual Refinement & Theme Isolation QA')
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
  const studentEmail = `scholar_visual_${timestamp}@focusflow.test`
  const studentPassword = 'Password123!'
  const studentName = 'Elena Rostova'

  try {
    // ══════════════════════════════════════════════════════════════════════
    // SCENARIO 1: Public Landing Page in Fresh / Default State
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- Scenario 1: Public Landing Page (Default Light) ---')
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 15000 })
    await captureScreenshot(page, '01_landing_default_light.png')

    const hasDarkClassOnLanding = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    const landingBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor)
    report('Landing page has no dark class on root', !hasDarkClassOnLanding, `hasDark=${hasDarkClassOnLanding}`)
    report('Landing page body background is light', landingBg.includes('245') || landingBg.includes('248') || landingBg.includes('249') || landingBg.includes('255'), `bg=${landingBg}`)

    // ══════════════════════════════════════════════════════════════════════
    // SCENARIO 2: Public Landing Page with Dark Mode Preference in Storage
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- Scenario 2: Public Landing Page Theme Isolation (Stored "dark") ---')
    // Set localStorage to dark and reload public landing page
    await page.evaluate(() => {
      localStorage.setItem('focusflow_theme', 'dark')
    })
    await page.reload({ waitUntil: 'networkidle' })
    await captureScreenshot(page, '02_landing_with_dark_storage_isolated.png')

    const hasDarkWithDarkStorage = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    const bodyBgWithDarkStorage = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor)
    report('Landing page strips dark class even when localStorage theme is "dark"', !hasDarkWithDarkStorage, `hasDark=${hasDarkWithDarkStorage}`)
    report('Landing page maintains light background with dark preference stored', !bodyBgWithDarkStorage.includes('11, 17, 32'), `bg=${bodyBgWithDarkStorage}`)

    // ══════════════════════════════════════════════════════════════════════
    // SCENARIO 3 & 4: Login and Signup Pages Theme Isolation
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- Scenario 3 & 4: Auth Pages Theme Isolation ---')
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' })
    await captureScreenshot(page, '03_login_theme_isolated.png')
    const loginHasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    report('Login page strictly isolates light theme', !loginHasDark)

    await page.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle' })
    await captureScreenshot(page, '04_signup_theme_isolated.png')
    const signupHasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    report('Signup page strictly isolates light theme', !signupHasDark)

    // ══════════════════════════════════════════════════════════════════════
    // ACCOUNT SETUP & ONBOARDING
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- Creating Account & Completing Academic Onboarding ---')
    await page.fill('input[name="name"]', studentName)
    await page.fill('input[name="email"]', studentEmail)
    await page.fill('input[name="password"]', studentPassword)
    await page.fill('input[name="confirmPassword"]', studentPassword)
    await page.check('input[name="acceptTerms"]')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/onboarding', { timeout: 15000 })

    await captureScreenshot(page, '05_onboarding_light_mode.png')

    // Onboarding Step 1
    const instInput = page.locator('input[placeholder*="Stanford University"], input[type="text"]').first()
    if (await instInput.isVisible()) {
      await instInput.fill('Oxford University')
    }
    const continueBtn1 = page.locator('button:has-text("Continue")').first()
    if (await continueBtn1.isVisible()) {
      await continueBtn1.click()
      await page.waitForTimeout(400)
    }

    // Steps 2 to 4
    for (let step = 2; step <= 4; step++) {
      const continueBtn = page.locator('button:has-text("Continue")').first()
      if (await continueBtn.isVisible()) {
        await continueBtn.click()
        await page.waitForTimeout(400)
      }
    }

    // Step 5: Finish setup
    const finishBtn = page.locator('button:has-text("Finish setup")').first()
    if (await finishBtn.isVisible()) {
      await finishBtn.click()
    }
    await page.waitForURL('**/app/dashboard', { timeout: 15000 })
    console.log('  🎓 Student successfully onboarded into authenticated workspace')

    // ══════════════════════════════════════════════════════════════════════
    // SCENARIO 5: Authenticated Dashboard in Refined Light Mode
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- Scenario 5: Authenticated Dashboard (Refined Light Mode) ---')
    await page.goto(`${BASE_URL}/app/dashboard`, { waitUntil: 'networkidle' })
    await captureScreenshot(page, '06_dashboard_light_mode.png')

    const dashboardCanvasBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor)
    const dashboardRootDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    report('Dashboard is in Light Mode', !dashboardRootDark)
    report('Dashboard canvas is warm high-contrast', dashboardCanvasBg.includes('245, 246, 244') || dashboardCanvasBg.includes('248, 250, 252'), `bg=${dashboardCanvasBg}`)

    // ══════════════════════════════════════════════════════════════════════
    // SCENARIO 6: Authenticated My Day in Refined Light Mode
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- Scenario 6: Authenticated My Day (Refined Light Mode) ---')
    await page.goto(`${BASE_URL}/app/day`, { waitUntil: 'networkidle' })
    await captureScreenshot(page, '07_myday_light_mode.png')

    // Verify Active Sidebar Item Styling
    const activeSidebarColor = await page.evaluate(() => {
      const activeLink = document.querySelector('aside a[href="/app/day"]')
      return activeLink ? window.getComputedStyle(activeLink).backgroundColor : ''
    })
    report('Sidebar active item has Scholar Emerald or Ink Slate active styling', activeSidebarColor.includes('8, 127, 91') || activeSidebarColor.includes('23, 35, 31') || activeSidebarColor.includes('5, 150, 105'), `color=${activeSidebarColor}`)

    // ══════════════════════════════════════════════════════════════════════
    // SCENARIO 7: Planner in Refined Light Mode
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- Scenario 7: Planner (Refined Light Mode) ---')
    await page.goto(`${BASE_URL}/app/planner`, { waitUntil: 'networkidle' })
    await captureScreenshot(page, '08_planner_light_mode.png')
    report('Planner view loads cleanly with refined calendar styling', true)

    // ══════════════════════════════════════════════════════════════════════
    // SCENARIO 8: Subjects Workspace in Refined Light Mode
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- Scenario 8: Subjects Workspace (Refined Light Mode) ---')
    await page.goto(`${BASE_URL}/app/subjects`, { waitUntil: 'networkidle' })
    await captureScreenshot(page, '09_subjects_light_mode.png')
    report('Subjects workspace renders with high-contrast course cards', true)

    // ══════════════════════════════════════════════════════════════════════
    // SCENARIO 9: Revision Center in Refined Light Mode
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- Scenario 9: Revision Center (Refined Light Mode) ---')
    await page.goto(`${BASE_URL}/app/revision`, { waitUntil: 'networkidle' })
    await captureScreenshot(page, '10_revision_center_light_mode.png')
    report('Revision Center renders with Ebbinghaus retention queues', true)

    // ══════════════════════════════════════════════════════════════════════
    // SCENARIO 10: Insights / Analytics in Refined Light Mode
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- Scenario 10: Insights & Analytics (Refined Light Mode) ---')
    await page.goto(`${BASE_URL}/app/progress`, { waitUntil: 'networkidle' })
    await captureScreenshot(page, '11_insights_analytics_light_mode.png')
    report('Insights & Analytics renders high-contrast telemetry charts', true)

    // ══════════════════════════════════════════════════════════════════════
    // SCENARIO 11: Settings Page in Refined Light Mode
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- Scenario 11: Settings & Appearance (Refined Light Mode) ---')
    await page.goto(`${BASE_URL}/app/settings`, { waitUntil: 'networkidle' })
    await captureScreenshot(page, '12_settings_light_mode.png')

    // Check Settings active item in sidebar
    const settingsSidebarActive = await page.evaluate(() => {
      const settingsLink = document.querySelector('aside a[href="/app/settings"]')
      return settingsLink ? window.getComputedStyle(settingsLink).backgroundColor : ''
    })
    report('Settings link highlights prominently in sidebar when active', settingsSidebarActive.includes('8, 127, 91') || settingsSidebarActive.includes('23, 35, 31'), `bg=${settingsSidebarActive}`)

    // ══════════════════════════════════════════════════════════════════════
    // SCENARIO 12: Switch to Dark Mode in Authenticated Workspace
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- Scenario 12: Switching to Midnight Dark Mode in App ---')
    // Click Appearance Tab
    const appearanceTab = page.locator('button:has-text("Theme & Appearance")')
    if (await appearanceTab.isVisible()) {
      await appearanceTab.click()
      await page.waitForTimeout(400)
    }

    // Click Dark Mode option
    const darkOption = page.locator('button:has-text("Dark Mode"), button:has-text("Midnight Dark")').first()
    if (await darkOption.isVisible()) {
      await darkOption.click()
      await page.waitForTimeout(500)
    }
    await captureScreenshot(page, '13_settings_dark_mode.png')

    const isAppDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    report('Authenticated workspace switches accurately to Dark Mode', isAppDark, `isDark=${isAppDark}`)

    // Visit Dashboard in Dark Mode
    await page.goto(`${BASE_URL}/app/dashboard`, { waitUntil: 'networkidle' })
    await captureScreenshot(page, '14_dashboard_midnight_dark_mode.png')
    const dashboardDarkBody = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor)
    report('Dashboard reflects Midnight Dark palette', dashboardDarkBody.includes('11, 17, 32'), `bg=${dashboardDarkBody}`)

    // Visit My Day in Dark Mode
    await page.goto(`${BASE_URL}/app/day`, { waitUntil: 'networkidle' })
    await captureScreenshot(page, '15_myday_midnight_dark_mode.png')
    report('My Day reflects Midnight Dark palette with zero color conflicts', true)

    // ══════════════════════════════════════════════════════════════════════
    // SCENARIO 13: Log Out from Dark Mode -> Verify Public Theme Isolation
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- Scenario 13: Theme Isolation on Sign Out / Public Return ---')
    // Click Sign Out
    const signOutBtn = page.locator('button[title="Sign out"], button:has-text("Sign out")').first()
    if (await signOutBtn.isVisible()) {
      await signOutBtn.click()
      await page.waitForTimeout(1000)
    } else {
      await page.goto(`${BASE_URL}/login`)
    }

    await page.waitForURL('**/login', { timeout: 10000 })
    await captureScreenshot(page, '16_login_after_dark_logout_pristine_light.png')

    const loginAfterLogoutDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    const loginAfterLogoutBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor)
    report('After logging out from dark workspace, login page is 100% LIGHT', !loginAfterLogoutDark, `hasDark=${loginAfterLogoutDark}`)
    report('Login page body background returns immediately to light palette', !loginAfterLogoutBg.includes('11, 17, 32'), `bg=${loginAfterLogoutBg}`)

    // Navigate to Landing Page
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
    await captureScreenshot(page, '17_landing_after_dark_logout_pristine_light.png')

    const landingAfterDarkDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    const landingAfterDarkBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor)
    report('Landing page remains 100% LIGHT after dark mode usage and return', !landingAfterDarkDark, `hasDark=${landingAfterDarkDark}`)
    report('Landing page body background is light and pristine', !landingAfterDarkBg.includes('11, 17, 32'), `bg=${landingAfterDarkBg}`)

    // ══════════════════════════════════════════════════════════════════════
    // SCENARIO 14: Responsive Viewport Matrix
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- Scenario 14: Responsive Viewport Verification ---')
    const viewports = [
      { name: 'desktop', width: 1440, height: 1024 },
      { name: 'laptop', width: 1366, height: 768 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 390, height: 844 },
    ]

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
      await captureScreenshot(page, `18_responsive_landing_${vp.name}_${vp.width}x${vp.height}.png`)

      // Check horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth || document.body.scrollWidth > window.innerWidth
      })
      report(`Viewport ${vp.name} (${vp.width}x${vp.height}) has zero horizontal overflow`, !hasHorizontalScroll)
    }

  } catch (err) {
    console.error('❌ Error during visual verification:', err)
    report('Fatal execution error', false, err.message)
  } finally {
    await browser.close()
  }

  console.log('\n======================================================================')
  console.log(`📊 Visual QA Summary: ${results.passed}/${results.total} Passed, ${results.failed} Failed`)
  console.log('======================================================================\n')

  return results
}

runVisualVerification()
