import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const ARTIFACT_DIR = 'C:/Users/bhowm/.gemini/antigravity/brain/61ce16d0-9da9-43cc-a19e-5b2161cb299b/screenshots/verified_typography'
const LOCAL_OUT = './test-results/typography-verification'

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
  dailyStudyHours: 5,
  theme: 'light',
  streak: 14,
  semester: 'Fall 2026',
  onboardingCompleted: true,
}

const now = new Date()
const formatDate = (d) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const todayStr = formatDate(now)
const pastDateStr = formatDate(new Date(now.getTime() - 4 * 86400000))
const futureDateStr = formatDate(new Date(now.getTime() + 6 * 86400000))

const mockSubjects = [
  {
    id: 'sub-chem204',
    name: 'Organic Chemistry II',
    code: 'CHEM 204',
    color: '#059669',
    examDate: new Date(now.getTime() + 5 * 86400000).toISOString(),
    topics: [
      {
        id: 'top-1',
        name: 'Electrophilic Addition to Conjugated Dienes',
        status: 'completed',
        nextRevision: pastDateStr,
        lastRevised: formatDate(new Date(now.getTime() - 8 * 86400000)),
        repetitions: 3,
        intervalDays: 7,
        easeFactor: 2.5,
        scheduleType: 'SPACED',
        revisions: [
          { id: 'rev-1', rating: 'GOOD', reviewedAt: new Date(now.getTime() - 8 * 86400000).toISOString() },
        ],
      },
      {
        id: 'top-2',
        name: 'Diels-Alder Cycloaddition Stereochemistry',
        status: 'in-progress',
        nextRevision: todayStr,
        lastRevised: formatDate(new Date(now.getTime() - 3 * 86400000)),
        repetitions: 2,
        intervalDays: 3,
        easeFactor: 2.3,
        scheduleType: 'SPACED',
        revisions: [
          { id: 'rev-2', rating: 'HARD', reviewedAt: new Date(now.getTime() - 3 * 86400000).toISOString() },
        ],
      },
      {
        id: 'top-3',
        name: 'Aromaticity & Huckel Rule Resonance',
        status: 'not-started',
        nextRevision: null,
        repetitions: 0,
        intervalDays: 0,
        easeFactor: 2.5,
        scheduleType: null,
        revisions: [],
      },
    ],
  },
  {
    id: 'sub-cs312',
    name: 'Operating Systems & Concurrency',
    code: 'CS 312',
    color: '#2563EB',
    examDate: new Date(now.getTime() + 18 * 86400000).toISOString(),
    topics: [
      {
        id: 'top-4',
        name: 'Virtual Memory & Multi-Level Page Tables',
        status: 'completed',
        nextRevision: futureDateStr,
        lastRevised: formatDate(new Date(now.getTime() - 2 * 86400000)),
        repetitions: 4,
        intervalDays: 14,
        easeFactor: 2.6,
        scheduleType: 'SPACED',
        revisions: [
          { id: 'rev-3', rating: 'EASY', reviewedAt: new Date(now.getTime() - 2 * 86400000).toISOString() },
        ],
      },
      {
        id: 'top-5',
        name: 'Deadlock Detection & Banker Algorithm',
        status: 'in-progress',
        nextRevision: todayStr,
        lastRevised: formatDate(new Date(now.getTime() - 4 * 86400000)),
        repetitions: 1,
        intervalDays: 2,
        easeFactor: 2.1,
        scheduleType: 'MANUAL',
        revisions: [
          { id: 'rev-4', rating: 'AGAIN', reviewedAt: new Date(now.getTime() - 4 * 86400000).toISOString() },
        ],
      },
    ],
  },
  {
    id: 'sub-math215',
    name: 'Linear Algebra & Vector Spaces',
    code: 'MATH 215',
    color: '#D97706',
    examDate: new Date(now.getTime() + 32 * 86400000).toISOString(),
    topics: [
      {
        id: 'top-6',
        name: 'Eigenvalues & Orthogonal Diagonalization',
        status: 'completed',
        nextRevision: futureDateStr,
        repetitions: 2,
        intervalDays: 6,
        easeFactor: 2.5,
        scheduleType: 'SPACED',
        revisions: [],
      },
    ],
  },
]

