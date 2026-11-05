import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const ARTIFACT_DIR = 'C:/Users/bhowm/.gemini/antigravity/brain/22a52d2b-b3ae-47d3-9bb0-c999863dbb22/screenshots/phase3'
const LOCAL_OUT = './test-results/revision-audit'

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
const pastDateStr = formatDate(new Date(now.getTime() - 4 * 86400000))
const futureDateStr = formatDate(new Date(now.getTime() + 6 * 86400000))

const mockSubjects = [
  {
    id: 'sub-cs101',
    name: 'Computer Systems Architecture',
    code: 'CS 101',
    color: '#2563EB',
    examDate: new Date(now.getTime() + 14 * 86400000).toISOString(),
    topics: [
      {
        id: 'top-cs-1',
        name: 'Memory Hierarchy & Cache Coherence',
        status: 'in-progress',
        nextRevision: todayStr, // Due Today
        lastRevised: formatDate(new Date(now.getTime() - 7 * 86400000)),
        repetitions: 2,
        intervalDays: 7,
        easeFactor: 2.5,
        scheduleType: 'SPACED',
        revisions: [
          {
            id: 'rev-cs-1',
            rating: 'GOOD',
            reviewedAt: new Date(now.getTime() - 7 * 86400000).toISOString(),
            previousInterval: 3,
            intervalAfter: 7,
          },
        ],
      },
      {
        id: 'top-cs-2',
        name: 'Paging & TLB Hit Rate Drill',
        status: 'completed',
        nextRevision: todayStr, // Due Today (completed topic)
        lastRevised: formatDate(new Date(now.getTime() - 10 * 86400000)),
        repetitions: 3,
        intervalDays: 10,
        easeFactor: 2.6,
        scheduleType: 'SPACED',
        revisions: [
          {
            id: 'rev-cs-2',
            rating: 'EASY',
            reviewedAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
            previousInterval: 4,
            intervalAfter: 10,
          },
        ],
      },
      {
        id: 'top-cs-3',
        name: 'Superscalar Pipelines & Branch Prediction',
        status: 'not-started',
        nextRevision: null, // Unscheduled
        lastRevised: null,
        repetitions: 0,
        intervalDays: 0,
        easeFactor: 2.5,
        scheduleType: null,
        revisions: [],
      },
    ],
  },
  {
    id: 'sub-chem204',
    name: 'Organic Chemistry II',
    code: 'CHEM 204',
    color: '#059669',
    examDate: new Date(now.getTime() + 21 * 86400000).toISOString(),
    topics: [
      {
        id: 'top-chem-1',
        name: 'Electrophilic Addition to Alkenes',
        status: 'in-progress',
        nextRevision: pastDateStr, // Overdue
        lastRevised: formatDate(new Date(now.getTime() - 12 * 86400000)),
        repetitions: 1,
        intervalDays: 4,
        easeFactor: 2.4,
        scheduleType: 'MANUAL',
        revisions: [
          {
            id: 'rev-chem-1',
            rating: 'HARD',
            reviewedAt: new Date(now.getTime() - 12 * 86400000).toISOString(),
            previousInterval: 2,
            intervalAfter: 4,
          },
        ],
      },
      {
        id: 'top-chem-2',
        name: 'Aromaticity & Electrophilic Substitution',
        status: 'in-progress',
        nextRevision: futureDateStr, // Upcoming
        lastRevised: formatDate(new Date(now.getTime() - 2 * 86400000)),
        repetitions: 2,
        intervalDays: 8,
        easeFactor: 2.5,
        scheduleType: 'SPACED',
        revisions: [
          {
            id: 'rev-chem-2',
            rating: 'GOOD',
            reviewedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
            previousInterval: 3,
            intervalAfter: 8,
          },
        ],
      },
    ],
  },
  {
    id: 'sub-math201',
    name: 'Linear Algebra & Vector Calculus',
    code: 'MATH 201',
    color: '#D97706',
    examDate: new Date(now.getTime() + 28 * 86400000).toISOString(),
    topics: [
      {
        id: 'top-math-1',
        name: 'Eigenvalues & Diagonalization',
        status: 'completed',
        nextRevision: futureDateStr,
        lastRevised: formatDate(now), // Recently reviewed today
        repetitions: 4,
        intervalDays: 16,
        easeFactor: 2.7,
        scheduleType: 'SPACED',
        revisions: [
          {
            id: 'rev-math-1',
            rating: 'EASY',
            reviewedAt: now.toISOString(),
            previousInterval: 8,
            intervalAfter: 16,
          },
        ],
      },
    ],
  },
]

const mockSessions = [
  {
    id: 'ses-rev-1',
    title: 'CS 101: Memory Hierarchy & Cache Coherence',
    subjectId: 'sub-cs101',
    topicId: 'top-cs-1',
    date: todayStr,
    duration: 60,
    actualDurationSeconds: 3600,
    status: 'completed',
  },
]

