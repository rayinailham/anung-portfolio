// Ukur tiga hal yang bisa pecah diam-diam saat lebar berubah:
// label sumbu yang menggantung di luar sumbu, periode yang lepas dari barnya
// atau keluar track, dan halaman yang jadi bisa digeser mendatar.
// Pakai: node docs/evidence/putaran-2/viz-1/measure.mjs
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
let failed = 0;
for (const width of [320, 370, 390, 767, 768, 1024, 1440, 1920]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:5173/#/pengalaman');
  await page.waitForSelector('.timeline-axis');
  const out = await page.evaluate(() => {
    const axis = document.querySelector('.timeline-axis').getBoundingClientRect();
    const ticks = [...document.querySelectorAll('.timeline-tick')]
      .filter(element => getComputedStyle(element).display !== 'none')
      .map(element => ({ text: element.textContent, right: element.getBoundingClientRect().right }));
    const periods = [...document.querySelectorAll('.timeline-row')].map(row => {
      const bar = row.querySelector('.timeline-bar').getBoundingClientRect();
      const track = row.querySelector('.timeline-track').getBoundingClientRect();
      const period = row.querySelector('.timeline-period').getBoundingClientRect();
      return {
        bar: Math.round(bar.width),
        atasBar: period.right > bar.left && period.left < bar.right,
        dalamTrack: period.left >= track.left - 0.5 && period.right <= track.right + 0.5,
      };
    });
    return {
      tickLewat: ticks.filter(tick => tick.right > axis.right + 0.5).map(tick => tick.text),
      periods,
      geser: document.documentElement.scrollWidth > innerWidth,
    };
  });
  const bad = out.tickLewat.length > 0 || out.geser || out.periods.some(p => !p.atasBar || !p.dalamTrack);
  if (bad) failed++;
  console.log(`${width}px | label lewat sumbu: ${out.tickLewat.length ? out.tickLewat.join(', ') : 'tidak ada'} | bar px: ${out.periods.map(p => p.bar).join(', ')} | periode nempel barnya: ${out.periods.every(p => p.atasBar)} | periode dalam track: ${out.periods.every(p => p.dalamTrack)} | geser mendatar: ${out.geser} | ${bad ? 'GAGAL' : 'LOLOS'}`);
  await page.close();
}
await browser.close();
console.log(`\n8 lebar diperiksa, ${failed} gagal.`);
process.exit(failed ? 1 : 0);
