// Kontras teks nyata: setiap simpul teks tampak diukur terhadap latar efektifnya
// yang dihitung dari rantai leluhur, bukan dari daftar pasangan yang diketik
// tangan. Empat halaman x dua tema x dua lebar.
// Pakai: node docs/evidence/putaran-2/polish-1/kontras.mjs [sebelum|sesudah]
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const tag = process.argv[2] || 'sesudah';
const base = process.env.BASE || 'http://127.0.0.1:4273';
const ROUTES = [['', 'Beranda'], ['#/pengalaman', 'Pengalaman'], ['#/tentang', 'Tentang'], ['#/kontak', 'Kontak']];
const VIEWS = [[1440, 1000, '1440px'], [390, 844, '390px']];

const probe = () => {
  const parse = (value) => {
    const parts = value.match(/[\d.]+/g);
    if (!parts) return null;
    return [Number(parts[0]), Number(parts[1]), Number(parts[2]), parts[3] === undefined ? 1 : Number(parts[3])];
  };
  const over = (front, back) => front.slice(0, 3).map((value, index) => value * front[3] + back[index] * (1 - front[3]));
  const channel = (value) => { const c = value / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const luminance = (rgb) => 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
  const ratio = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const key = (el) => {
    const classes = [...el.classList].filter((name) => name !== 'wrap').slice(0, 2).join('.');
    return classes ? `${el.tagName.toLowerCase()}.${classes}` : el.tagName.toLowerCase();
  };

  const rows = [];
  const skipped = [];
  const walker = document.createTreeWalker(document.querySelector('.app'), NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const el = node.parentElement;
    if (!node.textContent.trim() || el.closest('.sr-only, [aria-hidden="true"], svg') || !el.getClientRects().length) continue;
    const style = getComputedStyle(el);
    const colour = parse(style.color);
    const box = el.getBoundingClientRect();
    // Sebuah lapisan bisa dilukis oleh saudara yang diposisikan absolut di
    // belakang teks -- .timeline-bar-fill contohnya. Rantai leluhur saja akan
    // melewatkannya dan melaporkan kertas di atas kertas.
    const behind = (current) => {
      for (const sibling of current.parentElement ? current.parentElement.children : []) {
        if (sibling === current) continue;
        const siblingStyle = getComputedStyle(sibling);
        if (siblingStyle.position !== 'absolute' || siblingStyle.backgroundImage !== 'none') continue;
        const background = parse(siblingStyle.backgroundColor);
        if (!background || background[3] !== 1) continue;
        const rect = sibling.getBoundingClientRect();
        if (rect.left <= box.left + 0.5 && rect.right >= box.right - 0.5 && rect.top <= box.top + 0.5 && rect.bottom >= box.bottom - 0.5) return background;
      }
      return null;
    };
    let stack = [];
    let painted = null;
    let image = false;
    for (let current = el; current; current = current.parentElement) {
      const currentStyle = getComputedStyle(current);
      if (currentStyle.backgroundImage !== 'none') { image = true; break; }
      const background = parse(currentStyle.backgroundColor);
      if (background && background[3] > 0) {
        stack.push(background);
        if (background[3] === 1) { painted = background; break; }
      }
      const sibling = behind(current);
      if (sibling) { stack.push(sibling); painted = sibling; break; }
    }
    if (image || !painted) { skipped.push(key(el)); continue; }
    let backdrop = painted.slice(0, 3);
    for (const layer of stack.slice(0, -1).reverse()) backdrop = over(layer, backdrop);
    const size = parseFloat(style.fontSize);
    const weight = Number(style.fontWeight) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    rows.push({ key: key(el), ratio: ratio(over(colour, backdrop), backdrop), threshold: large ? 3 : 4.5, size });
  }
  return { rows, skipped: [...new Set(skipped)] };
};

const browser = await chromium.launch();
const worst = new Map();
const skipped = new Set();
let checked = 0;
for (const [width, height, size] of VIEWS) {
  for (const theme of ['light', 'dark']) {
    for (const [hash, name] of ROUTES) {
      // Satu halaman per rute: pindah lewat hash saja bisa terukur saat rute
      // lama masih terpasang.
      const page = await browser.newPage({ viewport: { width, height } });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.addInitScript((value) => {
        try { localStorage.setItem('anung-theme', value); sessionStorage.setItem('anung-intro', 'seen'); } catch { /* opsional */ }
      }, theme);
      await page.goto(`${base}/${hash}`);
      await page.waitForSelector('main h1');
      await page.waitForTimeout(600);
      const data = await page.evaluate(probe);
      for (const value of data.skipped) skipped.add(value);
      for (const row of data.rows) {
        checked++;
        const id = `${theme === 'light' ? 'terang' : 'gelap'} | \`${row.key}\``;
        const previous = worst.get(id);
        if (!previous || row.ratio < previous.ratio) worst.set(id, { ...row, page: `${name} ${size}` });
      }
      await page.close();
    }
  }
}
await browser.close();

const rows = [...worst.entries()].sort((a, b) => a[1].ratio - b[1].ratio);
const failed = rows.filter(([, row]) => row.ratio < row.threshold);
const lines = [`# Kontras teks nyata — ${tag}`, '',
  `${checked} simpul teks diukur, ${rows.length} pasangan unik (selektor x tema).`,
  'Ambang AA: 4,5:1 teks biasa, 3:1 teks besar (>=24px, atau >=18,66px tebal).', '',
  '| Tema / selektor | px | Rasio terburuk | Ambang | Diukur di | Hasil |', '|---|---|---|---|---|---|'];
for (const [id, row] of rows) {
  lines.push(`| ${id} | ${row.size} | ${row.ratio.toFixed(3).replace('.', ',')}:1 | ${String(row.threshold).replace('.', ',')}:1 | ${row.page} | ${row.ratio >= row.threshold ? 'LOLOS' : 'GAGAL'} |`);
}
lines.push('', `**${failed.length} gagal.**`, '',
  'Dilewati karena latarnya gambar atau gradien, bukan warna datar: ' + (skipped.size ? [...skipped].map((value) => `\`${value}\``).join(', ') : 'tidak ada') + '.');
const path = fileURLToPath(new URL(`./kontras-${tag}.md`, import.meta.url));
await writeFile(path, lines.join('\n'));
console.log(`kontras ${tag}: ${checked} simpul, ${rows.length} pasangan, ${failed.length} gagal -> ${path}`);
process.exit(failed.length ? 1 : 0);
