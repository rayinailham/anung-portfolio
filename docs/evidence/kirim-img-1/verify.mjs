import { chromium, firefox, webkit } from '@playwright/test';
import sharp from 'sharp';
import { writeFile, stat, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const out = 'docs/evidence/kirim-img-1';
const report = { engines: {}, assets: [], pages: [] };
for (const [name, engine] of Object.entries({ chromium, firefox, webkit })) {
  const browser = await engine.launch();
  report.engines[name] = browser.version();
  await browser.close();
}
for (const id of ['konten-sosial', 'video-produk', 'webinar-b2b']) {
  for (const path of [`assets/source/placeholder/${id}.png`, `public/images/placeholder/${id}.webp`]) {
    const { width, height, format } = await sharp(path).metadata();
    assert.equal(width, 1200);
    assert.equal(height, 900);
    report.assets.push({ path, width, height, format, bytes: (await stat(path)).size, sha256: createHash('sha256').update(await readFile(path)).digest('hex') });
  }
  const encoded = await sharp(`assets/source/placeholder/${id}.png`).resize({ width: 1200 }).webp({ quality: 82 }).toBuffer();
  assert.deepEqual(encoded, await readFile(`public/images/placeholder/${id}.webp`));
}
const browser = await chromium.launch();
for (const width of [1440, 390]) {
  for (const theme of ['light', 'dark']) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce', colorScheme: theme });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto('http://127.0.0.1:4175/#/pengalaman', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // Color scheme initializes the same theme selection path as a fresh visitor.
    for (const img of await page.locator('img').all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(node => node.decode());
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    const slots = await page.locator('[data-placeholder="true"]').evaluateAll(nodes => nodes.map(node => {
      const image = node.querySelector('img');
      return { caption: node.textContent.trim(), src: image.getAttribute('src'), width: image.getAttribute('width'), height: image.getAttribute('height'), naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, visible: getComputedStyle(image).visibility !== 'hidden' && getComputedStyle(image).display !== 'none' };
    }));
    assert.equal(slots.length, 3);
    for (const slot of slots) {
      assert.match(slot.caption, /ilustrasi sementara/i);
      assert.equal(slot.width, '1200');
      assert.equal(slot.height, '900');
      assert.equal(slot.naturalWidth, 1200);
      assert.equal(slot.naturalHeight, 900);
      assert.equal(slot.visible, true);
    }
    assert.deepEqual(errors, []);
    const pageState = await page.evaluate(() => ({ theme: document.documentElement.dataset.theme, noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth }));
    assert.equal(pageState.theme, theme);
    assert.equal(pageState.noHorizontalOverflow, true);
    const png = await page.screenshot({ fullPage: true });
    await sharp(png).webp({ quality: 80 }).toFile(`${out}/pengalaman-${width}-${theme}.webp`);
    if ((width === 1440 && theme === 'dark') || (width === 390 && theme === 'light')) {
      await page.locator('[data-placeholder="true"]').first().scrollIntoViewIfNeeded();
      await sharp(await page.screenshot()).webp({ quality: 80 }).toFile(`${out}/galeri-${width}-${theme}.webp`);
    }
    report.pages.push({ width, ...pageState, errors, slots });
    await page.close();
  }
}
await browser.close();
await writeFile(`${out}/metrics.json`, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
