# Progress — Putaran 2

Sumber pekerjaan: `plan.md` (2026-09-20). Papan putaran 1 sudah tutup;
ringkasannya ada di bagian "Arsip" `plan.md`, riwayat penuh di git dan
`docs/evidence/kirim-1` … `kirim-5`.

**Aturan.** Satu baris hanya `DONE` kalau kolom Bukti memuat sesuatu yang bisa
dijalankan ulang oleh orang lain. "Kelihatannya jalan" bukan bukti. Angka
diukur, tidak dikutip.

Status: `TODO` · `WIP` · `BLOCKED` · `DONE` · `SKIP`

---

## Ringkasan

| Blok | Isi | Item | Done |
|---|---|---|---|
| A | Bug | 2 | 2 |
| B | Hutang yang belum mendarat di `main` | 2 | 2 |
| C | Rombak visualisasi timeline | 1 | 1 |
| D | Poles visual menyeluruh | 1 | 1 |
| — | **Total** | **6** | **6** |

Urutan kerja: A → B → C → D. BLOK D hanya dimulai setelah A, B, C lolos.

## Baseline `main` 7b3e322, diukur 2026-09-20

Ini pembanding "sebelum" yang sah untuk putaran ini. Semua diukur di mesin dan
sesi yang sama, bukan dikutip dari catatan lama.

| Metrik | Nilai | Cara ukur |
|---|---|---|
| `npm test` | 196 passed, exit 0, 5,0 menit | `npx playwright test` |
| Build entry JS | 279,73 kB raw / 85,62 kB gzip | `npm run build` |
| Chunk route | Experience 10,59 · About 6,16 · Contact 15,82 kB | keluaran build |
| Console error | 0 | Playwright MCP, `#/pengalaman` |
| Elemen `[data-reveal]` tersangkut `opacity: 0` di `#/pengalaman` | **6–9 dari 10** (race) | gulir ke dasar, ukur 10× sampai 10,8 s |
| `dist/images/og-cover.png` | **tidak ada** | `ls` setelah build |
| Lighthouse mobile | diukur di `a764db0`, bukan di 7b3e322: performance 96 · 96 · 90 · 90, a11y/best-practices/SEO 100 di semua halaman | `mercusuar.mjs`, dua putaran |
| CLS mobile | Beranda 0 · Pengalaman 0 · **Tentang 0,1602** · **Kontak 0,1602** | idem, terulang di dua putaran |

---

## BLOK A — Bug

| ID | Item | Status | Bukti |
|---|---|---|---|
| BUG-1 | Sepertiga bawah `#/pengalaman` permanen `opacity: 0`; tween dibuat sebelum gerbang `revealed`, semua penyelamat dipasang sesudahnya | DONE | [`docs/evidence/putaran-2/bug-1/`](docs/evidence/putaran-2/bug-1/): gerbang urutan lifecycle gagal 4/4 di `a49750b`; hasil akhir 12/12 lolos (4 route × 4 project + animasi normal), test resmi terfokus 24/24, build exit 0. |
| BUG-2 | Intro splash terlalu cepat; teks utuh hanya ±20 ms | DONE | [`docs/evidence/putaran-2/bug-2/`](docs/evidence/putaran-2/bug-2/): baseline 4/4 gagal (34,0–50,4 ms); hasil akhir 12/12 lolos, jendela baca min 1000,0 ms, total max 2072 ms, skip/reduced motion/session lolos, test resmi terfokus 16/16, build exit 0. |

### Catatan BUG-1

Diukur di `main` 7b3e322, `#/pengalaman`, viewport 1440×1000, gulir wheel asli
sampai `scrollY 5026` dari `scrollHeight 6026`, lalu diam. `opacity` diambil
sepuluh kali sampai 10,8 detik — tetap `0` di semua pengukuran.

Enam elemen: `section.organizations`, empat `<article>` di dalamnya (BEM SB
IPB, IDEANATION, ADDVENTURES 8.0, ABEST Internship Program), dan
`section.contact-callout`.

**Akarnya sudah ditemukan — jangan investigasi ulang.** Uraian lengkap beserta
tabel empat penyelamat yang gagal ada di `plan.md` BLOK A. Ringkasnya: tween
reveal dibuat di dalam `gsap.context` **sebelum** gerbang
`if (!revealed) return` di `src/motion.js:231`, sedangkan keempat penyelamat
(backstop `refresh`, ResizeObserver, `refresh()`, jaring 5 detik) baru dipasang
**sesudah** gerbang itu. Menyembunyikan sebelum gerbang, menyelamatkan sesudah
gerbang.

