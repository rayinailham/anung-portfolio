// Kirim 2 measurements. Run against the static build twice: once on the state
// before the change and once after, so the dead-space numbers are comparable.
// Usage: node scripts/verify-kirim-2.mjs before|after
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const label = process.argv[2];
if (!['before', 'after'].includes(label)) throw new Error('pass "before" or "after"');
const baseURL = process.env.PORTFOLIO_URL || 'http://127.0.0.1:4173';
const output = 'docs/evidence/kirim-2';
await mkdir(output, { recursive: true });

const browser = await chromium.launch();
const result = { label, baseURL, viewport: { width: 1440, height: 1000 }, consoleErrors: [], runtimeErrors: [] };
try {
  const page = await browser.newPage({ viewport: result.viewport, reducedMotion: 'reduce' });
  page.on('pageerror', error => result.runtimeErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') result.consoleErrors.push(message.text()); });

  // Dead space on the Beranda hero, section heading and intro column.
  await page.goto(`${baseURL}/#/`);
  await page.locator('.hero').waitFor();
  await page.evaluate(() => document.fonts.ready);
  result.home = await page.evaluate(() => {
    const box = selector => document.querySelector(selector)?.getBoundingClientRect();
    const hero = box('.hero-copy'), description = box('.hero-description'), portrait = box('.hero-portrait');
    const meta = box('.hero-meta'), heading = box('.section-heading h2'), lead = box('.section-heading p');
    const intro = box('.intro-section'), aside = box('.intro-aside') || box('.intro-section .section-kicker');
    const kicker = box('.intro-section .section-kicker');
    return {
      heroCopyWidth: Math.round(hero.width),
      heroTextWidth: Math.round(Math.max(description.width, meta ? meta.width : 0)),
      heroUnusedWidth: Math.round(portrait.left - Math.max(description.right, meta ? meta.right : 0)),
      headingLeadOnSameRow: lead.top < heading.bottom - 4,
      headingUnusedWidth: lead.top < heading.bottom - 4 ? 0 : Math.round(heading.right - heading.left - heading.width + (intro.width - heading.width)),
      introColumnHeight: Math.round(aside.height),
      introKickerHeight: Math.round(kicker.height),
      introPaddingBlock: Math.round(parseFloat(getComputedStyle(document.querySelector('.intro-section')).paddingTop)),
    };
  });

  // Dead space per experience card: the shorter column's unused height.
  await page.goto(`${baseURL}/#/pengalaman`);
  await page.locator('.experience-card').first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: '.experience-side, .experience-main { align-self: start !important; }' });
  await page.waitForTimeout(300);
  result.experienceCards = await page.locator('.experience-card').evaluateAll(cards => cards.map(card => {
    const height = selector => Math.round(card.querySelector(selector)?.getBoundingClientRect().height || 0);
    const side = height('.experience-side'), main = height('.experience-main');
    return { id: card.id || null, side, main, gap: Math.abs(side - main), gallery: height('.evidence-gallery') };
  }));
  result.deadSpaceTotal = result.experienceCards.reduce((sum, card) => sum + card.gap, 0);

  // Every image, everywhere: one src must never appear with two crops.
  const crops = new Map();
  for (const route of ['/', '/pengalaman', '/tentang', '/kontak']) {
    await page.goto(`${baseURL}/#${route}`);
    await page.locator('h1').waitFor();
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += innerHeight) {
        window.scrollTo(0, y);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      window.scrollTo(0, 0);
    });
    const used = await page.locator('img').evaluateAll(images => images.map(image => {
      const box = image.getBoundingClientRect();
      if (!box.width || !box.height) return null;
      const style = getComputedStyle(image);
      return {
        src: new URL(image.currentSrc || image.src, location.href).pathname,
        crop: `${(box.width / box.height).toFixed(2)} ${style.objectFit} ${style.objectPosition}`,
        loaded: image.complete && image.naturalWidth > 0,
        declared: Boolean(image.getAttribute('width') && image.getAttribute('height')),
      };
    }).filter(Boolean));
    for (const item of used) {
      if (!crops.has(item.src)) crops.set(item.src, { crops: new Set(), loaded: true, declared: true });
      const entry = crops.get(item.src);
      entry.crops.add(item.crop);
      entry.loaded &&= item.loaded;
      entry.declared &&= item.declared;
    }
  }
  result.images = [...crops].map(([src, entry]) => ({ src, crops: [...entry.crops], loaded: entry.loaded, declared: entry.declared }));
  result.imagesReusedWithDifferentCrop = result.images.filter(image => image.crops.length > 1).map(image => image.src);
  // On the "before" run these are the findings themselves, so they are only
  // enforced once the fix is in place.
  if (label === 'after') {
    assert.deepEqual(result.imagesReusedWithDifferentCrop, []);
    assert.ok(result.images.every(image => image.loaded), 'every rendered image must load');
    assert.ok(result.images.every(image => image.declared), 'every image needs width + height');
  }

  // Evidence slots, and the same page with every placeholder cover blocked.
  await page.goto(`${baseURL}/#/pengalaman`);
  await page.locator('h1').waitFor();
  result.evidence = await page.locator('.evidence-item').evaluateAll(items => items.map(item => ({
    placeholder: item.dataset.placeholder === 'true',
    caption: item.querySelector('figcaption')?.textContent.trim(),
    src: item.querySelector('img')?.getAttribute('src'),
    declared: `${item.querySelector('img')?.getAttribute('width')}x${item.querySelector('img')?.getAttribute('height')}`,
  })));

  if (label === 'after') {
    assert.equal(result.evidence.length, 4);
    assert.equal(result.evidence.filter(slot => slot.placeholder).length, 3);
    assert.ok(result.evidence.filter(slot => slot.placeholder).every(slot => /ilustrasi sementara/.test(slot.caption)));

    const blocked = await browser.newPage({ viewport: result.viewport, reducedMotion: 'reduce' });
    result.blockedPlaceholders = { requests: 0, networkDiagnostics: [], slots: [] };
    blocked.on('console', message => { if (message.type() === 'error') result.blockedPlaceholders.networkDiagnostics.push(message.text()); });
    await blocked.route('**/images/placeholder/**', route => { result.blockedPlaceholders.requests++; return route.abort(); });
    await blocked.goto(`${baseURL}/#/pengalaman`);
    await blocked.locator('.evidence-item').first().waitFor();
    await blocked.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += innerHeight) {
        window.scrollTo(0, y);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    });
    await blocked.waitForTimeout(400);
    result.blockedPlaceholders.slots = await blocked.locator('.evidence-item[data-placeholder="true"]').evaluateAll(items => items.map(item => {
      const cover = item.querySelector('.evidence-cover');
      return {
        coverHeight: Math.round(cover.getBoundingClientRect().height),
        background: getComputedStyle(cover).backgroundImage.slice(0, 15),
        imageHidden: item.querySelector('img').dataset.missing === 'true',
        captionVisible: item.querySelector('figcaption').getBoundingClientRect().height > 0,
      };
    }));
    result.blockedPlaceholders.noHorizontalOverflow = await blocked.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
    assert.ok(result.blockedPlaceholders.requests > 0);
    assert.equal(result.blockedPlaceholders.slots.length, 3);
    assert.ok(result.blockedPlaceholders.slots.every(slot => slot.coverHeight > 40 && slot.imageHidden && slot.captionVisible && slot.background.includes('linear-grad')));
    assert.ok(result.blockedPlaceholders.noHorizontalOverflow);
    await blocked.close();
  }

  // Layout shift on a cold mobile load, no input, same method as Kirim 1.
  const cls = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await cls.addInitScript(() => {
    window.layoutShifts = [];
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.layoutShifts.push({ value: entry.value, time: entry.startTime });
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await cls.goto(`${baseURL}/`);
  await cls.locator('.splash').waitFor({ state: 'detached' });
  await cls.waitForTimeout(5500);
  result.initialLayoutShifts390 = await cls.evaluate(() => window.layoutShifts);
  result.initialLayoutShiftSum390 = result.initialLayoutShifts390.reduce((sum, entry) => sum + entry.value, 0);

  await writeFile(`${output}/metrics-${label}.json`, `${JSON.stringify(result, null, 2)}\n`);
  assert.ok(result.initialLayoutShiftSum390 <= .01, `CLS ${result.initialLayoutShiftSum390}`);
  assert.deepEqual(result.consoleErrors, []);
  assert.deepEqual(result.runtimeErrors, []);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
