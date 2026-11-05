import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const ARTIFACT_DIR = 'C:/Users/bhowm/.gemini/antigravity/brain/22a52d2b-b3ae-47d3-9bb0-c999863dbb22/screenshots/phase3'
const LOCAL_OUT = './test-results/subject-detail-audit'

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
      lastRevised: new Date(Date.now() - 2 * 86400000).toISOString(),
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
      lastRevised: new Date(Date.now() - 1 * 86400000).toISOString(),
      nextRevision: todayStr, // Due today!
      scheduleType: 'automatic',
    },
    {
      id: 'top-3',
      name: 'Carbonyl Condensation & Enolate Chemistry',
      status: 'in-progress',
      repetitions: 2,
      intervalDays: 3,
      easeFactor: 2.5,
      lastRevised: new Date(Date.now() - 4 * 86400000).toISOString(),
      nextRevision: new Date(Date.now() - 86400000).toISOString(), // Overdue!
      scheduleType: 'automatic',
    },
    {
      id: 'top-4',
      name: 'Carboxylic Acid Derivatives & Nucleophilic Acyl Substitution',
      status: 'not-started',
      repetitions: 0,
      intervalDays: 1,
      easeFactor: 2.5,
      lastRevised: null,
      nextRevision: null,
      scheduleType: 'automatic',
    },
    {
      id: 'top-5',
      name: 'NMR Spectroscopy & Molecular Structure Elucidation',
      status: 'completed',
      repetitions: 4,
      intervalDays: 14,
      easeFactor: 2.6,
      lastRevised: new Date(Date.now() - 3 * 86400000).toISOString(),
      nextRevision: new Date(Date.now() + 11 * 86400000).toISOString(),
      scheduleType: 'automatic',
    },
  ],
}

const mockSessions = [
  {
    id: 'ses-1',
    title: 'Reaction Mechanisms Practice Block',
    subjectId: 'sub-chem204',
    date: todayStr,
    startTime: '14:00',
    endTime: '15:30',
    durationMinutes: 90,
    status: 'scheduled',
  },
  {
    id: 'ses-2',
    title: 'Synthesis Problem Set Review',
    subjectId: 'sub-chem204',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:30',
    durationMinutes: 90,
    status: 'scheduled',
  },
]

async function verifySubjectDetail() {
  console.log('🏛️ Starting FocusFlow Phase 3B.2 Subject Detail Playwright Audit...')
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

    await context.route('**/api/subject**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ subjects: [mockCourse] }),
      })
    })

    await context.route('**/api/sessions**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ sessions: mockSessions }),
      })
    })
  }

  // 1. DESKTOP VIEWPORT AUDIT (1440 × 1024)
  console.log('\n--- 1. Desktop Subject Detail (1440x1024) ---')
  const desktopCtx = await browser.newContext({
    viewport: { width: 1440, height: 1024 },
  })
  await setupMocks(desktopCtx, 'light')
  const desktopPage = await desktopCtx.newPage()

  await desktopPage.goto('http://localhost:5173/app/subjects/sub-chem204')
  await desktopPage.waitForLoadState('networkidle')
  await desktopPage.waitForTimeout(600)
  await captureScreenshot(desktopPage, '01_desktop_subject_detail_1440x1024.png')

  // 2. Add Topic Dialog Interaction
  console.log('\n--- 2. Add Topic Modal Interaction ---')
  const addBtn = desktopPage.locator('button:has-text("Add Topic")').first()
  if (await addBtn.isVisible()) {
    await addBtn.click()
    await desktopPage.waitForTimeout(400)
    await captureScreenshot(desktopPage, '02_desktop_add_topic_dialog.png')
    // Close dialog
    await desktopPage.keyboard.press('Escape')
    await desktopPage.waitForTimeout(300)
  }

  // 3. Modify Topic Dialog Interaction
  console.log('\n--- 3. Modify Topic Modal Interaction ---')
  const modifyBtn = desktopPage.locator('button[aria-label*="Modify topic"]').first()
  if (await modifyBtn.isVisible()) {
    await modifyBtn.click()
    await desktopPage.waitForTimeout(400)
    await captureScreenshot(desktopPage, '03_desktop_modify_topic_dialog.png')
    // Close dialog
    await desktopPage.keyboard.press('Escape')
    await desktopPage.waitForTimeout(300)
  }

  // 4. Delete Topic Dialog Interaction
  console.log('\n--- 4. Delete Topic Confirmation Modal Interaction ---')
  const deleteBtn = desktopPage.locator('button[aria-label*="Delete topic"]').first()
  if (await deleteBtn.isVisible()) {
    await deleteBtn.click()
    await desktopPage.waitForTimeout(400)
    await captureScreenshot(desktopPage, '04_desktop_delete_topic_dialog.png')
    // Close dialog
    await desktopPage.keyboard.press('Escape')
    await desktopPage.waitForTimeout(300)
  }

  // 4b. Topic Details Drawer Interaction
  console.log('\n--- 4b. Topic Details Drawer Interaction ---')
  const firstTopicRow = desktopPage.locator('text=Electrophilic Addition to Alkenes & Stereochemistry').first()
  if (await firstTopicRow.isVisible()) {
    await firstTopicRow.click()
    await desktopPage.waitForTimeout(500)
    await captureScreenshot(desktopPage, '08_desktop_topic_details_drawer.png')
    // Close drawer
    await desktopPage.keyboard.press('Escape')
    await desktopPage.waitForTimeout(300)
  }

  // 5. TABLET VIEWPORT (768 × 1024)
  console.log('\n--- 5. Tablet Viewport (768x1024) ---')
  const tabletCtx = await browser.newContext({
    viewport: { width: 768, height: 1024 },
  })
  await setupMocks(tabletCtx, 'light')
  const tabletPage = await tabletCtx.newPage()
  await tabletPage.goto('http://localhost:5173/app/subjects/sub-chem204')
  await tabletPage.waitForLoadState('networkidle')
  await tabletPage.waitForTimeout(600)
  await captureScreenshot(tabletPage, '05_tablet_subject_detail_768x1024.png')

  // 6. MOBILE VIEWPORT (390 × 844)
  console.log('\n--- 6. Mobile Viewport (390x844) ---')
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
  })
  await setupMocks(mobileCtx, 'light')
  const mobilePage = await mobileCtx.newPage()
  await mobilePage.goto('http://localhost:5173/app/subjects/sub-chem204')
  await mobilePage.waitForLoadState('networkidle')
  await mobilePage.waitForTimeout(600)
  await captureScreenshot(mobilePage, '06_mobile_subject_detail_390x844.png')

  // 7. DARK THEME AUDIT (1440 × 1024)
  console.log('\n--- 7. Dark Theme Subject Detail (1440x1024) ---')
  const darkCtx = await browser.newContext({
    viewport: { width: 1440, height: 1024 },
  })
  await setupMocks(darkCtx, 'dark')
  const darkPage = await darkCtx.newPage()
  await darkPage.addInitScript(() => {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  })
  await darkPage.goto('http://localhost:5173/app/subjects/sub-chem204')
  await darkPage.waitForLoadState('networkidle')
  await darkPage.waitForTimeout(600)
  await captureScreenshot(darkPage, '07_dark_subject_detail_1440x1024.png')

  await browser.close()
  console.log('\n✨ All Subject Detail Playwright verification screenshots captured successfully!')
}

verifySubjectDetail().catch((err) => {
  console.error('❌ Playwright verification failed:', err)
  process.exit(1)
})
