import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const ARTIFACT_DIR = 'C:/Users/bhowm/.gemini/antigravity/brain/61ce16d0-9da9-43cc-a19e-5b2161cb299b/screenshots/unslop_audit'
const LOCAL_OUT = './test-results/unslop-audit'

for (const dir of [ARTIFACT_DIR, LOCAL_OUT]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

async function capture(page, filename, options = {}) {
  const localPath = path.join(LOCAL_OUT, filename)
  const artifactPath = path.join(ARTIFACT_DIR, filename)
  await page.screenshot({ path: localPath, ...options })
  fs.copyFileSync(localPath, artifactPath)
  console.log(`📸 Saved: ${filename}`)
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
  await page.waitForTimeout(400)
}

const mockUser = {
  id: 'usr-akash-1',
  name: 'Akash',
  email: 'akash@university.edu',
  dailyStudyHours: 4.5,
  theme: 'light',
  streak: 12,
  currentSemester: 4,
  onboardingCompleted: true,
}

const mockSubjects = [
  {
    id: 'sub-dbms',
    name: 'Database Management Systems',
    code: 'DBMS',
    color: '#6366f1',
    examDate: new Date(Date.now() + 1 * 86400000).toISOString(),
    topics: [
      { id: 't1', name: 'Relational Algebra', status: 'completed' },
      { id: 't2', name: 'Normalization', status: 'completed' },
      { id: 't3', name: 'Transaction Management', status: 'learning' },
    ],
  },
  {
    id: 'sub-cn',
    name: 'Computer Networks',
    code: 'CN',
    color: '#6366f1',
    examDate: new Date(Date.now() + 32 * 86400000).toISOString(),
    topics: [
      { id: 't4', name: 'OSI Reference Model', status: 'completed' },
      { id: 't5', name: 'TCP/IP Protocol Suite', status: 'completed' },
      { id: 't6', name: 'Routing Algorithms', status: 'learning' },
    ],
  },
  {
    id: 'sub-ds',
    name: 'Data Structures',
    code: 'DS',
    color: '#6366f1',
    examDate: new Date(Date.now() + 35 * 86400000).toISOString(),
    topics: [
      { id: 't7', name: 'Binary Search Trees', status: 'completed' },
      { id: 't8', name: 'AVL Trees', status: 'completed' },
      { id: 't9', name: 'Graph Traversals', status: 'completed' },
    ],
  },
]

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  })

  // 1. Landing Page (1440x900)
  const landingCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const landingPage = await landingCtx.newPage()
  await landingPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await landingPage.waitForTimeout(500)

  // Landing Light
  await setMode(landingPage, 'light')
  await capture(landingPage, 'unslop_01_landing_hero_light.png')
  await capture(landingPage, 'unslop_02_landing_full_light.png', { fullPage: true })

  // Landing Dark
  await setMode(landingPage, 'dark')
  await capture(landingPage, 'unslop_03_landing_hero_dark.png')
  await capture(landingPage, 'unslop_04_landing_full_dark.png', { fullPage: true })

  // 2. Auth Pages
  const loginPage = await landingCtx.newPage()
  await loginPage.goto('http://localhost:5173/login', { waitUntil: 'networkidle' })
  await loginPage.waitForTimeout(500)
  await capture(loginPage, 'unslop_05_login_clean.png')

  const signupPage = await landingCtx.newPage()
  await signupPage.goto('http://localhost:5173/signup', { waitUntil: 'networkidle' })
  await signupPage.waitForTimeout(500)
  await capture(signupPage, 'unslop_06_signup_clean.png')

  // 3. App Dashboard (1440x900)
  const appCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await appCtx.route('**/api/auth/me', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: mockUser }),
    })
  })
  await appCtx.route(/\/api\/subject/, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ subjects: mockSubjects }),
    })
  })

  const appPage = await appCtx.newPage()
  await appPage.goto('http://localhost:5173/app/dashboard', { waitUntil: 'networkidle' })
  await appPage.waitForTimeout(600)

  // Dashboard Light
  await setMode(appPage, 'light')
  await capture(appPage, 'unslop_07_dashboard_light.png')

  // Dashboard Dark
  await setMode(appPage, 'dark')
  await capture(appPage, 'unslop_08_dashboard_dark.png')

  await browser.close()
  console.log('✅ Unslop quality audit verification complete!')
}

run().catch(console.error)
