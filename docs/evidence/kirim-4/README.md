# Bukti Kirim 4 — Konversi

Semua angka di bawah berasal dari berkas di folder ini, bukan dari pengamatan mata.

- `metrics.json` — keluaran `node scripts/verify-kirim-4.mjs`.
- `verify.txt` — ringkasan keluaran skrip itu, `exit=0`.
- `full-suite.txt` — `npm test`.
- `build.txt` — `npm run build`, exit 0.
- Screenshot: 3 bagian × {1440, 390} × {terang, gelap} + 4 keadaan form.

## Dua server, karena backend form ditentukan saat build

`VITE_WEB3FORMS_KEY` dibaca saat build, jadi satu server tidak bisa menunjukkan
kedua jalur sekaligus.

| Server | Kunci | Yang dibuktikan di sana |
|---|---|---|
| `http://127.0.0.1:4173` — `vite preview` atas `dist/` | kosong | markup sosial, WhatsApp, preview CV, kontras, layout, jalur `mailto:` |
| `http://127.0.0.1:5174` — `vite dev` | `uji-kunci-bukan-kunci-asli` | keadaan mengirim, terkirim, gagal server, jaringan mati |

Kunci di server kedua palsu dan setiap permintaan dijawab secara lokal oleh
Playwright. **Tidak ada satu pun permintaan yang keluar dari mesin ini**, dan
tidak ada pesan yang benar-benar dikirim ke siapa pun.

## P1-10 — Form kontak

`metrics.json` → `formFallback` dan `backend`.

| Keadaan | `data-status` | Yang terukur |
|---|---|---|
| tanpa kunci, ditekan | `drafted` | tombol `"Buka draf email"`, copy footer tetap kalimat lama, status menyebut `anungramadhan17@gmail.com` |
| mengirim | `sending` | tombol terkunci (`buttonDisabled: true`, `aria-busy="true"`), label `"Mengirim..."`, `access_key` ikut di badan permintaan |
| terkirim | `sent` | `"Pesan terkirim ke anungramadhan17@gmail.com. Saya membacanya dari sana."`, kolom pesan kosong lagi, tidak ada blok fallback |
| server balas 500 | `failed` | status `"Pesan belum terkirim..."`, tautan `mailto:` muncul, isi yang diketik masih di form |
| jaringan diputus (`route.abort`) | `failed` | sama, plus `fallbackCarriesMessage: true` dan tombol bisa dipakai lagi |

Badan permintaan yang benar-benar dikirim berisi 8 field:
`access_key, botcheck, email, from_name, message, name, subject, topic`.
Subjeknya `"Peluang kerja — dari Rani Pertiwi"`.

Proteksi spam adalah honeypot, bukan CAPTCHA: `input[name="website"]` punya
`tabindex="-1"` dan pembungkusnya `aria-hidden="true"`
(`formFallback.honeypotTabIndex`, `formFallback.honeypotHiddenFromAssistiveTech`).
Test `a filled honeypot sends nothing and the trap stays out of the way`
membuktikan pengiriman dibatalkan diam-diam: `calls` tetap 0.

**Yang belum bisa dibuktikan di fase ini:** pengiriman tes sampai ke inbox
Anung. Itu butuh kunci Web3Forms asli, dan kunci itu belum ada. Sesuai kolom
"Default" di `prompt.md`, UI tetap lengkap, submit jatuh ke `mailto:`, dan test
menutup kedua jalur. Screenshot email masuk menunggu kunci.

## P1-11 — WhatsApp

`metrics.json` → `whatsapp`.

- `https://wa.me/6281388116739?text=...`
- Nomor `6281388116739`, diturunkan dari `profile.phone` — nomornya tetap
  ditulis satu kali saja di `src/data.js`.
- Pesan pembuka: `"Halo Anung, saya melihat portofolio Anda dan ingin berdiskusi soal peluang kerja."`
- `channelsInContactInfo: 3` — WhatsApp, LinkedIn, dan telepon berdiri sejajar;
  WhatsApp yang paling atas.
- `inFooter: 1` — juga ada di footer, di samping LinkedIn dan Email.

## P1-12 — Markup share

`metrics.json` → `socialMarkup`. Dibaca dari dokumen yang **dilayani server**,
bukan dari DOM, karena perayap LinkedIn dan WhatsApp tidak menjalankan
JavaScript.

- `canonicalCount: 1`, `ogUrlCount: 1` — tidak ada string yang diulang.
- `ogUrlEqualsCanonical: true`, `imageSharesCanonicalOrigin: true`,
  `titlesAgree: true` (`og:title` = `twitter:title` = `<title>`).
