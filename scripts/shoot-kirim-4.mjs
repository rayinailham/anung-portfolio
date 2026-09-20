// Screenshot pass for Kirim 4: the contact channels, the contact form in every
// state it can reach, and the inline CV preview — both themes, 1440 and 390.
// The form's backend is decided at build time, so the four backend states come
// from a server built with a key; everything else comes from the plain build.
// Usage: node scripts/shoot-kirim-4.mjs
//   PORTFOLIO_URL  build without a key   (default http://127.0.0.1:4173)
//   BACKEND_URL    server built with one (default http://127.0.0.1:5174)
import { mkdir, readdir, unlink } from 'node:fs/promises';
import { chromium } from 'playwright';
import sharp from 'sharp';

const baseURL = process.env.PORTFOLIO_URL || 'http://127.0.0.1:4173';
const backendURL = process.env.BACKEND_URL || 'http://127.0.0.1:5174';
const output = process.env.EVIDENCE_DIR || 'docs/evidence/kirim-4';
await mkdir(output, { recursive: true });

const SECTIONS = [
  { id: 'kontak-saluran', route: '/kontak', selector: '.contact-info' },
  { id: 'kontak-form', route: '/kontak', selector: '.contact-form' },
  { id: 'cv-preview', route: '/tentang', selector: '.cv-preview', viewport: { '1440': 2600, '390': 3400 } },
];

const shoot = async (page, url, selector, name) => {
  await page.goto(url);
  const target = page.locator(selector).first();
  await target.waitFor();
  await target.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every(image => image.complete));
  await page.waitForTimeout(2500);
  await target.screenshot({ path: `${output}/${name}.png` });
};

const fill = async (page) => {
  await page.locator('input[name="name"]').fill('Rani Pertiwi');
  await page.locator('input[name="email"]').fill('rani@example.com');
  await page.locator('select[name="topic"]').selectOption('Peluang kerja');
  await page.locator('textarea[name="message"]').fill('Halo Anung, kami sedang mencari kandidat untuk posisi affiliate marketing. Bisa bicara minggu ini?');
};

const browser = await chromium.launch();
try {
  for (const [width, height, tag] of [[1440, 1000, '1440'], [390, 844, '390']]) {
    for (const theme of ['light', 'dark']) {
      const page = await browser.newPage({ viewport: { width, height } });
      await page.addInitScript((value) => {
        try { sessionStorage.setItem('anung-intro', 'seen'); localStorage.setItem('anung-theme', value); } catch { /* optional */ }
      }, theme);
      for (const section of SECTIONS) {
        if (section.viewport) await page.setViewportSize({ width, height: section.viewport[tag] });
        await shoot(page, `${baseURL}/#${section.route}`, section.selector, `${section.id}-${tag}-${theme}`);
        if (section.viewport) await page.setViewportSize({ width, height });
      }
      await page.close();
    }
  }

  // The four states of the form. Idle and drafted come from the build without a
  // key; sending, sent and failed need the keyed build, with the request held
  // or answered locally so nothing ever leaves this machine.
  const drafted = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await drafted.addInitScript(() => { try { sessionStorage.setItem('anung-intro', 'seen'); } catch { /* optional */ } });
  await drafted.route('mailto:**', route => route.abort());
  await drafted.goto(`${baseURL}/#/kontak`);
  await drafted.locator('.contact-form').waitFor();
  await fill(drafted);
  await drafted.locator('.form-footer button').click();
  await drafted.waitForTimeout(800);
  await drafted.locator('.contact-form').screenshot({ path: `${output}/form-tanpa-kunci-drafted.png` });
  await drafted.close();

  for (const state of ['sending', 'sent', 'failed']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.addInitScript(() => { try { sessionStorage.setItem('anung-intro', 'seen'); } catch { /* optional */ } });
    await page.route('https://api.web3forms.com/submit', async (route) => {
      if (state === 'sending') return new Promise(() => {}); // held open on purpose
      if (state === 'failed') return route.fulfill({ status: 500, contentType: 'application/json', body: '{"success":false,"message":"Internal error"}' });
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true,"message":"Email sent successfully"}' });
    });
    await page.goto(`${backendURL}/#/kontak`);
    await page.locator('.contact-form').waitFor();
    await fill(page);
    await page.locator('.form-footer button').click();
    await page.waitForTimeout(state === 'sending' ? 900 : 1500);
    await page.locator('.contact-form').screenshot({ path: `${output}/form-dengan-kunci-${state}.png` });
    await page.close();
  }
} finally {
  await browser.close();
}

// Same rule as Kirim 2 and 3: evidence ships as WebP so the repo stays light.
for (const file of (await readdir(output)).filter(name => name.endsWith('.png'))) {
  await sharp(`${output}/${file}`).webp({ quality: 80 }).toFile(`${output}/${file.replace(/\.png$/, '.webp')}`);
  await unlink(`${output}/${file}`);
}
console.log('screenshots kirim-4 done');
