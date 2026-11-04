import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const OUT_DIR = './test-results/shell-audit'
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true })
}

const mockUser = {
  id: 'usr-academic-1',
  name: 'Eleanor Vance',
  email: 'e.vance@oxford.ac.uk',
  studyGoal: 'Cognitive Science Dissertation',
  theme: 'light',
}

const mockSubjects = [
  {
    id: 'sub-psyc-310',
    name: 'Cognitive Neuroscience',
    code: 'PSYC 310',
    color: '#059669',
    topics: [
      { id: 'top-1', name: 'Hippocampal Spatial Mapping', status: 'mastered' },
      { id: 'top-2', name: 'Prefrontal Executive Control', status: 'in-progress' },
    ],
  },
  {
    id: 'sub-math-401',
    name: 'Differential Topology',
    code: 'MATH 401',
    color: '#2563EB',
    topics: [
      { id: 'top-3', name: 'Smooth Manifolds & Tangent Bundles', status: 'mastered' },
    ],
  },
]

async function verifyShell() {
  console.log('🏛️ Starting Stitch Academic Deep Work Shell Verification...')
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()

  // Setup API mocks on context level
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

  await context.route('**/api/session/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ sessions: [] }),
    })
  })

  // 1. Desktop Shell at Stitch Resolution (1440 × 1024)
  console.log('📸 1. Capturing Desktop Shell (1440 × 1024, Light Theme)...')
  const page = await context.newPage()
  await page.setViewportSize({ width: 1440, height: 1024 })
  await page.goto('http://localhost:5173/app/dashboard', { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)

  // Verify zero horizontal overflow
  const overflowCheck = await page.evaluate(() => {
    return document.documentElement.scrollWidth <= document.documentElement.clientWidth
  })
  console.log(`  Horizontal overflow safe: ${overflowCheck ? '✅ YES' : '❌ NO'}`)

  await page.screenshot({ path: path.join(OUT_DIR, '01_desktop_stitch_1440x1024.png') })

  // 2. Desktop Shell Dark Theme
  console.log('📸 2. Capturing Desktop Shell (Dark Theme)...')
  await page.evaluate(() => {
    document.documentElement.classList.add('dark')
  })
  await page.waitForTimeout(300)
  await page.screenshot({ path: path.join(OUT_DIR, '02_desktop_dark_1440x1024.png') })

  // Revert dark mode
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark')
  })

  // 3. Search Palette (⌘K)
  console.log('📸 3. Testing Search / Command Launcher...')
  await page.keyboard.press('Control+KeyK')
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(OUT_DIR, '03_search_launcher_open.png') })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)

  // 4. Tablet Adaptation (768 × 1024)
  console.log('📸 4. Capturing Tablet Layout (768 × 1024)...')
  const tabletPage = await context.newPage()
  await tabletPage.setViewportSize({ width: 768, height: 1024 })
  await tabletPage.goto('http://localhost:5173/app/dashboard', { waitUntil: 'networkidle' })
  await tabletPage.waitForTimeout(500)
  await tabletPage.screenshot({ path: path.join(OUT_DIR, '04_tablet_768x1024.png') })

  // 5. Mobile Web Layout & Drawer (390 × 844)
  console.log('📸 5. Capturing Mobile Layout & Navigation Drawer (390 × 844)...')
  const mobilePage = await context.newPage()
  await mobilePage.setViewportSize({ width: 390, height: 844 })
  await mobilePage.goto('http://localhost:5173/app/dashboard', { waitUntil: 'networkidle' })
  await mobilePage.waitForTimeout(500)
  await mobilePage.screenshot({ path: path.join(OUT_DIR, '05_mobile_compact_390x844.png') })

  // Open mobile drawer
  const menuBtn = mobilePage.locator('button[aria-label="Open menu"]')
  if (await menuBtn.isVisible()) {
    await menuBtn.click()
    await mobilePage.waitForTimeout(400)
    await mobilePage.screenshot({ path: path.join(OUT_DIR, '06_mobile_drawer_open.png') })
  }

  await browser.close()
  console.log('🎉 Shell Verification Complete! Screenshots saved to:', OUT_DIR)
}

verifyShell().catch((err) => {
  console.error('❌ Verification failed:', err)
  process.exit(1)
})