Bukti kunci: resize viewport 1440→1441 px tidak mengubah apa pun, jadi
ResizeObserver-nya memang tidak terpasang; dan MutationObserver mencatat **0
tulisan** ke atribut `style` selama 9 detik, jadi jaring 5 detik memang tidak
pernah berjalan.

Ini race: load pertama 6 dari 10 elemen tersangkut, load berikutnya **9 dari
10**. **P0-2 dari putaran 1 dengan demikian bocor**, meski ditandai DONE di
papan lama.

196 test lolos sambil bug ini hidup. Tidak ada test yang menuntut konten
benar-benar terlihat setelah pengguna berhenti menggulir.

### Catatan BUG-2

Dihitung dari `src/App.jsx:56-63`: huruf "Halo." selesai 0,50 s · caption
selesai 0,50 s · konten mulai diangkat 0,52 s · tirai selesai ±1,10 s.
Teks utuh dan diam hanya ±20 ms. `setTimeout(skip, 2000)` di `src/App.jsx:53`
ikut dinaikkan kalau durasi intro bertambah.

---

## BLOK B — Hutang yang belum mendarat di `main`

Branch `fase/img-1`, `fase/img-2`, `fase/vis-1` lahir **sebelum** refactor
Kirim 5. `git merge` akan menghapus `src/pages/`, `src/seo.js`, `src/site.js`,
`src/image-manifest.json`. **Port diff-nya, jangan merge.**

| ID | Item | Status | Bukti |
|---|---|---|---|
| DEBT-1 | Turunkan rupa VIS-1 (`6b10739`) ke `main` | DONE | [`docs/evidence/putaran-2/debt-1/`](docs/evidence/putaran-2/debt-1/): diff hanya `src/motion.js` + `src/styles.css` (63 tambah, 52 hapus); `tests/` tidak berubah; `npm test` 196/196 lolos dalam 3,8 menit. |
| DEBT-2 | Pasang `public/images/og-cover.png` dari `0adb7e5` | DONE | [`docs/evidence/putaran-2/debt-2/`](docs/evidence/putaran-2/debt-2/): sumber, publik, dan hasil build PNG 1200×630 dengan hash identik; metadata menunjuk ke `/images/og-cover.png`; HTTP 200; reproduksi bersih identik; audit 15 berkas, 0 temuan. Preview LinkedIn/WhatsApp nyata tetap menunggu domain hidup. |

### Koreksi terhadap papan lama — penting

Papan putaran 1 menandai **VIS-1 `DONE` (1/1)** dan P2-23/P1-8/P1-9 `DONE`.
**Itu salah untuk `main`.** Rupa VIS-1 tidak pernah mendarat; ia berhenti di
branch `fase/vis-1`. Buktinya di `main` hari ini, `src/motion.js:60-73`, semua
baris `REVEAL_TIMING` masih identik `duration: 0.9, ease: 'power3.out'`, dan
komentar di atasnya menyatakan nilainya memang ditinggalkan untuk pass visual.
Commit `c89885e` di `main` bahkan berjudul "catat suite penuh di main **tanpa
rupa VIS-1**".

Laporan penutup putaran 1 hanya menyebut IMG-2 dan Kirim 6 sebagai fase
terbuka. Itu tidak lengkap: VIS-1 juga belum mendarat.

Sampai DEBT-1 selesai, **P1-8, P1-9, dan P2-23 berstatus kerangka saja** —
penanda dan strukturnya ada, rupanya tidak.

---

## BLOK C — Rombak visualisasi timeline

| ID | Item | Status | Bukti |
|---|---|---|---|
| VIZ-1 | Rombak "Rentang waktu magang" jadi Gantt terbaca: dua kolom, kisi 11 bulan, sumbu di atas, overlap jadi pita bukan baris | DONE | [`docs/evidence/putaran-2/viz-1/`](docs/evidence/putaran-2/viz-1/): 8 potret sebelum/sesudah (1440px + 390px × terang/gelap); 14 pasangan kontras, 0 gagal, terendah 4,947:1; 8 lebar 320–1920px, 0 gagal; dua test pengganti gagal 8/8 di DOM lama yang sudah diberi atribut baru, lolos 8/8 sesudahnya; `npm test` 200 passed. |

