import { chromium } from 'playwright-core';

const url = process.argv[2] || 'http://localhost:5175/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push('PAGEERR: ' + e.message));

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const footerCount = await page.locator('footer').count();
console.log('footer count:', footerCount);
console.log('errors:', JSON.stringify(errors.slice(0, 5), null, 2));

await page.screenshot({ path: 'C:/tmp/fullpage.png', fullPage: true });
console.log('saved C:/tmp/fullpage.png');

if (footerCount > 0) {
  const footer = page.locator('footer').first();
  await footer.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await footer.screenshot({ path: 'C:/tmp/footer.png' });
  console.log('saved C:/tmp/footer.png');
}
await browser.close();
