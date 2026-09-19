// Capture a tall mobile section from a whole-page frame. This avoids the
// locator screenshot's additional scroll while Lenis is active.
import { chromium } from 'playwright';
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const browser = await chromium.launch();
const captures = [];
try {
  for (const theme of ['light', 'dark']) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.addInitScript(value => {
      sessionStorage.setItem('anung-intro', 'seen');
      localStorage.setItem('anung-theme', value);
    }, theme);
    await page.goto(`${process.env.PORTFOLIO_URL || 'http://127.0.0.1:4175'}/#/pengalaman`);
    const target = page.locator('.timeline-section');
    await target.scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(3000);
    const rect = await target.evaluate(el => {
      const r = el.getBoundingClientRect();
      return { left: Math.round(r.left + scrollX), top: Math.round(r.top + scrollY), width: Math.round(r.width), height: Math.round(r.height) };
    });
    const file = `docs/evidence/vis-1/timeline-karier-390-${theme}-fullpage-crop.webp`;
    await sharp(await page.screenshot({ fullPage: true })).extract(rect).webp({ quality: 80 }).toFile(file);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390);
    captures.push({ theme, viewport: { width: 390, height: 844 }, rect, file });
    await page.close();
  }
} finally { await browser.close(); }
await writeFile('docs/evidence/vis-1/mobile-capture.json', JSON.stringify(captures, null, 2) + '\n');
console.log('Mobile timeline full-page crops saved');