Diminta langsung oleh pemilik; rupa sekarang ditolak. Enam cacat dan arah
desainnya ada di `plan.md` BLOK C.

**Ini satu-satunya blok yang boleh mengubah `tests/`.** Empat assertion
mengunci bentuk lama: `tests/portfolio.spec.js:611` (`.timeline-row` tepat 4),
`:626` (geometri `.timeline-overlap`), `:639` (teks periode overlap), `:640`
(`.timeline-axis` persis `"Sep 2025Jul 2026"`). Keempatnya memotret bentuk,
bukan kebenaran. Gantinya wajib ditulis dan wajib sama kerasnya — lima
invarian di `plan.md` BLOK C. Melonggarkan tanpa pengganti = gagal.

Urutan: DEBT-1 dulu, baru VIZ-1. Sebagian rupa timeline dari VIS-1 akan
ditimpa blok ini, tapi bagian non-timeline (ring IPK, bar TOEFL, split bar,
ritme reveal) tetap harus mendarat lebih dulu.

---

## BLOK D — Poles visual menyeluruh

| ID | Item | Status | Bukti |
|---|---|---|---|
| POLISH-1 | Skala spacing bertoken, skala tipografi, ritme vertikal, easing hover/focus, radius/bayangan | DONE | [`docs/evidence/putaran-2/polish-1/`](docs/evidence/putaran-2/polish-1/): 32 potret (4 halaman × terang/gelap × 1440px/390px, sebelum dan sesudah); angka px lepas untuk jarak 57 → 1; ukuran font teks tampak 36 → 19 nilai; durasi transisi 5 → 2; radius 5 → 3; padding vertikal per halaman 7/7/5/6 → 3/3/3/3; kontras 1240 simpul / 96 pasangan / 0 gagal di kedua kolom; 64 kombinasi lebar 320–1920px, 0 gagal; Lighthouse CLS Tentang & Kontak 0,1602 → 0,0000; `npm test` 200 passed tanpa menyentuh `tests/`. |

---

## Yang sengaja tidak dikerjakan putaran ini

| Item | Alasan |
|---|---|
| Foto/video asli dari Anung | Belum dikirim. Tiga slot bukti tetap placeholder jujur bercaption, bukan blocker. |
| Deploy | Keputusan pemilik. |
| `VITE_SITE_URL` | Domain final belum ada. Canonical, `og:url`, `sitemap.xml`, `llms.txt` memakai host placeholder `https://anung-ramadhan.example`; `npm run build` memperingatkan setiap kali. |
| `VITE_WEB3FORMS_KEY` | Tanpa kunci, form kontak jatuh ke draf `mailto:` dan copy-nya mengatakan persis itu. Uji sampai inbox menunggu kunci asli. |
| P2-31 bilingual · P2-27 prerender/SSG · P2-25 subset font · P2-24 SVG manual | Di-SKIP sejak putaran 1; alasan masih berlaku, ada di `plan.md`. |

## Slot yang masih placeholder

Tiga slot bukti di halaman Pengalaman, `placeholder: true` di `src/data.js`
dan `data-placeholder="true"` di DOM, dengan caption yang menyatakan
statusnya: `konten-sosial`, `video-produk`, `webinar-b2b`.

Cara menukar: taruh berkas di `assets/source/placeholder/<slot-id>.png`
(1200×900), jalankan `node scripts/prepare-assets.mjs`, hapus
`placeholder: true`, tulis ulang `caption` dan `alt`, tambah baris di
`docs/asset-provenance.md`. Tidak ada JSX yang perlu ditulis ulang.

`anymind-pantene-team.webp` bukan placeholder — itu foto asli milik Anung.

---

## Catatan keputusan

Diisi saat pengerjaan berlangsung: apa yang diputuskan, kenapa, dan apa yang
dilepas.

- **2026-09-20** — Papan putaran 1 diganti papan ini. Alasannya bukan
  kerapian: papan lama menyatakan VIS-1 sudah mendarat padahal tidak, dan
  menyatakan P0-2 tertutup padahal bocor. Papan yang salah lebih berbahaya
  daripada papan yang panjang.
