import { chromium } from 'playwright'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SCREENSHOT_DIR = path.resolve('C:/Users/bhowm/.gemini/antigravity/brain/22a52d2b-b3ae-47d3-9bb0-c999863dbb22/screenshots/audit_fixes')

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
}

async function runAuditVerification() {
  console.log('--- Starting Visual Audit Verification ---')
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1024 },
  })
  const page = await context.newPage()

  const timestamp = Date.now()
  const studentEmail = `audit_student_${timestamp}@focusflow.test`
  const studentPassword = 'Password123!'
  const studentName = 'Elena Rostova'

  try {
    // 1. Landing Page Photographic Hero Inspection
    console.log('1. Capturing Landing Hero Background...')
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_landing_hero_photographic_bg.png'), fullPage: false })

    // 2. Register & Complete Onboarding
    console.log('2. Registering fresh student account...')
    await page.goto('http://localhost:5173/signup', { waitUntil: 'networkidle' })
    await page.fill('input[name="name"]', studentName)
    await page.fill('input[name="email"]', studentEmail)
    await page.fill('input[name="password"]', studentPassword)
    await page.fill('input[name="confirmPassword"]', studentPassword)
    await page.check('input[name="acceptTerms"]')
    await page.click('button[type="submit"]')

    await page.waitForURL('**/onboarding', { timeout: 15000 })
    await page.waitForTimeout(800)

    const instInput = page.locator('input[placeholder*="Stanford University"], input[type="text"]').first()
    if (await instInput.isVisible()) {
      await instInput.fill('Oxford University')
    }
    const continueBtn1 = page.locator('button:has-text("Continue")').first()
    if (await continueBtn1.isVisible()) {
      await continueBtn1.click()
      await page.waitForTimeout(500)
    }

    for (let step = 2; step <= 4; step++) {
      const continueBtn = page.locator('button:has-text("Continue")').first()
      if (await continueBtn.isVisible()) {
        await continueBtn.click()
        await page.waitForTimeout(500)
      }
    }

    const finishBtn = page.locator('button:has-text("Finish setup"), button:has-text("Launch")').first()
    if (await finishBtn.isVisible()) {
      await finishBtn.click()
    }

    await page.waitForURL('**/app/dashboard', { timeout: 15000 })
    await page.waitForTimeout(1000)
    console.log('Successfully reached dashboard!')

    // 3. Inspect Subjects KPI Overview
    console.log('3. Capturing Subjects Overview...')
    await page.goto('http://localhost:5173/app/subjects', { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_subjects_kpi_overview.png'), fullPage: false })

    // 4. Inspect Subject Detail
    console.log('4. Capturing Subject Detail...')
    const subjectCard = page.locator('a[href^="/app/subjects/"]').first()
    if (await subjectCard.count() > 0) {
      await subjectCard.click()
      await page.waitForURL('**/app/subjects/**', { timeout: 10000 })
      await page.waitForTimeout(800)
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_subject_detail_workspace.png'), fullPage: false })
    }

    // 5. Inspect Revision Center
    console.log('5. Capturing Revision Center...')
    await page.goto('http://localhost:5173/app/revision', { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_revision_center_pace_and_tabs.png'), fullPage: false })

    // 6. Inspect Planner Week View (Grid contrast)
    console.log('6. Capturing Planner Week View...')
    await page.goto('http://localhost:5173/app/planner', { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_planner_week_view.png'), fullPage: false })

    // 7. Inspect My Day
    console.log('7. Capturing My Day...')
    await page.goto('http://localhost:5173/app/day', { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_myday_workspace.png'), fullPage: false })

    console.log('--- Visual Audit Verification Completed Successfully ---')
  } catch (error) {
    console.error('Audit verification error:', error)
  } finally {
    await browser.close()
  }
}

runAuditVerification()
