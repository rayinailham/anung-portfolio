// Kirim 5 evidence: what the browser actually downloads for every image on the
// production build, per viewport, plus one screenshot per page. Run against
// `npm run preview` (127.0.0.1:4173) after `npm run build`. Exits 1 if any
// image failed to load or collapsed to a zero-sized box, so `picture` ever
// falling out of the layout is a failure and not something to notice by eye.
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const OUT = process.env.EVIDENCE_DIR ?? 'docs/evidence/kirim-5';
const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4173';

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const report = {};
for (const [label, width, height] of [['1440', 1440, 1000], ['390', 390, 844]]) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  for (const [slug, route] of [['beranda', '/'], ['pengalaman', '/pengalaman'], ['tentang', '/tentang']]) {
    await page.goto(`${BASE}/#${route}`, { waitUntil: 'load' });
    await page.waitForTimeout(1200);
    // Lazy images only choose a source once they are near the viewport.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${OUT}/${slug}-${label}-responsif.png` });
    report[`${slug}-${label}`] = await page.locator('img').evaluateAll(images => images.map(image => ({
      src: image.getAttribute('src'),
      served: image.currentSrc ? new URL(image.currentSrc).pathname : null,
      natural: `${image.naturalWidth}x${image.naturalHeight}`,
      box: `${Math.round(image.getBoundingClientRect().width)}x${Math.round(image.getBoundingClientRect().height)}`,
      loaded: image.complete && image.naturalWidth > 0,
    })));
  }
  await context.close();
}
await browser.close();

const broken = Object.entries(report).flatMap(([key, images]) => images
  .filter(image => !image.loaded || /^0x|x0$/.test(image.box))
  .map(image => `${key} ${image.src} box ${image.box} loaded ${image.loaded}`));
await writeFile(`${OUT}/gambar-responsif.json`, `${JSON.stringify({ base: BASE, images: report, broken }, null, 2)}\n`);
console.log(`Wrote ${OUT}/gambar-responsif.json and ${Object.keys(report).length} screenshots.`);
console.log(broken.length ? `BROKEN:\n${broken.join('\n')}` : 'BROKEN: none');
process.exit(broken.length ? 1 : 0);
