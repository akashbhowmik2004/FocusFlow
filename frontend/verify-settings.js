import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const ARTIFACT_DIR = 'C:/Users/bhowm/.gemini/antigravity/brain/22a52d2b-b3ae-47d3-9bb0-c999863dbb22/screenshots/phase3'
const LOCAL_OUT = './test-results/settings-audit'

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

const mockUser = {
  id: 'usr-academic-1',
  name: 'Maya Lin',
  email: 'maya@university.edu',
  studyGoal: 'Complete Honours Thesis & High Distinction GPA',
  dailyStudyHours: 5,
  reminderEnabled: true,
  preferredStartTime: '09:00',
  preferredEndTime: '13:00',
  theme: 'light',
  createdAt: '2026-08-15T10:00:00.000Z',
}

const mockSubjects = [
  {
    id: 'sub-chem204',
    name: 'Organic Chemistry II',
    code: 'CHEM 204',
    color: '#059669',
    topics: [],
  },
  {
    id: 'sub-math215',
    name: 'Multivariable Calculus',
    code: 'MATH 215',
    color: '#0284C7',
    topics: [],
  },
]

const mockSessions = [
  {
    id: 'sess-1',
    subjectId: 'sub-chem204',
    date: '2026-11-05',
    duration: 60,
    actualDurationSeconds: 3600,
    status: 'completed',
    type: 'focus',
  },
]

async function setupMocks(context, theme = 'light') {
  await context.route('**/api/auth/me', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: { ...mockUser, theme } }),
    })
  })

  await context.route('**/api/user/update', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'User updated', user: { ...mockUser, theme } }),
    })
  })

  await context.route('**/api/subject**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ subjects: mockSubjects }),
    })
  })

  await context.route('**/api/session**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ sessions: mockSessions }),
    })
  })
}

async function runAudit() {
  const browser = await chromium.launch({ headless: true })

  try {
    console.log('🚀 Starting Phase 3F Settings & Preferences Visual Audit...')

    // 1. Desktop Profile View (1440x1024)
    console.log('Capturing Desktop Profile View...')
    const desktopCtx = await browser.newContext({
      viewport: { width: 1440, height: 1024 },
    })
    await setupMocks(desktopCtx, 'light')
    const page1 = await desktopCtx.newPage()
    await page1.goto('http://localhost:5173/app/settings', { waitUntil: 'networkidle' })
    await page1.waitForTimeout(800)
    await captureScreenshot(page1, '01_desktop_settings_profile_1440x1024.png')

    // 2. Desktop Academic Preferences View (1440x1024)
    console.log('Capturing Desktop Academic Preferences View...')
    const academicTab = page1.locator('button:has-text("Academic Preferences")')
    await academicTab.click()
    await page1.waitForTimeout(600)
    await captureScreenshot(page1, '02_desktop_settings_academic_1440x1024.png')
    await desktopCtx.close()

    // 3. Tablet View (768x1024) - Study & Time Blocking
    console.log('Capturing Tablet View...')
    const tabletCtx = await browser.newContext({
      viewport: { width: 768, height: 1024 },
    })
    await setupMocks(tabletCtx, 'light')
    const page2 = await tabletCtx.newPage()
    await page2.goto('http://localhost:5173/app/settings', { waitUntil: 'networkidle' })
    await page2.waitForTimeout(800)
    const studyTab = page2.locator('button:has-text("Study & Time Blocking")')
    await studyTab.click()
    await page2.waitForTimeout(600)
    await captureScreenshot(page2, '03_tablet_settings_768x1024.png')
    await tabletCtx.close()

    // 4. Mobile View (390x844) - Navigation & Profile
    console.log('Capturing Mobile View...')
    const mobileCtx = await browser.newContext({
      viewport: { width: 390, height: 844 },
    })
    await setupMocks(mobileCtx, 'light')
    const page3 = await mobileCtx.newPage()
    await page3.goto('http://localhost:5173/app/settings', { waitUntil: 'networkidle' })
    await page3.waitForTimeout(800)
    await captureScreenshot(page3, '04_mobile_settings_390x844.png')
    await mobileCtx.close()

    // 5. Dark Mode View (1440x1024) - Account & Security
    console.log('Capturing Dark Mode View (Account & Security)...')
    const darkCtx = await browser.newContext({
      viewport: { width: 1440, height: 1024 },
    })
    await setupMocks(darkCtx, 'dark')
    const page4 = await darkCtx.newPage()
    await page4.addInitScript(() => {
      document.documentElement.classList.add('dark')
      localStorage.setItem('focusflow_theme', 'dark')
    })
    await page4.goto('http://localhost:5173/app/settings', { waitUntil: 'networkidle' })
    await page4.waitForTimeout(800)
    const accountTab = page4.locator('button:has-text("Account & Security")')
    await accountTab.click()
    await page4.waitForTimeout(600)
    await captureScreenshot(page4, '05_dark_settings_1440x1024.png')
    await darkCtx.close()

    console.log('🎉 Settings visual audit complete! All 5 viewports captured.')
  } catch (err) {
    console.error('Audit failed with error:', err)
  } finally {
    await browser.close()
  }
}

runAudit()
