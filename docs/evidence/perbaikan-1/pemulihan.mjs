// Mematikan setiap trigger reveal yang belum sempat menyala, lalu menggulir ke
// dasar halaman. Itu persis kegagalan yang dilaporkan: tidak ada lagi yang
// tersisa untuk mengembalikan isinya. Argumen: rute ('#/', '#/pengalaman', ...).
import { chromium, firefox } from 'playwright';

const engine = { chromium, firefox }[process.env.ENGINE || 'chromium'];
const hash = process.argv[2] || '#/';
const browser = await engine.launch();
const context = await browser.newContext({ viewport: { width: 1840, height: 1130 } });
const page = await context.newPage();
page.on('pageerror', error => console.log('PAGEERROR:', error.message));
await page.goto('http://localhost:5173/' + hash, { waitUntil: 'load' });
await page.waitForFunction(() => !document.querySelector('.splash'), null, { timeout: 30000 });
await page.waitForTimeout(900);

const killed = await page.evaluate(async () => {
  const { ScrollTrigger } = await import('/src/motion-runtime.js');
  let gone = 0;
  for (const trigger of ScrollTrigger.getAll()) {
    if (trigger.animation && !trigger.animation.progress()) { trigger.kill(false); gone++; }
  }
  return gone;
});
// Hanya yang benar-benar ada di layar yang dihitung: yang di bawah lipatan
// memang belum waktunya tampil.
const hidden = () => page.evaluate(() => {
  let count = 0;
  for (const el of document.querySelectorAll('[data-reveal], [data-reveal-group] > *, [data-mask], [data-bar], [data-bar-fill], [data-arc]')) {
    const style = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    if ((Number(style.opacity) < 0.99 || style.clipPath.includes('100%')) && box.top < innerHeight && box.bottom > 0) count++;
  }
  return count;
});

for (let i = 0; i < 18; i++) { await page.mouse.wheel(0, 800); await page.waitForTimeout(60); }
await page.waitForTimeout(1500);
const langsung = await hidden();
// Jaring pengaman 5 detik di `usePageMotion` akhirnya menyapu semuanya; kolom
// kedua menunjukkan bahwa yang lama pun pulih, hanya terlambat beberapa detik.
await page.waitForTimeout(6000);
const kemudian = await hidden();
console.log(`${hash.padEnd(13)} trigger dimatikan=${String(killed).padStart(2)}  tersembunyi di layar: langsung=${langsung}  setelah 6 detik=${kemudian}`);
await browser.close();
