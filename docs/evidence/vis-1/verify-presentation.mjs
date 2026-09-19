// Supplemental VIS-1 evidence. Run from the project root after vite build.
// PORTFOLIO_URL=http://127.0.0.1:4175 node docs/evidence/vis-1/verify-presentation.mjs
import assert from 'node:assert/strict';
import { writeFile, readFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import sharp from 'sharp';

const output = 'docs/evidence/vis-1';
const baseURL = process.env.PORTFOLIO_URL || 'http://127.0.0.1:4175';
const parse = value => value.match(/[\d.]+/g).map(Number);
const composite = (front, back) => front.slice(0, 3).map((v, i) => v * (front[3] ?? 1) + back[i] * (1 - (front[3] ?? 1)));
const luminance = rgb => rgb.slice(0, 3).map(v => {
  v /= 255;
  return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
}).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return Number(((hi + .05) / (lo + .05)).toFixed(3));
};
const results = { scoreTrackContrast: {}, narrowLayout: {}, errors: [] };
const browser = await chromium.launch();
try {
  for (const theme of ['light', 'dark']) {
    const page = await browser.newPage({ viewport: { width: 320, height: 900 }, reducedMotion: 'reduce' });
    page.on('pageerror', error => results.errors.push(error.message));
    await page.addInitScript(value => {
      localStorage.setItem('anung-theme', value);
      sessionStorage.setItem('anung-intro', 'seen');
    }, theme);
    await page.goto(`${baseURL}/#/tentang`);
    await page.locator('.gpa').waitFor();
    await page.evaluate(() => document.fonts.ready);
    const colors = await page.evaluate(() => ({
      fill: getComputedStyle(document.querySelector('.score-scale-fill')).backgroundColor,
      track: getComputedStyle(document.querySelector('.score-scale-track')).backgroundColor,
      paper: getComputedStyle(document.documentElement).backgroundColor,
    }));
    const solidTrack = composite(parse(colors.track), parse(colors.paper));
    const ratio = contrast(parse(colors.fill), solidTrack);
    results.scoreTrackContrast[theme] = { ...colors, compositedTrack: solidTrack, ratio, required: 3 };
    assert.ok(ratio >= 3, `${theme} TOEFL fill against its new track`);
    results.narrowLayout[theme] = await page.locator('.gpa').evaluate(element => {
      const ring = element.querySelector('svg').getBoundingClientRect();
      const figure = element.querySelector('.gpa-figure').getBoundingClientRect();
      return {
        viewport: innerWidth,
        ringWidth: ring.width,
        figureWidth: figure.width,
        figureInsideRing: figure.left > ring.left && figure.right < ring.right && figure.top > ring.top && figure.bottom < ring.bottom,
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    assert.ok(results.narrowLayout[theme].figureInsideRing);
    assert.equal(results.narrowLayout[theme].overflow, false);
    for (const [route, selector, name] of [
      ['/tentang', '.education-card', 'ring-ipk'],
      ['/pengalaman', '.timeline-section', 'timeline-karier'],
    ]) {
      await page.goto(`${baseURL}/#${route}`);
      const element = page.locator(selector);
      await element.scrollIntoViewIfNeeded();
      await page.evaluate(() => document.fonts.ready);
      await sharp(await element.screenshot()).webp({ quality: 80 }).toFile(`${output}/${name}-320-${theme}-reduced-motion.webp`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
assert.equal(results.errors.length, 0);

// Tighten evidence checks that the existing script records but doesn't assert.
const metrics = JSON.parse(await readFile(`${output}/metrics.json`, 'utf8'));
for (const scale of Object.values(metrics.scales)) assert.ok(Math.abs(scale.split.coversWholeTrackPx) <= .1);
for (const bar of metrics.reducedMotion.pengalaman.bars) assert.equal(bar.transform, 'none');
assert.equal(metrics.reducedMotion.tentang.fill.transform, 'none');
results.reducedMotionBarsChecked = metrics.reducedMotion.pengalaman.bars.length;
results.splitTracksChecked = Object.keys(metrics.scales).length;
await writeFile(`${output}/presentation.json`, JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify(results, null, 2));
console.log('VIS-1 presentation checks OK');