- **2026-09-20** — `BUG-3` (glitch) dicabut atas keputusan pemilik: dianggap
  tidak ada. Tidak pernah direproduksi, jadi tidak ada yang hilang selain
  baris `BLOCKED`. Kalau gejalanya muncul lagi, buka sebagai item baru
  dengan langkah reproduksi.
- **2026-09-20** — `tests/` dibuka untuk BLOK C saja. Empat assertion timeline
  memotret bentuk lama; mempertahankannya berarti mengunci desain yang sudah
  ditolak pemilik.
- **2026-09-20 — BUG-1.** Gerbang regresi ditempatkan di
  `docs/evidence/putaran-2/bug-1/`, bukan `tests/`, karena aturan putaran hanya
  membuka `tests/` pada BLOK C. Probe natural race lolos sekali pada snapshot
  baseline, jadi pembeda baseline memakai invarian deterministik: guard
  `revealed` dan deadline native wajib terpasang sebelum `gsap.context`.
  Test perilaku tetap mengunci nol konten tersembunyi di 4 route × 4 project,
  dan test pendamping membuktikan tween normal masih hidup.
- **2026-09-20 — BUG-2.** Jeda baca dibuat sebagai pause wall-clock 950 ms
  sesudah tween teks selesai, bukan menambah tween visual palsu. Pause dimulai
  20 ms setelah posisi final agar WebKit mendapat satu frame stabil. Timeline
  nominal tetap 1,12 detik; waktu nyata intro 1,77–2,07 detik. Safety dinaikkan
  ke 2,4 detik, 328 ms di atas hasil terlama.
- **2026-09-20 — DEBT-1.** Diff VIS-1 dipindahkan manual ke arsitektur Kirim 5;
  branch lama tidak di-merge. Tidak ada token atau pasangan warna berubah, jadi
  item ini tidak melahirkan rasio kontras baru. Provisioner Python dari skill
  Arch tidak menemukan CLI Python `playwright`; verifikasi dialihkan ke paket
  Node proyek dan launch nyata ketiga engine berhasil sebelum suite penuh.
- **2026-09-20 — DEBT-2.** Checkout lama membawa versi
  `docs/asset-provenance.md` sebelum gambar responsif Kirim 5. Bagian itu tidak
  diambil; dokumentasi responsif dipertahankan dan hanya catatan IMG-2 yang
  ditambahkan. Kartu memakai crop foto asli serta teks lokal, tanpa model
  gambar. LinkedIn Post Inspector dan pratinjau WhatsApp nyata menunggu domain
  hidup dan deploy.

- **2026-09-20 — VIZ-1.** Pita overlap digambar sebagai potongan per baris di
  dalam track masing-masing, bukan satu elemen yang membentang lintas baris
  lewat CSS Grid. Alasannya: baris yang membentang butuh penempatan grid
  eksplisit yang pecah begitu layout menumpuk di mobile, sedangkan dua potongan
  di baris yang bersentuhan terbaca sebagai satu pita utuh dan tetap masuk akal
  setelah menumpuk.
- **2026-09-20 — VIZ-1.** Kalimat "4 bulan dengan dua magang berjalan
  bersamaan" dipindah jadi `sr-only` di dalam `<figcaption>`. Cacat 6 menuntut
  kalimat lead berhenti mengulang isi pita, tapi faktanya tidak boleh hanya
  hidup di elemen `aria-hidden`. Chip "4 bulan bersamaan" mengurus mata,
  kalimat penuh mengurus pembaca layar, dan tidak ada yang dobel di layar.
- **2026-09-20 — VIZ-1.** `plan.md` menyebut ambang kuartal "di bawah 700px";
  yang dipakai breakpoint 767px yang sudah ada. Menambah breakpoint keempat
  hanya untuk satu langkah label akan menambah satu titik patah baru ke
  `src/styles.css` yang justru mau dirapikan BLOK D.
- **2026-09-20 — VIZ-1.** Label sumbu terakhir dipaku ke ujung sumbu, bukan ke
  posisi bulannya. Diukur: di 1024px teks di posisi 90,9% menggantung 1px di
  luar sumbu, di 320px menggantung 8px. Bulan itu memang bulan terakhir
  rentang, jadi memaku labelnya di ujung tetap jujur.
- **2026-09-20 — VIZ-1.** Periode pindah ke bawah barnya di <=767px. Test
  `all pages keep readable text` melarang teks tampak di bawah 14px, dan bar
  24px selebar 102px di 320px tidak muat memuat periode 14px di dalamnya.
  Invarian test ikut berubah dari "periode di dalam kotak bar" jadi "periode
  menempel pada rentang barnya dan tidak keluar track" — dua hal yang sama-sama
  bisa gagal, bukan pelonggaran.
