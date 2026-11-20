import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const ARTIFACT_DIR = 'C:/Users/bhowm/.gemini/antigravity/brain/61ce16d0-9da9-43cc-a19e-5b2161cb299b/screenshots/authentic'
const LOCAL_OUT = './test-results/authentic-screens'

for (const dir of [ARTIFACT_DIR, LOCAL_OUT]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

async function capture(page, filename, options = {}) {
  const localPath = path.join(LOCAL_OUT, filename)
  const artifactPath = path.join(ARTIFACT_DIR, filename)
  await page.screenshot({ path: localPath, ...options })
  fs.copyFileSync(localPath, artifactPath)
  console.log(`📸 Saved: ${filename}`)
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  })

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)

  // 1. Landing Hero (Light)
  await capture(page, 'authentic_01_landing_hero_light.png')

  // 2. How It Works Section (Light)
  const howEl = await page.$('#how-it-works')
  if (howEl) {
    await howEl.scrollIntoViewIfNeeded()
    await page.waitForTimeout(400)
    await capture(page, 'authentic_02_workflow_light.png')
  }

  // 3. Switch to Dark Mode & Capture
  await page.evaluate(() => {
    document.documentElement.classList.add('dark')
    localStorage.setItem('focusflow_theme', 'dark')
  })
  await page.waitForTimeout(400)
  if (howEl) {
    await capture(page, 'authentic_03_workflow_dark.png')
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
  await capture(page, 'authentic_04_landing_hero_dark.png')

  // 4. Signup Clean (No fake student avatars)
  const signupPage = await ctx.newPage()
  await signupPage.goto('http://localhost:5173/signup', { waitUntil: 'networkidle' })
  await signupPage.waitForTimeout(500)
  await capture(signupPage, 'authentic_05_signup_clean.png')

  await browser.close()
  console.log('✨ Authentic UI verification completed!')
}

run().catch(console.error)
