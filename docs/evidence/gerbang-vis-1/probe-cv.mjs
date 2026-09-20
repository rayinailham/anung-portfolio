// Probe deterministik untuk gerbang VIS-1.
//
// Kegagalan aslinya balapan: `img.decode()` di Firefox DITOLAK selama permintaan
// gambar lazy-nya masih di jalan, bukan menunggu permintaan itu selesai. Kalau
// server menjawab cepat, permintaan sudah mendarat sebelum decode dipanggil dan
// test lolos; kalau tidak, test membaca `naturalWidth` 0.
//
// Probe ini menahan respons gambar selama DELAY ms supaya jendela balapan itu
// selalu terbuka, lalu menjalankan dua urutan pada halaman yang sama persis:
//   lama : scrollIntoViewIfNeeded -> decode().catch(() -> {}) -> naturalWidth
//   baru : scrollIntoViewIfNeeded -> tunggu naturalWidth > 0 -> decode()
// Dijalankan di tiga engine supaya terlihat ini perilaku Firefox, bukan bug situs.
import { chromium, firefox, webkit, devices } from '@playwright/test';

const BASE = process.env.PROBE_BASE || 'http://127.0.0.1:5173';
const DELAY = Number(process.env.PROBE_DELAY || 600);
const ROUNDS = Number(process.env.PROBE_ROUNDS || 3);

const engines = [
  ['chromium', chromium, devices['Desktop Chrome']],
  ['firefox', firefox, devices['Desktop Firefox']],
  ['webkit', webkit, devices['Desktop Safari']],
];

async function openPage(browser, device) {
  const context = await browser.newContext({ ...device });
  const page = await context.newPage();
  // Tahan respons gambar CV sesaat; berkasnya tetap berkas asli dari server.
  await page.route('**/images/cv-halaman-1.webp', async route => {
    await new Promise(resolve => setTimeout(resolve, DELAY));
    await route.continue();
  });
  await page.goto(`${BASE}/#/tentang`);
  await page.locator('.splash').waitFor({ state: 'detached' });
  return { context, page };
}

const results = [];
for (const [name, engine, device] of engines) {
  const browser = await engine.launch();
  for (let round = 1; round <= ROUNDS; round++) {
    // Urutan lama, persis seperti test sebelum perbaikan.
    {
      const { context, page } = await openPage(browser, device);
      const image = page.locator('.cv-pages img').first();
      await image.scrollIntoViewIfNeeded();
      const row = await image.evaluate(async el => {
        const decoded = await el.decode().then(() => 'ok', error => `${error.name}: ${error.message}`);
        return { decoded, natural: el.naturalWidth };
      });
      results.push({ engine: name, round, urutan: 'lama', ...row, lolos: row.natural > 0 });
      await context.close();
    }
    // Urutan baru: tunggu muatannya mendarat lebih dulu, lalu decode wajib sukses.
    {
      const { context, page } = await openPage(browser, device);
      const image = page.locator('.cv-pages img').first();
      await image.scrollIntoViewIfNeeded();
      const deadline = Date.now() + 10000;
      let natural = 0;
      while (natural === 0 && Date.now() < deadline) {
        natural = await image.evaluate(el => el.naturalWidth);
        if (natural === 0) await page.waitForTimeout(100);
      }
      const row = await image.evaluate(async el => {
        const decoded = await el.decode().then(() => 'ok', error => `${error.name}: ${error.message}`);
        return { decoded, natural: el.naturalWidth };
      });
      results.push({ engine: name, round, urutan: 'baru', ...row, lolos: row.natural > 0 && row.decoded === 'ok' });
      await context.close();
    }
  }
  await browser.close();
}

for (const row of results) console.log(JSON.stringify(row));
const lamaGagal = results.filter(row => row.urutan === 'lama' && !row.lolos);
const baruGagal = results.filter(row => row.urutan === 'baru' && !row.lolos);
console.log(`delay=${DELAY}ms rounds=${ROUNDS} · urutan lama gagal ${lamaGagal.length}/${results.length / 2} · urutan baru gagal ${baruGagal.length}/${results.length / 2}`);
console.log(`engine yang menolak decode saat permintaan masih di jalan: ${[...new Set(lamaGagal.map(row => row.engine))].join(', ') || 'tidak ada'}`);
process.exit(baruGagal.length === 0 ? 0 : 1);