- **2026-09-20 — VIZ-1.** Suite naik 196 -> 200 karena satu test lama diganti
  dua test baru (geometri + gerbang kisi dekoratif) di 4 project. Tidak ada
  cakupan yang hilang.

- **2026-09-20 — POLISH-1.** Ritme vertikal dan skala tipografi dibuat fluid
  (`clamp`) antara 390px dan 1440px, bukan bertingkat per breakpoint. Yang
  tersisa di dalam `@media (max-width: ...)` hanya perubahan layout: kolom yang
  runtuh, elemen yang muncul atau hilang. Terukur: 163 → 81 baris di dalam
  ketiga media query itu, dan nilai padding berbeda per halaman 7/7/5/6 →
  3/3/3/3.
- **2026-09-20 — POLISH-1.** `h1` yang tadinya punya tiga ukuran berbeda
  (`.hero`, `.page-heading`, `.about-hero`) plus override mobile disatukan jadi
  satu token `--display`. Konsekuensinya judul halaman di 1440px turun 100px →
  95px dan `h1` di 768px turun 78px → ~65px. Disengaja: dua ukuran untuk judul
  utama di satu situs bukan skala, itu dua keputusan yang kebetulan berdampingan.
- **2026-09-20 — POLISH-1.** `main:empty { min-height: calc(100dvh -
  var(--header-height)); }` ditambahkan walau tidak ada di daftar lima poin.
  Alasannya: mengukur Lighthouse sebagai pembanding sebelum/sesudah memunculkan
  CLS **0,1602** di Tentang dan Kontak, terulang di dua putaran, sedangkan
  gerbang putaran menuntut CLS ≤ 0,01. `<main>` kosong satu putaran jaringan
  saat chunk rute malas datang, jadi footer duduk di bawah header lalu turun.
  Perbaikannya satu aturan CSS di berkas yang memang boleh disentuh item ini,
  tanpa menyentuh `src/App.jsx`. Hasil: 0,0000.
- **2026-09-20 — POLISH-1.** Sisa jujur VIZ-1 ditutup di sini: anotasi pita
  "4 bulan bersamaan" di ≤767px sekarang berlatar `var(--paper)` dan selebar
  isinya, jadi tumpahannya terbaca sebagai chip yang duduk di atas pita, bukan
  teks yang memotong garis tepi pita.
- **2026-09-20 — POLISH-1.** Durasi hover 620ms pada `.feature-photo` dan
  `.feature-art` ikut disamakan jadi 320ms. Itu satu-satunya durasi yang rasanya
  berubah jelas; 620ms untuk skala 1,022 membuat gambar terasa menyeret, dan
  tidak ada alasan tertulis untuk nilai itu.
- **2026-09-20 — POLISH-1.** Nilai reveal di `src/motion.js` tidak disentuh
  walau prompt mengizinkan nilai estetis di berkas itu. Poin 4 `plan.md` bicara
  soal hover/focus; ritme reveal per jenis konten baru mendarat lewat DEBT-1 dan
  mengubahnya berarti membuang keputusan yang sudah diverifikasi.
- **2026-09-20 — POLISH-1.** Performance Lighthouse mobile berhenti di 96–98
  dan tidak stabil di 98, jadi gerbang ≥98 putaran ini belum terpenuhi utuh. Tidak dinaikkan dengan cara lain:
  penyebabnya bundel JS 279,74 kB (React + GSAP + ikon), di luar jangkauan CSS
  dan di luar scope item ini. Yang bisa dibuktikan di mesin yang sama hanya arah
  dan besarnya: 90 → 97–98 di dua rute terburuk, dua putaran di tiap kolom.

## Log verifikasi

Diisi per item saat selesai: perintah yang dijalankan, keluarannya, dan di
mana buktinya disimpan (`docs/evidence/putaran-2/`).

- **BUG-1 — 2026-09-20.** `npx playwright test --config
  docs/evidence/putaran-2/bug-1/playwright.config.js`: 12 passed final; guard
  yang sama 4 failed di snapshot `a49750b`. Test resmi terfokus: 24 passed.
  `npm run build`: exit 0. Bukti dan perintah ulang:
  [`docs/evidence/putaran-2/bug-1/`](docs/evidence/putaran-2/bug-1/).