const mockSessions = [
  {
    id: 'sess-1',
    title: 'Diels-Alder Stereochemistry Flashcard Drill',
    date: todayStr,
    startTime: '09:00',
    endTime: '10:00',
    duration: 60,
    status: 'completed',
    subjectId: 'sub-chem204',
    actualDurationSeconds: 3600,
  },
  {
    id: 'sess-2',
    title: 'Banker Algorithm Practice Problems',
    date: todayStr,
    startTime: '11:00',
    endTime: '12:00',
    duration: 60,
    status: 'completed',
    subjectId: 'sub-cs312',
    actualDurationSeconds: 3420,
  },
  {
    id: 'sess-3',
    title: 'Virtual Memory Multi-Level Paging Review',
    date: todayStr,
    startTime: '14:30',
    endTime: '15:30',
    duration: 60,
    status: 'upcoming',
    subjectId: 'sub-cs312',
    actualDurationSeconds: null,
  },
  {
    id: 'sess-4',
    title: 'Eigenvalues Problem Set 4',
    date: todayStr,
    startTime: '16:30',
    endTime: '17:30',
    duration: 60,
    status: 'upcoming',
    subjectId: 'sub-math215',
    actualDurationSeconds: null,
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

  await context.route(/\/api\/subject/, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ subjects: mockSubjects }),
    })
  })

  await context.route(/\/api\/session\/active-focus/, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ session: null }),
    })
  })

  await context.route(/\/api\/session/, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ sessions: mockSessions }),
    })
  })
}

async function run() {
  console.log('🚀 Starting FocusFlow Typography & Clean Tag Verification...')
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  })

  const routes = [
    { name: '01_dashboard', path: '/app/dashboard' },
    { name: '02_my_day', path: '/app/day' },
    { name: '03_planner', path: '/app/planner' },
    { name: '04_subjects', path: '/app/subjects' },
    { name: '05_subject_detail', path: '/app/subjects/sub-chem204' },
    { name: '06_revision_center', path: '/app/revision' },
    { name: '07_insights', path: '/app/insights' },
    { name: '08_settings', path: '/app/settings' },
    { name: '09_focus_mode', path: '/app/focus' },
  ]

  // --- LIGHT THEME (1440x960) ---
  console.log('\n☀️ Testing Light Theme Desktop...')
  const lightCtx = await browser.newContext({ viewport: { width: 1440, height: 960 } })
  await setupMocks(lightCtx, 'light')
  const lightPage = await lightCtx.newPage()

  for (const r of routes) {
    await lightPage.goto(`http://localhost:5173${r.path}`)
    await lightPage.waitForLoadState('networkidle')
    await lightPage.evaluate(() => {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('focusflow_theme', 'light')
    })
    await lightPage.waitForTimeout(600)
    await captureScreenshot(lightPage, `${r.name}_light.png`)
  }

  // --- DARK THEME (1440x960) ---
  console.log('\n🌙 Testing Dark Theme Desktop...')
  const darkCtx = await browser.newContext({ viewport: { width: 1440, height: 960 } })
  await setupMocks(darkCtx, 'dark')
  const darkPage = await darkCtx.newPage()

  for (const r of routes) {
    await darkPage.goto(`http://localhost:5173${r.path}`)
    await darkPage.waitForLoadState('networkidle')
    await darkPage.evaluate(() => {
      document.documentElement.classList.add('dark')
      localStorage.setItem('focusflow_theme', 'dark')
    })
    await darkPage.waitForTimeout(600)
    await captureScreenshot(darkPage, `${r.name}_dark.png`)
  }

  // --- MOBILE AUDIT (390x844) ---
  console.log('\n📱 Testing Mobile Viewports...')
  const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  await setupMocks(mobileCtx, 'light')
  const mobilePage = await mobileCtx.newPage()

  const mobileRoutes = [
    { name: '09_mobile_dashboard', path: '/app/dashboard' },
    { name: '10_mobile_revision', path: '/app/revision' },
    { name: '11_mobile_subjects', path: '/app/subjects' },
    { name: '12_mobile_planner', path: '/app/planner' },
  ]

  for (const r of mobileRoutes) {
    await mobilePage.goto(`http://localhost:5173${r.path}`)
    await mobilePage.waitForLoadState('networkidle')
    await mobilePage.waitForTimeout(600)
    await captureScreenshot(mobilePage, `${r.name}.png`)
  }

  await browser.close()
  console.log('🎉 Verification run complete! All screenshots captured.')
}

run().catch((err) => {
  console.error('Execution error:', err)
  process.exit(1)
})
