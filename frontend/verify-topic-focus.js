import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const ARTIFACT_DIR = 'C:/Users/bhowm/.gemini/antigravity/brain/22a52d2b-b3ae-47d3-9bb0-c999863dbb22/screenshots/phase3'
const LOCAL_OUT = './test-results/topic-focus-audit'

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
  dailyStudyHours: 4,
  theme: 'light',
}

const now = new Date()
const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

const mockCourse = {
  id: 'sub-chem204',
  name: 'Organic Chemistry II',
  code: 'CHEM 204',
  color: '#059669',
  examDate: new Date(Date.now() + 5 * 86400000).toISOString(),
  topics: [
    {
      id: 'top-1',
      name: 'Electrophilic Addition to Alkenes & Stereochemistry',
      status: 'completed',
      repetitions: 3,
      intervalDays: 7,
      easeFactor: 2.5,
      lastRevised: todayStr,
      nextRevision: new Date(Date.now() + 5 * 86400000).toISOString(),
      scheduleType: 'automatic',
    },
    {
      id: 'top-2',
      name: 'Aromaticity & Electrophilic Aromatic Substitution',
      status: 'in-progress',
      repetitions: 1,
      intervalDays: 1,
      easeFactor: 2.3,
      lastRevised: new Date(Date.now() - 86400000).toISOString(),
      nextRevision: todayStr,
      scheduleType: 'automatic',
    },
    {
      id: 'top-3',
      name: 'Carbonyl Condensation & Enolate Chemistry',
      status: 'not-started',
      repetitions: 0,
      intervalDays: 1,
      easeFactor: 2.5,
      lastRevised: null,
      nextRevision: null,
      scheduleType: 'automatic',
    },
  ],
}

const mockSessions = [
  {
    id: 'ses-completed-today',
    title: 'CHEM 204: Electrophilic Addition to Alkenes & Stereochemistry',
    subjectId: 'sub-chem204',
    topicId: 'top-1',
    date: todayStr,
    startTime: '09:00',
    endTime: '09:45',
    duration: 45,
    status: 'completed',
    completedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    actualDurationSeconds: 2700,
  },
  {
    id: 'ses-scheduled-second',
    title: 'CHEM 204: Electrophilic Addition Advanced Synthesis Problem Set',
    subjectId: 'sub-chem204',
    topicId: 'top-1',
    date: todayStr,
    startTime: '15:30',
    endTime: '17:00',
    duration: 90,
    status: 'upcoming',
  },
  {
    id: 'ses-upcoming-top2',
    title: 'CHEM 204: Aromaticity & Electrophilic Aromatic Substitution',
    subjectId: 'sub-chem204',
    topicId: 'top-2',
    date: todayStr,
    startTime: '11:00',
    endTime: '12:00',
    duration: 60,
    status: 'upcoming',
  },
]

async function verifyTopicFocus() {
  console.log('🏛️ Starting FocusFlow Daily Completion-Aware Focus Actions Visual Audit...')
  const browser = await chromium.launch({ headless: true })

  const setupMocks = async (context, theme = 'light') => {
    await context.route('**/api/auth/me', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { ...mockUser, theme } }),
      })
    })

    await context.route('**/api/subject/sub-chem204', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ subject: mockCourse }),
      })
    })

    await context.route('**/api/subject', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ subjects: [mockCourse] }),
      })
    })

    await context.route('**/api/session**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ sessions: mockSessions }),
      })
    })

    await context.route('**/api/session/active-focus', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ session: null, serverTime: new Date().toISOString() }),
      })
    })
  }

  try {
    // 1. Desktop Light: Subject Detail with Studied Today status pill
    console.log('--- 1. Desktop Light: Subject Detail with Studied Today badge ---')
    const context1 = await browser.newContext({
      viewport: { width: 1440, height: 1024 },
      colorScheme: 'light',
    })
    await setupMocks(context1, 'light')
    const page1 = await context1.newPage()
    await page1.goto('http://127.0.0.1:5173/app/subjects/sub-chem204', { waitUntil: 'networkidle' })
    await page1.waitForTimeout(1000)

    await captureScreenshot(page1, '01_subject_detail_studied_today_pill.png', { fullPage: false })

    // 2. Open Topic Details Drawer for top-1 (showing Studied Today badge and Schedule Session button)
    console.log('--- 2. Topic Details Drawer with Studied Today & Schedule action ---')
    const detailsButtons = await page1.locator('button:has-text("Details")').all()
    if (detailsButtons.length > 0) {
      await detailsButtons[0].click()
      await page1.waitForTimeout(600)
      await captureScreenshot(page1, '02_topic_details_drawer_studied_today.png')

      // 3. Click Schedule Session inside the drawer to reveal flexible additional scheduling
      console.log('--- 3. Schedule Session Dialog pre-filled for flexible additional study ---')
      const scheduleSessionBtn = page1.locator('button:has-text("Schedule Session")')
      if (await scheduleSessionBtn.isVisible()) {
        await scheduleSessionBtn.click()
        await page1.waitForTimeout(600)
        await captureScreenshot(page1, '03_schedule_second_session_dialog.png')
      }
    }
    await context1.close()

    // 4. Desktop Light: Planner showing completed session without focus button & upcoming 2nd session
    console.log('--- 4. Planner Action Availability: Completed session guarded vs upcoming ---')
    const contextPlanner = await browser.newContext({
      viewport: { width: 1440, height: 1024 },
      colorScheme: 'light',
    })
    await setupMocks(contextPlanner, 'light')
    const pagePlanner = await contextPlanner.newPage()
    await pagePlanner.goto('http://127.0.0.1:5173/app/planner', { waitUntil: 'networkidle' })
    await pagePlanner.waitForTimeout(1000)
    await captureScreenshot(pagePlanner, '04_planner_completed_session_action_guard.png', { fullPage: false })
    await contextPlanner.close()

    // 5. Mobile (390x844): Subject Detail with Studied Today badge
    console.log('--- 5. Mobile Viewport (390x844): Subject Detail ---')
    const contextMobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
      colorScheme: 'light',
      isMobile: true,
      hasTouch: true,
    })
    await setupMocks(contextMobile, 'light')
    const pageMobile = await contextMobile.newPage()
    await pageMobile.goto('http://127.0.0.1:5173/app/subjects/sub-chem204', { waitUntil: 'networkidle' })
    await pageMobile.waitForTimeout(1000)
    await captureScreenshot(pageMobile, '05_mobile_subject_detail_390x844.png', { fullPage: false })
    await contextMobile.close()

    // 6. Dark Mode (1440x1024): Subject Detail with Studied Today badge
    console.log('--- 6. Dark Mode: Subject Detail ---')
    const contextDark = await browser.newContext({
      viewport: { width: 1440, height: 1024 },
      colorScheme: 'dark',
    })
    await setupMocks(contextDark, 'dark')
    const pageDark = await contextDark.newPage()
    await pageDark.goto('http://127.0.0.1:5173/app/subjects/sub-chem204', { waitUntil: 'networkidle' })
    // Ensure dark class is applied
    await pageDark.evaluate(() => document.documentElement.classList.add('dark'))
    await pageDark.waitForTimeout(1000)
    await captureScreenshot(pageDark, '06_dark_subject_detail_1440x1024.png', { fullPage: false })
    await contextDark.close()

    console.log('🎉 Playwright Visual Audit successfully completed!')
  } catch (error) {
    console.error('❌ Playwright audit failed:', error)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

verifyTopicFocus()