- **BUG-2 — 2026-09-20.** `npx playwright test --config
  docs/evidence/putaran-2/bug-2/playwright.config.js`: 12 passed; test timing
  yang sama di snapshot `a49750b`: 4 failed. Jendela baca final minimum
  1000,0 ms; total intro maksimum 2072 ms. Test resmi terfokus: 16 passed.
  `npm run build`: exit 0. Bukti:
  [`docs/evidence/putaran-2/bug-2/`](docs/evidence/putaran-2/bug-2/).
- **BLOK A — gerbang akhir 2026-09-20.** Snapshot bersih dibuat dari
  `git archive HEAD` sehingga perubahan BLOK B di worktree tidak ikut diuji.
  `npm test`: **196 passed (3,9 menit)**, exit 0. `npm run build`: exit 0,
  Vite 8.3.0 mentransformasi 4579 modul. Ringkasan:
  [`docs/evidence/putaran-2/`](docs/evidence/putaran-2/).
- **DEBT-1 — 2026-09-20.** `git diff --stat` hanya menyebut `src/motion.js`
  dan `src/styles.css` (63 tambah, 52 hapus); `tests/` tidak berubah.
  `npm test`: **196 passed (3,8 menit)**, exit 0, pada Chromium desktop,
  Chromium mobile, Firefox, dan WebKit. Bukti:
  [`docs/evidence/putaran-2/debt-1/`](docs/evidence/putaran-2/debt-1/).
- **DEBT-2 — 2026-09-20.** `npm run build`: exit 0, 4579 modul.
  `dist/images/og-cover.png`: PNG 1200×630, hash sama dengan sumber dan aset
  publik. `verify-delivery.mjs`: HTTP 200 `image/png`, metadata OG/Twitter
  cocok, regenerasi bersih byte-identik. `audit.py`: 15 berkas, 0 temuan, 5
  umpan negatif tertolak. Kontras bordo/krem 8,881:1 dan hijau/krem 8,956:1.
  Bukti: [`docs/evidence/putaran-2/debt-2/`](docs/evidence/putaran-2/debt-2/).
- **VIZ-1 — 2026-09-20.** `npx playwright test`: **200 passed (3,7 menit)**,
  exit 0, 4 project. Gerbang DOM lama: snapshot `git archive 9b7b4d8` yang
  sudah diberi `data-months` dan `data-range` tetap **8 failed / 8** pada dua
  test baru — gagal di `.timeline-row` toHaveCount (3 diminta, 4 ada) dan
  `.timeline-bar` toHaveLength (3 diminta, 4 ada). `contrast.mjs`: 14 pasangan,
  0 gagal, terendah `.timeline-band-note` gelap 4,947:1 terhadap ambang 4,5:1.
  `measure.mjs`: 8 lebar 320–1920px, 0 gagal. `npm run build`: exit 0, 4579
  modul. Bukti: [`docs/evidence/putaran-2/viz-1/`](docs/evidence/putaran-2/viz-1/).
- **POLISH-1 — 2026-09-20.** `npx playwright test`: **200 passed (3,7 menit)**,
  exit 0, `tests/` tidak berubah sebaris pun. `npm run build`: exit 0, 4579
  modul, CSS 39,66 → 41,98 kB mentah tetapi 11,38 → 11,03 kB gzip.
  `kosakata.sh`: angka px lepas untuk jarak **57 → 1** (sisanya `margin: -1px`
  di `.sr-only`). `ritme.mjs`: ukuran font teks tampak **36 → 19** nilai,
  durasi transisi **160/180/250/320/620ms → 220/320ms**, radius **5 → 3**,
  padding vertikal per halaman **7/7/5/6 → 3/3/3/3**. `kontras.mjs`: 1240
  simpul, 96 pasangan, **0 gagal** sebelum dan sesudah, terendah 5,806:1.
  `lebar.mjs`: 64 kombinasi 320–1920px × 2 tema × 4 halaman, **0 gagal**.
  `mercusuar.mjs`: CLS Tentang dan Kontak **0,1602 → 0,0000**, performance
  **90 → 97–98**, a11y/best-practices/SEO 100 di semua halaman. Bukti:
  [`docs/evidence/putaran-2/polish-1/`](docs/evidence/putaran-2/polish-1/).
