import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const ARTIFACT_DIR = 'C:/Users/bhowm/.gemini/antigravity/brain/22a52d2b-b3ae-47d3-9bb0-c999863dbb22/screenshots/phase3'
const LOCAL_OUT = './test-results/planner-audit'

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
const tomorrow = new Date(now.getTime() + 86400000)
const tomorrowStr = formatDate(tomorrow)
const inTwoDays = new Date(now.getTime() + 2 * 86400000)
const inTwoDaysStr = formatDate(inTwoDays)

const mockSubjects = [
  {
    id: 'sub-cs101',
    name: 'Computer Systems Architecture',
    code: 'CS 101',
    color: '#2563EB',
    examDate: new Date(now.getTime() + 5 * 86400000).toISOString(),
    topics: [
      { id: 'top-cs-1', name: 'Memory Hierarchy & Cache Coherence', status: 'completed' },
      { id: 'top-cs-2', name: 'Paging & TLB Hit Rate Drill', status: 'in-progress' },
      { id: 'top-cs-3', name: 'Superscalar Pipelines & Branch Prediction', status: 'not-started' },
    ],
  },
  {
    id: 'sub-chem204',
    name: 'Organic Chemistry II',
    code: 'CHEM 204',
    color: '#059669',
    examDate: new Date(now.getTime() + 12 * 86400000).toISOString(),
    topics: [
      { id: 'top-chem-1', name: 'Electrophilic Addition to Alkenes', status: 'completed' },
      { id: 'top-chem-2', name: 'Aromaticity & Electrophilic Substitution', status: 'in-progress' },
    ],
  },
  {
    id: 'sub-math201',
    name: 'Linear Algebra & Vector Calculus',
    code: 'MATH 201',
    color: '#D97706',
    examDate: new Date(now.getTime() + 24 * 86400000).toISOString(),
    topics: [
      { id: 'top-math-1', name: 'Eigenvalues & Diagonalization', status: 'completed' },
      { id: 'top-math-2', name: 'Gram-Schmidt & Orthogonality', status: 'not-started' },
    ],
  },
]

const mockSessions = [
  {
    id: 'ses-1',
    title: 'Cache Coherence & Bus Protocols',
    subjectId: 'sub-cs101',
    topicId: 'top-cs-1',
    date: todayStr,
    startTime: '09:00',
    endTime: '10:30',
    duration: 90,
    status: 'upcoming',
  },
  {
    id: 'ses-2',
    title: 'Stereochemistry Problem Set',
    subjectId: 'sub-chem204',
    topicId: 'top-chem-1',
    date: todayStr,
    startTime: '10:00',
    endTime: '11:30',
    duration: 90,
    status: 'upcoming',
  },
  {
    id: 'ses-3',
    title: 'Eigenvalues & Spectral Theorem',
    subjectId: 'sub-math201',
    topicId: 'top-math-1',
    date: todayStr,
    startTime: '14:00',
    endTime: '15:30',
    duration: 90,
    actualDurationSeconds: 5100, // 85m measured
    status: 'completed',
  },
  {
    id: 'ses-4',
    title: 'Reaction Mechanisms & Synthesis',
    subjectId: 'sub-chem204',
    topicId: 'top-chem-2',
    date: tomorrowStr,
    startTime: '11:00',
    endTime: '12:30',
    duration: 90,
    status: 'in-progress',
  },
  {
    id: 'ses-5',
    title: 'Virtual Memory & TLB Drill',
    subjectId: 'sub-cs101',
    topicId: 'top-cs-2',
    date: inTwoDaysStr,
    startTime: '15:00',
    endTime: '16:30',
    duration: 90,
    status: 'upcoming',
  },
]

