// Potret bagian "Rentang waktu magang" di dua lebar dan dua tema.
// Pakai: node docs/evidence/putaran-2/viz-1/shoot.mjs <sebelum|sesudah>
// Dev server 5173 harus hidup (`npm run dev -- --host 127.0.0.1`).
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const tag = process.argv[2] || 'sesudah';
const out = new URL(`./${tag}/`, import.meta.url);
await mkdir(out, { recursive: true });
const file = name => fileURLToPath(new URL(name, out));

const browser = await chromium.launch();
for (const [width, height, name] of [[1440, 1000, '1440'], [390, 844, '390']]) {
  for (const theme of ['light', 'dark']) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(value => { try { localStorage.setItem('anung-theme', value); } catch { /* opsional */ } }, theme);
    await page.goto('http://127.0.0.1:5173/#/pengalaman');
    await page.waitForSelector('.timeline-section');
    await page.waitForTimeout(600);
    await page.locator('.timeline-section').screenshot({ path: file(`./timeline-${name}-${theme}.png`) });
    await page.close();
  }
}
await browser.close();
console.log(`potret ${tag} selesai`);
