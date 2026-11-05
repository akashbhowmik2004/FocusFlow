import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const ARTIFACT_DIR = 'C:/Users/bhowm/.gemini/antigravity/brain/22a52d2b-b3ae-47d3-9bb0-c999863dbb22/screenshots/phase3'
const LOCAL_OUT = './test-results/insights-audit'

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
const formatDate = (d) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const todayStr = formatDate(now)
const daysAgoStr = (days) => formatDate(new Date(now.getTime() - days * 86400000))
const daysAheadStr = (days) => formatDate(new Date(now.getTime() + days * 86400000))

const mockSubjects = [
  {
    id: 'sub-chem204',
    name: 'Organic Chemistry II',
    code: 'CHEM 204',
    color: '#059669',
    examDate: daysAheadStr(3),
    topics: [
      {
        id: 'top-c-1',
        name: 'Electrophilic Addition & Mechanisms',
        status: 'completed',
        nextRevision: todayStr,
        revisions: [
          { id: 'rev-c-1', rating: 'EASY', intervalDays: 7, easeFactor: 2.6, reviewedAt: daysAgoStr(1) },
          { id: 'rev-c-2', rating: 'GOOD', intervalDays: 3, easeFactor: 2.5, reviewedAt: daysAgoStr(4) },
        ],
      },
      {
        id: 'top-c-2',
        name: 'Resonance Stability & Conjugation',
        status: 'completed',
        nextRevision: daysAgoStr(2), // Overdue
        revisions: [
          { id: 'rev-c-3', rating: 'HARD', intervalDays: 2, easeFactor: 2.36, reviewedAt: daysAgoStr(2) },
        ],
      },
      {
        id: 'top-c-3',
        name: 'Carbonyl Condensation Reactions',
        status: 'completed',
        nextRevision: daysAheadStr(4),
        revisions: [
          { id: 'rev-c-4', rating: 'GOOD', intervalDays: 4, easeFactor: 2.5, reviewedAt: daysAgoStr(3) },
        ],
      },
      { id: 'top-c-4', name: 'Aromaticity & Hückel Rule', status: 'not-started' },
    ],
  },
  {
    id: 'sub-psyc310',
    name: 'Cognitive Neuroscience',
    code: 'PSYC 310',
    color: '#D97706',
    examDate: daysAheadStr(5),
    topics: [
      {
        id: 'top-p-1',
        name: 'Long-Term Potentiation & Synaptic Plasticity',
        status: 'completed',
        nextRevision: todayStr,
        revisions: [
          { id: 'rev-p-1', rating: 'EASY', intervalDays: 8, easeFactor: 2.7, reviewedAt: daysAgoStr(1) },
        ],
      },
      {
        id: 'top-p-2',
        name: 'Hippocampal Memory Encoding',
        status: 'completed',
        nextRevision: daysAheadStr(3),
        revisions: [
          { id: 'rev-p-2', rating: 'GOOD', intervalDays: 5, easeFactor: 2.5, reviewedAt: daysAgoStr(5) },
        ],
      },
    ],
  },
  {
    id: 'sub-math215',
    name: 'Linear Algebra',
    code: 'MATH 215',
    color: '#2563EB',
    examDate: daysAheadStr(12),
    topics: [
      {
        id: 'top-m-1',
        name: 'Eigenvalues & Eigenspaces',
        status: 'completed',
        nextRevision: daysAheadStr(7),
        revisions: [
          { id: 'rev-m-1', rating: 'GOOD', intervalDays: 6, easeFactor: 2.5, reviewedAt: daysAgoStr(2) },
          { id: 'rev-m-2', rating: 'AGAIN', intervalDays: 1, easeFactor: 1.7, reviewedAt: daysAgoStr(1) },
        ],
      },
      { id: 'top-m-2', name: 'Orthogonal Projections & Gram-Schmidt', status: 'in-progress' },
    ],
  },
]

