import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const ARTIFACT_DIR = 'C:/Users/bhowm/.gemini/antigravity/brain/61ce16d0-9da9-43cc-a19e-5b2161cb299b/screenshots/landing'
const LOCAL_OUT = './test-results/landing-verification'

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

async function run() {
  console.log('🚀 Starting FocusFlow Landing Page Verification...')

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  })

  // 1. Desktop Light Mode (1440x900)
  console.log('\n☀️ Testing Desktop Light Mode (1440x900)...')
  const desktopLightContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const desktopLightPage = await desktopLightContext.newPage()

  await desktopLightPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await desktopLightPage.waitForTimeout(1000)

  // Ensure Light Mode
  const isDarkLightPage = await desktopLightPage.evaluate(() => document.documentElement.classList.contains('dark'))
  if (isDarkLightPage) {
    await desktopLightPage.click('button[aria-label="Switch to light mode"], button[title="Switch to light mode"]')
    await desktopLightPage.waitForTimeout(500)
  }

  // Capture Hero section
  await captureScreenshot(desktopLightPage, 'landing_01_hero_light.png')

  // Capture full page
  await captureScreenshot(desktopLightPage, 'landing_02_full_page_light.png', { fullPage: true })

  // Test FAQ Accordion interaction
  console.log('Testing FAQ accordion toggle...')
  const faqButtons = await desktopLightPage.$$('button[aria-controls^="faq-answer-"]')
  if (faqButtons.length > 1) {
    await faqButtons[1].click()
    await desktopLightPage.waitForTimeout(400)
  }

  // Test Product Showcase tab interaction
  console.log('Testing Product Showcase tabs...')
  const plannerTab = await desktopLightPage.$('text="Study Planner"')
  if (plannerTab) {
    await plannerTab.click()
    await desktopLightPage.waitForTimeout(400)
  }

  await captureScreenshot(desktopLightPage, 'landing_03_showcase_planner_light.png')

  // 2. Desktop Dark Mode (1440x900)
  console.log('\n🌙 Testing Desktop Dark Mode (1440x900)...')
  const desktopDarkContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const desktopDarkPage = await desktopDarkContext.newPage()

  await desktopDarkPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await desktopDarkPage.waitForTimeout(1000)

  // Switch to Dark Mode
  const isDarkDarkPage = await desktopDarkPage.evaluate(() => document.documentElement.classList.contains('dark'))
  if (!isDarkDarkPage) {
    await desktopDarkPage.click('button[aria-label="Switch to dark mode"], button[title="Switch to dark mode"]')
    await desktopDarkPage.waitForTimeout(500)
  }

  // Capture Hero Dark
  await captureScreenshot(desktopDarkPage, 'landing_04_hero_dark.png')

  // Capture full page Dark
  await captureScreenshot(desktopDarkPage, 'landing_05_full_page_dark.png', { fullPage: true })

  // 3. Tablet Viewport (768x1024)
  console.log('\n📱 Testing Tablet Viewport (768x1024)...')
  const tabletContext = await browser.newContext({
    viewport: { width: 768, height: 1024 },
  })
  const tabletPage = await tabletContext.newPage()
  await tabletPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await tabletPage.waitForTimeout(1000)
  await captureScreenshot(tabletPage, 'landing_06_tablet_light.png')

  // 4. Mobile Viewport (375x812)
  console.log('\n📱 Testing Mobile Viewport (375x812)...')
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
  })
  const mobilePage = await mobileContext.newPage()
  await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await mobilePage.waitForTimeout(1000)

  // Capture mobile top
  await captureScreenshot(mobilePage, 'landing_07_mobile_hero_light.png')

  // Test mobile menu drawer
  const mobileMenuBtn = await mobilePage.$('button[aria-label="Open mobile navigation"]')
  if (mobileMenuBtn) {
    await mobileMenuBtn.click()
    await mobilePage.waitForTimeout(400)
    await captureScreenshot(mobilePage, 'landing_08_mobile_drawer_open.png')
  }

  await browser.close()
  console.log('\n🎉 Landing page verification complete!')
}

run().catch((err) => {
  console.error('Error during landing verification:', err)
  process.exit(1)
})
