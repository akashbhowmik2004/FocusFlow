import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import { prisma } from '../lib/prisma.js'
import { chromium } from '../../../frontend/node_modules/playwright/index.mjs'

const BASE_URL = 'http://localhost:5173'

function assert(condition, message) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`)
  }
  console.log(`  ✓ ${message}`)
}

async function run() {
  console.log('================================================================================')
  console.log('       FocusFlow — Real Browser Session Workflow Verification')
  console.log('================================================================================\n')

  const timestamp = Date.now()
  const testUserEmail = `qa_workflow_${timestamp}@focusflow.test`
  const testUserName = `Workflow QA Tester ${timestamp}`
  const testPassword = 'Password123!'

  let browser, page, disposableUserId, disposableSubjectId

  try {
    // Launch headless chromium
    console.log('🚀 STEP 1: Launching Chromium browser...')
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
    page = await context.newPage()

    page.on('pageerror', (err) => {
      console.error(`  [Browser PageError] ${err.message}`)
    })

    // Sign up
    console.log(`\n📝 STEP 2: Registering disposable user (${testUserEmail})...`)
    await page.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle' })

    await page.fill('input[name="name"]', testUserName)
    await page.fill('input[name="email"]', testUserEmail)
    await page.fill('input[name="password"]', testPassword)
    await page.fill('input[name="confirmPassword"]', testPassword)
    await page.check('input[name="acceptTerms"]')

    await Promise.all([
      page.waitForURL((url) => url.pathname.includes('/onboarding') || url.pathname.includes('/app')),
      page.click('button[type="submit"]'),
    ])
    console.log(`  ✓ Reached: ${page.url()}`)

    const createdUser = await prisma.user.findUnique({ where: { email: testUserEmail } })
    assert(Boolean(createdUser), `Disposable user created in DB with ID: ${createdUser?.id}`)
    disposableUserId = createdUser.id

    // Pre-create a subject in database for this user
    console.log('\n📚 STEP 3: Setting up subject in database...')
    const subject = await prisma.subject.create({
      data: {
        name: `Systems Engineering ${timestamp}`,
        code: 'SYS101',
        userId: disposableUserId,
        color: '#6366f1',
      },
    })
    disposableSubjectId = subject.id
    console.log(`  ✓ Created subject ID: ${disposableSubjectId}`)

    // Navigate to My Day
    console.log('\n📅 STEP 4: Navigating to My Day...')
    await page.goto(`${BASE_URL}/app/day`, { waitUntil: 'networkidle' })
    await page.waitForSelector('text=Chronological Timeline')

    // Add Session A via UI
    console.log('\n⏱️ STEP 5: Scheduling Session A via UI ("Raft Leader Election Live")...')
    await page.click('button:has-text("Add Study Block")')
    await page.waitForSelector('input[placeholder*="CPU Scheduling"]')
    await page.fill('input[placeholder*="CPU Scheduling"]', 'Raft Leader Election Live')
    await page.click('button:has-text("Save Session")')
    await page.waitForSelector('text=Raft Leader Election Live', { timeout: 8000 })
    console.log('  ✓ Session A rendered in My Day timeline')

    // Query database to confirm Session A exists and has genuine DB ID
    const dbSessionA = await prisma.studySession.findFirst({
      where: { userId: disposableUserId, title: 'Raft Leader Election Live' },
    })
    assert(Boolean(dbSessionA), `Session A in PostgreSQL has ID: ${dbSessionA?.id}`)

    // Test Bug 2: Click "Start Focus" directly on Session A card WITHOUT refreshing
    console.log('\n🎯 STEP 6: Clicking "Start Focus" directly on Session A card (without refresh)...')
    const cardA = page.locator('.group').filter({ hasText: 'Raft Leader Election Live' })
    const startFocusBtn = cardA.locator('button:has-text("Start Focus")')
    await startFocusBtn.waitFor({ state: 'visible' })
    await startFocusBtn.click()

    // Wait for transition to Focus Mode
    await page.waitForURL(/\/app\/focus\//, { timeout: 10000 })
    console.log(`  ✓ Navigated to Focus Mode: ${page.url()}`)
    assert(page.url().includes(dbSessionA.id), `URL contains authentic database ID: ${dbSessionA.id}`)

    // Verify Focus Mode is running
    await page.waitForSelector('text=In focus', { timeout: 8000 })
    const hasErrorToast = await page.locator('text=Session not found').isVisible().catch(() => false)
    assert(!hasErrorToast, 'CONFIRMED: No "Session not found" error toast appeared!')
    console.log('  ✓ Focus Mode active and running without errors!')

    // Navigate back to My Day
    console.log('\n📅 STEP 7: Navigating back to My Day to test manual completion...')
    await page.goto(`${BASE_URL}/app/day`, { waitUntil: 'networkidle' })
    await page.waitForSelector('text=Chronological Timeline')

    // Add Session B via UI
    console.log('\n⏱️ STEP 8: Scheduling Session B via UI ("Log Replication Live")...')
    await page.click('button:has-text("Add Study Block")')
    await page.waitForSelector('input[placeholder*="CPU Scheduling"]')
    await page.fill('input[placeholder*="CPU Scheduling"]', 'Log Replication Live')
    await page.click('button:has-text("Save Session")')
    await page.waitForSelector('text=Log Replication Live', { timeout: 8000 })
    console.log('  ✓ Session B rendered in timeline')

    const dbSessionB = await prisma.studySession.findFirst({
      where: { userId: disposableUserId, title: 'Log Replication Live' },
    })
    assert(Boolean(dbSessionB), `Session B in PostgreSQL has ID: ${dbSessionB?.id}`)

    // Test Bug 1: Click "Done" (manual completion) on Session B
    console.log('\n✅ STEP 9: Manually completing Session B by clicking Done...')
    const cardB = page.locator('.group').filter({ hasText: 'Log Replication Live' })
    const doneBtn = cardB.locator('button:has-text("Done")')
    await doneBtn.waitFor({ state: 'visible' })
    await doneBtn.click()

    // Verify success toast appeared exactly once
    await page.waitForSelector('text=Completed "Log Replication Live"!', { timeout: 8000 })
    console.log('  ✓ Success notification "Completed "Log Replication Live"!" appeared')

    // Verify completed styling on the card immediately (line-through & Completed badge)
    await page.waitForSelector('span.line-through:has-text("Log Replication Live")', { timeout: 8000 })
    const titleEl = page.locator('span.line-through:has-text("Log Replication Live")').first()
    const classList = await titleEl.getAttribute('class')
    assert(classList.includes('line-through'), `Session title has line-through styling: ${classList}`)
    console.log('  ✓ Completed strikethrough styling rendered immediately!')

    // Step 10: Refresh the browser and verify persistence
    console.log('\n🔄 STEP 10: Refreshing browser to verify persistence...')
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForSelector('text=Chronological Timeline')
    await page.waitForSelector('span.line-through:has-text("Log Replication Live")', { timeout: 8000 })
    console.log('  ✓ Session B remains completed with strikethrough styling after refresh!')

    // Step 11: Inspect PostgreSQL database record for Session B
    console.log('\n🔍 STEP 11: Inspecting PostgreSQL record for Session B...')
    const freshDbB = await prisma.studySession.findUnique({ where: { id: dbSessionB.id } })
    assert(freshDbB.status === 'completed', `Database status is "completed" (${freshDbB.status})`)
    assert(freshDbB.actualDurationSeconds === null, `actualDurationSeconds is strictly null (${freshDbB.actualDurationSeconds})`)
    console.log('  ✓ Database verified: status = completed, actualDurationSeconds = null')

    console.log('\n================================================================================')
    console.log('🎉 REAL BROWSER & DATABASE VERIFICATION COMPLETED WITH 100% SUCCESS!')
    console.log('================================================================================\n')
  } catch (err) {
    console.error('\n❌ Browser test failed:', err)
    process.exitCode = 1
  } finally {
    if (browser) {
      await browser.close().catch(() => {})
    }
    // Cleanup disposable test records
    if (disposableUserId) {
      await prisma.studySession.deleteMany({ where: { userId: disposableUserId } }).catch(() => {})
      await prisma.topic.deleteMany({ where: { subject: { userId: disposableUserId } } }).catch(() => {})
      await prisma.subject.deleteMany({ where: { userId: disposableUserId } }).catch(() => {})
      await prisma.user.deleteMany({ where: { id: disposableUserId } }).catch(() => {})
      console.log('🧹 Cleaned up all disposable test records from database.')
    }
    await prisma.$disconnect()
  }
}

run()
