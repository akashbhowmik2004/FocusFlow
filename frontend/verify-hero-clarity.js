import { chromium } from 'playwright'
import path from 'node:path'

async function captureMultiViewport() {
  const browser = await chromium.launch({ headless: true })
  
  const viewports = [
    { name: 'desktop_1440x1024', width: 1440, height: 1024 },
    { name: 'tablet_768x1024', width: 768, height: 1024 },
    { name: 'mobile_390x844', width: 390, height: 844 },
  ]

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    const hero = page.locator('#hero')
    await hero.screenshot({ path: `C:/Users/bhowm/.gemini/antigravity/brain/22a52d2b-b3ae-47d3-9bb0-c999863dbb22/screenshots/audit_fixes/hero_${vp.name}.png` })
    console.log(`Captured: hero_${vp.name}.png`)
    await page.close()
  }

  await browser.close()
}

captureMultiViewport()
