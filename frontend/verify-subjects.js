import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const ARTIFACT_DIR = 'C:/Users/bhowm/.gemini/antigravity/brain/22a52d2b-b3ae-47d3-9bb0-c999863dbb22/screenshots/phase3'
const LOCAL_OUT = './test-results/subjects-audit'

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
  {
    id: 'sub-cs350',
    name: 'Distributed Systems & Cloud Computing',
    code: 'CS 350',
    color: '#6366F1',
    examDate: null,
    topics: [],
  },
]

async function verifySubjects() {
  console.log('🏛️ Starting FocusFlow Phase 3B.1 My Subjects Playwright Audit...')
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
  }

  // 1. DESKTOP AUDIT (1440 × 1024)
  console.log('\n--- 1. Desktop Subjects (1440x1024) ---')
  const desktopCtx = await browser.newContext({
    viewport: { width: 1440, height: 1024 },
  })
  await setupMocks(desktopCtx)
  const desktopPage = await desktopCtx.newPage()

  await desktopPage.goto('http://localhost:5173/app/subjects')
  await desktopPage.waitForLoadState('networkidle')
  await desktopPage.waitForTimeout(600)
  await captureScreenshot(desktopPage, '01_desktop_subjects_1440x1024.png')

  // 2. Open Add Subject Dialog Interaction
  console.log('\n--- 2. Add Subject Modal Interaction ---')
  const addBtn = desktopPage.locator('button:has-text("Add Subject")').first()
  if (await addBtn.isVisible()) {
    await addBtn.click()
    await desktopPage.waitForTimeout(400)
    await captureScreenshot(desktopPage, '02_desktop_subjects_add_dialog.png')
    // Close dialog
    await desktopPage.keyboard.press('Escape')
    await desktopPage.waitForTimeout(300)
  }

  // 3. Open Edit Subject Dialog Interaction
  console.log('\n--- 3. Edit Subject Modal Interaction ---')
  const editBtn = desktopPage.locator('button[aria-label*="Edit Organic Chemistry"]').first()
  if (await editBtn.isVisible()) {
    await editBtn.click()
    await desktopPage.waitForTimeout(400)
    await captureScreenshot(desktopPage, '03_desktop_subjects_edit_dialog.png')
    // Close dialog
    await desktopPage.keyboard.press('Escape')
    await desktopPage.waitForTimeout(300)
  }

  // 4. Open Delete Subject Dialog Interaction
  console.log('\n--- 4. Delete Subject Confirmation Modal Interaction ---')
  const deleteBtn = desktopPage.locator('button[aria-label*="Delete Organic Chemistry"]').first()
  if (await deleteBtn.isVisible()) {
    await deleteBtn.click()
    await desktopPage.waitForTimeout(400)
    await captureScreenshot(desktopPage, '04_desktop_subjects_delete_dialog.png')
    // Close dialog
    await desktopPage.keyboard.press('Escape')
    await desktopPage.waitForTimeout(300)
  }

  // 5. TABLET VIEWPORT (768 × 1024)
  console.log('\n--- 5. Tablet Viewport (768x1024) ---')
  const tabletCtx = await browser.newContext({
    viewport: { width: 768, height: 1024 },
  })
  await setupMocks(tabletCtx)
  const tabletPage = await tabletCtx.newPage()
  await tabletPage.goto('http://localhost:5173/app/subjects')
  await tabletPage.waitForLoadState('networkidle')
  await tabletPage.waitForTimeout(600)
  await captureScreenshot(tabletPage, '05_tablet_subjects_768x1024.png')

  // 6. MOBILE VIEWPORT (390 × 844)
  console.log('\n--- 6. Mobile Viewport (390x844) ---')
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
  })
  await setupMocks(mobileCtx)
  const mobilePage = await mobileCtx.newPage()
  await mobilePage.goto('http://localhost:5173/app/subjects')
  await mobilePage.waitForLoadState('networkidle')
  await mobilePage.waitForTimeout(600)
  await captureScreenshot(mobilePage, '06_mobile_subjects_390x844.png')

  // 7. DARK THEME AUDIT (1440 × 1024)
  console.log('\n--- 7. Dark Theme Subjects (1440x1024) ---')
  const darkCtx = await browser.newContext({
    viewport: { width: 1440, height: 1024 },
  })
  await setupMocks(darkCtx)
  const darkPage = await darkCtx.newPage()
  await darkPage.goto('http://localhost:5173/app/subjects')
  await darkPage.waitForLoadState('networkidle')
  await darkPage.evaluate(() => {
    document.documentElement.classList.add('dark')
    localStorage.setItem('focusflow_theme', 'dark')
  })
  await darkPage.waitForTimeout(600)
  await captureScreenshot(darkPage, '07_dark_subjects_1440x1024.png')

  await browser.close()
  console.log('✅ Phase 3B.1 My Subjects Playwright Audit Complete!')
}

verifySubjects().catch((err) => {
  console.error('❌ Playwright audit failed:', err)
  process.exit(1)
})