// Real sessions for testing
const mockSessions = [
  // Today: 2 completed sessions (90m and 60m)
  {
    id: 'sess-today-1',
    subjectId: 'sub-chem204',
    date: todayStr,
    startTime: `${todayStr}T09:00:00Z`,
    endTime: `${todayStr}T10:30:00Z`,
    duration: 90,
    actualDurationSeconds: 5400, // 90m
    status: 'completed',
    type: 'focus',
  },
  {
    id: 'sess-today-2',
    subjectId: 'sub-psyc310',
    date: todayStr,
    startTime: `${todayStr}T14:00:00Z`,
    endTime: `${todayStr}T15:10:00Z`,
    duration: 60,
    actualDurationSeconds: 4200, // 70m (overtime)
    status: 'completed',
    type: 'focus',
  },
  // Yesterday: 120m
  {
    id: 'sess-yest-1',
    subjectId: 'sub-math215',
    date: daysAgoStr(1),
    startTime: `${daysAgoStr(1)}T10:00:00Z`,
    endTime: `${daysAgoStr(1)}T12:00:00Z`,
    duration: 120,
    actualDurationSeconds: 7200, // 120m
    status: 'completed',
    type: 'focus',
  },
  // Day -2: 150m
  {
    id: 'sess-d2-1',
    subjectId: 'sub-chem204',
    date: daysAgoStr(2),
    duration: 90,
    actualDurationSeconds: 5400, // 90m
    status: 'completed',
    type: 'focus',
  },
  {
    id: 'sess-d2-2',
    subjectId: 'sub-psyc310',
    date: daysAgoStr(2),
    duration: 60,
    actualDurationSeconds: 3600, // 60m
    status: 'completed',
    type: 'focus',
  },
  // Day -3: cancelled block
  {
    id: 'sess-d3-cancelled',
    subjectId: 'sub-math215',
    date: daysAgoStr(3),
    duration: 60,
    status: 'cancelled',
    type: 'focus',
  },
  // Day -4: 180m
  {
    id: 'sess-d4-1',
    subjectId: 'sub-chem204',
    date: daysAgoStr(4),
    duration: 120,
    actualDurationSeconds: 7200, // 120m
    status: 'completed',
    type: 'focus',
  },
  {
    id: 'sess-d4-2',
    subjectId: 'sub-math215',
    date: daysAgoStr(4),
    duration: 60,
    actualDurationSeconds: 3600, // 60m
    status: 'completed',
    type: 'focus',
  },
  // Day -5: 90m
  {
    id: 'sess-d5-1',
    subjectId: 'sub-psyc310',
    date: daysAgoStr(5),
    duration: 90,
    actualDurationSeconds: 5400, // 90m
    status: 'completed',
    type: 'focus',
  },
  // Day -6: uncalibrated legacy session
  {
    id: 'sess-d6-uncalibrated',
    subjectId: 'sub-chem204',
    date: daysAgoStr(6),
    duration: 45,
    actualDurationSeconds: null,
    status: 'completed',
    type: 'focus',
  },
  // Prior period sessions (for comparison baseline)
  {
    id: 'sess-prior-1',
    subjectId: 'sub-chem204',
    date: daysAgoStr(9),
    duration: 120,
    actualDurationSeconds: 7200,
    status: 'completed',
    type: 'focus',
  },
  {
    id: 'sess-prior-2',
    subjectId: 'sub-math215',
    date: daysAgoStr(11),
    duration: 90,
    actualDurationSeconds: 5400,
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
    console.log('🚀 Starting Phase 3E Insights & Analytics Visual Audit with fully hydrated state...')

    // 1. Desktop Full Overview (1440x1024)
    console.log('Capturing Desktop Overview...')
    const desktopCtx = await browser.newContext({
      viewport: { width: 1440, height: 1024 },
    })
    await setupMocks(desktopCtx, 'light')
    const page = await desktopCtx.newPage()

    await page.goto('http://127.0.0.1:5173/app/progress', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    await captureScreenshot(page, '01_desktop_insights_overview_1440x1024.png')

    // 2. Desktop Month View
    console.log('Capturing Desktop Month View...')
    const monthButton = page.locator('button:has-text("Month")')
    if (await monthButton.isVisible()) {
      await monthButton.click()
      await page.waitForTimeout(600)
      await captureScreenshot(page, '02_desktop_insights_month_view.png')
    }

    // 3. Tablet Viewport (768x1024)
    console.log('Capturing Tablet Viewport...')
    const tabletCtx = await browser.newContext({
      viewport: { width: 768, height: 1024 },
    })
    await setupMocks(tabletCtx, 'light')
    const tabletPage = await tabletCtx.newPage()
    await tabletPage.goto('http://127.0.0.1:5173/app/progress', { waitUntil: 'networkidle' })
    await tabletPage.waitForTimeout(800)
    await captureScreenshot(tabletPage, '03_tablet_insights_768x1024.png')

    // 4. Mobile Viewport (390x844)
    console.log('Capturing Mobile Viewport...')
    const mobileCtx = await browser.newContext({
      viewport: { width: 390, height: 844 },
    })
    await setupMocks(mobileCtx, 'light')
    const mobilePage = await mobileCtx.newPage()
    await mobilePage.goto('http://127.0.0.1:5173/app/progress', { waitUntil: 'networkidle' })
    await mobilePage.waitForTimeout(800)
    await captureScreenshot(mobilePage, '04_mobile_insights_390x844.png')

    // 5. Dark Mode (1440x1024)
    console.log('Capturing Dark Mode...')
    const darkCtx = await browser.newContext({
      viewport: { width: 1440, height: 1024 },
    })
    await setupMocks(darkCtx, 'dark')
    const darkPage = await darkCtx.newPage()
    await darkPage.goto('http://127.0.0.1:5173/app/progress', { waitUntil: 'networkidle' })
    await darkPage.evaluate(() => {
      document.documentElement.classList.add('dark')
    })
    await darkPage.waitForTimeout(800)
    await captureScreenshot(darkPage, '05_dark_insights_1440x1024.png')

    console.log('✅ Phase 3E Visual Audit Complete. All 5 screenshots updated!')
  } catch (err) {
    console.error('❌ Error during visual audit:', err)
  } finally {
    await browser.close()
  }
}

runAudit()
