// Delapan lebar x empat halaman x dua tema: tidak ada geser mendatar, tidak ada
// kotak yang lebih lebar dari layar, tidak ada teks tampak di bawah 14px.
// Pakai: node docs/evidence/putaran-2/polish-1/lebar.mjs
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const base = process.env.BASE || 'http://127.0.0.1:4273';
const ROUTES = [['', 'Beranda'], ['#/pengalaman', 'Pengalaman'], ['#/tentang', 'Tentang'], ['#/kontak', 'Kontak']];
const WIDTHS = [320, 360, 390, 767, 768, 1024, 1440, 1920];

const browser = await chromium.launch();
const rows = [];
for (const width of WIDTHS) {
  for (const theme of ['light', 'dark']) {
    for (const [hash, name] of ROUTES) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.addInitScript((value) => {
        try { localStorage.setItem('anung-theme', value); sessionStorage.setItem('anung-intro', 'seen'); } catch { /* opsional */ }
      }, theme);
      await page.goto(`${base}/${hash}`);
      await page.waitForSelector('main h1');
      await page.waitForTimeout(400);
      rows.push({ width, theme, name, ...await page.evaluate(() => {
        const overflow = document.documentElement.scrollWidth - innerWidth;
        let widest = 0;
        let widestName = '';
        // Sesuatu yang lebih lebar dari layar tidak apa-apa selama ada leluhur
        // yang memotongnya -- pita marquee memang selebar dua salinan teksnya.
        const clipped = (el) => {
          for (let current = el.parentElement; current && current !== document.body; current = current.parentElement) {
            const overflow = getComputedStyle(current).overflowX;
            if (overflow === 'hidden' || overflow === 'clip') return true;
          }
          return false;
        };
        for (const el of document.querySelectorAll('.app *')) {
          const box = el.getBoundingClientRect();
          if (!box.width || getComputedStyle(el).position === 'fixed' || clipped(el)) continue;
          if (box.right - box.left > widest) { widest = box.right - box.left; widestName = el.className || el.tagName; }
        }
        const small = [];
        const walker = document.createTreeWalker(document.querySelector('.app'), NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const node = walker.currentNode;
          const el = node.parentElement;
          if (!node.textContent.trim() || el.closest('.sr-only, [aria-hidden="true"], svg') || !el.getClientRects().length) continue;
          if (parseFloat(getComputedStyle(el).fontSize) < 14) small.push(node.textContent.trim().slice(0, 30));
        }
        return { overflow, widest: Math.round(widest), widestName: String(widestName).slice(0, 40), small };
      }) });
      await page.close();
    }
  }
}
await browser.close();

const bad = rows.filter((row) => row.overflow > 0 || row.small.length || row.widest > row.width);
const lines = ['# Lebar — sesudah', '', `${rows.length} kombinasi (8 lebar x 2 tema x 4 halaman).`, '',
  '| Lebar | Tema | Halaman | Geser mendatar | Kotak terlebar | Teks <14px | Hasil |', '|---|---|---|---|---|---|---|'];
for (const row of rows) {
  const pass = row.overflow <= 0 && !row.small.length && row.widest <= row.width;
  lines.push(`| ${row.width} | ${row.theme === 'light' ? 'terang' : 'gelap'} | ${row.name} | ${row.overflow}px | ${row.widest}px | ${row.small.length} | ${pass ? 'LOLOS' : 'GAGAL'} |`);
}
lines.push('', `**${bad.length} gagal.**`);
if (bad.length) for (const row of bad) lines.push(`- ${row.width}px ${row.name} ${row.theme}: geser ${row.overflow}px, terlebar ${row.widest}px \`${row.widestName}\`, kecil ${JSON.stringify(row.small)}`);
const path = fileURLToPath(new URL('./lebar.md', import.meta.url));
await writeFile(path, lines.join('\n'));
console.log(`lebar: ${rows.length} kombinasi, ${bad.length} gagal -> ${path}`);
process.exit(bad.length ? 1 : 0);
