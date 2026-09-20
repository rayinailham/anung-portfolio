// Mencicip posisi huruf pertama kata intro setiap frame, sejak cat pertama.
// Argumen: nama kolom ('sebelum' / 'sesudah'). Server dev harus hidup di 5173.
import { chromium, firefox } from 'playwright';

const engine = { chromium, firefox }[process.env.ENGINE || 'chromium'];
const browser = await engine.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
await page.addInitScript(() => {
  window.__introY = [];
  const sample = () => {
    const letter = document.querySelector('.splash-word span');
    if (letter) window.__introY.push(Math.round(new DOMMatrixReadOnly(getComputedStyle(letter).transform).f));
    if (window.__introY.length < 600) requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
});
await page.goto('http://localhost:5173/', { waitUntil: 'commit' });
await page.waitForTimeout(3000);

const travel = await page.evaluate(() => window.__introY);
// Rapatkan nilai berurutan yang sama supaya bentuk geraknya terbaca.
const shape = travel.filter((y, i) => y !== travel[i - 1]);
const backwards = shape.filter((y, i) => i > 0 && y > shape[i - 1] + 2);
console.log(`${process.env.ENGINE || 'chromium'} | frame=${travel.length} | frame pertama=${travel[0]}px | bentuk=${JSON.stringify(shape.slice(0, 8))} | tarikan mundur=${backwards.length}`);
await browser.close();