async function verifyPlanner() {
  console.log('🏛️ Starting FocusFlow Phase 3C Planner Playwright Visual Verification...')
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

  // 1. DESKTOP VIEWPORT AUDIT - WEEK VIEW (1440 × 1024)
  console.log('\n--- 1. Desktop Planner Week View (1440x1024) ---')
  const desktopCtx = await browser.newContext({
    viewport: { width: 1440, height: 1024 },
  })
  await setupMocks(desktopCtx, 'light')
  const desktopPage = await desktopCtx.newPage()

  await desktopPage.goto(`http://localhost:5173/app/planner?date=${todayStr}`)
  await desktopPage.waitForLoadState('networkidle')
  await desktopPage.waitForTimeout(600)
  await captureScreenshot(desktopPage, '01_desktop_planner_week_1440x1024.png')

  // 2. DESKTOP VIEWPORT AUDIT - DAY VIEW (1440 × 1024)
  console.log('\n--- 2. Desktop Planner Day View (1440x1024) ---')
  const dayBtn = desktopPage.locator('button:has-text("Day")').first()
  await dayBtn.click()
  await desktopPage.waitForTimeout(500)
  await captureScreenshot(desktopPage, '02_desktop_planner_day_1440x1024.png')

  // 3. DESKTOP VIEWPORT AUDIT - MONTH VIEW (1440 × 1024)
  console.log('\n--- 3. Desktop Planner Month View (1440x1024) ---')
  const monthBtn = desktopPage.locator('button:has-text("Month")').first()
  await monthBtn.click()
  await desktopPage.waitForTimeout(500)
  await captureScreenshot(desktopPage, '03_desktop_planner_month_1440x1024.png')

  // Switch back to Week view for dialog interactions
  const weekBtn = desktopPage.locator('button:has-text("Week")').first()
  await weekBtn.click()
  await desktopPage.waitForTimeout(400)

  // 4. Create Session Dialog Interaction
  console.log('\n--- 4. Create Session Modal Interaction ---')
  const createBtn = desktopPage.locator('button:has-text("Create Study Session")').first()
  if (await createBtn.isVisible()) {
    await createBtn.click()
    await desktopPage.waitForTimeout(400)
    await captureScreenshot(desktopPage, '04_desktop_create_session_dialog.png')
    await desktopPage.keyboard.press('Escape')
    await desktopPage.waitForTimeout(300)
  }

  // 5. Cancel Session Confirmation Dialog Interaction
  console.log('\n--- 5. Cancel Session Confirmation Modal Interaction ---')
  // Go to Day view to click Cancel on an upcoming session
  await dayBtn.click()
  await desktopPage.waitForTimeout(400)
  const cancelBtn = desktopPage.locator('button:has-text("Cancel")').first()
  if (await cancelBtn.isVisible()) {
    await cancelBtn.click()
    await desktopPage.waitForTimeout(400)
    await captureScreenshot(desktopPage, '05_desktop_cancel_session_dialog.png')
    // Dismiss cancel dialog
    const keepBtn = desktopPage.locator('button:has-text("Keep Session")').first()
    if (await keepBtn.isVisible()) {
      await keepBtn.click()
    } else {
      await desktopPage.keyboard.press('Escape')
    }
    await desktopPage.waitForTimeout(300)
  }

  await desktopCtx.close()

  // 6. TABLET VIEWPORT AUDIT (768 × 1024)
  console.log('\n--- 6. Tablet Viewport Audit (768x1024) ---')
  const tabletCtx = await browser.newContext({
    viewport: { width: 768, height: 1024 },
  })
  await setupMocks(tabletCtx, 'light')
  const tabletPage = await tabletCtx.newPage()
  await tabletPage.goto(`http://localhost:5173/app/planner?date=${todayStr}`)
  await tabletPage.waitForLoadState('networkidle')
  await tabletPage.waitForTimeout(600)
  await captureScreenshot(tabletPage, '06_tablet_planner_768x1024.png')
  await tabletCtx.close()

  // 7. MOBILE VIEWPORT AUDIT (390 × 844)
  console.log('\n--- 7. Mobile Viewport Audit (390x844) ---')
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
  })
  await setupMocks(mobileCtx, 'light')
  const mobilePage = await mobileCtx.newPage()
  await mobilePage.goto(`http://localhost:5173/app/planner?date=${todayStr}`)
  await mobilePage.waitForLoadState('networkidle')
  await mobilePage.waitForTimeout(600)
  await captureScreenshot(mobilePage, '07_mobile_planner_390x844.png')
  await mobileCtx.close()

  // 8. DARK MODE DESKTOP VIEWPORT AUDIT (1440 × 1024)
  console.log('\n--- 8. Dark Mode Desktop Viewport Audit (1440x1024) ---')
  const darkCtx = await browser.newContext({
    viewport: { width: 1440, height: 1024 },
  })
  await setupMocks(darkCtx, 'dark')
  const darkPage = await darkCtx.newPage()
  // Add dark class to html
  await darkPage.addInitScript(() => {
    document.documentElement.classList.add('dark')
  })
  await darkPage.goto(`http://localhost:5173/app/planner?date=${todayStr}`)
  await darkPage.waitForLoadState('networkidle')
  await darkPage.waitForTimeout(600)
  await captureScreenshot(darkPage, '08_dark_planner_1440x1024.png')
  await darkCtx.close()

  await browser.close()
  console.log('\n✨ Playwright Planner Visual Verification Complete!')
}

verifyPlanner().catch((err) => {
  console.error('Audit failed:', err)
  process.exit(1)
})
