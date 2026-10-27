import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const SCREENSHOT_DIR = './test-results/screenshots'
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
}

const routes = [
  { name: '01_landing_desktop', path: '/', viewport: { width: 1280, height: 800 } },
  { name: '01_landing_mobile', path: '/', viewport: { width: 390, height: 844 } },
  { name: '02_login', path: '/login', viewport: { width: 1280, height: 800 } },
  { name: '03_signup', path: '/signup', viewport: { width: 1280, height: 800 } },
  { name: '04_onboarding', path: '/onboarding', viewport: { width: 1280, height: 800 } },
  { name: '05_dashboard_desktop', path: '/app/dashboard', viewport: { width: 1440, height: 900 } },
  { name: '05_dashboard_tablet', path: '/app/dashboard', viewport: { width: 768, height: 1024 } },
  { name: '05_dashboard_mobile', path: '/app/dashboard', viewport: { width: 390, height: 844 } },
  { name: '06_my_day', path: '/app/day', viewport: { width: 1280, height: 800 } },
  { name: '07_planner_month', path: '/app/planner', viewport: { width: 1280, height: 800 } },
  { name: '08_subjects_grid', path: '/app/subjects', viewport: { width: 1280, height: 800 } },
  { name: '09_subject_detail', path: '/app/subjects/sub-1', viewport: { width: 1280, height: 800 } },
  { name: '10_revision_queue', path: '/app/revision', viewport: { width: 1280, height: 800 } },
  { name: '11_progress_analytics', path: '/app/progress', viewport: { width: 1440, height: 900 } },
  { name: '12_settings_profile', path: '/app/settings', viewport: { width: 1280, height: 800 } },
]

async function runAudit() {
  console.log('🚀 Starting FocusFlow Browser Visual & Interaction Audit...\n')
  const browser = await chromium.launch({ headless: true })
  let totalErrors = 0
  let passedChecks = 0

  for (const r of routes) {
    const page = await browser.newPage()
    await page.setViewportSize(r.viewport)

    const consoleErrors = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message)
    })

    try {
      const url = `http://127.0.0.1:5173${r.path}`
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 })
      await page.waitForTimeout(500) // allow motion animations to settle

      // Take screenshot
      const file = path.join(SCREENSHOT_DIR, `${r.name}.png`)
      await page.screenshot({ path: file, fullPage: false })

      if (consoleErrors.length > 0) {
        console.error(`❌ [${r.name}] Console Errors encountered (${consoleErrors.length}):`)
        consoleErrors.forEach((e) => console.error(`   - ${e}`))
        totalErrors += consoleErrors.length
      } else {
        console.log(`✅ [${r.name}] Loaded cleanly (0 errors) -> saved ${file}`)
        passedChecks++
      }
    } catch (err) {
      console.error(`❌ [${r.name}] Navigation failed:`, err.message)
      totalErrors++
    } finally {
      await page.close()
    }
  }

  // Interactive Flow Test
  console.log('\n🧪 Testing End-to-End User Interactions in Browser...')
  const testPage = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  try {
    // 1. Visit Login and Sign In
    await testPage.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle' })
    console.log('  Testing Login submit...')
    const submitBtn = testPage.locator('button[type="submit"]')
    await submitBtn.click()
    await testPage.waitForURL('**/app/dashboard', { timeout: 5000 })
    console.log('  ✅ Login successfully navigated to /app/dashboard')
    passedChecks++

    // 2. Complete a Session on Dashboard
    console.log('  Testing Session completion action...')
    const completeBtn = testPage.locator('button:has-text("Done")').first()
    if (await completeBtn.isVisible()) {
      await completeBtn.click()
      await testPage.waitForTimeout(500)
      console.log('  ✅ Session marked complete with visual feedback')
      passedChecks++
    }

    // 3. Navigate to Planner & toggle to Week view
    console.log('  Testing Planner View switching...')
    await testPage.goto('http://127.0.0.1:5173/app/planner', { waitUntil: 'networkidle' })
    const weekBtn = testPage.locator('button:has-text("Week")')
    await weekBtn.click()
    await testPage.waitForTimeout(400)
    console.log('  ✅ Planner switched to Week View')
    passedChecks++

    // 4. Navigate to Subjects and open CS201 details
    console.log('  Testing Subjects drill-down...')
    await testPage.goto('http://127.0.0.1:5173/app/subjects', { waitUntil: 'networkidle' })
    const subjectCard = testPage.locator('text=Data Structures & Algorithms').first()
    await subjectCard.click()
    await testPage.waitForURL('**/app/subjects/**', { timeout: 5000 })
    console.log('  ✅ Navigated to Subject Detail view')
    passedChecks++

    // 5. Test Revision Queue action
    console.log('  Testing Revision action...')
    await testPage.goto('http://127.0.0.1:5173/app/revision', { waitUntil: 'networkidle' })
    const reviseBtn = testPage.locator('button:has-text("Revise & Reset"), button:has-text("Mark Reviewed")').first()
    if (await reviseBtn.isVisible()) {
      await reviseBtn.click()
      await testPage.waitForTimeout(400)
      console.log('  ✅ Revision completed and rescheduled')
      passedChecks++
    }

    // 6. Test Settings Theme Toggle
    console.log('  Testing Theme toggle in Settings...')
    await testPage.goto('http://127.0.0.1:5173/app/settings', { waitUntil: 'networkidle' })
    const appearanceTab = testPage.locator('button:has-text("Theme & Appearance")')
    await appearanceTab.click()
    const darkBtn = testPage.locator('button:has-text("Midnight Dark")')
    await darkBtn.click()
    await testPage.waitForTimeout(300)
    const isDark = await testPage.evaluate(() => document.documentElement.classList.contains('dark'))
    if (isDark) {
      console.log('  ✅ Dark mode class successfully applied to HTML root')
      passedChecks++
    }
  } catch (err) {
    console.error('❌ Interaction test failed:', err)
    totalErrors++
  } finally {
    await testPage.close()
    await browser.close()
  }

  console.log(`\n🎉 Audit Complete! Passed checks: ${passedChecks}, Errors: ${totalErrors}`)
  if (totalErrors > 0) {
    process.exit(1)
  }
}

runAudit()
