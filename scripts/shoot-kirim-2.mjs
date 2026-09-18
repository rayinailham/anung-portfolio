// Screenshot pass for Kirim 2: 3 pages x 2 widths x 2 themes.
// Usage: node scripts/shoot-kirim-2.mjs before|after
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const label = process.argv[2];
if (!['before', 'after'].includes(label)) throw new Error('pass "before" or "after"');
const baseURL = process.env.PORTFOLIO_URL || 'http://127.0.0.1:4173';
const output = 'docs/evidence/kirim-2';
await mkdir(output, { recursive: true });

const pages = [['/', 'beranda'], ['/pengalaman', 'pengalaman'], ['/tentang', 'tentang']];
const viewports = [[1440, 1000, '1440'], [390, 844, '390']];
const browser = await chromium.launch();
try {
  for (const [width, height, tag] of viewports) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    await page.addInitScript(() => { try { sessionStorage.setItem('anung-intro', 'seen'); } catch { /* optional */ } });
    for (const theme of ['light', 'dark']) {
      for (const [route, name] of pages) {
        await page.goto(`${baseURL}/#${route}`);
        await page.locator('h1').waitFor();
        await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
        await page.evaluate(() => document.fonts.ready);
        // Lazy images below the fold never decode for a fullPage capture on
        // their own, so walk the document down and back up first.
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += innerHeight) {
            window.scrollTo(0, y);
            await new Promise(resolve => setTimeout(resolve, 120));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForFunction(() => [...document.images].every(image => image.complete));
        await page.waitForTimeout(400);
        await page.screenshot({ path: `${output}/${name}-${tag}-${theme}-${label}.png`, fullPage: true });
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
}
console.log(`screenshots ${label} done`);
