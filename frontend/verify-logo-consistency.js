import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const ARTIFACT_DIR = 'C:/Users/bhowm/.gemini/antigravity/brain/61ce16d0-9da9-43cc-a19e-5b2161cb299b/screenshots/brand_logo'
const LOCAL_OUT = './test-results/brand-logo-verification'

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
  await page.evaluate((mode) => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark')
      localStorage.setItem('focusflow_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('focusflow_theme', 'light')
    }
  }, targetMode)
  await page.waitForTimeout(300)
}

const mockUser = {
  id: 'usr-academic-1',
  name: 'Maya Lin',
  email: 'maya@university.edu',
  dailyStudyHours: 5,
  theme: 'light',
  streak: 14,
  semester: 'Fall 2026',
  onboardingCompleted: true,
}

async function run() {
  console.log('🚀 Starting FocusFlow Brand Logo Consistency Verification...')

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  })

  // 1. Landing Page Navbar Logo (Public, 1440x900)
  console.log('\nTesting Landing Page Navbar Logo...')
  const publicContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const landingPage = await publicContext.newPage()
  await landingPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await landingPage.waitForTimeout(600)
  await setMode(landingPage, 'light')
  await captureScreenshot(landingPage, 'logo_01_landing_navbar_light.png')

  await setMode(landingPage, 'dark')
  await captureScreenshot(landingPage, 'logo_02_landing_navbar_dark.png')

  // 2. Login Page Logo
  console.log('\nTesting Login Page Logo...')
  const loginPage = await publicContext.newPage()
  await loginPage.goto('http://localhost:5173/login', { waitUntil: 'networkidle' })
  await loginPage.waitForTimeout(600)
  await setMode(loginPage, 'light')
  await captureScreenshot(loginPage, 'logo_03_login_header_light.png')

  await setMode(loginPage, 'dark')
  await captureScreenshot(loginPage, 'logo_04_login_header_dark.png')

  // 3. Signup Page Logo
  console.log('\nTesting Signup Page Logo...')
  const signupPage = await publicContext.newPage()
  await signupPage.goto('http://localhost:5173/signup', { waitUntil: 'networkidle' })
  await signupPage.waitForTimeout(600)
  await setMode(signupPage, 'light')
  await captureScreenshot(signupPage, 'logo_05_signup_header_light.png')

  // 4. Authenticated App Context: Dashboard Sidebar Logo
  console.log('\nTesting App Dashboard Sidebar Logo (Authenticated)...')
  const appContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  await appContext.route('**/api/auth/me', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: mockUser }),
    })
  })
  await appContext.route(/\/api\/subject/, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ subjects: [] }),
    })
  })

  const appPage = await appContext.newPage()
  await appPage.goto('http://localhost:5173/app/dashboard', { waitUntil: 'networkidle' })
  await appPage.waitForTimeout(600)
  await setMode(appPage, 'light')
  await captureScreenshot(appPage, 'logo_06_app_sidebar_light.png')

  await setMode(appPage, 'dark')
  await captureScreenshot(appPage, 'logo_07_app_sidebar_dark.png')

  // 5. Mobile App Navigation Logo (375x812)
  console.log('\nTesting Mobile App Navigation Logo...')
  const mobileAppContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
  })
  await mobileAppContext.route('**/api/auth/me', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: mockUser }),
    })
  })
  await mobileAppContext.route(/\/api\/subject/, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ subjects: [] }),
    })
  })

  const mobileAppPage = await mobileAppContext.newPage()
  await mobileAppPage.goto('http://localhost:5173/app/dashboard', { waitUntil: 'networkidle' })
  await mobileAppPage.waitForTimeout(600)
  await setMode(mobileAppPage, 'light')
  await captureScreenshot(mobileAppPage, 'logo_08_mobile_topbar_light.png')

  // Open mobile drawer to verify drawer logo
  const menuBtn = await mobileAppPage.$('button[aria-label="Open navigation menu"]')
  if (menuBtn) {
    await menuBtn.click()
    await mobileAppPage.waitForTimeout(400)
    await captureScreenshot(mobileAppPage, 'logo_09_mobile_drawer_logo.png')
  }

  // 6. Onboarding Page Logo
  console.log('\nTesting Onboarding Page Logo...')
  const onboardingPage = await appContext.newPage()
  await onboardingPage.goto('http://localhost:5173/onboarding', { waitUntil: 'networkidle' })
  await onboardingPage.waitForTimeout(600)
  await setMode(onboardingPage, 'light')
  await captureScreenshot(onboardingPage, 'logo_10_onboarding_logo.png')

  await browser.close()
  console.log('\n✨ Brand logo consistency verification complete!')
}

run().catch((err) => {
  console.error('❌ Verification failed:', err)
  process.exit(1)
})