async function verifyRevision() {
  console.log('🏛️ Starting FocusFlow Phase 3D Revision Center Playwright Visual Verification...')
  const browser = await chromium.launch({ headless: true })

  const setupMocks = async (context, theme = 'light') => {
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

  // 1. DESKTOP VIEWPORT AUDIT - DUAL PANE OVERVIEW (1440 × 1024)
  console.log('\n--- 1. Desktop Revision Overview (1440x1024) ---')
  const desktopCtx = await browser.newContext({
    viewport: { width: 1440, height: 1024 },
  })
  await setupMocks(desktopCtx, 'light')
  const desktopPage = await desktopCtx.newPage()

  await desktopPage.goto('http://127.0.0.1:5173/app/revision')
  await desktopPage.waitForLoadState('networkidle')
  await desktopPage.waitForTimeout(600)

  // Click on the first topic card to ensure it's loaded into the active recall deck
  const firstCard = desktopPage.locator('[data-testid^="topic-card-"]').first()
  if (await firstCard.isVisible()) {
    await firstCard.click()
    await desktopPage.waitForTimeout(400)
  }

  await captureScreenshot(desktopPage, '01_desktop_revision_overview_1440x1024.png')

  // 2. TOPIC REVIEW MODAL INTERACTION
  console.log('\n--- 2. Topic Review Dialog Interaction ---')
  const startRevBtn = desktopPage.locator('button:has-text("Start Revision")').first()
  if (await startRevBtn.isVisible()) {
    await startRevBtn.click()
    await desktopPage.waitForTimeout(500)
    await captureScreenshot(desktopPage, '02_desktop_revision_review_dialog.png')
    await desktopPage.keyboard.press('Escape')
    await desktopPage.waitForTimeout(300)
  }

  // 3. SCHEDULE REVISION MODAL INTERACTION
  console.log('\n--- 3. Schedule Revision Dialog Interaction ---')
  const scheduleBtn = desktopPage.locator('button:has-text("Schedule")').first()
  if (await scheduleBtn.isVisible()) {
    await scheduleBtn.click()
    await desktopPage.waitForTimeout(500)
    await captureScreenshot(desktopPage, '03_desktop_revision_schedule_dialog.png')
    await desktopPage.keyboard.press('Escape')
    await desktopPage.waitForTimeout(300)
  }

  // 4. REVISION HISTORY TAB AUDIT (1440 × 1024)
  console.log('\n--- 4. Revision History Ledger Audit (1440x1024) ---')
  const historyTab = desktopPage.locator('button[role="tab"]:has-text("History")')
  if (await historyTab.isVisible()) {
    await historyTab.click()
    await desktopPage.waitForTimeout(500)
    await captureScreenshot(desktopPage, '04_desktop_revision_history_1440x1024.png')
  }

  await desktopCtx.close()

  // 5. TABLET VIEWPORT AUDIT (768 × 1024)
  console.log('\n--- 5. Tablet Viewport Audit (768x1024) ---')
  const tabletCtx = await browser.newContext({
    viewport: { width: 768, height: 1024 },
  })
  await setupMocks(tabletCtx, 'light')
  const tabletPage = await tabletCtx.newPage()
  await tabletPage.goto('http://127.0.0.1:5173/app/revision')
  await tabletPage.waitForLoadState('networkidle')
  await tabletPage.waitForTimeout(600)
  await captureScreenshot(tabletPage, '05_tablet_revision_768x1024.png')
  await tabletCtx.close()

  // 6. MOBILE VIEWPORT AUDIT (390 × 844)
  console.log('\n--- 6. Mobile Viewport Audit (390x844) ---')
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
  })
  await setupMocks(mobileCtx, 'light')
  const mobilePage = await mobileCtx.newPage()
  await mobilePage.goto('http://127.0.0.1:5173/app/revision')
  await mobilePage.waitForLoadState('networkidle')
  await mobilePage.waitForTimeout(600)
  await captureScreenshot(mobilePage, '06_mobile_revision_390x844.png')
  await mobileCtx.close()

  // 7. DARK MODE DESKTOP VIEWPORT AUDIT (1440 × 1024)
  console.log('\n--- 7. Dark Mode Desktop Viewport Audit (1440x1024) ---')
  const darkCtx = await browser.newContext({
    viewport: { width: 1440, height: 1024 },
  })
  await setupMocks(darkCtx, 'dark')
  const darkPage = await darkCtx.newPage()
  await darkPage.addInitScript(() => {
    document.documentElement.classList.add('dark')
  })
  await darkPage.goto('http://127.0.0.1:5173/app/revision')
  await darkPage.waitForLoadState('networkidle')
  await darkPage.waitForTimeout(600)
  await captureScreenshot(darkPage, '07_dark_revision_1440x1024.png')
  await darkCtx.close()

  await browser.close()
  console.log('\n✨ Playwright Revision Center Visual Verification Complete!')
}

verifyRevision().catch((err) => {
  console.error('Audit failed:', err)
  process.exit(1)
})