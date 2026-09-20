// Lighthouse mobile terhadap build produksi yang dilayani `vite preview`.
// Chrome-nya memakai Chromium milik Playwright supaya tidak ada dependensi baru.
// Pakai: node docs/evidence/putaran-2/polish-1/mercusuar.mjs <sebelum|sesudah>
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const tag = process.argv[2] || 'sesudah';
const base = process.env.BASE || 'http://127.0.0.1:4273';
const ROUTES = [['/', 'Beranda'], ['/#/pengalaman', 'Pengalaman'], ['/#/tentang', 'Tentang'], ['/#/kontak', 'Kontak']];

const chrome = await launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
});

const lines = [`# Lighthouse mobile — ${tag}`, '', `Base: ${base}`, '',
  '| Halaman | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |', '|---|---|---|---|---|---|---|---|'];
const summary = {};
for (const [path, name] of ROUTES) {
  const result = await lighthouse(`${base}${path}`, { port: chrome.port, output: 'json', logLevel: 'error' });
  const { categories, audits } = result.lhr;
  const score = (key) => Math.round(categories[key].score * 100);
  const row = {
    performance: score('performance'),
    accessibility: score('accessibility'),
    'best-practices': score('best-practices'),
    seo: score('seo'),
    lcp: audits['largest-contentful-paint'].displayValue,
    cls: audits['cumulative-layout-shift'].numericValue,
    tbt: audits['total-blocking-time'].displayValue,
  };
  summary[name] = row;
  lines.push(`| ${name} | ${row.performance} | ${row.accessibility} | ${row['best-practices']} | ${row.seo} | ${row.lcp} | ${row.cls.toFixed(4).replace('.', ',')} | ${row.tbt} |`);
}
await chrome.kill();

const path = fileURLToPath(new URL(`./lighthouse-${tag}.md`, import.meta.url));
await writeFile(path, lines.join('\n'));
await writeFile(fileURLToPath(new URL(`./lighthouse-${tag}.json`, import.meta.url)), JSON.stringify(summary, null, 2));
console.log(lines.join('\n'));
