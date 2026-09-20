# Bukti Kirim 5 — Performa, SEO, penutup

Semua angka di bawah diambil pada mesin dan sesi yang sama, 2026-09-20.

## Bundle

`npm run build`, lalu `gzip -c9` dan `brotli -q 11` pada berkas yang sama.

| Berkas | Sebelum (raw / gzip / brotli) | Sesudah (raw / gzip / brotli) |
|---|---|---|
| entry `assets/index-*.js` | 306.206 / 90.725 / 78.435 | **279.718 / 84.398 / 73.034** |
| `assets/motion-runtime-*.js` | 131.506 / 48.739 / 44.018 | 131.506 / 48.739 / 44.018 (tidak berubah) |
| `assets/Experience-*.js` | — | 10.597 / 3.207 / 2.894 |
| `assets/About-*.js` | — | 6.167 / 2.126 / 1.940 |
| `assets/Contact-*.js` | — | 15.826 / 4.815 / 4.162 |

JavaScript yang diminta saat Beranda dibuka:

| Keadaan | Sebelum | Sesudah |
|---|---|---|
| gerak normal | 437.712 raw / 139.464 gzip | 411.224 raw / 133.137 gzip |
| `prefers-reduced-motion: reduce` | 437.712 raw / 139.464 gzip | **279.718 raw / 84.398 gzip** — `motion-runtime` tidak diminta sama sekali |

Log build: [sebelum](build-sebelum.txt) · [sesudah](build-sesudah.txt).

## Lighthouse mobile

Dijalankan pada build statis (`vite preview`) dengan Chromium bawaan Playwright
lewat `CHROME_PATH`, pengaturan bawaan Lighthouse 13.4.1 (form factor mobile,
throttling `simulate`).

| | Sebelum (`main` c89885e) | Sesudah |
|---|---|---|
| performance | 93 | **98** |
| accessibility | 100 | 100 |
| best-practices | 100 | 100 |
| SEO | 100 | 100 |
| agentic-browsing | 0,67 | **1,00** |
| LCP | 3,1 s (3094 ms) | **2,3 s (2332 ms)** |
| FCP | 1,5 s | 1,5 s |
| Speed Index | 2,7 s | 2,5 s |
| TBT | 20 ms | 20 ms |
| CLS | 0 | 0 |

JSON penuh: [sebelum](lighthouse-mobile-sebelum.json) · [sesudah](lighthouse-mobile-sesudah.json).
Salinan yang "sesudah" juga menjadi `docs/lighthouse-mobile.json` yang dirujuk README.

## Lebar yang benar-benar diunduh

`node scripts/shoot-kirim-5.mjs` terhadap `npm run preview`, dua viewport,
setiap halaman digulir sampai bawah supaya gambar lazy ikut memilih sumbernya.
Skripnya keluar dengan kode 1 kalau ada gambar yang gagal muat atau kotaknya
nol, jadi `picture` yang jatuh dari layout adalah kegagalan, bukan sesuatu yang
harus dilihat dengan mata.

| Halaman | 1440 px | 390 px |
|---|---|---|
| Beranda | potret 440, foto tim 900, ilustrasi 640 (AVIF) | potret 320, foto tim 400, ilustrasi 400 |
| Pengalaman | foto tim 900, tiga cover 480 | foto tim 400, tiga cover 320 |
| Tentang | potret 440, dua halaman CV 1000 | potret 320, dua halaman CV 400 |

`broken: []`. Angka penuh di [gambar-responsif.json](gambar-responsif.json),
tangkapan layar `*-responsif.png` di folder ini.

## Structured data

[Screenshot Rich Results Test](rich-results-test.png) pada potongan HTML yang
persis berisi blok `<script type="application/ld+json">` dari `dist/index.html`.
Hasil: **tidak ada error dan tidak ada warning**; Google melaporkan "No items
detected — No rich results detected in this URL" karena `Person` memang bukan
tipe yang menghasilkan rich result di Google Search, bukan karena markupnya
ditolak. Rinciannya di `progress.md` bagian "Log verifikasi".

## Test

| Run | Hasil |
|---|---|
| [Suite penuh, run 1](suite-penuh-1.txt) | 192 passed — diambil sebelum test `cold deep link` ditambahkan |
| [Suite penuh, run 2](suite-penuh-2.txt) | **196 passed**, exit 0 |
| [Suite penuh, run 3](suite-penuh-3.txt) | **196 passed**, exit 0 |
| [WebKit ×3 ulang](webkit-ulang-3.txt) | exit 0 |
| [Probe `main.jsx` tanpa `.catch`](probe-main-tanpa-catch.txt) | 2/2 lolos — lihat catatan di bawah |

Satu run di antaranya pernah gagal di WebKit dengan
`TypeError: Importing a module script failed.`. Sebabnya kesalahan prosedur:
`src/ui.jsx` dan `src/pages.js` disunting saat suite itu masih berjalan,
sehingga HMR membatalkan modul yang sedang diimpor route `/pengalaman`. Run 2,
run 3 dan WebKit ×3 di atas diambil tanpa satu pun suntingan di tengah, pada
kode yang sama, dan semuanya hijau. Rinciannya di "Log verifikasi" `progress.md`.
