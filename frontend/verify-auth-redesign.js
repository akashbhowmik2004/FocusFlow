import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const ARTIFACT_DIR = 'C:/Users/bhowm/.gemini/antigravity/brain/61ce16d0-9da9-43cc-a19e-5b2161cb299b/screenshots/auth'
const LOCAL_OUT = './test-results/auth-verification'

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

async function setMode(page, targetMode) {
  const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
  if (targetMode === 'dark' && !isDark) {
    const toggleBtn = await page.$('button[aria-label="Switch to dark mode"], button[title="Switch to dark mode"]')
    if (toggleBtn) {
      await toggleBtn.click()
      await page.waitForTimeout(400)
    }
  } else if (targetMode === 'light' && isDark) {
    const toggleBtn = await page.$('button[aria-label="Switch to light mode"], button[title="Switch to light mode"]')
    if (toggleBtn) {
      await toggleBtn.click()
      await page.waitForTimeout(400)
    }
  }
}

async function run() {
  console.log('🚀 Starting FocusFlow Auth Redesign Verification...')

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  })

  // ── 1. Desktop Light Login (1440x900) ─────────────────────────
  console.log('\n☀️ Testing Desktop Light Mode Login (1440x900)...')
  const desktopLoginContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const loginPage = await desktopLoginContext.newPage()

  await loginPage.goto('http://localhost:5173/login', { waitUntil: 'networkidle' })
  await loginPage.waitForTimeout(600)
  await setMode(loginPage, 'light')

  await captureScreenshot(loginPage, 'auth_01_login_desktop_light.png')

  // Test inline validation errors on empty submit
  console.log('Testing Login validation errors...')
  const submitLoginBtn = await loginPage.$('button[type="submit"]')
  if (submitLoginBtn) {
    await submitLoginBtn.click()
    await loginPage.waitForTimeout(400)
  }
  await captureScreenshot(loginPage, 'auth_02_login_validation_errors.png')

  // Test password toggle
  console.log('Testing password visibility toggle...')
  const passwordField = await loginPage.$('#password-field')
  if (passwordField) {
    await passwordField.fill('SecretPassword123!')
    const toggleBtn = await loginPage.$('button[aria-label="Toggle password visibility"]')
    if (toggleBtn) {
      await toggleBtn.click()
      await loginPage.waitForTimeout(300)
    }
  }
  await captureScreenshot(loginPage, 'auth_03_login_password_unmasked.png')

  // ── 2. Desktop Dark Login (1440x900) ──────────────────────────
  console.log('\n🌙 Testing Desktop Dark Mode Login (1440x900)...')
  await setMode(loginPage, 'dark')
  await loginPage.reload({ waitUntil: 'networkidle' })
  await loginPage.waitForTimeout(600)
  await setMode(loginPage, 'dark')
  await captureScreenshot(loginPage, 'auth_04_login_desktop_dark.png')

  // ── 3. Desktop Light Signup (1440x900) ────────────────────────
  console.log('\n☀️ Testing Desktop Light Mode Signup (1440x900)...')
  const signupPage = await desktopLoginContext.newPage()
  await signupPage.goto('http://localhost:5173/signup', { waitUntil: 'networkidle' })
  await signupPage.waitForTimeout(600)
  await setMode(signupPage, 'light')
  await captureScreenshot(signupPage, 'auth_05_signup_desktop_light.png')

  // Test Password strength meter in Signup
  console.log('Testing Signup password strength meter & match indicator...')
  await signupPage.fill('#full-name', 'Akash Sharma')
  await signupPage.fill('#email', 'akash@iitb.ac.in')
  await signupPage.fill('#password', 'StudySmart2026!')
  await signupPage.fill('#confirm-password', 'StudySmart2026!')
  await signupPage.waitForTimeout(400)
  await captureScreenshot(signupPage, 'auth_06_signup_strength_and_matching.png')

  // Test Signup validation errors (with clear fields and submitting)
  await signupPage.goto('http://localhost:5173/signup', { waitUntil: 'networkidle' })
  await signupPage.waitForTimeout(400)
  await setMode(signupPage, 'light')
  const submitSignupBtn = await signupPage.$('button[type="submit"]')
  if (submitSignupBtn) {
    await submitSignupBtn.click()
    await signupPage.waitForTimeout(400)
  }
  await captureScreenshot(signupPage, 'auth_07_signup_validation_errors.png')

  // ── 4. Desktop Dark Signup (1440x900) ─────────────────────────
  console.log('\n🌙 Testing Desktop Dark Mode Signup (1440x900)...')
  await setMode(signupPage, 'dark')
  await signupPage.reload({ waitUntil: 'networkidle' })
  await signupPage.waitForTimeout(600)
  await setMode(signupPage, 'dark')
  await captureScreenshot(signupPage, 'auth_08_signup_desktop_dark.png')

  // ── 5. Tablet Viewport (768x1024) ─────────────────────────────
  console.log('\n📱 Testing Tablet Viewport (768x1024)...')
  const tabletContext = await browser.newContext({
    viewport: { width: 768, height: 1024 },
  })
  const tabletPage = await tabletContext.newPage()
  await tabletPage.goto('http://localhost:5173/login', { waitUntil: 'networkidle' })
  await tabletPage.waitForTimeout(600)
  await setMode(tabletPage, 'light')
  await captureScreenshot(tabletPage, 'auth_09_tablet_login.png')

  await tabletPage.goto('http://localhost:5173/signup', { waitUntil: 'networkidle' })
  await tabletPage.waitForTimeout(600)
  await setMode(tabletPage, 'light')
  await captureScreenshot(tabletPage, 'auth_10_tablet_signup.png')

  // ── 6. Mobile Viewport (375x812) ──────────────────────────────
  console.log('\n📱 Testing Mobile Viewport (375x812)...')
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
  })
  const mobilePage = await mobileContext.newPage()

  await mobilePage.goto('http://localhost:5173/login', { waitUntil: 'networkidle' })
  await mobilePage.waitForTimeout(600)
  await setMode(mobilePage, 'light')
  await captureScreenshot(mobilePage, 'auth_11_mobile_login_light.png')

  await setMode(mobilePage, 'dark')
  await mobilePage.waitForTimeout(300)
  await captureScreenshot(mobilePage, 'auth_12_mobile_login_dark.png')

  await mobilePage.goto('http://localhost:5173/signup', { waitUntil: 'networkidle' })
  await mobilePage.waitForTimeout(600)
  await setMode(mobilePage, 'light')
  await captureScreenshot(mobilePage, 'auth_13_mobile_signup_light.png')

  await setMode(mobilePage, 'dark')
  await mobilePage.waitForTimeout(300)
  await captureScreenshot(mobilePage, 'auth_14_mobile_signup_dark.png')

  await browser.close()
  console.log('\n✨ All auth verification screenshots captured successfully!')
}

run().catch((err) => {
  console.error('❌ Verification failed:', err)
  process.exit(1)
})
