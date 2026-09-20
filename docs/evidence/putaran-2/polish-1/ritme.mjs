// Ukur ritme vertikal, skala tipografi, dan durasi transisi yang benar-benar
// dipakai halaman — bukan yang tertulis di CSS.
// Pakai: node docs/evidence/putaran-2/polish-1/ritme.mjs <sebelum|sesudah>
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const tag = process.argv[2] || 'sesudah';
const base = process.env.BASE || 'http://127.0.0.1:4273';
const ROUTES = [['', 'Beranda'], ['#/pengalaman', 'Pengalaman'], ['#/tentang', 'Tentang'], ['#/kontak', 'Kontak']];
const VIEWS = [[1440, 1000, '1440px'], [390, 844, '390px']];

const probe = () => {
  const round = (value) => Math.round(parseFloat(value) * 10) / 10;
  const sections = [...document.querySelectorAll('main > section, main > div > section, main > .wrap, main > div > .wrap')]
    .filter((el) => el.getClientRects().length)
    .map((el) => {
      const style = getComputedStyle(el);
      return {
        name: el.className.split(' ').filter((part) => part && part !== 'wrap')[0] || el.tagName.toLowerCase(),
        top: round(style.paddingTop),
        bottom: round(style.paddingBottom),
      };
    });
  const fonts = new Map();
  const durations = new Map();
  const radii = new Map();
  const walker = document.createTreeWalker(document.querySelector('.app'), NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const el = node.parentElement;
    if (!node.textContent.trim() || el.closest('.sr-only, [aria-hidden="true"], svg') || !el.getClientRects().length) continue;
    const size = round(getComputedStyle(el).fontSize);
    fonts.set(size, (fonts.get(size) || 0) + 1);
  }
  for (const el of document.querySelectorAll('.app *')) {
    if (!el.getClientRects().length) continue;
    const style = getComputedStyle(el);
    for (const value of style.transitionDuration.split(',')) {
      const ms = Math.round(parseFloat(value) * 1000);
      if (ms > 0) durations.set(ms, (durations.get(ms) || 0) + 1);
    }
    const radius = style.borderRadius;
    if (radius && radius !== '0px') radii.set(radius, (radii.get(radius) || 0) + 1);
  }
  return {
    sections,
    fonts: [...fonts.entries()].sort((a, b) => a[0] - b[0]),
    durations: [...durations.entries()].sort((a, b) => a[0] - b[0]),
    radii: [...radii.entries()].sort((a, b) => b[1] - a[1]),
  };
};

const browser = await chromium.launch();
const result = {};
for (const [width, height, size] of VIEWS) {
  for (const [hash, name] of ROUTES) {
    // Gerak normal: `prefers-reduced-motion` memangkas setiap transisi jadi
    // 0,01 ms, jadi durasi asli hanya terbaca di sini. Satu halaman per rute,
    // supaya yang terukur memang rute itu dan bukan sisa rute sebelumnya.
    const page = await browser.newPage({ viewport: { width, height } });
    await page.addInitScript(() => { try { sessionStorage.setItem('anung-intro', 'seen'); } catch { /* opsional */ } });
    await page.goto(`${base}/${hash}`);
    await page.waitForSelector('main h1');
    await page.waitForTimeout(600);
    result[`${name} ${size}`] = await page.evaluate(probe);
    await page.close();
  }
}
await browser.close();

const lines = [`# Ritme dan skala — ${tag}`, ''];
const union = (key) => {
  const merged = new Map();
  for (const page of Object.values(result)) for (const [value, count] of page[key]) merged.set(value, (merged.get(value) || 0) + count);
  return [...merged.entries()].sort((a, b) => (typeof a[0] === 'number' ? a[0] - b[0] : b[1] - a[1]));
};
lines.push('## Ukuran font teks tampak (gabungan 4 halaman × 2 lebar)', '');
lines.push('| px | jumlah simpul teks |', '|---|---|');
for (const [size, count] of union('fonts')) lines.push(`| ${size} | ${count} |`);
lines.push('', `Nilai berbeda: **${union('fonts').length}**`, '');
lines.push('## Durasi transisi yang hidup di DOM', '');
lines.push('| ms | jumlah elemen |', '|---|---|');
for (const [ms, count] of union('durations')) lines.push(`| ${ms} | ${count} |`);
lines.push('', `Nilai berbeda: **${union('durations').length}**`, '');
lines.push('## Radius yang hidup di DOM', '');
lines.push('| radius | jumlah elemen |', '|---|---|');
for (const [radius, count] of union('radii')) lines.push(`| \`${radius}\` | ${count} |`);
lines.push('', `Nilai berbeda: **${union('radii').length}**`, '');
lines.push('## Padding vertikal tiap section', '');
for (const [page, data] of Object.entries(result)) {
  lines.push(`### ${page}`, '', '| section | padding-top | padding-bottom |', '|---|---|---|');
  for (const section of data.sections) lines.push(`| \`.${section.name}\` | ${section.top}px | ${section.bottom}px |`);
  const values = new Set(data.sections.flatMap((section) => [section.top, section.bottom]));
  lines.push('', `Nilai padding berbeda di halaman ini: **${values.size}**`, '');
}
const path = fileURLToPath(new URL(`./ritme-${tag}.md`, import.meta.url));
await writeFile(path, lines.join('\n'));
console.log(`ritme ${tag} -> ${path}`);
