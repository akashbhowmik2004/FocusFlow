import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const ARTIFACT_DIR = 'C:/Users/bhowm/.gemini/antigravity/brain/22a52d2b-b3ae-47d3-9bb0-c999863dbb22/screenshots/phase2'
const LOCAL_OUT = './test-results/phase2-audit'

for (const dir of [ARTIFACT_DIR, LOCAL_OUT]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

async function captureScreenshot(page, filename, options = {}) {
  const localPath = path.join(LOCAL_OUT, filename)
  const artifactPath = path.join(ARTIFACT_DIR, filename)
  await page.screenshot({ path: localPath, ...options })
  fs.copyFileSync(localPath, artifactPath)
  console.log(`📸 Saved screenshot: ${filename}`)
}

async function runPhase2Audit() {
  console.log('🏛️ Starting FocusFlow Phase 2 Playwright Audit...')
  const browser = await chromium.launch({ headless: true })

  // ─────────────────────────────────────────────────────────────
  // 1. DESKTOP AUDIT (1440 × 1024) — Canonical Stitch Workspace
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 1. Desktop Stitch Canvas (1440x1024) ---')
  const desktopCtx = await browser.newContext({
    viewport: { width: 1440, height: 1024 },
  })
  const desktopPage = await desktopCtx.newPage()

  // 1A. Landing Page (Desktop)
  await desktopPage.goto('http://localhost:5173/')
  await desktopPage.waitForLoadState('networkidle')
  await captureScreenshot(desktopPage, '01_desktop_landing_1440x1024.png')

  // Click on active recall button in component preview
  const hardRecallBtn = desktopPage.locator('button:has-text("Hard (3d)")').first()
  if (await hardRecallBtn.isVisible()) {
    await hardRecallBtn.click()
    await desktopPage.waitForTimeout(300)
    await captureScreenshot(desktopPage, '02_desktop_landing_recall_interaction.png')
  }

  // 1B. Login Page (Desktop)
  await desktopPage.goto('http://localhost:5173/login')
  await desktopPage.waitForLoadState('networkidle')
  await captureScreenshot(desktopPage, '03_desktop_login_1440x1024.png')

  // Type credentials into login form
  await desktopPage.fill('#email-field', 'j.vance@columbia.edu')
  await desktopPage.fill('#password-field', 'CurieCognition2025!')
  await captureScreenshot(desktopPage, '04_desktop_login_filled.png')

  // Toggle password visibility
  const togglePassBtn = desktopPage.locator('button[aria-label="Toggle password visibility"]')
  if (await togglePassBtn.isVisible()) {
    await togglePassBtn.click()
    await desktopPage.waitForTimeout(200)
    await captureScreenshot(desktopPage, '05_desktop_login_password_revealed.png')
  }

  // 1C. Signup Page (Desktop)
  await desktopPage.goto('http://localhost:5173/signup')
  await desktopPage.waitForLoadState('networkidle')
  await captureScreenshot(desktopPage, '06_desktop_signup_1440x1024.png')

  // Fill signup form and test dynamic password complexity meter
  await desktopPage.fill('#full-name', 'Julian Vance')
  await desktopPage.fill('#email', 'j.vance@columbia.edu')
  await desktopPage.fill('#password', 'CurieCognition2025!')
  await desktopPage.fill('#confirm-password', 'CurieCognition2025!')
  await desktopPage.check('input[name="acceptTerms"]')
  await desktopPage.waitForTimeout(300)
  await captureScreenshot(desktopPage, '07_desktop_signup_strong_password.png')

  // ─────────────────────────────────────────────────────────────
  // 2. TABLET AUDIT (768 × 1024)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 2. Tablet Viewport (768x1024) ---')
  const tabletCtx = await browser.newContext({
    viewport: { width: 768, height: 1024 },
  })
  const tabletPage = await tabletCtx.newPage()

  await tabletPage.goto('http://localhost:5173/')
  await tabletPage.waitForLoadState('networkidle')
  await captureScreenshot(tabletPage, '08_tablet_landing_768x1024.png')

  await tabletPage.goto('http://localhost:5173/login')
  await tabletPage.waitForLoadState('networkidle')
  await captureScreenshot(tabletPage, '09_tablet_login_768x1024.png')

  await tabletPage.goto('http://localhost:5173/signup')
  await tabletPage.waitForLoadState('networkidle')
  await captureScreenshot(tabletPage, '10_tablet_signup_768x1024.png')

  // ─────────────────────────────────────────────────────────────
  // 3. MOBILE AUDIT (390 × 844)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 3. Mobile Viewport (390x844) ---')
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
  })
  const mobilePage = await mobileCtx.newPage()

  await mobilePage.goto('http://localhost:5173/')
  await mobilePage.waitForLoadState('networkidle')
  await captureScreenshot(mobilePage, '11_mobile_landing_390x844.png')

  // Open mobile drawer
  const menuBtn = mobilePage.locator('button[aria-label="Toggle Navigation Menu"]')
  if (await menuBtn.isVisible()) {
    await menuBtn.click()
    await mobilePage.waitForTimeout(300)
    await captureScreenshot(mobilePage, '12_mobile_landing_menu_open.png')
  }

  await mobilePage.goto('http://localhost:5173/login')
  await mobilePage.waitForLoadState('networkidle')
  await captureScreenshot(mobilePage, '13_mobile_login_390x844.png')

  await mobilePage.goto('http://localhost:5173/signup')
  await mobilePage.waitForLoadState('networkidle')
  await captureScreenshot(mobilePage, '14_mobile_signup_390x844.png')

  // ─────────────────────────────────────────────────────────────
  // 4. DARK MODE AUDIT (1440 × 1024)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 4. Dark Theme Audits ---')
  const darkCtx = await browser.newContext({
    viewport: { width: 1440, height: 1024 },
  })
  const darkPage = await darkCtx.newPage()

  // Enable dark mode via class on html element
  await darkPage.goto('http://localhost:5173/login')
  await darkPage.waitForLoadState('networkidle')
  await darkPage.evaluate(() => document.documentElement.classList.add('dark'))
  await darkPage.waitForTimeout(200)
  await captureScreenshot(darkPage, '15_dark_login_1440x1024.png')

  await darkPage.goto('http://localhost:5173/signup')
  await darkPage.waitForLoadState('networkidle')
  await darkPage.evaluate(() => document.documentElement.classList.add('dark'))
  await darkPage.waitForTimeout(200)
  await captureScreenshot(darkPage, '16_dark_signup_1440x1024.png')

  await darkPage.goto('http://localhost:5173/')
  await darkPage.waitForLoadState('networkidle')
  await darkPage.evaluate(() => document.documentElement.classList.add('dark'))
  await darkPage.waitForTimeout(200)
  await captureScreenshot(darkPage, '17_dark_landing_1440x1024.png')

  await browser.close()
  console.log('✅ Phase 2 Playwright Audit Complete! All 17 screenshots captured.')
}

runPhase2Audit().catch((err) => {
  console.error('Audit failed:', err)
  process.exit(1)
})
