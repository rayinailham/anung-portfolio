// Screenshot pass for Kirim 3: every data visual in both themes at 1440 and
// 390, plus a reduced-motion capture proving the final value is what shows.
// Usage: node scripts/shoot-kirim-3.mjs   (needs a served build, see PORTFOLIO_URL)
import { mkdir, readdir, unlink } from 'node:fs/promises';
import { chromium } from 'playwright';
import sharp from 'sharp';

const baseURL = process.env.PORTFOLIO_URL || 'http://127.0.0.1:4173';
// A later phase can re-run this against its own folder: EVIDENCE_DIR=docs/evidence/vis-1
const output = process.env.EVIDENCE_DIR || 'docs/evidence/kirim-3';
await mkdir(output, { recursive: true });

const VISUALS = [
  { id: 'ring-ipk', route: '/tentang', selector: '.education-card' },
  { id: 'bar-toefl', route: '/tentang', selector: '.score-scale' },
  { id: 'split-afiliasi', route: '/pengalaman', selector: '#entri-anima-coordination .split-bar' },
  { id: 'timeline-karier', route: '/pengalaman', selector: '.timeline-section' },
  { id: 'counter-pengalaman', route: '/pengalaman', selector: '#entri-anima-digital .experience-stats' },
];

const shoot = async (page, visual, name) => {
  await page.goto(`${baseURL}/#${visual.route}`);
  const target = page.locator(visual.selector).first();
  await target.waitFor();
  await target.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  // Long enough for every entrance tween and counter to have landed.
  await page.waitForTimeout(2500);
  await target.screenshot({ path: `${output}/${name}.png` });
};

const browser = await chromium.launch();
try {
  for (const [width, height, tag] of [[1440, 1000, '1440'], [390, 844, '390']]) {
    for (const theme of ['light', 'dark']) {
      const page = await browser.newPage({ viewport: { width, height } });
      await page.addInitScript((value) => {
        try { sessionStorage.setItem('anung-intro', 'seen'); localStorage.setItem('anung-theme', value); } catch { /* optional */ }
      }, theme);
      for (const visual of VISUALS) await shoot(page, visual, `${visual.id}-${tag}-${theme}`);
      await page.close();
    }
  }
  // Reduced motion: nothing animates, so whatever shows is the resting value.
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await page.addInitScript(() => { try { sessionStorage.setItem('anung-intro', 'seen'); } catch { /* optional */ } });
  for (const visual of VISUALS) await shoot(page, visual, `${visual.id}-reduced-motion`);
  for (const [route, name] of [['/pengalaman', 'pengalaman'], ['/tentang', 'tentang']]) {
    await page.goto(`${baseURL}/#${route}`);
    await page.locator('h1').waitFor();
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += innerHeight) {
        window.scrollTo(0, y);
        await new Promise(resolve => setTimeout(resolve, 120));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForFunction(() => [...document.images].every(image => image.complete));
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${output}/${name}-1440-light-reduced-motion.png`, fullPage: true });
  }
  await page.close();
} finally {
  await browser.close();
}

// Same rule as Kirim 2: evidence ships as WebP so the repo stays light.
for (const file of (await readdir(output)).filter(name => name.endsWith('.png'))) {
  await sharp(`${output}/${file}`).webp({ quality: 80 }).toFile(`${output}/${file.replace(/\.png$/, '.webp')}`);
  await unlink(`${output}/${file}`);
}
console.log('screenshots kirim-3 done');
