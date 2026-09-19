// Kirim 3 verification: honest scales, contrast of every new colour pair, and
// final values under reduced motion. Writes docs/evidence/kirim-3/metrics.json.
// Usage: node scripts/verify-kirim-3.mjs   (needs a served build, see PORTFOLIO_URL)
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = process.env.PORTFOLIO_URL || 'http://127.0.0.1:4173';
// A later phase can re-run this against its own folder: EVIDENCE_DIR=docs/evidence/vis-1
const output = process.env.EVIDENCE_DIR || 'docs/evidence/kirim-3';
await mkdir(output, { recursive: true });

const parse = (value) => {
  const numbers = value.match(/[\d.]+/g).map(Number);
  return { r: numbers[0], g: numbers[1], b: numbers[2], a: numbers[3] ?? 1 };
};
const over = (front, back) => ({
  r: front.r * front.a + back.r * (1 - front.a),
  g: front.g * front.a + back.g * (1 - front.a),
  b: front.b * front.a + back.b * (1 - front.a),
  a: 1,
});
const luminance = ({ r, g, b }) => {
  const channel = (value) => { const v = value / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};
const ratio = (front, back) => {
  const solid = front.a < 1 ? over(front, back) : front;
  const values = [luminance(solid), luminance(back)].sort((a, b) => b - a);
  return Number(((values[0] + 0.05) / (values[1] + 0.05)).toFixed(3));
};

// Every colour this phase introduced, with the surface it actually sits on.
// `kind: text` must clear 4.5:1; `kind: graphic` must clear 3:1 (WCAG 1.4.11).
const PAIRS = [
  { id: 'timeline-overlap-label', route: '/pengalaman', selector: '.timeline-overlap .timeline-label strong', background: '.timeline-section', kind: 'text' },
  { id: 'timeline-role-label', route: '/pengalaman', selector: '.timeline-row[data-entry="anymind"] .timeline-label strong', background: '.timeline-section', kind: 'text' },
  { id: 'timeline-period', route: '/pengalaman', selector: '.timeline-row[data-entry="anymind"] .timeline-period', background: '.timeline-section', kind: 'text' },
  { id: 'timeline-axis', route: '/pengalaman', selector: '.timeline-axis', background: '.timeline-section', kind: 'text' },
  { id: 'timeline-note', route: '/pengalaman', selector: '.timeline-note', background: '.timeline-section', kind: 'text' },
  { id: 'timeline-lead', route: '/pengalaman', selector: '.timeline-lead', background: '.timeline-section', kind: 'text' },
  { id: 'split-legend', route: '/pengalaman', selector: '.split-legend li', background: '.experience-main', kind: 'text' },
  { id: 'split-caption', route: '/pengalaman', selector: '.split-bar figcaption', background: '.experience-main', kind: 'text' },
  { id: 'score-value', route: '/tentang', selector: '.score-scale-head strong', background: '.skills-section', kind: 'text' },
  { id: 'score-label', route: '/tentang', selector: '.score-scale-label', background: '.skills-section', kind: 'text' },
  { id: 'score-level', route: '/tentang', selector: '.score-scale-level', background: '.skills-section', kind: 'text' },
  { id: 'score-axis', route: '/tentang', selector: '.score-scale-axis', background: '.skills-section', kind: 'text' },
  { id: 'gpa-number', route: '/tentang', selector: '.gpa-figure strong', background: '.education-card', kind: 'text' },
  { id: 'gpa-caption', route: '/tentang', selector: '.gpa-figure > span', background: '.education-card', kind: 'text' },
  { id: 'timeline-bar-fill', route: '/pengalaman', selector: '.timeline-row[data-entry="anymind"] .timeline-bar', background: '.timeline-section', kind: 'graphic', property: 'backgroundColor' },
  { id: 'timeline-overlap-fill', route: '/pengalaman', selector: '.timeline-overlap .timeline-bar', background: '.timeline-section', kind: 'graphic', property: 'backgroundColor' },
  { id: 'split-shopee', route: '/pengalaman', selector: '.split-segment[data-segment="shopee"]', background: '.experience-main', kind: 'graphic', property: 'backgroundColor' },
  { id: 'split-tiktok', route: '/pengalaman', selector: '.split-segment[data-segment="tiktok"]', background: '.experience-main', kind: 'graphic', property: 'backgroundColor' },
  { id: 'score-fill', route: '/tentang', selector: '.score-scale-fill', background: '.skills-section', kind: 'graphic', property: 'backgroundColor' },
  { id: 'gpa-arc', route: '/tentang', selector: '.gpa-ring-value', background: '.education-card', kind: 'graphic', property: 'stroke' },
];

const surfaceColor = (page, selector) => page.locator(selector).first().evaluate((element) => {
  for (let node = element; node; node = node.parentElement) {
    const value = getComputedStyle(node).backgroundColor;
    if (value && !value.startsWith('rgba(0, 0, 0, 0)')) return value;
  }
  return getComputedStyle(document.documentElement).backgroundColor;
});

const trackGeometry = (locator) => locator.evaluate((track) => {
  const box = track.getBoundingClientRect();
  const style = getComputedStyle(track);
  return { left: box.left + parseFloat(style.borderLeftWidth), width: track.clientWidth };
});

const browser = await chromium.launch();
const metrics = { baseURL, contrast: {}, scales: {}, reducedMotion: {}, layout: {} };
try {
  // 1. Contrast, per theme.
  for (const theme of ['light', 'dark']) {
    metrics.contrast[theme] = {};
    // The theme is seeded through localStorage, the same door the page's own
    // guard reads. Setting the attribute by hand races React's theme effect and
    // yields a foreground from one theme against a background from the other.
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    await page.addInitScript((value) => {
      try { sessionStorage.setItem('anung-intro', 'seen'); localStorage.setItem('anung-theme', value); } catch { /* optional */ }
    }, theme);
    for (const pair of PAIRS) {
      await page.goto(`${baseURL}/#${pair.route}`);
      await page.locator(pair.selector).first().waitFor();
      await page.waitForFunction(value => document.documentElement.dataset.theme === value, theme);
      const front = await page.locator(pair.selector).first().evaluate((element, property) =>
        getComputedStyle(element)[property || 'color'], pair.property);
      const back = await surfaceColor(page, pair.background);
      const value = ratio(parse(front), parse(back));
      metrics.contrast[theme][pair.id] = {
        kind: pair.kind, front, back, ratio: value,
        required: pair.kind === 'text' ? 4.5 : 3, passes: value >= (pair.kind === 'text' ? 4.5 : 3),
      };
    }
    await page.close();
  }

  // 2. Scales and geometry, per viewport.
  for (const [width, height, tag] of [[1440, 1000, '1440'], [390, 844, '390'], [320, 900, '320']]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    await page.addInitScript(() => { try { sessionStorage.setItem('anung-intro', 'seen'); } catch { /* optional */ } });
    const scales = {};

    await page.goto(`${baseURL}/#/tentang`);
    await page.locator('.gpa-ring-value').waitFor();
    scales.gpaRing = await page.locator('.gpa-ring-value').evaluate(circle => {
      const length = Number(circle.getAttribute('stroke-dasharray'));
      const offset = Number(circle.getAttribute('stroke-dashoffset'));
      return { length, offset, drawnFraction: Number((1 - offset / length).toFixed(6)), inlineOverride: circle.style.strokeDashoffset || null };
    });
    const scoreTrack = await trackGeometry(page.locator('.score-scale-track'));
    const scoreFill = await page.locator('.score-scale-fill').evaluate(el => el.getBoundingClientRect());
    scales.toefl = {
      declared: await page.locator('.score-scale').evaluate(el => ({ value: el.dataset.value, min: el.dataset.scaleMin, max: el.dataset.scaleMax })),
      axisText: await page.locator('.score-scale-axis').innerText(),
      startsAtScaleFloorPx: Number((scoreFill.left - scoreTrack.left).toFixed(2)),
      measuredFraction: Number((scoreFill.width / scoreTrack.width).toFixed(4)),
      expectedFraction: Number(((583 - 310) / (677 - 310)).toFixed(4)),
    };

    await page.goto(`${baseURL}/#/pengalaman`);
    await page.locator('.split-track').waitFor();
    const splitTrack = await trackGeometry(page.locator('.split-track'));
    const segments = await page.locator('.split-segment').evaluateAll(list => list.map(el => ({ segment: el.dataset.segment, width: el.getBoundingClientRect().width })));
    const gap = await page.locator('.split-track').evaluate(el => parseFloat(getComputedStyle(el).columnGap) || 0);
    scales.split = {
      total: await page.locator('.split-bar').getAttribute('data-total'),
      caption: await page.locator('.split-bar figcaption').innerText(),
      segments, gap, trackWidth: splitTrack.width,
      ratio: Number((segments[0].width / segments[1].width).toFixed(4)),
      coversWholeTrackPx: Number((segments[0].width + segments[1].width + gap - splitTrack.width).toFixed(2)),
    };

    const span = 11;
    const bars = {};
    for (const selector of ['.timeline-row[data-entry="anima-digital"]', '.timeline-row[data-entry="anymind"]', '.timeline-row[data-entry="anima-coordination"]', '.timeline-overlap']) {
      const track = await trackGeometry(page.locator(`${selector} .timeline-track`));
      const bar = await page.locator(`${selector} .timeline-bar`).evaluate(el => el.getBoundingClientRect());
      bars[selector] = {
        fromMonth: Number(((bar.left - track.left) / track.width * span).toFixed(2)),
        toMonth: Number(((bar.right - track.left) / track.width * span).toFixed(2)),
      };
    }
    const anymind = bars['.timeline-row[data-entry="anymind"]'];
    const coordination = bars['.timeline-row[data-entry="anima-coordination"]'];
    scales.timeline = {
      span: await page.locator('.timeline').getAttribute('data-span'),
      bars,
      sharedMonths: Number((Math.min(anymind.toMonth, coordination.toMonth) - Math.max(anymind.fromMonth, coordination.fromMonth)).toFixed(2)),
      lead: await page.locator('.timeline-lead').innerText(),
      note: await page.locator('.timeline-note').innerText(),
    };

    metrics.scales[tag] = scales;
    metrics.layout[tag] = {};
    for (const route of ['/', '/pengalaman', '/tentang', '/kontak']) {
      await page.goto(`${baseURL}/#${route}`);
      await page.locator('h1').waitFor();
      metrics.layout[tag][route] = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
    }
    await page.close();
  }

  // 3. Reduced motion: every animated value already final, no GSAP inline overrides.
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await page.addInitScript(() => { try { sessionStorage.setItem('anung-intro', 'seen'); } catch { /* optional */ } });
  await page.goto(`${baseURL}/#/pengalaman`);
  await page.locator('.timeline').waitFor();
  await page.waitForTimeout(1200);
  metrics.reducedMotion.pengalaman = await page.evaluate(() => ({
    counters: [...document.querySelectorAll('[data-count]')].map(el => ({ declared: el.dataset.count, shown: el.textContent, parent: el.parentElement.textContent })),
    bars: [...document.querySelectorAll('[data-bar]')].map(el => ({ transform: getComputedStyle(el).transform, inline: el.style.transform || null, width: el.getBoundingClientRect().width })),
  }));
  await page.goto(`${baseURL}/#/tentang`);
  await page.locator('.gpa-ring-value').waitFor();
  await page.waitForTimeout(1200);
  metrics.reducedMotion.tentang = await page.evaluate(() => {
    const arc = document.querySelector('[data-arc]');
    const fill = document.querySelector('[data-bar-fill]');
    return {
      arc: { attribute: arc.getAttribute('stroke-dashoffset'), computed: getComputedStyle(arc).strokeDashoffset, inline: arc.style.strokeDashoffset || null },
      fill: { inlineWidth: fill.style.width, transform: getComputedStyle(fill).transform },
    };
  });
  await page.close();
} finally {
  await browser.close();
}

await writeFile(`${output}/metrics.json`, `${JSON.stringify(metrics, null, 2)}\n`);

const failures = [];
for (const [theme, pairs] of Object.entries(metrics.contrast)) {
  for (const [id, entry] of Object.entries(pairs)) if (!entry.passes) failures.push(`${theme}/${id} ${entry.ratio}:1 < ${entry.required}:1`);
}
for (const [tag, scales] of Object.entries(metrics.scales)) {
  if (Math.abs(scales.toefl.measuredFraction - scales.toefl.expectedFraction) > 0.01) failures.push(`${tag} TOEFL fraction ${scales.toefl.measuredFraction}`);
  if (Math.abs(scales.toefl.startsAtScaleFloorPx) > 1.5) failures.push(`${tag} TOEFL bar does not start at the scale floor`);
  if (Math.abs(scales.split.ratio - 2) > 0.05) failures.push(`${tag} split ratio ${scales.split.ratio}`);
  if (Math.abs(scales.timeline.sharedMonths - 4) > 0.1) failures.push(`${tag} shared months ${scales.timeline.sharedMonths}`);
  if (Math.abs(scales.gpaRing.drawnFraction - 3.74 / 4) > 0.0001) failures.push(`${tag} GPA arc ${scales.gpaRing.drawnFraction}`);
}
for (const [tag, routes] of Object.entries(metrics.layout)) {
  for (const [route, fits] of Object.entries(routes)) if (!fits) failures.push(`${tag} ${route} overflows horizontally`);
}
for (const counter of metrics.reducedMotion.pengalaman.counters) {
  if (counter.shown !== counter.declared) failures.push(`counter ${counter.declared} shows ${counter.shown}`);
}
if (metrics.reducedMotion.tentang.arc.inline) failures.push('GPA arc carries a GSAP inline override under reduced motion');

const lowest = Math.min(...Object.values(metrics.contrast).flatMap(pairs => Object.values(pairs).map(entry => entry.ratio)));
console.log(`contrast pairs checked: ${PAIRS.length * 2}, lowest ${lowest}:1`);
console.log(`TOEFL fraction ${metrics.scales['1440'].toefl.measuredFraction} (expected ${metrics.scales['1440'].toefl.expectedFraction})`);
console.log(`split ratio ${metrics.scales['1440'].split.ratio}, shared months ${metrics.scales['1440'].timeline.sharedMonths}`);
console.log(`GPA arc fraction ${metrics.scales['1440'].gpaRing.drawnFraction}`);
if (failures.length) { console.error('FAIL:'); failures.forEach(line => console.error(` - ${line}`)); process.exit(1); }
console.log('verify-kirim-3 OK');
