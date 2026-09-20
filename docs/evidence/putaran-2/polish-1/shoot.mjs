// Potret penuh empat halaman, dua tema, dua lebar.
// Pakai: node docs/evidence/putaran-2/polish-1/shoot.mjs <sebelum|sesudah>
// Server pratinjau harus hidup di 127.0.0.1:4273 (`npx vite preview --port 4273`).
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const tag = process.argv[2] || 'sesudah';
const base = process.env.BASE || 'http://127.0.0.1:4273';
const out = new URL(`./${tag}/`, import.meta.url);
await mkdir(out, { recursive: true });
const file = (name) => fileURLToPath(new URL(name, out));

const ROUTES = [['', 'beranda'], ['#/pengalaman', 'pengalaman'], ['#/tentang', 'tentang'], ['#/kontak', 'kontak']];
const VIEWS = [[1440, 1000, '1440'], [390, 844, '390']];

const browser = await chromium.launch();
let shots = 0;
for (const [width, height, size] of VIEWS) {
  for (const theme of ['light', 'dark']) {
    // Satu halaman per rute. Berpindah lewat hash di halaman yang sama hanya
    // memicu transisi klien, dan potret bisa terambil saat rute lama masih
    // terpasang.
    for (const [hash, name] of ROUTES) {
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.addInitScript((value) => {
        try { localStorage.setItem('anung-theme', value); sessionStorage.setItem('anung-intro', 'seen'); } catch { /* opsional */ }
      }, theme);
      await page.goto(`${base}/${hash}`);
      await page.waitForSelector('main h1');
      await page.waitForTimeout(700);
      // Potret halaman penuh sebagai PNG berukuran belasan MB tidak layak masuk
      // repo; WebP lossless-mendekati menyimpan hal yang sama jauh lebih kecil.
      const shot = await page.screenshot({ fullPage: true });
      await sharp(shot).webp({ quality: 88 }).toFile(file(`./${name}-${size}-${theme}.webp`));
      shots++;
      await page.close();
    }
  }
}
await browser.close();
console.log(`${shots} potret ${tag} selesai`);
