import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const ARTIFACT_DIR = 'C:/Users/bhowm/.gemini/antigravity/brain/22a52d2b-b3ae-47d3-9bb0-c999863dbb22/screenshots/phase3'
const LOCAL_OUT = './test-results/dashboard-audit'

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

const todayDate = new Date()
const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`

const mockSubjects = [
  {
    id: 'sub-chem204',
    name: 'Organic Chemistry II',
    code: 'CHEM 204',
    color: '#059669',
    examDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    topics: [
      { id: 'top-1', name: 'Electrophilic Addition & Stereochemistry', status: 'completed' },
      { id: 'top-2', name: 'Resonance Stability & Aromaticity', status: 'learning' },
      { id: 'top-3', name: 'Carbonyl Condensations', status: 'not-started', nextRevision: todayStr },
      { id: 'top-4', name: 'Carbocation Rearrangements', status: 'not-started' },
    ],
  },
  {
    id: 'sub-psyc310',
    name: 'Cognitive Neuroscience',
    code: 'PSYC 310',
    color: '#2563EB',
    examDate: new Date(Date.now() + 12 * 86400000).toISOString(),
    topics: [
      { id: 'top-5', name: 'Synaptic Plasticity & Long-Term Potentiation', status: 'completed' },
      { id: 'top-6', name: 'Hippocampal Memory Consolidation', status: 'completed' },
      { id: 'top-7', name: 'Prefrontal Executive Control', status: 'learning' },
    ],
  },
  {
    id: 'sub-math215',
    name: 'Linear Algebra',
    code: 'MATH 215',
    color: '#D97706',
    examDate: new Date(Date.now() + 24 * 86400000).toISOString(),
    topics: [
      { id: 'top-8', name: 'Eigenvalues & Orthogonal Diagonalization', status: 'completed' },
      { id: 'top-9', name: 'Gram-Schmidt Orthonormalization', status: 'learning' },
      { id: 'top-10', name: 'Spectral Theorem Applications', status: 'not-started' },
    ],
  },
]

const mockSessions = [
  {
    id: 'sess-today-1',
    title: 'Reaction Mechanisms: Electrophilic Addition Drill',
    date: todayStr,
    startTime: '09:00',
    endTime: '09:45',
    duration: 45,
    status: 'completed',
    subjectId: 'sub-chem204',
    actualDurationSeconds: 2700,
  },
  {
    id: 'sess-today-2',
    title: 'Synaptic Plasticity & LTP Pathways Review',
    date: todayStr,
    startTime: '10:30',
    endTime: '11:15',
    duration: 45,
    status: 'completed',
    subjectId: 'sub-psyc310',
    actualDurationSeconds: 2640,
  },
  {
    id: 'sess-today-3',
    title: 'Eigenvalues & Orthogonal Projections Problem Set',
    date: todayStr,
    startTime: '14:00',
    endTime: '15:00',
    duration: 60,
    status: 'upcoming',
    subjectId: 'sub-math215',
    actualDurationSeconds: null,
  },
  {
    id: 'sess-today-4',
    title: 'Carbonyl Condensation Flashcard Drill',
    date: todayStr,
    startTime: '16:30',
    endTime: '17:15',
    duration: 45,
    status: 'upcoming',
    subjectId: 'sub-chem204',
    actualDurationSeconds: null,
  },
]

async function verifyDashboard() {
  console.log('🏛️ Starting FocusFlow Phase 3A Dashboard Playwright Audit...')
  const browser = await chromium.launch({ headless: true })

  const setupMocks = async (context) => {
    await context.route('**/api/auth/me', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: mockUser }),
      })
    })

    await context.route('**/api/subject/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ subjects: mockSubjects }),
      })
    })

    await context.route('**/api/session/active-focus', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ session: null }),
      })
    })

    await context.route('**/api/session/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ sessions: mockSessions }),
      })
    })
  }

  // 1. DESKTOP AUDIT (1440 × 1024)
  console.log('\n--- 1. Desktop Dashboard (1440x1024) ---')
  const desktopCtx = await browser.newContext({
    viewport: { width: 1440, height: 1024 },
  })
  await setupMocks(desktopCtx)
  const desktopPage = await desktopCtx.newPage()

  await desktopPage.goto('http://localhost:5173/app/dashboard')
  await desktopPage.waitForLoadState('networkidle')
  await desktopPage.waitForTimeout(500)
  await captureScreenshot(desktopPage, '01_desktop_dashboard_1440x1024.png')

  // 2. Open Add Session Dialog Interaction
  console.log('\n--- 2. Add Session Modal Interaction ---')
  const addBtn = desktopPage.locator('button:has-text("Add Session")').first()
  if (await addBtn.isVisible()) {
    await addBtn.click()
    await desktopPage.waitForTimeout(400)
    await captureScreenshot(desktopPage, '02_desktop_dashboard_add_dialog.png')
    // Close dialog
    await desktopPage.keyboard.press('Escape')
    await desktopPage.waitForTimeout(300)
  }

  // 3. TABLET VIEWPORT (768 × 1024)
  console.log('\n--- 3. Tablet Viewport (768x1024) ---')
  const tabletCtx = await browser.newContext({
    viewport: { width: 768, height: 1024 },
  })
  await setupMocks(tabletCtx)
  const tabletPage = await tabletCtx.newPage()
  await tabletPage.goto('http://localhost:5173/app/dashboard')
  await tabletPage.waitForLoadState('networkidle')
  await tabletPage.waitForTimeout(500)
  await captureScreenshot(tabletPage, '03_tablet_dashboard_768x1024.png')

  // 4. MOBILE VIEWPORT (390 × 844)
  console.log('\n--- 4. Mobile Viewport (390x844) ---')
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
  })
  await setupMocks(mobileCtx)
  const mobilePage = await mobileCtx.newPage()
  await mobilePage.goto('http://localhost:5173/app/dashboard')
  await mobilePage.waitForLoadState('networkidle')
  await mobilePage.waitForTimeout(500)
  await captureScreenshot(mobilePage, '04_mobile_dashboard_390x844.png')

  // 5. DARK THEME AUDIT (1440 × 1024)
  console.log('\n--- 5. Dark Theme Dashboard ---')
  const darkCtx = await browser.newContext({
    viewport: { width: 1440, height: 1024 },
  })
  await setupMocks(darkCtx)
  const darkPage = await darkCtx.newPage()
  await darkPage.goto('http://localhost:5173/app/dashboard')
  await darkPage.waitForLoadState('networkidle')
  await darkPage.evaluate(() => {
    document.documentElement.classList.add('dark')
    localStorage.setItem('focusflow_theme', 'dark')
  })
  await darkPage.waitForTimeout(500)
  await captureScreenshot(darkPage, '05_dark_dashboard_1440x1024.png')

  await browser.close()
  console.log('✅ Phase 3A Dashboard Playwright Audit Complete!')
}

verifyDashboard().catch((err) => {
  console.error('❌ Playwright audit failed:', err)
  process.exit(1)
})