- `og:image` `…/images/og-cover.png`, `og:image:type image/png`,
  `1200 × 630`, `og:image:alt` 100+ karakter.
- `twitter:card summary_large_image`, `twitter:image` sama dengan `og:image`.
- Semuanya dirender dari `src/site.js` oleh plugin `anung-site-meta` di
  `vite.config.js`; `index.html` cuma memuat penanda `<!--site-meta-->`.

Dua hal yang sengaja belum selesai dan alasannya:

1. `ogImageFilePresent: false` — berkas `public/images/og-cover.png` belum ada.
   Tiketnya `docs/image-jobs/IMG-2-og-image.md`, milik Codex. Tag-nya sudah
   benar dan sudah diuji sebelum berkasnya ada; itu memang kontraknya.
2. `canonical https://anung-ramadhan.example/` — domain belum dipilih, jadi
   `VITE_SITE_URL` kosong dan tag memakai host placeholder `.example` (TLD
   cadangan RFC 2606, jelas bukan alamat nyata). `npm run build` menulis
   peringatan setiap kali itu terjadi — lihat `build.txt`.

Validasi LinkedIn Post Inspector dan pratinjau WhatsApp nyata **belum
dilakukan**, dan tidak bisa dilakukan sebelum dua hal di atas beres: keduanya
menuntut URL publik yang hidup. Itu bukan kelalaian fase ini, itu urutannya.

## P1-13 — Preview CV

`metrics.json` → `cvPreview`, `cvDownloadStillPresent`, `layoutShiftTentang`.

- 2 halaman, `/images/cv-halaman-1.webp` dan `-2.webp`.
- `naturalWidth/Height` 1000 × 1413 **sama persis** dengan atribut
  `width`/`height` yang tertulis — syarat CLS terpenuhi.
- `loading="lazy"` pada keduanya.
- `layoutShiftTentang: 0` — diukur dengan `PerformanceObserver('layout-shift')`
  sambil menggulir seluruh halaman Tentang. CLS 0.008 dari baseline tidak naik.
- `cvDownloadStillPresent: 1` — tombol download tidak hilang.
- Gambarnya render dari PDF asli lewat poppler + sharp
  (`scripts/prepare-assets.mjs`), bukan hasil image gen dan bukan ketikan ulang.
  Provenance ada di `docs/asset-provenance.md`.

## Kontras — 6 pasangan × 2 tema = 12 pemeriksaan

Semua lolos ambang teks 4.5:1. Terendah: **5.806:1**, `cv-preview-lead` tema
terang (`--muted` di atas `--paper`). Itu angka lantai yang sudah tercatat sejak
audit (5.81:1); fase ini tidak menurunkannya dan tidak menambah pasangan baru
yang lebih rendah. Angka tiap pasangan ada di `metrics.json` → `contrast`.

## Lebar

`metrics.json` → `layout`: 12 kombinasi (320, 390, 1440 × empat route) tidak ada
yang meluber horizontal. Footer sekarang memuat satu tautan lagi, jadi
`.site-footer > div` diberi `flex-wrap` di bawah 768px.

## Tidak ada kunci yang ikut ter-commit

`metrics.json` → `buildSecrets`:

- 2 bundel JS dipindai, `leaks: []`.
- `envFilesOnDisk: []` — tidak ada berkas `.env*` selain `.env.example` di mesin
  ini saat build.
- `inlinedFormKeyIsEmpty: true`.
- Pemindaiannya mencari pola UUID (bentuk kunci akses Web3Forms) dan setiap
  nilai dari berkas `.env*` yang ada di disk. Nama variabel `VITE_WEB3FORMS_KEY`
  memang selalu ada di bundel — itu nama properti di `buildSite()`, bukan nilai.
- `git status` bersih dari `.env*`; `.gitignore` sudah menutupnya sejak awal dan
  `!.env.example` yang membuka contohnya.

## Yang tidak diukur di fase ini

- Lighthouse, LCP, dan bundle: milik Kirim 5. Bundel naik dari 297,22 kB jadi
  ~307 kB mentah karena ikon WhatsApp, komponen preview CV, dan modul
  `src/site.js`. Angka baselinenya disentuh di Kirim 5, bukan di sini.
- Rasa visual: ruang kosong di kolom kiri preview CV pada 1440 sengaja
  dibiarkan; itu lapisan Codex (Kirim 6).
- Gambar OG: IMG-2.
