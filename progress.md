# Progress — Perbaikan Portofolio Anung

Sumber temuan: `plan.md` (audit 2026-09-18).
Aturan: satu baris hanya boleh jadi `DONE` kalau ada bukti verifikasi yang tertulis di kolom Bukti. "Kelihatannya jalan" bukan bukti.

Status: `TODO` · `WIP` · `BLOCKED` · `DONE` · `SKIP`

---

## Ringkasan

Rencana eksekusi: **6 fase kode + 2 tiket gambar**. Satu prompt untuk semuanya —
lihat "PROMPT UNIVERSAL" di `prompt.md`. Agent menentukan sendiri fase mana yang
jadi giliran dengan membaca tabel di bawah: fase bernomor paling kecil yang
belum seluruhnya `DONE`/`SKIP`.

| Fase | Isi | Harness | Item | Done |
|---|---|---|---|---|
| 1 | Bug P0 + semua perbaikan mekanis | Claude Code | 10 | 10 |
| 2 | Bukti kerja + ruang mati | Claude Code | 7 | 7 |
| IMG-1 | Cover placeholder galeri bukti | Codex | 1 | 1 |
| 3 | Kerangka visualisasi data + timeline | Claude Code | 2 | 2 |
| VIS-1 | Rasa visual + animasi (gerbang test ditutup Claude Code) | Codex | 1 | 1 |
| 4 | Konversi | Claude Code | 4 | 4 |
| IMG-2 | Gambar OG 1200×630 | Codex | 1 | 0 |
| 5 | Performa, SEO, penutup | Claude Code | 6 | 6 |
| 6 | Pass poles visual terakhir | Codex | 1 | 0 |
| — | **Total dikerjakan** | | **33** | **31** |
| — | Sengaja di-SKIP | | 3 | — |

Di-SKIP supaya scope-nya masuk akal (alasan lengkap di `prompt.md`):
`P2-31` bilingual · `P2-27` prerender/SSG · `P2-25` subset font.
`P1-6` diturunkan jadi deep-link anchor, bukan halaman case study terpisah.
`P2-24` dibatasi code-split saja, Phosphor tidak diganti SVG manual.

Baseline sebelum pengerjaan (jangan sampai turun):
- Lighthouse mobile: performance 93 · a11y 100 · best-practices 100 · SEO 100 · agentic-browsing 0.67
- LCP 2.9s · FCP 1.7s · CLS 0.008 · TBT 110ms
- Bundle: 413.852 B raw / 132.009 B gzip
- Playwright: 9 skenario × 4 project, semua lolos
- Console error: 0

---

## Kirim 1 — Bug P0 + semua perbaikan mekanis

| ID | Item | Status | Bukti |
|---|---|---|---|
| P0-1 | Filter pengalaman menghapus `.organizations` + `ContactCallout` | DONE | [Regresi sebelum](docs/evidence/kirim-1/regression-before.txt): `Expected: "1"`, `Received: "0"`, `1 failed`. [Sesudah](docs/evidence/kirim-1/regression-after.txt): `1 passed (4.6s)`. Seluruh kategori + refresh geometri stale + timeout ticker mati lolos di [88 test](docs/evidence/kirim-1/full-suite.txt). [Screenshot](docs/evidence/kirim-1/filter-after.png). |
| P0-2 | Reveal tanpa jaring pengaman — konten hilang kalau ScrollTrigger gagal | DONE | Runtime motion opsional; GSAP diblokir di dev pada empat engine dan pada build statis. [metrics.json](docs/evidence/kirim-1/metrics.json): empat route, 179 node teks diperiksa, `hidden: []`, `inert: false`, runtime error 0. [Screenshot tanpa GSAP](docs/evidence/kirim-1/gsap-blocked-experience.png). |
| P2-15 | Mode gelap kehilangan aksen (`--green: #f5dabf` = `--ink`) | DONE | `--green: #7fb3a8`; kontras 6,159:1 di `#102e2b`, 5,268:1 di `#163a36`; semua pasangan AA ([angka](docs/evidence/kirim-1/metrics.json)). [Sebelum](docs/evidence/kirim-1/home-dark-before.png) / [sesudah](docs/evidence/kirim-1/home-dark-after.png). |
| P2-16 | Crop potret memotong logo "AnyM" | DONE | Logo AnyMind utuh: hero [sebelum](docs/evidence/kirim-1/home-light-before.png)/[sesudah](docs/evidence/kirim-1/home-light-after.png), kartu [sebelum](docs/evidence/kirim-1/feature-before.png)/[sesudah](docs/evidence/kirim-1/feature-after.png), Tentang [sebelum](docs/evidence/kirim-1/about-light-before.png)/[sesudah](docs/evidence/kirim-1/about-light-after.png). [390px](docs/evidence/kirim-1/mobile-portrait-after.png). |
| P2-17 | Asterisk menumpuk di lengan subjek | DONE | Asterisk kiri atas, di luar siluet lengan/jam tangan. Hero [sebelum](docs/evidence/kirim-1/home-light-before.png)/[sesudah](docs/evidence/kirim-1/home-light-after.png); [mobile](docs/evidence/kirim-1/mobile-portrait-after.png). |
| P2-19 | Disclosure membuka tanpa animasi | DONE | Transisi tinggi grid 320ms: test mencatat tinggi antara 0 dan tinggi akhir, lalu memastikan refresh saat membuka/menutup. Reduced motion langsung final. [88 test](docs/evidence/kirim-1/full-suite.txt). |
| P2-20 | Accordion hanya satu terbuka | DONE | Dua detail terbuka bersamaan (`aria-expanded=true` berjumlah 2), penutupan independen; tiap perubahan tinggi memicu refresh. [Test](docs/evidence/kirim-1/full-suite.txt), [screenshot](docs/evidence/kirim-1/two-disclosures-after.png). |
| P2-21 | Intro memblokir kunjungan pertama termasuk deep link | DONE | Deep link sesi baru: splash false, inert false, form opacity 1 ([angka](docs/evidence/kirim-1/metrics.json), [screenshot](docs/evidence/kirim-1/contact-deep-link.png)). Test juga menunda motion 1,8 detik: form tetap langsung bisa diisi. Intro 1,10 detik; reload tetap melewati intro. |
| P3-32 | Target sentuh 22px (`.header-cv`, footer LinkedIn, footer Email) | DONE | 390px: Download CV, LinkedIn footer, Email footer masing-masing 32,390625px ≥ 24px ([angka](docs/evidence/kirim-1/metrics.json)); lolos di empat project. |
| P3-33 | `role="img"` pada pita marquee | DONE | Marquee berisi paragraf statis `.sr-only`; visual tetap `aria-hidden=true`; tanpa `role=img`. Assertion DOM/accessibility lolos di [empat project](docs/evidence/kirim-1/full-suite.txt). |

## Kirim 2 — Bukti kerja + ruang mati

| ID | Item | Status | Bukti |
|---|---|---|---|
| P1-4 | Pakai `with_anymind_team.jpg` (AnyMind × Pantene) | DONE | Masuk `scripts/prepare-assets.mjs` → `public/images/anymind-pantene-team.webp` 1200×900, original di root tidak disentuh. Tayang di kartu Beranda dan di slot bukti entri AnyMind pada Pengalaman, keduanya dekat angka 40. `width="1200" height="900"` ada di kedua tempat ([metrics-after.json](docs/evidence/kirim-2/metrics-after.json) → `images`, `declared: true`). Caption memisahkan acara di foto (New Product Launch) dari acara yang dia koordinasikan (Affiliate Gathering) — diuji di `every evidence slot is declared, sized and captioned honestly`. [Sesudah](docs/evidence/kirim-2/pengalaman-1440-light-after.webp). |
| P1-5 | Galeri bukti digerakkan data + placeholder jujur | DONE | `EvidenceGallery` digerakkan `experience[].evidence` di `src/data.js`. 4 slot, 3 di antaranya `placeholder: true` + `data-placeholder="true"` + caption "ilustrasi sementara" sebagai konten, bukan `title`/`alt` ([metrics-after.json](docs/evidence/kirim-2/metrics-after.json) → `evidence`). Dengan seluruh `**/images/placeholder/**` diblokir: 3 request digagalkan, cover tetap 317px, `background: linear-gradient`, `img[data-missing]` disembunyikan, caption terlihat, tanpa overflow horizontal (`blockedPlaceholders`). Test `placeholder covers missing still leave the evidence slots correct`. Kontrak tukar aset: [asset-provenance.md](docs/asset-provenance.md). Cover editorial lewat tiket IMG-1. |
| P1-3 | Hentikan 1 foto dipakai 3×; beri gambar ke halaman Pengalaman | DONE | Audit crop lintas 4 route: **sebelum** `/images/anung-profile.webp` muncul dengan dua crop berbeda ([metrics-before.json](docs/evidence/kirim-2/metrics-before.json) → `imagesReusedWithDifferentCrop: ["/images/anung-profile.webp"]`); **sesudah** daftar itu kosong ([metrics-after.json](docs/evidence/kirim-2/metrics-after.json)). Kartu Unicharm sekarang memakai foto tim asli. Potret tersisa 2× dengan crop identik `0.90 cover 50% 100%` (hero + Tentang). Test `no image is reused with a different crop` lolos di 4 project. |
| P1-7 | Fakta CV yang hilang (profit bazar IDR 100k, 11 laporan BEM, konteks perusahaan) | DONE | Empat fakta ditambahkan, tiap angka dikutip bersama baris CV sumbernya di tabel "Kutipan CV" di bawah. Test `CV facts that were missing are on the page with their own numbers`. Tidak ada angka baru di luar CV. |
| P2-14 | Ruang mati: hero, `.section-heading`, `.intro-section`, `.experience-side` | DONE | Angka terukur 1440px, `align-self: start` supaya tinggi intrinsik terbaca. Hero: jarak kosong teks→potret **528px → 268px**. `.section-heading`: paragraf pindah ke baris yang sama dengan judul (`headingLeadOnSameRow` **false → true**). `.intro-section`: `padding-block` 128→104px, kolom kicker **319px → 33px** karena kini memuat 3 fakta CV. Kartu Pengalaman: selisih tinggi kolom **344+295+322 = 961px → 202+180+180 = 562px**. [before](docs/evidence/kirim-2/metrics-before.json) / [after](docs/evidence/kirim-2/metrics-after.json). Screenshot 3 halaman × 1440/390 × terang/gelap di `docs/evidence/kirim-2/`. |
| P1-6 | Kartu Beranda deep-link ke anchor entri yang tepat | DONE | Hash dipecah jadi route + anchor (`splitHash` di `src/App.jsx`). Kartu Unicharm → `#/pengalaman#entri-anymind`, kartu Anima → `#/pengalaman#entri-anima-digital`. Test `deep link from a Beranda card lands on its own experience entry` memeriksa URL dan posisi entri (`top < 260px`, `bottom > 0`) di 4 project. Tidak ada halaman case study terpisah. |
| P2-18 | ContactCallout identik di 3 halaman | DONE | Tiga heading berbeda + lead per konteks + label tombol berbeda. Test `the contact callout says something different on each page` memastikan `new Set(headings).size === 3`. |

### Kutipan CV untuk P1-7

Setiap angka baru beserta baris asalnya di `Anung Hanindhita Ramadhan-CV.pdf`.

| Yang ditulis di situs | Baris CV |
|---|---|
| "Profit lebih dari Rp100.000 · 30+ transaksi produk · Nilai A untuk inovasi produk, pelaksanaan bisnis, dan evaluasi kinerja pasar" (Tentang) | "Achieved over IDR 100,000 in profit and completed 30+ product transactions" · "Earned an A grade for product innovation, business execution, and market performance evaluation." |
| "menyusun 11 laporan keuangan bulanan termasuk rangkuman tengah dan akhir periode, menyiapkan laporan keuangan untuk 3+ program departemen, serta membimbing 5 peserta magang selama satu bulan" (BEM SB IPB) | "Prepared 11 comprehensive monthly financial reports, including mid-year and end-of-term summaries" · "Prepared financial reports for 3+ departmental programs" · "Coordinated and trained 5 internship participants ... over a one-month period." |
| "Mengadakan 20+ barang kebutuhan acara, berkoordinasi dengan 3+ vendor, membuat 5+ jenis dekorasi, dan menuntaskan 7+ misi respons cepat" (ADDVENTURES 8.0) | "Responsible for procuring 20+ items" · "Coordinated with 3+ vendors" · "Designed and created 5+ types of decorations" · "successfully completing over 7 missions." |
| "AnyMind Group adalah perusahaan teknologi BPaaS ... di 15 pasar Asia dan Timur Tengah." (konteks entri AnyMind) | "AnyMind Group is a BPaaS technology company delivering integrated solutions for marketing, e-commerce, digital transformation, logistics, and creator monetization across 15 markets in Asia and the Middle East." |
| "PT Sutan Vet Medika adalah startup kesehatan hewan ... teruji klinis ... imunitas, pengelolaan stres, kesehatan kulit, serta nafsu makan." (konteks dua entri Sutan Vet Medika) | "PT Sutan Vet Medika is a pet healthcare startup offering innovative and clinically tested supplements under the Anima Companion brand. Products focus on immunity, stress management, skin health, and appetite." |
| "IPK 3.74/4.00", "TOEFL ITP 583", "Lulus Agu 2026" (kolom intro Beranda) | "Bachelor of Business, 3.74/4.00" · "Aug 2022 - Aug 2026" · "TOEFL ITP Score 583" |
| "Sarjana Bisnis, IPB University", "AnyMind Group · PT Sutan Vet Medika", "Bekasi, Jawa Barat" (meta hero) | "Institut Pertanian Bogor ... Bachelor of Business" · dua entri Pengalaman Kerja · "Bekasi, West Java, Indonesia" |

Tidak ada angka lain yang ditambahkan. Permintaan "naikkan angka" tetap ditolak.

## IMG-1 — Cover placeholder galeri bukti · Codex

Tiket: [`docs/image-jobs/IMG-1-bukti-placeholder.md`](docs/image-jobs/IMG-1-bukti-placeholder.md) — cover selesai pada sesi Codex IMG-1; gerbang test dibuka pada sesi tiket Claude Code, hasil verifikasi di bawah.

| ID | Item | Status | Bukti |
|---|---|---|---|
| IMG-1 | 3 cover abstrak (sosial / video / webinar) di `public/images/placeholder/` | DONE | Keenam berkas PNG/WebP 1200×900 selesai; generator bawaan `image_gen`, prompt persis di [provenance](docs/asset-provenance.md). [Ukuran + hash + DOM](docs/evidence/kirim-img-1/metrics.json), [screenshot](docs/evidence/kirim-img-1/README.md), build lolos. **Gerbang test sudah lolos**: kegagalan WebKit `interrupted transition` ternyata race di `src/App.jsx`, bukan aset — [diagnosis + bukti](docs/evidence/gerbang-img-1/README.md). WebKit `-g 'interrupted transition'` lolos 5/5 run berturut ([log](docs/evidence/gerbang-img-1/webkit-gerbang-5-run.txt)); `npm test` penuh exit 0 **116 passed** dua kali ([1](docs/evidence/gerbang-img-1/suite-penuh-sesudah.txt), [2](docs/evidence/gerbang-img-1/suite-penuh-sesudah-2.txt)). |

## Kirim 3 — Kerangka visualisasi data + timeline

Kerangka saja: markup final, angka jujur, teks alternatif, nilai akhir
reduced-motion, test. Boleh selesai dalam keadaan polos — rasanya digarap VIS-1.

| ID | Item | Status | Bukti |
|---|---|---|---|
| P1-8 | Ring IPK · bar TOEFL · split 100/50 Shopee-TikTok · counter halaman Pengalaman | DONE | Empat visual SVG/CSS inline, tanpa pustaka chart. Skala dikunci berangka di [metrics.json](docs/evidence/kirim-3/metrics.json): arc IPK `drawnFraction 0.935001` = 3.74/4.00; bar TOEFL `measuredFraction 0.7439` = `expectedFraction 0.7439` pada skala penuh ITP 310–677 dengan `startsAtScaleFloorPx: 0`; split `ratio: 2` dengan dua segmen menutup seluruh track dan caption "penjumlahan dua platform, bukan hitungan orang unik"; 6 counter `[data-count]` dengan "+" di luar elemen counter. Reduced motion: 6 counter `shown === declared`, 6 `[data-bar]` `transform: none`, arc `inline: null`. Test `data visuals keep an honest scale in the DOM`, `experience counters carry the CV number and keep their suffix outside it`, `GSAP blocked still leaves every data visual on its final value` di 4 project. 40 pemeriksaan kontras lolos, terendah teks 5.806:1. [Screenshot + ringkasan](docs/evidence/kirim-3/README.md). |
| P1-9 | Timeline karier yang menunjukkan periode tumpang tindih | DONE | Satu sumbu 11 bulan (Sep 2025 – Jul 2026) di atas daftar kartu, digerakkan `start`/`end` di `src/data.js`. Terukur di 1440, 390, dan 320: AnyMind bulan 4→8, Sutan Vet koordinasi 4→11, Sutan Vet digital 0→4, dan baris "Dua magang bersamaan" 4→8 — `sharedMonths: 4`. Bulan tumpang tindih dihitung dari data, tidak diketik. `.timeline-note` menyatakan PT Sutan Vet Medika muncul 2 kali sebagai perusahaan yang sama dengan dua periode dan dua peran. Test `the career timeline draws the two overlapping internships on one axis` di 4 project. [metrics.json](docs/evidence/kirim-3/metrics.json) → `scales.*.timeline`, [screenshot](docs/evidence/kirim-3/README.md). |

## VIS-1 — Rasa visual + animasi · Codex

Implementasi rupa dan bukti dikerjakan sesi Codex; gerbang `npm test` yang
tertinggal ditutup sesi tiket Claude Code 2026-09-20
([`docs/evidence/gerbang-vis-1/`](docs/evidence/gerbang-vis-1/README.md)).
Catatan balik ada di
[`docs/visual-jobs/VIS-1-visualisasi-data.md`](docs/visual-jobs/VIS-1-visualisasi-data.md).

| ID | Item | Status | Bukti |
|---|---|---|---|
| P2-23 | Kosakata reveal terlalu seragam, plus pass rasa atas seluruh keluaran Kirim 3 | DONE | Ring–angka menyatu, kisi timeline 11 bulan, bar/counter dan timing per jenis selesai. Build + skrip Kirim 3 + probe rupa/motion lolos; 56 screenshot sebelum/sesudah, 40 pasangan kontras standar dan 6 pasangan terhadap lapisan kisi/track lolos. [Bukti rupa](docs/evidence/vis-1/README.md). **Gerbang:** kegagalan `npm test` yang ditinggalkan sesi Codex — Firefox, preview CV, `naturalWidth` 0 — dilacak sampai akarnya dan diperbaiki di sesi tiket Claude Code: `img.decode()` ditolak Firefox (`EncodingError: Invalid image request.`) selama permintaan gambar lazy-nya masih di jalan, penolakan itu ditelan `.catch(() => {})`, lalu `naturalWidth` dibaca sebelum muatannya mendarat. Bukan ulah VIS-1: kegagalan yang sama muncul 3/3 pada `main` 54f05e1 tanpa satu pun perubahan VIS-1. Perbaikan ada di test, bukan aplikasi, dan menambah assertion alih-alih melonggarkan. Sesudahnya `npm test` **164 passed** dua run berturut, `verify-kirim-3.mjs` dan `verify-polish.mjs` mengembalikan angka VIS-1 yang sama persis. [Bukti gerbang](docs/evidence/gerbang-vis-1/README.md). |

## Kirim 4 — Konversi

Backend form dan domain sama-sama belum punya kredensial. Kolom "Default" di
`prompt.md` dipakai apa adanya: UI lengkap di kedua jalur, test menutup keduanya.
Semua angka di bawah berasal dari
[`docs/evidence/kirim-4/`](docs/evidence/kirim-4/README.md).

| ID | Item | Status | Bukti |
|---|---|---|---|
| P1-10 | Backend form kontak nyata (mailto jadi fallback) | DONE | Web3Forms lewat `VITE_WEB3FORMS_KEY`, dibaca dari `src/site.js`. Lima keadaan terukur di [metrics.json](docs/evidence/kirim-4/metrics.json) → `formFallback`, `backend`: tanpa kunci `drafted` (tombol "Buka draf email", copy lama utuh); `sending` (tombol terkunci, `aria-busy="true"`, `access_key` terkirim); `sent` ("Pesan terkirim ke anungramadhan17@gmail.com. Saya membacanya dari sana.", kolom pesan kosong, tanpa klaim waktu balasan); server 500 → `failed` + tautan `mailto:`; jaringan diputus (`route.abort`) → `failed`, `fallbackCarriesMessage: true`, tombol bisa dipakai lagi, isi form tidak hilang. Honeypot `input[name="website"]` `tabindex="-1"` di pembungkus `aria-hidden="true"`; test membuktikan 0 permintaan terkirim saat terisi. 5 test baru × 4 project. `buildSecrets.leaks: []`. **Sisa:** uji sampai inbox menunggu kunci Web3Forms asli. |
| P1-11 | Tautan WhatsApp `wa.me/6281388116739` | DONE | `https://wa.me/6281388116739?text=Halo%20Anung%2C%20saya%20melihat%20portofolio%20Anda%20dan%20ingin%20berdiskusi%20soal%20peluang%20kerja.` Nomor diturunkan dari `profile.phone`, jadi tetap ditulis sekali saja. [metrics.json](docs/evidence/kirim-4/metrics.json) → `whatsapp`: `channelsInContactInfo: 3` (WhatsApp paling atas, sejajar LinkedIn dan telepon), `inFooter: 1`. Test `WhatsApp stands beside email and LinkedIn with a prefilled Indonesian message` × 4 project. [Screenshot](docs/evidence/kirim-4/kontak-saluran-1440-light.webp) 1440/390 × terang/gelap. |
| P1-12 | `og:image` + `og:url` + `twitter:card` + canonical | DONE | Dirender dari `src/site.js` oleh plugin `anung-site-meta` di `vite.config.js`; `index.html` cuma memuat `<!--site-meta-->`. Diperiksa pada dokumen yang **dilayani**, bukan DOM, karena perayap tidak menjalankan JS: `canonicalCount: 1`, `ogUrlCount: 1`, `ogUrlEqualsCanonical: true`, `imageSharesCanonicalOrigin: true`, `titlesAgree: true`, `og:image:type image/png` 1200×630 dengan `og:image:alt`, `twitter:card summary_large_image`. **Sisa:** berkas `public/images/og-cover.png` menunggu IMG-2 (`ogImageFilePresent: false`), dan canonical masih `https://anung-ramadhan.example/` karena `VITE_SITE_URL` kosong — `npm run build` memperingatkan setiap kali. Validasi LinkedIn Post Inspector + pratinjau WhatsApp nyata menunggu keduanya; keduanya butuh URL publik yang hidup. |
| P1-13 | Preview CV inline | DONE | Dua halaman CV dirender dari PDF asli (poppler `pdftoppm` 150 dpi → sharp 1000 px, WebP q82) oleh `scripts/prepare-assets.mjs`, tampil di Tentang di samping tombol download yang tetap ada. [metrics.json](docs/evidence/kirim-4/metrics.json) → `cvPreview`: `naturalWidth/Height` 1000×1413 sama persis dengan atribut `width`/`height`, `loading="lazy"`, alt 281 dan 197 karakter. `layoutShiftTentang: 0` diukur dengan `PerformanceObserver('layout-shift')` sambil menggulir seluruh halaman — CLS 0,008 tidak naik. `cvDownloadStillPresent: 1`. Provenance di [asset-provenance.md](docs/asset-provenance.md). [Screenshot](docs/evidence/kirim-4/cv-preview-1440-light.webp). |

## IMG-2 — Gambar OG 1200×630 · Codex

Kirim 4 sudah `DONE`, jadi fase ini siap dijalankan. Tiket sudah ditulis:
[`docs/image-jobs/IMG-2-og-image.md`](docs/image-jobs/IMG-2-og-image.md).
Tag `og:` sudah menunjuk ke jalurnya dan sudah dikunci test; tiket ini hanya
menambahkan berkasnya.

| ID | Item | Status | Bukti |
|---|---|---|---|
| IMG-2 | `public/images/og-cover.png` 1200×630 | TODO | Butuh: berkas ada, validasi LinkedIn Post Inspector + preview WhatsApp nyata setelah berkas masuk. |

## Kirim 5 — Performa, SEO, penutup

Semua angka di bawah diambil pada mesin dan sesi yang sama, 2026-09-20, dan
selengkapnya ada di [`docs/evidence/kirim-5/`](docs/evidence/kirim-5/README.md).
Pembanding "sebelum" bukan baseline lama dari catatan, melainkan build `main`
c89885e yang dibangun ulang dan diaudit hari ini di worktree terpisah.

| ID | Item | Status | Bukti |
|---|---|---|---|
| P2-24 | Bundle 414 KB — code-split per route + lazy GSAP/Lenis | DONE | Tiga route jadi chunk sendiri (`Experience` 10.597/3.207, `About` 6.167/2.126, `Contact` 15.826/4.815 raw/gzip); Beranda tetap ikut shell karena halaman itulah yang menentukan LCP. Entry `assets/index-*.js` **306.206 → 279.718 B raw, 90.725 → 84.398 B gzip, 78.435 → 73.034 B brotli** (`gzip -c9`, `brotli -q 11`). `motion-runtime` (131.506 B / 48.739 B gzip) sudah dipisah sejak Kirim 1; yang baru di sini, chunk itu **tidak diminta sama sekali** saat `prefers-reduced-motion: reduce`, jadi JS untuk pembaca itu turun dari 139.464 B gzip jadi 84.398 B gzip. Dikunci test `reduced motion never downloads the animation chunk`, `route chunks blocked still leave Beranda complete and say so on the other routes`, dan `route chunks blocked on a cold deep link say so without a page error` di 4 project — dua yang terakhir memastikan chunk yang tidak pernah sampai menghasilkan halaman yang mengatakannya, bukan `<main>` kosong. Phosphor tidak diganti, sesuai scope. [Build sebelum](docs/evidence/kirim-5/build-sebelum.txt) / [sesudah](docs/evidence/kirim-5/build-sesudah.txt). |
| P2-26 | Satu ukuran gambar untuk semua layar | DONE | 8 gambar × 3–4 lebar × 2 format = 60 berkas AVIF + WebP, ditulis `scripts/prepare-assets.mjs` bersama `src/image-manifest.json` — satu-satunya sumber setiap `srcset`, sehingga markup tidak bisa menyebut lebar yang tidak pernah dienkode. `sizes` per slot dibaca dari layout dan disimpan sekali di `src/image-sizes.js`; `vite.config.js` membaca entri potret yang sama supaya `<link rel=preload>` mengulang persis `srcset`/`sizes` milik `<picture>` dan potret tidak terunduh dua kali. Lebar intrinsik `width`/`height` tidak berubah, **CLS tetap 0** pada audit Lighthouse di bawah (syarat ≤ 0,01 terpenuhi). Dikunci `every responsive image offers AVIF and WebP widths that all resolve` (60 berkas dipanggil satu per satu, semua 200), `the portrait a narrow screen downloads is not the desktop file`, dan `no image is reused with a different crop, whichever width is served` — yang terakhir berkunci pada `src` kanonis supaya varian lebar tidak bisa menyembunyikan crop kedua. |
| P2-22 | LCP mobile 2.9s → di bawah 2.5s | DONE | **LCP 3,1 s → 2,3 s**, performance **93 → 98**, di bawah target 2,5 s. FCP 1,5 s tetap, Speed Index 2,7 → 2,5 s, TBT 20 ms tetap, CLS 0 tetap. a11y/best-practices/SEO tetap 100/100/100 — tidak ada yang turun. Penyebab utamanya pipeline gambar: ponsel 412 px kini menerima AVIF 640 px (37 KB), bukan WebP 900 px (127 KB). [JSON sebelum](docs/evidence/kirim-5/lighthouse-mobile-sebelum.json) / [sesudah](docs/evidence/kirim-5/lighthouse-mobile-sesudah.json); salinan "sesudah" menggantikan `docs/lighthouse-mobile.json`. |
| P2-28 | JSON-LD `Person` | DONE | Graf `Person` dibangun `src/seo.js` dari `src/data.js` dan disisipkan `vite.config.js` ke `<head>`: `name`, `jobTitle`, `url`, `image`, `description`, `email`, `telephone`, `sameAs` (LinkedIn), `address` (Bekasi, Jawa Barat, ID), `alumniOf` (IPB University), `knowsAbout` (12 keahlian), `knowsLanguage`. Rich Results Test pada potongan HTML berisi blok itu: **nol error, nol warning**; Google melaporkan "No items detected" karena `Person` memang bukan tipe yang menghasilkan rich result, bukan karena markupnya ditolak — rinciannya di Log verifikasi. [Screenshot](docs/evidence/kirim-5/rich-results-test.png). Dikunci `the document carries a Person graph built from the CV facts`, yang juga melarang `worksFor` muncul di graf. |
| P2-29 | `sitemap.xml` | DONE | Dibuat `src/seo.js` dari objek `site` yang sama dengan canonical, disajikan dev server dan di-emit ke `dist/`. **Satu `<loc>`**, bukan empat: route hash adalah fragmen dari satu dokumen, jadi mendaftarkan `#/pengalaman` sebagai URL tersendiri adalah klaim yang tidak dihormati perayap mana pun. `public/robots.txt` statis dihapus dan digantikan berkas generated yang memuat `Sitemap: <origin>/sitemap.xml`, supaya origin-nya tidak bisa berbeda dari canonical. Dikunci `robots, sitemap and llms.txt are served and agree on one origin`. |
| P2-30 | `llms.txt` (agentic-browsing 0.67) | DONE | **agentic-browsing 0,67 → 1,00**, audit `llms-txt` 0 → 1. Isinya dibangkitkan dari `src/data.js`, jadi setiap angka tunduk pada aturan kejujuran yang sama dan tidak ada angka kedua yang bisa menyimpang. Ada bagian "Cara membaca angka di halaman ini" yang menyatakan semuanya angka kegiatan — bukan hasil penjualan — dan bahwa 150 adalah 100 Shopee + 50 TikTok, bukan 150 orang unik; ada bagian "Materi yang belum bisa ditampilkan" yang melarang pembaca mesin menyebut placeholder sebagai contoh karya. Dikunci `robots, sitemap and llms.txt are served and agree on one origin`, termasuk keberadaan H1 dan tautan Markdown yang diminta llmstxt.org. |

## Kirim 6 — Pass poles visual · Codex

Hanya dijalankan setelah Kirim 5 seluruhnya `DONE`. Kirim 5 sekarang `DONE`,
jadi fase ini sudah boleh dijalankan. Patokan yang tidak boleh turun sekarang:
performance 98 · a11y 100 · best-practices 100 · SEO 100 · agentic-browsing 1,00 ·
LCP 2,3 s · CLS 0 · TBT 20 ms · `npm test` 196 hasil.

| ID | Item | Status | Bukti |
|---|---|---|---|
| K6-1 | Poles spacing, skala tipografi, easing estetis — tanpa menyentuh data/logika/test | TODO | Butuh: screenshot sebelum/sesudah 4 halaman × terang/gelap × 1440px/390px, angka kontras tiap pasangan yang berubah, `npm test` lolos, Lighthouse tidak turun. |

## Sengaja di-SKIP

| ID | Item | Alasan |
|---|---|---|
| P2-31 | Toggle bilingual ID/EN + `hreflang` | Item termahal di daftar; sendirian bisa makan 3 kirim. |
| P2-27 | Prerender / SSG per route | Butuh keputusan hosting + rewrite. Google tetap bisa render JS; sakit utamanya (preview LinkedIn/WA) diobati `og:image` di Kirim 4. |
| P2-25 | Buang subset font cyrillic/greek/vietnamese | 47 KB artefak build, dampak runtime nol — browser cuma unduh `unicode-range` yang cocok. |

Ambil lagi kapan saja lewat "Prompt satuan" di `prompt.md`.

## Aset dari Anung — daftar tukar, bukan blocker

Ini BUKAN blocker. Halaman dibangun penuh dengan cover placeholder; daftar ini
menyebut berkas apa yang menggantikan placeholder mana kalau nanti dikirim.
Menukarnya = taruh berkas di `assets/source/placeholder/<slot-id>.png`,
jalankan `node scripts/prepare-assets.mjs` supaya semua lebar dan formatnya
dienkode ulang, lalu hapus `placeholder: true`. Tidak ada JSX yang perlu
ditulis ulang.

- [ ] 4+ konten Instagram Anima Companion (screenshot atau file asli)
- [ ] 3 video promosi produk (file, atau thumbnail + tautan)
- [ ] Video profil perusahaan
- [ ] Rekaman/screenshot webinar B2B (15+ peserta)
- [ ] Foto tambahan dari masa AnyMind (selain `with_anymind_team.jpg`)
- [ ] Opsional: screenshot dashboard afiliasi Shopee/TikTok, angka sensitif disensor
- [ ] Opsional: screenshot laporan bulanan yang dia susun, angka disensor
- [ ] Konfirmasi: mana yang boleh dipublikasikan, mana yang NDA

Kalau materialnya tidak boleh dipublikasikan, keputusannya bukan "hilangkan diam-diam" — placeholder jujur bercaption tetap tayang. Aturan lengkap apa yang boleh dan tidak boleh digambar ada di `prompt.md` bagian "Aturan aset & placeholder" dan `docs/image-jobs/README.md`.

---

## Catatan keputusan

Dicatat saat pengerjaan berlangsung — apa yang diputuskan, kenapa, dan apa yang dilepas.

| Tanggal | Keputusan | Alasan |
|---|---|---|
| 2026-09-18 | Audit awal, 33 temuan | Baseline |
| 2026-09-20 | Gerbang VIS-1 diperbaiki di `tests/portfolio.spec.js`, bukan di aplikasi | Probe tiga engine menunjukkan gambar CV sehat di chromium/firefox/webkit: begitu muatannya mendarat, `naturalWidth` 1000 dan `decode()` sukses di semuanya. Yang keliru cara test mengukur — `decode()` dipakai sebagai penunggu muatan, padahal Firefox menolaknya selama permintaan masih di jalan. Mengubah aplikasi (misal membuang `loading="lazy"`) berarti mengubah perilaku yang benar demi menyenangkan test. |
| 2026-09-20 | Penolakan `decode()` yang tadinya ditelan `.catch(() => {})` sekarang diperiksa assertion | Menunggu muatan saja sudah cukup membuat test hijau, tapi itu menyisakan `decode()` sebagai panggilan tanpa arti. Sekalian dijadikan bukti: gambar CV harus benar-benar bisa didekode, bukan sekadar kotak seukuran benar. Cakupan naik, tidak ada yang dilonggarkan; jumlah hasil tetap 164. |
| 2026-09-20 | Beranda tetap ikut shell; hanya Pengalaman/Tentang/Kontak yang jadi chunk terpisah | Beranda adalah halaman pendaratan dan memuat potret yang menentukan LCP. Melazykan Beranda berarti menunda persis elemen yang sedang dikejar P2-22. Tiga route lain dipisah, dan itu yang memangkas entry 6.327 B gzip. |
| 2026-09-20 | Route tidak dipasang di `React.Suspense`, melainkan di hook `usePage` sendiri | `usePageMotion` mengukur DOM halaman untuk membangun reveal. Kalau chunk mendarat setelah efek itu jalan, halaman muncul tanpa satu pun reveal terpasang. Hook sendiri memungkinkan identitas komponen ikut jadi syarat `revealed`, sehingga motion dibangun ulang tepat saat halamannya benar-benar ada. |
| 2026-09-20 | Chunk route yang gagal diunduh menampilkan `PageUnavailable`, bukan halaman kosong, dan menyuruh muat ulang | Peramban menyimpan kegagalan fetch modul di module map selama sesi berlangsung, jadi mengimpor URL yang sama lagi tidak bisa pulih — tombol "coba lagi" akan berbohong. Yang jujur: katakan berkasnya tidak sampai, sediakan muat ulang, tautan ke beranda, dan alamat email. `<main>` kosong bukan jawaban yang boleh diterima. |
| 2026-09-20 | `prefers-reduced-motion: reduce` tidak lagi hanya mematikan animasi, tapi mencegah `motion-runtime` diunduh | Chunk itu 48.739 B gzip yang tidak akan pernah dipakai pembaca tersebut. Statusnya `'skipped'`, diperlakukan sama dengan `'unavailable'` oleh semua pemanggil, dan hook tetap mengawasi media query supaya mematikan preferensi di tengah sesi tetap memuat chunk-nya. |
| 2026-09-20 | Varian gambar responsif dibangkitkan skrip, dan `srcset` dibaca dari `src/image-manifest.json` | Kalau `srcset` ditulis tangan, satu lebar yang lupa dienkode jadi 404 senyap yang hanya muncul di viewport tertentu. Manifest ditulis oleh skrip yang juga menulis berkasnya, jadi keduanya tidak bisa berbeda. Jalur yang tidak ada di manifest dirender sebagai `<img>` biasa, bukan `srcset` yang mengarang. |
| 2026-09-20 | Menukar placeholder kini menambah satu langkah: `node scripts/prepare-assets.mjs` | Kontrak di `prompt.md` berbunyi "tidak boleh perlu menulis JSX lagi" — itu tetap dipenuhi. Yang bertambah adalah menjalankan skrip yang sudah wajib dijalankan untuk setiap gambar lain di project ini. Alternatifnya, `srcset` menunjuk berkas lama sementara `src` menunjuk berkas baru; itu lebih buruk daripada satu perintah. Dicatat di `docs/asset-provenance.md` dan di komentar `src/data.js`. |
| 2026-09-20 | `hasOccupation` (tiga magang) dibuang dari graf `Person` | Validator schema.org menandai `hiringOrganization` sebagai field yang tidak dikenal pada `Occupation` — 3 warning. Satu-satunya cara schema.org mengikat peran ke organisasi adalah `worksFor`, yang terbaca sebagai pekerjaan yang sedang dijalani sekarang. Anung bukan pegawai di sana sekarang. Jadi peran-perannya tinggal di halaman, di CV, dan di `llms.txt`, tempat tanggalnya ikut. Sisa graf persis yang diminta `prompt.md` bagian D. |
| 2026-09-20 | `sitemap.xml` memuat satu `<loc>`, bukan empat | Keempat route adalah fragmen hash dari satu dokumen. Mendaftarkan `#/pengalaman` sebagai URL tersendiri adalah klaim yang tidak dihormati perayap mana pun, dan P2-27 (prerender) memang sengaja di-SKIP. |
| 2026-09-20 | `llms.txt` ditulis dengan tautan Markdown, bukan URL telanjang | Run Lighthouse pertama masih memberi `llms-txt` skor 0 dengan pesan "File does not appear to contain any links." Format llmstxt.org meminta daftar berupa tautan Markdown. Sesudah diubah, audit lolos dan agentic-browsing naik ke 1,00. Diukur, bukan diasumsikan. |
| 2026-09-20 | Kegagalan disebut bukan ulah VIS-1 hanya setelah dijalankan pada `main` 54f05e1 yang bersih | Catatan balik Codex melarang menyebut "bug lama" atau "flaky" tanpa pembanding. Dua log dengan `git diff --stat` di kepalanya menjadi pembanding itu: 3/3 gagal dengan VIS-1 terpasang, 3/3 gagal tanpa VIS-1. |
| 2026-09-20 | `verify-polish.mjs` dijalankan ulang dan menimpa `polish-metrics.json` + `motion-*-raw.json` milik sesi Codex di `docs/evidence/vis-1/` | Skrip itu menulis ke foldernya sendiri dan tidak punya `EVIDENCE_DIR`. Berkasnya belum pernah di-commit, dan angka hasilnya identik dengan yang diklaim sesi Codex (6 pasangan, terendah 3,164:1), jadi yang tertimpa adalah hasil run yang sama pada sumber yang sama. Salinan log sesi ini ada di `docs/evidence/gerbang-vis-1/verify-polish.txt`. |
| 2026-09-20 | Pekerjaan rupa VIS-1 di-commit ke `fase/vis-1` lewat merge `main`, bukan rebase atau force | Branch `fase/vis-1` sudah punya commit VIS-1 lama (`3bfef9f`) yang berdiri di atas Kirim 3, sementara sesi Codex terakhir menggarap ulang rupanya di atas Kirim 4. `prompt.md` melarang force dan rebase, jadi `main` di-merge masuk ke branch dan isi pohon kerja yang sudah diverifikasi dipasang sebagai hasil merge. Keputusan merge ke `main` tetap milik Milord. |
| 2026-09-20 | VIS-1 tetap WIP dan tidak commit/push setelah suite 163 passed / 1 failed | Preview CV gagal di Firefox (`naturalWidth` 0). Instruksi `prompt.md` melarang Codex memperbaiki bug/test dan melarang commit pada suite gagal. Tidak mengklaim ini bug lama atau flaky tanpa pembanding. Semua item rupa dan bukti lain selesai; tindak lanjut gerbang milik Claude Code. |
| 2026-09-19 | VIS-1 dipilih sebagai fase belum tuntas paling awal menurut urutan Papan Fase | Kirim 4 sudah DONE; tiket VIS-1 tetap mendahului IMG-2 dan Kirim 5. Tidak melompati tiket atau mengerjakan fase lain. |
| 2026-09-19 | VIS-1 memakai CSS dan hanya nilai tiga tabel timing; `progress.md` diperbarui sesuai instruksi sesi langsung | Ring–angka disatukan melalui grid, tanpa mengubah JSX; semua angka, teks, logika, test, pipeline dan dependensi tetap. Kisi 11 sel dekoratif mengikuti kontrak timeline saat ini; kalau rentang tanggal berubah nanti, kisi perlu ditinjau oleh harness kode. |
| 2026-09-19 | Bukti utama VIS-1 mengikuti lokasi tiket `docs/evidence/vis-1/`; indeks fase di `docs/evidence/kirim-vis-1/` | Menjaga tautan tiket dan pola penutup sesi sekaligus, tanpa menggandakan gambar. Tidak membutuhkan aset baru atau tiket gambar baru. |
| 2026-09-19 | Kirim 4 memakai kolom Default apa adanya: Web3Forms via `VITE_WEB3FORMS_KEY`, `VITE_SITE_URL` untuk domain, keduanya kosong | Tidak ada kredensial dan tidak ada domain. Berhenti bertanya berarti fase tidak jalan. UI lengkap di kedua jalur, copy jujur di kedua jalur, dan test menutup keduanya, jadi mengisi env var nanti tidak menuntut perubahan kode sebaris pun. |
| 2026-09-19 | `src/site.js` jadi satu-satunya sumber URL + metadata share; `vite.config.js` merendernya ke `index.html` lewat plugin `anung-site-meta` | `prompt.md` menuntut canonical dan `og:url` dari satu sumber. Menaruh tag di `index.html` berarti URL ditulis 4 kali (canonical, `og:url`, `og:image`, `twitter:image`) dan judul 3 kali. Perayap LinkedIn/WhatsApp tidak menjalankan JS, jadi menulis tag dari React tidak menyelesaikan apa pun — harus saat build. Plugin melempar error kalau penanda `<!--site-meta-->` hilang, jadi kegagalannya berisik, bukan diam. |
| 2026-09-19 | Host fallback `https://anung-ramadhan.example`, bukan domain tebakan | `.example` adalah TLD cadangan RFC 2606 — mustahil disalahartikan sebagai alamat nyata, dan kalau tidak sengaja ter-deploy, canonical yang salah menunjuk ke tempat yang jelas tidak ada alih-alih ke situs orang lain. `npm run build` menulis peringatan setiap kali dipakai. |
| 2026-09-19 | `npm test` menjalankan dua dev server: 5173 tanpa kunci, 5174 dengan kunci palsu | Backend form ditentukan saat build, jadi satu server tidak bisa menguji kedua jalur. Alternatifnya menaruh hook test di kode produksi (global yang bisa ditimpa) — itu menambah permukaan yang hanya ada demi test. Kedua kunci di-set eksplisit di `playwright.config.js` supaya `.env` lokal siapa pun tidak bisa mengubah apa yang diuji. Cakupan test lama tidak dikurangi: jalur `mailto:` tetap diuji test yang sama persis. |
| 2026-09-19 | Jalur tanpa backend mempertahankan copy dan label tombol lama kata per kata | Test Kirim 1 `contact form validates inputs and prepares an honest email handoff` mengunci "Buka draf email" dan "Untuk mengirim pesan, tekan tombol kirim di aplikasi email." Mengubahnya berarti melonggarkan test yang sudah ada. Label baru ("Kirim pesan") hanya muncul ketika backend memang ada, jadi tombolnya tidak pernah menjanjikan sesuatu yang tidak bisa dilakukannya. |
| 2026-09-19 | Proteksi spam honeypot off-screen, bukan `display: none`, bukan CAPTCHA | `prompt.md` melarang CAPTCHA. `display: none` mudah dikenali bot yang membaca DOM. Field 1×1 ber-`clip-path` dengan `tabindex="-1"` di pembungkus `aria-hidden="true"` tidak pernah dijangkau manusia, keyboard, atau pembaca layar, dan tidak menambah pasangan kontras baru. Submit yang terisi dibatalkan diam-diam — menjelaskan jebakannya berarti membocorkannya. |
| 2026-09-19 | Preview CV merender **dua** halaman, bukan satu | `prompt.md` meminta "halaman pertama", tapi CV-nya dua halaman dan halaman kedua memuat seluruh pengalaman organisasi dan keterampilan. Menampilkan satu halaman dari dua justru memaksa unduhan yang mau dihindari. Biayanya 293 KB WebP `loading="lazy"`, bukan di jalur LCP. |
| 2026-09-19 | Halaman CV dirender dengan poppler `pdftoppm` di `prepare-assets.mjs`, PNG antaranya tidak dilacak | sharp tidak membaca PDF. `pdftoppm` hanya dibutuhkan saat aset diregenerasi, tidak pernah saat `npm run build`, jadi tidak ada langkah build yang ikut bergantung padanya. PNG 150 dpi cuma turunan dari PDF yang sudah dilacak di root — menyimpannya di `assets/source/` berarti menambah ~840 KB ke repo tanpa menambah informasi. |
| 2026-09-19 | Gambar halaman CV = gambar teks, dan itu diterima dengan tiga pengaman | WCAG 1.4.5 menghindari gambar teks. Di sini gambarnya adalah potret sebuah dokumen, bukan cara menyampaikan teks: PDF aslinya tetap bisa diunduh di sebelahnya, seluruh isinya sudah ada sebagai teks nyata di Pengalaman dan Tentang, dan `alt` tiap halaman menyebutkan isinya. Copy di halaman menyatakan ketiganya. |
| 2026-09-19 | `.cv-preview-intro` dibuat `position: sticky` di atas 767px | Bukan rasa: bloknya setinggi dua halaman A4, dan header situs tidak ikut menempel. Tanpa sticky, tombol Download CV hilang dari layar begitu pembaca menggulir ke halaman kedua. Di bawah 767px kolomnya tunggal dan sticky dimatikan. Ruang kosong yang tersisa di kolom kiri 1440px sengaja dibiarkan untuk pass rasa Kirim 6. |
| 2026-09-19 | `.site-footer > div` diberi `flex-wrap` di bawah 768px | Footer bertambah satu tautan (WhatsApp). Tanpa wrap, tiga tautan plus tombol tidak muat di 320px dan `document.scrollWidth <= innerWidth` gagal. |
| 2026-09-19 | Pemindai kebocoran mencari pola UUID dan nilai dari berkas `.env*`, bukan nama variabel | `buildSite(import.meta.env)` membuat Vite menyisipkan seluruh objek env, jadi string `VITE_WEB3FORMS_KEY` selalu ada di bundel sebagai nama properti. Versi pertama pemindai menandainya sebagai kebocoran — alarm palsu yang, kalau dibiarkan, membuat alarm sungguhan ikut diabaikan. Kunci akses Web3Forms berbentuk UUID, jadi itulah yang dicari. |
| 2026-09-19 | Split 100/50 dipasang di kartu **Marketing Intern (Coordination Role)**, bukan di Beranda | `prompt.md` menulis "150 di Beranda adalah penjumlahan 100 + 50". Itu keliru, dan README sudah menyatakan yang benar: 150 yang merupakan penjumlahan adalah "100 mitra afiliasi Shopee dan 50 mitra afiliasi TikTok" pada peran koordinasi Sutan Vet. Angka 150 di Beranda adalah baris CV tersendiri, "Contacted and invited 150 new affiliates daily to join Unicharm's affiliate community" — bukan penjumlahan. Memasang bar penjumlahan di Beranda justru akan membuat angka CV yang benar terbaca sebagai gabungan. |
| 2026-09-19 | Sumbu bar TOEFL 310–677, bukan 0–677 | 310 adalah skor total terendah yang mungkin pada TOEFL ITP, jadi itulah lantai skalanya; memaksa 0 bukan kejujuran melainkan skala yang tidak ada. Kedua ujung dicetak sebagai teks dan `startsAtScaleFloorPx: 0` dikunci test, sehingga bar tidak pernah dimulai di tempat yang menyanjung. Label "Professional Working Proficiency" dikutip persis dari baris Bahasa di CV dan ditulis di halaman sebagai kutipan CV, bukan sebagai pemetaan skor. |
| 2026-09-19 | Dua entri Sutan Vet ditulis "perusahaan yang sama, 2 periode magang, peran A lalu peran B", bukan "promosi" | `prompt.md` menyebut "promosi peran". CV tidak menyatakan promosi; yang tertulis hanya dua periode dengan dua judul peran. Kalimatnya menunjukkan perkembangan yang sama tanpa mengklaim status kepegawaian yang tidak ada di sumber. |
| 2026-09-19 | Bar dan timeline dibangun dari HTML/CSS, hanya ring IPK yang SVG | Batasan fase adalah "SVG inline + GSAP, jangan tambah pustaka chart" — yang dilarang pustaka chart, bukan CSS. Persegi panjang berposisi persen jauh lebih tahan di 320–390px daripada `viewBox` SVG yang harus diskalakan ulang, dan hooknya sama-sama berupa kelas CSS. Ring butuh arc, jadi ring tetap SVG. |
| 2026-09-19 | Tumpang tindih jadi barisnya sendiri ("Dua magang bersamaan"), bukan pita vertikal di belakang seluruh timeline | Versi pertama memakai pita setinggi penuh. Terukur salah: pita `--line` menggelapkan latar di belakang teks label, jadi kontras `--muted` di situ tidak lagi sama dengan 5.806:1 yang tercatat. Sebagai baris tersendiri, bar tumpang tindih tetap sejajar tepat di bawah kedua bar 2026 (4→8 di ketiga lebar) dan tidak ada teks yang berdiri di atas warna campuran. |
| 2026-09-19 | "+" pada "30+"/"100+" ditaruh di elemen saudara `.stat-unit`, bukan lewat `data-suffix` | Test Kirim 1 `reduced motion leaves every reveal, counter and disclosure at its final value` membandingkan `textContent` counter dengan atribut `data-count` persis. Memakai suffix di dalam elemen counter akan memaksa test lama diubah. Ini menambah cakupan tanpa melonggarkan apa pun. Efek sampingnya satu: `.experience-stats span` ternyata juga mengenai span di dalam `<strong>`, jadi aturannya dipersempit ke `.experience-stats > div > span`. |
| 2026-09-19 | Kosakata reveal (P2-23) berhenti di penanda + tabel nilai yang semua barisnya identik | Batas fase: mekanismenya milik Kirim 3, nilainya milik VIS-1. Setiap elemen reveal kini membawa `data-reveal-kind` (`heading`/`text`/`stat`/`media`/`panel`/`viz`) dan `src/motion.js` punya satu baris tabel per jenis. Keenam baris diisi angka yang berlaku sekarang, jadi tidak ada satu piksel pun yang berubah di fase ini; Codex cukup mengganti nilainya. |
| 2026-09-19 | Skrip bukti membaca `EVIDENCE_DIR` | VIS-1 perlu screenshot yang sebanding piksel per piksel dengan Kirim 3. Dengan env var, skrip yang sama dipakai tanpa menyalin berkas atau menimpa bukti fase ini. |
| 2026-09-19 | Gerbang IMG-1: penjaga interupsi curtain berhenti bertanya ke GSAP dan memiliki statusnya sendiri (`stopTransition()`) | `transition.current?.isActive()` menjawab `false` untuk timeline yang sudah dibuat tapi belum dirender — GSAP baru menyalakan `_initted` pada tick ticker pertama, sementara React memasang `inert` tanpa menunggu frame. `hashchange` kedua yang jatuh di jendela itu lolos dari penjaga, curtain yatim tetap `commit()` route lama lalu melepas `inert` di route yang sudah ditinggalkan. Melonggarkan test atau menaikkan timeout hanya menyembunyikan urutan yang memang tidak dijamin; buktinya test regresi baru gagal di keempat project pada kode lama, bukan hanya WebKit. |
| 2026-09-19 | IMG-1 tidak commit/push pada sesi Codex; fase WIP meski keenam aset selesai | Dua run suite penuh masih gagal pada transisi route WebKit. Batas tiket melarang perubahan source/test, sehingga kegagalan diserahkan ke harness kode; tidak menyamarkan hasil sebagai DONE atau mengklaim bug lama tanpa pembanding. Keputusan itu benar: penyebabnya memang bug kode, diselesaikan pada sesi tiket gerbang IMG-1. |
| 2026-09-19 | IMG-1 memakai tiga still life hasil `image_gen`; PNG dinormalisasi 1448×1086 → 1200×900, WebP q82 | Rasio 4:3 tetap; tanpa crop. Latar tanah liat/bordo membedakan cover dari kedua tema. Bentuk dekoratif bukan angka CV. Caption dan flag placeholder tetap. |
| 2026-09-19 | Bukti tiket IMG-1 disimpan di `docs/evidence/kirim-img-1/`; `progress.md` diperbarui sesuai penutup sesi universal | Instruksi langsung sesi mewajibkan orientasi/progres meski tiket lama membatasi pembacaan. Tidak membaca `plan.md` atau mengubah sumber aplikasi/test. |
| 2026-09-19 | Galeri bukti jadi baris selebar kartu, bukan isi `.experience-side` | Versi pertama menaruh galeri di kolom samping seperti saran `prompt.md`. Terukur: kolom samping jadi 817/954px sementara kolom utama 510/488px — lubang 400px cuma pindah dari kiri ke kanan, dan tinggi kartu berhenti berubah saat disclosure dibuka sehingga `ResizeObserver` di `main` tidak lagi memicu refresh (test Kirim 1 gagal). Sebagai baris penuh: selisih kolom 562px total, disclosure kembali mengubah tinggi kartu. |
| 2026-09-19 | Slot placeholder tetap merender `<img>`, dan berkas cover datar ikut di-commit | Kalau `<img>` menunjuk berkas yang tidak ada, Chromium mencatat 404 sebagai console error dan seluruh suite gagal — `afterEach` mewajibkan console bersih. Jalur "tanpa berkas gambar" tetap dibuktikan lewat test yang membatalkan `**/images/placeholder/**`, bukan dengan menghilangkan berkasnya. |
| 2026-09-19 | Cover sementara dibuat Claude Code dari SVG token warna brand, bukan image gen | Blok geometris datar = artefak build yang deterministik (`scripts/make-placeholder-covers.mjs`), bukan artistry. Tugas artistik tetap milik Codex lewat IMG-1, yang menimpa berkas di jalur yang sama. `placeholder: true` tidak hilang saat IMG-1 selesai — flag itu baru dilepas kalau materi asli dari Anung yang masuk. |
| 2026-09-19 | Potret tetap tampil 2× (hero Beranda + Tentang), crop identik | P1-3 menuntut "tidak ada gambar muncul >1× dengan crop berbeda", bukan "tidak ada gambar dipakai 2×". Yang menyesatkan adalah kartu Unicharm yang memajang potret ter-crop ulang sebagai gambar pekerjaan; itu diganti foto tim asli. Potret di hero dan Tentang memakai `aspect-ratio: .9` dan `object-position: 50% 100%` yang sama. |
| 2026-09-19 | Hover kartu Beranda kehilangan `filter: brightness/saturate`, `transform: scale` dipertahankan | Bukan selera: WebKit meng-crash renderer kalau transisi `filter` pada `.feature-photo`/`.feature-art` dibongkar oleh perpindahan route. Bug ini sudah ada di `main` sebelum Kirim 2 — terbukti dengan menjalankan skenario yang sama pada `HEAD` (`crashed= true`). Menghapus `filter` saja sudah cukup; `scale` yang terlihat tetap ada. |
| 2026-09-19 | Offset "geometri basi" di test Kirim 1 diubah dari `-5000px` tetap jadi hasil pengukuran | Halaman Pengalaman di 390px tumbuh dari ~4.700px jadi ~6.500px, jadi angka tetap itu tidak lagi menaruh elemen di atas viewport dan test gagal di project `mobile`. Offset sekarang `-(rect.top + innerHeight)`, tidak ikut basi saat halaman tumbuh lagi. Cakupan test tidak dikurangi. |
| 2026-09-19 | LCP mobile turun 2,8 → 3,1 detik; diterima dan diteruskan ke P2-22 | Penyebabnya melekat pada perbaikan P1-3: kartu Beranda dulu memakai ulang berkas potret yang sudah diunduh hero (0 byte tambahan), sekarang mengunduh foto tim 138 KB tersendiri yang berebut bandwidth dengan `motion-runtime`. `fetchPriority="low"` pada semua gambar bawah-lipatan mengembalikan ~0,1 detik. Sisanya dibereskan `srcset` multi-lebar (P2-26) dan P2-22 di Kirim 5. Skor performa tetap 93 = baseline; CLS justru turun 0,008 → 0. |
| 2026-09-19 | Satu prompt universal untuk semua fase; agent berorientasi sendiri dari tabel ringkasan di berkas ini | Tidak ada lagi copy-paste blok berbeda tiap kirim. `progress.md` jadi satu-satunya sumber kebenaran giliran fase. |
| 2026-09-19 | Routing harness: Codex hanya untuk image gen (IMG-1, IMG-2) dan pass poles visual (Kirim 6); sisanya Claude Code | Context window Codex kecil — dipakai untuk artistry, dibungkus tiket mandiri di `docs/image-jobs/` supaya tidak perlu membaca repo. **Digantikan keputusan 2026-09-19 di bawah.** |
| 2026-09-19 | Routing harness diperluas: Codex memegang SELURUH lapisan rasa (gambar, bentuk SVG, animasi, spacing, tipografi, warna dalam token); Claude Code memegang test, logika, data, angka, integrasi, performa, SEO, aksesibilitas | Permintaan Milord. Pemisahnya sifat kegagalan, bukan selera kerja: kerangka yang salah menghasilkan angka bohong dan harus ditangkap test di `main`; rasa yang meleset cuma jelek dan dibuang dengan menghapus branch. Konsekuensinya Kirim 3 dipecah — kerangka + angka + test tetap Claude Code (2 item), rasa jadi fase Codex VIS-1 (1 item, membawa P2-23). Total 33 item tidak berubah. Pola tiketnya menyalin pola gambar yang sudah terbukti: `docs/visual-jobs/` sebagai pasangan `docs/image-jobs/`. |
| 2026-09-19 | Aset yang belum ada tidak lagi berstatus BLOCKED; slot diisi cover placeholder hasil image gen dengan caption jujur | P1-5 sebelumnya menahan halaman Pengalaman tanpa gambar tanpa batas waktu. Kontrak jalur berkas membuat penukaran ke aset asli tidak butuh perubahan JSX. |
| 2026-09-19 | Satu commit per fase setelah verifikasi lolos; fase Claude Code ke `main`, fase Codex ke branch `fase/<id>` | Izin git diberikan eksplisit untuk project ini. Hasil berbasis selera (gambar, poles visual) dibuang dengan menghapus branch, bukan `git revert` di `main`. Hash commit dicatat di Log verifikasi. |
| 2026-09-19 | Keputusan yang belum diisi Milord punya kolom default (Web3Forms via env, `VITE_SITE_URL`, placeholder ya) | Agent tidak boleh berhenti bertanya di tengah fase. Default dicatat di sini saat dipakai. |
| 2026-09-18 | Rencana dipadatkan jadi 5 kirim | Permintaan Milord. 3 item di-SKIP, 2 diturunkan scope-nya. |
| 2026-09-18 | Kirim 1: `ResizeObserver` pada `main`, refresh dikoaleskan via `requestAnimationFrame` | Callback berjalan setelah commit React; ikut menangani filter, transisi tinggi disclosure, resize, dan perubahan font. Tidak mengulang seluruh intro ketika filter berubah. |
| 2026-09-18 | Reveal dipulihkan berdasarkan posisi DOM nyata setiap event refresh; timeout native 5 detik membuka semua reveal/mask | `once` yang menyimpan posisi lama tidak boleh menahan konten. Setelah 5 detik, keterbacaan diprioritaskan atas animasi scroll yang belum dimainkan. Observer, listener, frame, timer dibersihkan saat unmount/pergantian route. |
| 2026-09-18 | GSAP + ScrollTrigger + Lenis masuk modul opsional `motion-runtime.js`; CSS konten tetap terlihat secara default | Impor statis sebelumnya membuat kegagalan GSAP ikut menggagalkan render React. Import ditangkap; tenggat 1,5 detik memilih halaman statis jika unduhan macet. Ini hanya pemisahan runtime yang diperlukan P0-2, bukan penyelesaian seluruh P2-24. |
| 2026-09-18 | Disclosure memakai grid `0fr` → `1fr`, 320ms; state berupa Set | Tinggi mengikuti isi tanpa nilai piksel tebak-tebakan. Banyak detail boleh terbuka; ganti kategori tetap mereset detail seperti perilaku lama. `aria-expanded`, `aria-controls`, `aria-hidden`, dan `inert` tetap sinkron. Reduced motion melewati transisi. |
| 2026-09-18 | Intro hanya untuk kunjungan awal beranda; timeline 1,10 detik; sessionStorage tetap dipakai | Deep link langsung terbaca, termasuk form kontak saat modul motion masih dimuat. Intro juga memiliki timeout native agar tidak mengunci halaman ketika ticker berhenti. |
| 2026-09-18 | Crop tanpa pembesaran permanen; asterisk dipindah ke kiri atas | Logo AnyMind utuh di hero, kartu beranda, dan Tentang. Subjek tetap terlihat; foto/aset dan atribut width/height tetap. |
| 2026-09-18 | Aksen gelap `#7fb3a8` | Kontras 6,159:1 di `#102e2b`; 5,268:1 di `#163a36`; hover tombol 5,055:1. Seluruh pasangan yang diuji tetap AA. |
| 2026-09-18 | Preload font Latin yang sudah dipakai | Pemisahan motion mempercepat render sehingga font swap sempat menghasilkan layout-shift lokal 0,01825. Preload menghilangkan shift pada pemeriksaan ulang. Bukan audit Lighthouse baru atau pekerjaan subset font P2-25. |
| 2026-09-18 | Bukti pemblokiran GSAP memisahkan error aplikasi dari diagnostik jaringan yang sengaja dibuat | `net::ERR_FAILED` memang muncul akibat `route.abort()`; runtime error tetap 0. Navigasi hash memakai dokumen sama, jadi satu request diblokir untuk empat route. Assertion awal yang keliru meminta empat request diperbaiki; pemeriksaan teks empat route dipertahankan. |


---

## Log verifikasi

Setiap sesi kerja menambahkan satu baris. Perintah dan hasil aslinya, bukan ringkasan.

| Tanggal | Perintah | Hasil |
|---|---|---|
| 2026-09-18 | `Playwright MCP: #/pengalaman → filter → scroll → getComputedStyle` | `opacity: "0"` pada `top: 166px` — P0-1 dikonfirmasi |
| 2026-09-18 | perhitungan kontras semua token | terendah 5.81:1 (`--muted` di `--paper`) — lolos AA |
| 2026-09-18 | ukur target sentuh di 390px | 3 elemen 22px tinggi — P3-32 dikonfirmasi |
| 2026-09-18 | `gzip -c9 dist/assets/index-*.js` | 132.009 B |
| 2026-09-20 | `npm run build` di worktree `main` c89885e dan di pohon kerja Kirim 5, lalu `gzip -c9` + `brotli -q 11` pada berkas yang sama | Entry: **306.206 → 279.718 B raw**, **90.725 → 84.398 B gzip**, **78.435 → 73.034 B brotli**. Tiga chunk route baru: Experience 10.597/3.207, About 6.167/2.126, Contact 15.826/4.815. `motion-runtime` 131.506/48.739 tidak berubah ukurannya, tapi berhenti diminta saat reduced motion. [sebelum](docs/evidence/kirim-5/build-sebelum.txt) / [sesudah](docs/evidence/kirim-5/build-sesudah.txt). |
| 2026-09-20 | Lighthouse 13.4.1 mobile pada build statis (`vite preview`), Chromium Playwright lewat `CHROME_PATH`, pengaturan bawaan, dua build di mesin dan sesi yang sama | **Sebelum** (`main` c89885e dibangun ulang hari ini): performance 93 · a11y 100 · BP 100 · SEO 100 · agentic-browsing 0,67 · LCP 3,1s · FCP 1,5s · SI 2,7s · TBT 20ms · CLS 0 ([JSON](docs/evidence/kirim-5/lighthouse-mobile-sebelum.json)). **Sesudah**: performance **98** · a11y 100 · BP 100 · SEO 100 · agentic-browsing **1,00** · LCP **2,3s** · FCP 1,5s · SI 2,5s · TBT 20ms · CLS **0** ([JSON](docs/evidence/kirim-5/lighthouse-mobile-sesudah.json)). Tidak ada kategori yang turun dari gerbang 93/100/100/100. |
| 2026-09-20 | Lighthouse run pertama sesudah `llms.txt` dipasang | agentic-browsing masih 0,67; audit `llms-txt` 0 dengan pesan `File does not appear to contain any links.` Berkasnya ditulis ulang memakai tautan Markdown sesuai llmstxt.org, lalu diaudit ulang: `llms-txt` 1, agentic-browsing 1,00. Run pertama itu tidak disimpan sebagai bukti karena sudah digantikan; yang dicatat di sini adalah sebabnya. |
| 2026-09-20 | Google Rich Results Test, tab **Code**, potongan HTML berisi persis blok `<script type="application/ld+json">` dari `dist/index.html` | **Nol error, nol warning.** Hasilnya "No items detected — No rich results detected in this URL", dengan ikon info, bukan error: `Person` memang bukan tipe yang menghasilkan rich result di Google Search, sehingga tidak ada rich result yang bisa dideteksi. Markupnya sendiri diterima dan diurai. [Screenshot](docs/evidence/kirim-5/rich-results-test.png). Ini batas yang jujur: alat itu tidak bisa memberi cap "lolos" untuk tipe yang tidak didukungnya. |
| 2026-09-20 | `POST https://validator.schema.org/validate` pada graf versi awal (masih memuat `hasOccupation`) | `totalNumErrors: 0`, `totalNumWarnings: 3`, semuanya `UNKNOWN_FIELD hiringOrganization Occupation`. `hasOccupation` dibuang karena itu (alasannya di Catatan keputusan). Percobaan validasi ulang pada graf final ditolak reCAPTCHA Google dengan HTTP 429 dari IP ini; Rich Results Test di baris atas — alat yang memang diminta fase ini — sudah menguji graf final dan mengembalikan nol error. |
| 2026-09-20 | `curl` 60 berkas varian gambar lewat test `every responsive image offers AVIF and WebP widths that all resolve` di 4 project | Semua 200. Tidak ada `srcset` yang menunjuk berkas yang tidak dienkode. |
| 2026-09-20 | `npm test` penuh, dua run berturut pada pohon kerja final tanpa satu pun suntingan di tengah | Exit 0, **196 passed** keduanya — 164 hasil Kirim 4 ditambah 8 test baru × 4 project, tidak ada yang dihapus. [run 2](docs/evidence/kirim-5/suite-penuh-2.txt), [run 3](docs/evidence/kirim-5/suite-penuh-3.txt). |
| 2026-09-20 | `npx playwright test --project=webkit --repeat-each=3` | Exit 0. WebKit diulang tiga kali penuh karena satu run sebelumnya gagal di engine itu. [Log](docs/evidence/kirim-5/webkit-ulang-3.txt). |
| 2026-09-20 | Kegagalan WebKit `TypeError: Importing a module script failed.` pada satu run | **Sebab: kesalahan prosedur saya sendiri** — `src/ui.jsx` dan `src/pages.js` disunting saat suite masih berjalan, sehingga HMR Vite membatalkan modul yang sedang diimpor route `/pengalaman` di tengah test. Bukan sifat code-split-nya: run pertama (192 passed) dan dua run bersih sesudahnya (196 passed masing-masing) plus WebKit ×3 semuanya hijau pada kode yang sama. Dicatat apa adanya, bukan dihapus. |
| 2026-09-20 | Probe: test `route chunks blocked on a cold deep link` dijalankan pada `src/main.jsx` **tanpa** `.catch` | Lolos 2/2 di chromium dan webkit — jadi `loadPage()` tanpa penangan di `main.jsx` **tidak** terbukti jadi sumber error WebKit di atas: `usePage` sempat memasang penangan pada promise yang sama sebelum penolakannya mendarat. `.catch` tetap dipasang sebagai pengaman yang tidak bergantung pada urutan itu, dan tidak diklaim sebagai perbaikan kegagalan tersebut. [Log](docs/evidence/kirim-5/probe-main-tanpa-catch.txt). |

| 2026-09-18 | `arch-playwright-provision/scripts/provision_playwright_arch.sh --check` + launch headless Node Playwright | Library hilang 0; Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6 berhasil launch; lihat [env-check](docs/env-check.md). |
| 2026-09-18 | `npm test -- --project=chromium -g 'filter layout refresh'` sebelum implementasi | `1 failed`; `.organizations`: `Expected: "1"`, `Received: "0"`. [Output asli](docs/evidence/kirim-1/regression-before.txt), [trace](docs/evidence/kirim-1/regression-before-trace.zip). |
| 2026-09-18 | `npm test -- --project=chromium -g 'filter layout refresh'` sesudah implementasi | `1 passed (4.6s)` — [output asli](docs/evidence/kirim-1/regression-after.txt). |
| 2026-09-18 | `npm test` | `88 passed (1.9m)` — 22 skenario × chromium/mobile/firefox/webkit; sembilan skenario lama tetap ada. Semua skenario normal memeriksa console error 0 dan runtime error 0. [Output asli](docs/evidence/kirim-1/full-suite.txt). |
| 2026-09-18 | `npm run build` | Exit 0; `✓ built in 257ms` — lihat [output asli](docs/evidence/kirim-1/build.txt) untuk durasi build terakhir. |
| 2026-09-18 | `npm run preview -- --host 127.0.0.1 --port 4173` lalu `node scripts/verify-kirim-1.mjs` | Exit 0; [output asli](docs/evidence/kirim-1/production-check.txt), [JSON](docs/evidence/kirim-1/metrics.json). Teks GSAP diblokir: 43 + 66 + 49 + 21 = 179 node, 0 tersembunyi. Tiga target sentuh 32,390625px. Kontras aksen gelap 6,159:1; minimum seluruh pasangan termasuk hover 5,055:1. |
| 2026-09-18 | `PerformanceObserver('layout-shift')` pada build statis, 390×844, tanpa input | Setelah preload: `initialLayoutShifts390: []`, jumlah 0. Pengukuran lokal initial render hingga 5,5 detik setelah intro; bukan audit Lighthouse ulang. [JSON](docs/evidence/kirim-1/metrics.json). |
| 2026-09-19 | `node scripts/verify-kirim-2.mjs before` pada build `HEAD` | Exit 0. `imagesReusedWithDifferentCrop: ["/images/anung-profile.webp"]` — P1-3 dikonfirmasi berangka. Ruang mati kartu 344+295+322 = **961px**; jarak kosong hero **528px**; `headingLeadOnSameRow: false`; `introPaddingBlock: 128`. [metrics-before.json](docs/evidence/kirim-2/metrics-before.json). |
| 2026-09-19 | `node scripts/verify-kirim-2.mjs after` pada build statis | Exit 0. `imagesReusedWithDifferentCrop: []`; semua gambar `loaded: true` dan `declared: true`. Ruang mati kartu **562px**; jarak kosong hero **268px**; `headingLeadOnSameRow: true`; `introPaddingBlock: 104`. 4 slot bukti, 3 placeholder, semua captionnya memuat "ilustrasi sementara". [metrics-after.json](docs/evidence/kirim-2/metrics-after.json), [output](docs/evidence/kirim-2/verify-after.txt). |
| 2026-09-19 | Blokir `**/images/placeholder/**` lalu ukur ketiga slot | 3 request digagalkan. Tiap slot: `coverHeight: 317`, `background: linear-gradient`, `imageHidden: true`, `captionVisible: true`; `noHorizontalOverflow: true`. Halaman benar tanpa satu pun berkas cover. [metrics-after.json](docs/evidence/kirim-2/metrics-after.json) → `blockedPlaceholders`. |
| 2026-09-19 | Skenario klik kartu Beranda di WebKit pada `HEAD` (tanpa perubahan Kirim 2) | `crashed= true` — renderer WebKit mati. Bug lama, bukan regresi Kirim 2. Dipersempit: mematikan `filter` **atau** `transform` **atau** `transition` pada `.feature-photo` menghilangkan crash. |
| 2026-09-19 | Skenario yang sama setelah `filter` dilepas dari hover | `crashed= false`, `hash #/pengalaman#entri-anymind`. Test `deep link from a Beranda card lands on its own experience entry` lolos di keempat project. |
| 2026-09-19 | `npm test` | `112 passed (2.4m)` — 28 skenario × chromium/mobile/firefox/webkit. 22 skenario Kirim 1 tetap ada, 6 skenario baru ditambahkan, tidak ada yang dihapus. Console error 0 kecuali dua test yang memang menggagalkan request. [Output asli](docs/evidence/kirim-2/full-suite.txt). |
| 2026-09-19 | `npm run build` | Exit 0; `✓ built in 263ms`. Bundle (css + index + motion-runtime) **445.599 B → 454.464 B mentah**, **143.037 B → 145.181 B gzip** (+2.144 B), diukur dengan metode sama pada kedua build. [Output](docs/evidence/kirim-2/build.txt). |
| 2026-09-19 | Lighthouse mobile pada build statis, sebelum vs sesudah, mesin dan sesi sama | **Sebelum**: performance 95 · LCP 2,8s · FCP 1,5s · TBT 10ms · CLS 0 ([JSON](docs/evidence/kirim-2/lighthouse-mobile-before.json)). **Sesudah**: performance 93 · a11y 100 · best-practices 100 · SEO 100 · LCP 3,1s · FCP 1,5s · TBT 10ms · **CLS 0** ([JSON](docs/evidence/kirim-2/lighthouse-mobile.json)). Syarat fase CLS ≤ 0,01 terpenuhi (0,008 → 0). LCP turun 0,3s dibanding run hari ini dan 0,2s dibanding baseline tercatat 2,9s — dilaporkan apa adanya, alasannya di Catatan keputusan, penyelesaiannya P2-22/P2-26 di Kirim 5. |
| 2026-09-19 | `npm test -- --project=webkit -g 'interrupted transition'` (sebelum perbaikan, sendirian, 3×) | `1 passed (5.7s)` · `1 passed (5.8s)` · `1 passed (5.8s)` — lolos 3/3. Test ini tidak gagal saat diisolasi. |
| 2026-09-19 | `npx playwright test --project=webkit -g 'interrupted transition' --repeat-each=12 --workers=4` (sebelum perbaikan) | `12 passed (20.8s)`. Beban paralel saja tidak cukup untuk memicu race. |
| 2026-09-19 | Sapuan jeda 0–800 ms antara dua `hashchange` di WebKit, 21 titik (sebelum perbaikan) | 21/21 heading kembali ke `"Halo, saya Anung."`. Panjang jeda bukan variabelnya; frame yang jadi variabelnya. |
| 2026-09-19 | Probe deterministik: `requestAnimationFrame` ditahan 1500 ms lewat `addInitScript`, `src/App.jsx` diberi instrumentasi sementara (sebelum perbaikan) | **Gagal**, `Expected substring: "Halo, saya"` / `Received string: "Pengalaman magang saya."`. Log runtime: `change \| /pengalaman \| routeRef=/ \| active=false` → `curtain path start` → `change \| / \| routeRef=/ \| active=false` (tanpa reset) → `commit \| /pengalaman` → `timeline complete \| /pengalaman`. [Keluaran mentah](docs/evidence/gerbang-img-1/probe-sebelum-gagal.txt), [probe](docs/evidence/gerbang-img-1/probe-frame-gap.spec.js.txt). Instrumentasi dibuang sesudahnya. |
| 2026-09-19 | `npx playwright test tests/portfolio.spec.js -g "first frame gap"` pada `src/App.jsx` **sebelum** perbaikan | Exit 1, **4 failed** — chromium, mobile, firefox, webkit, semuanya `Received string: "Pengalamanmagang saya."`. Racenya tidak pernah khusus WebKit; WebKit hanya paling sering menunda frame pertama. [Log](docs/evidence/gerbang-img-1/regresi-tanpa-perbaikan-gagal.txt). |
| 2026-09-19 | `npx playwright test tests/portfolio.spec.js -g "first frame gap"` sesudah perbaikan | `4 passed (7.9s)`. |
| 2026-09-19 | `npm test -- --project=webkit -g 'interrupted transition'` sesudah perbaikan, 5× berturut-turut | `1 passed (4.1s)` · `1 passed (4.0s)` · `1 passed (4.1s)` · `1 passed (3.8s)` · `1 passed (3.6s)`, `exit=0` lima-limanya. [Log](docs/evidence/gerbang-img-1/webkit-gerbang-5-run.txt). |
| 2026-09-19 | `npm test` penuh sesudah perbaikan, run 1 | Exit 0, **116 passed (2.3m)**. [Log](docs/evidence/gerbang-img-1/suite-penuh-sesudah.txt). |
| 2026-09-19 | `npm test` penuh sesudah perbaikan, run 2 (tanpa perubahan apa pun) | Exit 0, **116 passed (2.3m)**. Kegagalan aslinya baru stabil pada run kedua, jadi gerbangnya juga dibuktikan dua run. [Log](docs/evidence/gerbang-img-1/suite-penuh-sesudah-2.txt). |
| 2026-09-19 | `npm run build` sesudah perbaikan | Exit 0, `✓ built in 264ms`. [Log](docs/evidence/gerbang-img-1/build.txt). |
| 2026-09-19 | `npx playwright test` pada `git worktree` commit `main` 58003a9, tanpa aset IMG-1 yang belum di-commit | Exit 0, **116 passed (2.5m)**. `main` hijau berdiri sendiri, bukan hanya di working tree yang memuat gambar. [Log](docs/evidence/gerbang-img-1/suite-penuh-main-58003a9.txt). |
| 2026-09-19 | `node scripts/make-placeholder-covers.mjs && node scripts/prepare-assets.mjs` | Exit 0; 3 PNG sumber + 3 WebP 1200×900 dihasilkan ulang dari SVG token warna brand. Foto tim `anymind-pantene-team.webp` 1200×900, 138 KB. |
| 2026-09-19 | Berat bukti | 24 screenshot PNG dikonversi WebP q80 sebelum di-commit: **14.423 KB → 3.990 KB**, sesuai aturan "PNG bukti di atas 500 KB" di `prompt.md`. |

| 2026-09-19 | `npx playwright test --project=chromium -g "honest scale\|experience counters\|career timeline\|revealing element\|GSAP blocked still leaves"` | Iterasi pertama **1 failed**: satu `.impact-stat` di Beranda tidak punya `data-reveal-kind` karena atribut bocor sebagai teks ke dalam `<strong>`. Diperbaiki, lalu `5 passed (9.8s)`. |
| 2026-09-19 | `npm test` | Exit 0, **136 passed (3.0m)** — 34 skenario × chromium/mobile/firefox/webkit. 116 hasil sebelumnya tetap ada, 5 skenario baru ditambahkan (20 hasil), tidak ada yang dihapus atau dilonggarkan. [Log asli](docs/evidence/kirim-3/full-suite.txt). |
| 2026-09-19 | `npm run build` | Exit 0, `✓ built in 250ms`. [Log](docs/evidence/kirim-3/build.txt). |
| 2026-09-19 | `node scripts/verify-kirim-3.mjs` pada build statis | Exit 0. 40 pemeriksaan kontras lolos, terendah **5.268:1** (arc IPK sebagai objek grafis, ambang 3:1); terendah untuk teks **5.806:1**, sama dengan lantai yang sudah tercatat. Skala: TOEFL `0.7439` = harapan, split `ratio 2`, tumpang tindih `4` bulan, arc `0.935001`. Keempat route tidak meluber di 320/390/1440. [JSON](docs/evidence/kirim-3/metrics.json), [output](docs/evidence/kirim-3/verify.txt). |
| 2026-09-19 | Kontras diukur ulang setelah tema diseed lewat `localStorage`, bukan lewat atribut | Run pertama melaporkan 15 pasangan gagal di tema gelap. Penyebabnya bukan warna: menyetel `documentElement.dataset.theme` langsung berlomba dengan efek tema React, sehingga warna depan terbaca dari satu tema dan latar dari tema lain (`gpa-number`: front `#6c151e` terang di atas `#163a36` gelap). Setelah diseed lewat pintu yang sama dengan penjaga tema di `index.html`, 40/40 lolos. |
| 2026-09-19 | Ukuran bundle, metode sama pada kedua sisi (`gzip -c9`, css + index + motion-runtime) | `HEAD` cd44c68 di `git worktree`: **454.489 B mentah / 144.594 B gzip**. Sesudah Kirim 3: **464.921 B mentah / 147.233 B gzip** — **+10.432 B mentah, +2.639 B gzip (+1,8%)**. Tanpa dependensi baru; seluruh kenaikan adalah markup, CSS, dan logika timeline. [Rincian](docs/evidence/kirim-3/bundle.txt). |
| 2026-09-19 | `node scripts/prepare-assets.mjs` sesudah ditambah render CV | Exit 0. `pdftoppm -png -r 150` → 2 PNG A4 1241×1754 di direktori sementara, lalu sharp → `public/images/cv-halaman-1.webp` dan `-2.webp`, keduanya **1000×1413**, 158 KB + 135 KB. Enam berkas gambar lama dihasilkan ulang byte-identik (`git status` tidak menandainya berubah). |
| 2026-09-19 | `npm run build` | Exit 0, `✓ built in 214ms`. Peringatan `[site-meta] VITE_SITE_URL belum diisi...` muncul seperti yang dimaksudkan. Bundle `index-*.js` **297.22 kB → 306.22 kB** mentah, **89.15 kB → 92.16 kB** gzip; CSS **36.18 kB → 37.11 kB**. [Log](docs/evidence/kirim-4/build.txt). |
| 2026-09-19 | `node scripts/verify-kirim-4.mjs` pada `vite preview` 4173 + dev berkunci 5174 | Exit 0, semua pemeriksaan lolos. `canonicalCount: 1`, `ogUrlCount: 1`, `titlesAgree: true`; `whatsapp.channelsInContactInfo: 3`, `inFooter: 1`; form tanpa kunci → `drafted`, dengan kunci → `sending`/`sent`/`failed` (500 dan `route.abort`) dengan `mailto:` fallback yang membawa isi pesan; `cvPreview` 2 halaman 1000×1413 `lazy`; `layoutShiftTentang: 0`; 12 pemeriksaan kontras lolos, terendah **5.806:1**; 12 kombinasi lebar×route tanpa overflow; `buildSecrets.leaks: []`. [Output](docs/evidence/kirim-4/verify.txt), [JSON](docs/evidence/kirim-4/metrics.json). |
| 2026-09-19 | `npm test` | Exit 0, **164 passed (3.3m)** — 41 skenario × chromium/mobile/firefox/webkit. 34 skenario lama tetap ada tanpa satu pun dihapus; 7 skenario baru ditambahkan. Dua assertion lama disesuaikan karena fase ini memang menambah elemen yang dihitungnya: jumlah target sentuh footer 3 → 4 (WhatsApp), dan pemeriksaan metadata dipindah dari DOM ke dokumen yang dilayani. [Log](docs/evidence/kirim-4/full-suite.txt). |
| 2026-09-19 | `node scripts/shoot-kirim-4.mjs` | Exit 0. 12 screenshot bagian (3 × {1440,390} × {terang,gelap}) + 4 keadaan form. Permintaan ke `api.web3forms.com` dijawab Playwright secara lokal — tidak ada permintaan yang keluar dari mesin dan tidak ada pesan yang benar-benar terkirim. PNG dikonversi WebP q80 sebelum di-commit. |
| 2026-09-19 | Uji kirim sampai inbox | **Belum dijalankan.** Butuh kunci Web3Forms asli yang belum ada. Jalur `mailto:` dan seluruh keadaan backend sudah dibuktikan dengan permintaan yang dicegat; yang menunggu hanya konfirmasi bahwa email benar-benar mendarat. |
| 2026-09-19 | Validasi LinkedIn Post Inspector + pratinjau WhatsApp nyata | **Belum dijalankan.** Butuh `VITE_SITE_URL` berisi domain nyata, situs ter-deploy, dan `public/images/og-cover.png` dari IMG-2. Markup-nya sendiri sudah dibuktikan pada dokumen yang dilayani. |
| 2026-09-20 | `npx playwright test --project=firefox -g 'the CV can be read' --repeat-each=3` sebelum perbaikan, dua keadaan pohon kerja | Exit 1 dua-duanya: **3/3 gagal** dengan VIS-1 terpasang, **3/3 gagal** pada `main` 54f05e1 yang bersih. Kegagalannya bukan ulah VIS-1. [Log](docs/evidence/gerbang-vis-1/sebelum-vis-1-terpasang.txt), [log](docs/evidence/gerbang-vis-1/sebelum-tanpa-vis-1.txt). |
| 2026-09-20 | `node docs/evidence/gerbang-vis-1/probe-cv.mjs` | Exit 0. Respons gambar CV ditahan 600 ms supaya balapannya selalu terbuka: urutan lama gagal 4/9 (firefox 3/3, webkit 1/3), urutan baru 0/9 gagal. `EncodingError: Invalid image request.` hanya muncul selama permintaan masih di jalan. [Log](docs/evidence/gerbang-vis-1/probe-cv.txt). |
| 2026-09-20 | `npm test` sesudah perbaikan, dua run berturut | Exit 0 dua-duanya, **164 passed (3.2m)** dan **164 passed (3.3m)**. [Log 1](docs/evidence/gerbang-vis-1/suite-penuh-1.txt), [log 2](docs/evidence/gerbang-vis-1/suite-penuh-2.txt). |
| 2026-09-20 | `npm test` pada `main` 60f9c5f apa adanya, tanpa rupa VIS-1 | Exit 0, **164 passed (3.1m)**. `main` hijau sendiri; rupa VIS-1 menunggu keputusan merge Milord di `fase/vis-1`. [Log](docs/evidence/gerbang-vis-1/suite-penuh-main.txt). |

### Output regresi gagal → lolos

Perintah sama: `npm test -- --project=chromium -g 'filter layout refresh'`.

Sebelum implementasi ([output lengkap](docs/evidence/kirim-1/regression-before.txt)):

```text
Error: expect(locator).toHaveCSS(expected) failed
Locator:  locator('.organizations')
Expected: "1"
Received: "0"
Timeout:  2000ms
1 failed
```

Sesudah implementasi ([output lengkap](docs/evidence/kirim-1/regression-after.txt)):

```text
✓  1 [chromium] › tests/portfolio.spec.js:22:1 › filter layout refresh reveals organizations, every card and contact callout (4.1s)
1 passed (4.6s)
```

### Batas bukti dan pemeriksaan visual — Kirim 1

- Screenshot sebelum direkam sebelum implementasi; sesudah direkam dari build statis dengan ukuran sama (desktop 1440×1000). Motion dikurangi untuk membandingkan crop final. Screenshot gelap awal diambil dengan mengganti atribut tema langsung; header sempat menyimpan warna frame lama. Screenshot akhir memakai tombol tema dan menunggu warna tautan selesai berubah. Penilaian kontras memakai warna terukur di JSON, bukan piksel screenshot awal.
- Hero, kartu beranda, dan Tentang diperiksa visual: logo AnyMind utuh; asterisk tidak menimpa lengan. Screenshot mobile tambahan pada 390×844.
- Uji GSAP diblokir sengaja menghasilkan satu diagnostik jaringan `Failed to load resource: net::ERR_FAILED`; tidak ada runtime error. Angka console error 0 berlaku untuk skenario normal, bukan request yang sengaja digagalkan.
- Data CV, klaim, foto sumber, dan ilustrasi dekoratif tidak diubah. Tidak ada gambar publik baru; width/height foto tetap 900×1200 dan ilustrasi tetap 1200×800.
- Kirim 1 selesai seluruhnya; status kirim berikutnya tetap sesuai rencana sebelumnya.

### Batas bukti dan pemeriksaan visual — Kirim 2

- Screenshot sebelum direkam dari build statis `HEAD` (`git stash` → `vite build` → rekam → `git stash pop`), sesudah dari build statis hasil kerja ini. Skrip, viewport, tema, dan urutan sama: `scripts/shoot-kirim-2.mjs`. Semua diambil dengan `reducedMotion: 'reduce'` dan setelah menggulir seluruh halaman supaya gambar `loading="lazy"` benar-benar terdekode; tanpa itu cover placeholder tampil sebagai blok CSS kosong di tangkapan layar meski di browser normal termuat.
- Semua angka ruang mati diukur dengan `align-self: start` dipaksakan lewat `addStyleTag`, supaya yang terbaca tinggi intrinsik kolom, bukan tinggi baris grid. Angka itu bukan hasil pembacaan screenshot.
- Lighthouse dijalankan dua kali pada build "sesudah" (93/93) dan tiga kali pada build "sebelum" (95/95/95) di mesin dan sesi yang sama, memakai Chromium bawaan Playwright lewat `CHROME_PATH`. Selisih LCP 0,3 detik konsisten, bukan derau satu run.
- Kategori `agentic-browsing` tidak diukur ulang di fase ini; itu bagian P2-30 di Kirim 5. Angka baseline 0,67 belum tersentuh.
- Crash WebKit diverifikasi dua arah: skenario yang sama dijalankan pada `HEAD` (crash) dan pada hasil kerja ini (tidak crash). Jadi klaim "bug lama" bukan tebakan.
- Cover placeholder yang ikut di-commit adalah blok warna datar, bukan tiruan tangkapan layar apa pun. Caption di halaman menyatakan statusnya; `alt` menggambarkan ilustrasinya, bukan pekerjaan yang tidak ditampilkan.
- Tidak ada angka baru yang tidak ada di `Anung Hanindhita Ramadhan-CV.pdf`. Tabel "Kutipan CV untuk P1-7" mencantumkan pasangannya satu per satu.
- Kirim 2 selesai seluruhnya. Giliran berikutnya: **IMG-1**, milik **Codex**, tiketnya sudah siap di `docs/image-jobs/IMG-1-bukti-placeholder.md`.

### Verifikasi IMG-1 — 2026-09-19

| Perintah / pemeriksaan | Hasil |
|---|---|
| `arch-playwright-provision --check` + launch Node Playwright | Nol library hilang; Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6 launch sukses. |
| `npm run build` | Exit 0, build 551ms. [Log](docs/evidence/kirim-img-1/build.txt). |
| `node docs/evidence/kirim-img-1/verify.mjs` | Exit 0; enam berkas 1200×900; byte WebP identik hasil pipeline PNG; 4 kombinasi viewport/tema lolos. Tiga slot termuat, caption “ilustrasi sementara”, atribut ukuran utuh, error 0, tanpa overflow. [JSON](docs/evidence/kirim-img-1/metrics.json). |
| Inspeksi visual | Tiga cover satu keluarga; tanpa teks/logo/wajah/UI/grafik data. Screenshot halaman penuh dan close-up galeri di [bukti](docs/evidence/kirim-img-1/README.md). |
| `npm test` — run pertama | Exit 1: 110 passed, 2 failed (4.2m). WebKit: `multiple disclosures animate height and refresh after opening and closing` gagal sampel tinggi antara awal/akhir (`portfolio.spec.js:93`); `interrupted transition and live reduced motion never lock the page` tetap pada Pengalaman saat menunggu Beranda (`portfolio.spec.js:392`). [Log asli](docs/evidence/kirim-img-1/full-suite-first.txt). Penyebab belum dipastikan; tidak mengubah aplikasi/test di luar tiket. |

Lighthouse/CLS tidak diaudit ulang: di luar cakupan tiket gambar. Tidak ada perubahan CSS/token, sehingga tidak ada pasangan kontras teks yang diubah.

| Perintah / keputusan lanjutan IMG-1 | Hasil |
|---|---|
| `npm test` — run ulang tanpa perubahan kode/config/test | Exit 1: **111 passed, 1 failed (4.2m)**. Disclosure WebKit sekarang lolos, tetapi `interrupted transition and live reduced motion never lock the page` kembali gagal pada `portfolio.spec.js:392`: expected “Halo, saya”, received “Pengalamanmagang saya.” [Log lengkap](docs/evidence/kirim-img-1/full-suite.txt). |
| Git per fase (sesi Codex) | **Tidak commit dan tidak push**: gerbang `npm test` belum lolos saat itu. Tidak ada hash commit dari sesi tersebut. |

Semua keluaran gambar IMG-1 dan pemeriksaan aset selesai pada sesi Codex; tiket gambar berstatus DONE, fase ditahan WIP oleh gerbang regresi. Keputusan menahan itu benar — penyebabnya memang bug kode, bukan aset.

### Gerbang IMG-1 — sesi tiket Claude Code, 2026-09-19

Kegagalan `[webkit] interrupted transition and live reduced motion never lock the page` dilacak sampai
akarnya di `src/App.jsx`: penjaga interupsi curtain memakai `transition.current?.isActive()`, dan GSAP
menjawab `false` untuk timeline yang sudah dibuat tapi belum dirender — `_initted` baru menyala pada tick
ticker pertama, sedangkan React memasang `inert` tanpa menunggu frame. `hashchange` kedua yang jatuh di
jendela itu lolos dari penjaga, sehingga curtain yatim tetap `commit()` route lama lalu melepas `inert`
di route yang sudah ditinggalkan. Perbaikannya: status "ada curtain berjalan" dimiliki sendiri lewat
`stopTransition()`, dipakai oleh cabang route-sama, cabang route-beda, cleanup listener, dan penyelamat
reduced-motion. Tidak ada timeout dinaikkan, assertion dilonggarkan, `test.skip` ditambahkan, atau
cakupan test dikurangi; satu test regresi ditambahkan (112 → 116 hasil di empat project).

Diagnosis, probe deterministik, dan seluruh keluaran mentah: [`docs/evidence/gerbang-img-1/`](docs/evidence/gerbang-img-1/README.md).

IMG-1 sekarang **DONE**; Ringkasan 17 → 18 dari 33.

Fase berikutnya: **Kirim 3 — Claude Code** (kerangka + angka + test). Sesudah itu
**VIS-1 — Codex** untuk rasanya. Sesi tiket ini berhenti di sini.

### Batas bukti dan pemeriksaan visual — Kirim 3

- Semua angka di bagian ini berasal dari `docs/evidence/kirim-3/metrics.json`,
  hasil `node scripts/verify-kirim-3.mjs` pada build statis. Tidak ada angka
  yang dibaca dari screenshot.
- Tidak ada bandingan "sebelum" untuk kelima visual: sebelum fase ini benda itu
  tidak ada. Yang punya bandingan hanya ukuran bundle, dan itu diambil dari
  `git worktree` pada commit `cd44c68` dengan metode pengukuran yang persis sama.
- Screenshot diambil dari build statis pada `http://127.0.0.1:4173` lewat
  `scripts/shoot-kirim-3.mjs`: 5 visual × {1440, 390} × {terang, gelap} dengan
  motion menyala dan jeda 2,5 detik supaya tween dan counter sudah mendarat,
  plus 5 versi `reducedMotion: 'reduce'` dan 2 halaman penuh. PNG dikonversi
  WebP q80 sebelum di-commit; total folder bukti 780 KB.
- Kontras dihitung dari warna terukur di browser, bukan dari token yang ditulis
  tangan, dan warna semi-transparan dikomposit dulu ke atas latar nyatanya.
  Ambangnya dipisah: teks 4.5:1, objek grafis 3:1 (WCAG 1.4.11).
- Tidak ada angka baru di luar `Anung Hanindhita Ramadhan-CV.pdf`. Satu-satunya
  angka yang bukan milik Anung adalah 310 dan 677, yaitu batas bawah dan atas
  skor total TOEFL ITP — itu sumbu tesnya, dicetak sebagai teks, dan dijelaskan
  di komentar `src/data.js`.
- Lighthouse, LCP, dan CLS tidak diaudit ulang: itu P2-22/P2-26 di Kirim 5.
  Baseline lama tidak disentuh dan tidak diklaim.
- Tidak ada aset gambar baru, jadi `docs/asset-provenance.md` tidak berubah dan
  tidak ada tiket gambar baru yang ditulis.
- Rupanya memang masih polos. Itu bukan kekurangan yang terlewat; bentuk, kurva,
  dan ritme adalah isi tiket VIS-1.

Kirim 3 selesai seluruhnya; Ringkasan 18 → 20 dari 33.

Fase berikutnya: **VIS-1 — Codex**, tiketnya siap di
[`docs/visual-jobs/VIS-1-visualisasi-data.md`](docs/visual-jobs/VIS-1-visualisasi-data.md),
branch `fase/vis-1`. Sesudah itu **Kirim 4 — Claude Code**.


### Verifikasi VIS-1 — sesi Codex 2026-09-19, penutup 2026-09-20

| Perintah / pemeriksaan | Hasil |
|---|---|
| `arch-playwright-provision --check` + launch tiga engine | Nol library hilang. Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6 berhasil launch. [Lingkungan](docs/evidence/vis-1/env-check.md). |
| `npm run build` | Exit 0. Peringatan canonical placeholder sesuai default Kirim 4. [Log](docs/evidence/vis-1/build.txt). |
| `EVIDENCE_DIR=docs/evidence/vis-1 node scripts/verify-kirim-3.mjs` | Exit 0: arc 0,935001, TOEFL 0,7439, split ≈2:1 (pembulatan subpiksel), cakupan track tepat (delta 0 px), overlap 4 bulan; empat route tanpa overflow pada 320/390/1440. Kontras standar 40/40: teks minimum 5,806:1, grafis terhadap permukaan 5,268:1. [Log](docs/evidence/vis-1/verify.txt), [metrik](docs/evidence/vis-1/metrics.json). |
| `node docs/evidence/vis-1/verify-polish.mjs` | Exit 0: 8 pemeriksaan ring–angka (4 lebar × 2 tema), sampel tween arc/bar langsung dari browser, 6 pasangan tambahan grafis terhadap campuran kisi/track, minimum 3,164:1 ≥ 3:1. [Log](docs/evidence/vis-1/verify-polish.txt), [metrik](docs/evidence/vis-1/polish-metrics.json). |
| Probe arc awal | Gagal pada batas pecahan nilai antara yang terlalu ketat: GSAP membulatkan offset CSS sementara menjadi 21 unit, fraksi 0,935726. Nilai akhir kembali ke atribut 21,237, fraksi 0,935001. Probe tambahan mengizinkan setengah unit SVG selama tween, dengan pemeriksaan nilai akhir tetap. Tidak mengubah test aplikasi atau logika GSAP. [Log probe](docs/evidence/vis-1/probe-arc-first.txt). |
| Reduced motion | 6 counter final, 6 `[data-bar]` tanpa transform, TOEFL tanpa transform, arc tanpa inline override. [Bukti](docs/evidence/vis-1/reduced-motion.txt). |
| `scripts/shoot-kirim-3.mjs` sebelum/sesudah + `shoot-mobile.mjs` | Exit 0; 56 WebP sebelum/sesudah. Lima visual × dua tema × desktop/mobile, reduced motion dan halaman penuh. Tambahan timeline mobile utuh karena header sticky menutupi atas tangkapan standar saat section lebih tinggi dari viewport. [Indeks](docs/evidence/vis-1/README.md). |
| SHA-256 sebelum/sesudah | 14 berkas terlindungi identik pada sesi implementasi: JSX, data, tests, scripts, package + lockfile. [Hasil](docs/evidence/vis-1/protected-files.txt). Snapshot pembanding sementara di `/tmp` tidak lagi tersedia saat sesi dilanjutkan; hasil lama dipertahankan, tidak diklaim diperiksa ulang. |
| `npm test` | **163 passed, 1 failed (3.3m)**. Firefox: `the CV can be read on the page without downloading it`, `tests/portfolio.spec.js:746:28`, `expect(rendered.natural).toBeGreaterThan(0)` menerima 0. Penyebab belum dipastikan; tidak mengubah source/test di luar tiket atau mengulang sampai hijau. [Log lengkap](docs/evidence/vis-1/full-suite.txt). |
| Penutup Git | Tidak ada commit, push, atau hash commit VIS-1: gerbang suite belum lolos. |

VIS-1 tetap **WIP**; total tetap **24/33**. Tindak lanjut: Claude Code memeriksa gerbang Firefox preview CV. Sesudah gerbang lolos dan VIS-1 ditutup, fase berikutnya **IMG-2 — Codex**, lalu **Kirim 5 — Claude Code**. Sesi ini tidak melanjutkan fase lain.

### Gerbang VIS-1 — sesi tiket Claude Code, 2026-09-20

Kegagalan `[firefox] the CV can be read on the page without downloading it`
(`tests/portfolio.spec.js:746`) dilacak sampai akarnya. `scrollIntoViewIfNeeded()`
hanya memulai permintaan gambar `loading="lazy"`; test lalu memanggil
`img.decode()` dan menelan penolakannya, mengira `decode()` menunggu muatan itu
mendarat. Firefox tidak menunggu — selama permintaannya masih di jalan,
`decode()` ditolak dengan `EncodingError: Invalid image request.` — jadi
`naturalWidth` dibaca pada gambar yang belum mendarat dan bernilai 0.

| Perintah / pemeriksaan | Hasil |
|---|---|
| Sebelum perbaikan, sumber dengan VIS-1 terpasang, `--repeat-each=3` | Exit 1: **3 dari 3 gagal**. [Log berkepala `git diff --stat`](docs/evidence/gerbang-vis-1/sebelum-vis-1-terpasang.txt). |
| Sebelum perbaikan, pohon kerja persis `main` 54f05e1, nol perubahan VIS-1 | Exit 1: **3 dari 3 gagal**. Kegagalannya sudah ada di commit Kirim 4 — bukan ulah VIS-1, dan ini pembanding yang diminta catatan balik Codex. [Log](docs/evidence/gerbang-vis-1/sebelum-tanpa-vis-1.txt). |
| `node docs/evidence/gerbang-vis-1/probe-cv.mjs` (respons gambar ditahan 600 ms, 3 engine × 3 ronde × 2 urutan) | Exit 0. Urutan lama: firefox **0/3** lolos (`EncodingError: Invalid image request.`), webkit 2/3 (`Aborted by source change.`), chromium 3/3. Urutan baru: **9/9** lolos. Di semua engine, setelah muatannya mendarat `naturalWidth` 1000 dan `decode()` sukses — gambarnya sehat, pengukurannya yang salah. [Log](docs/evidence/gerbang-vis-1/probe-cv.txt). |
| Perbaikan | `tests/portfolio.spec.js`, satu test: tunggu `naturalWidth > 0` (batas 10 detik) sebelum mengukur, lalu `decode()` yang tadinya ditelan diperiksa `expect(rendered.decoded).toBe('ok')`. Aplikasi tidak disentuh. Tidak ada timeout dinaikkan, assertion dilonggarkan, `test.skip` ditambahkan, atau cakupan dikurangi — satu assertion justru ditambah. |
| `npx playwright test -g 'the CV can be read…' --repeat-each=5` di 4 project | Exit 0, **20 passed (23.8s)**. [Log](docs/evidence/gerbang-vis-1/sesudah-ulang-5.txt). |
| `npm test` run 1 | Exit 0, **164 passed (3.2m)** — jumlah hasil sama dengan Kirim 4, tidak ada yang dihapus. [Log](docs/evidence/gerbang-vis-1/suite-penuh-1.txt). |
| `npm test` run 2, tanpa perubahan apa pun | Exit 0, **164 passed (3.3m)**. [Log](docs/evidence/gerbang-vis-1/suite-penuh-2.txt). |
| `npm test` pada `main` 60f9c5f apa adanya | Exit 0, **164 passed (3.1m)** — dua run di atas diambil dengan rupa VIS-1 terpasang, run ini membuktikan `main` sendiri juga hijau. [Log](docs/evidence/gerbang-vis-1/suite-penuh-main.txt). |
| `npm run build` | Exit 0; peringatan canonical placeholder tetap seperti default Kirim 4. [Log](docs/evidence/gerbang-vis-1/build.txt). |
| `EVIDENCE_DIR=docs/evidence/gerbang-vis-1 node scripts/verify-kirim-3.mjs` | Exit 0 pada pohon kerja final: arc IPK 0,935001, TOEFL 0,7439 = harapan, rasio split 2,0001, tumpang tindih 4 bulan, 40 pasangan kontras terendah 5,268:1. Identik dengan sesi Codex. [Log](docs/evidence/gerbang-vis-1/verify-kirim-3.txt), [metrik](docs/evidence/gerbang-vis-1/metrics.json). |
| `node docs/evidence/vis-1/verify-polish.mjs` | Exit 0: 8 pemeriksaan ring–angka, sampel tween langsung, 6 pasangan kontras cat terendah 3,164:1 — sama persis dengan angka sesi Codex. [Log](docs/evidence/gerbang-vis-1/verify-polish.txt). |
| Lighthouse / LCP / CLS | Tidak diaudit ulang; itu P2-22/P2-26 di Kirim 5. Baseline lama tidak disentuh dan tidak diklaim. |

VIS-1 sekarang **DONE**; Ringkasan 24 → 25 dari 33.

Fase berikutnya saat catatan itu ditulis: **IMG-2 — Codex**, tiketnya siap di
[`docs/image-jobs/IMG-2-og-image.md`](docs/image-jobs/IMG-2-og-image.md),
branch `fase/img-2`. Sesudah itu **Kirim 5 — Claude Code**. Sesi tiket itu
berhenti di sana.

---

## Laporan penutup — kondisi project terhadap `plan.md`

Ditulis di akhir Kirim 5, fase kode terakhir. Dua fase Codex masih terbuka:
**IMG-2** (berkas OG, sudah dikerjakan di branch `fase/img-2`, menunggu
keputusan merge Milord) dan **Kirim 6** (pass poles visual).

### Setiap temuan `plan.md`

| ID | Temuan | Status | Di mana |
|---|---|---|---|
| P0-1 | Filter pengalaman menyembunyikan satu section selamanya | DONE | Kirim 1 |
| P0-2 | Tidak ada jaring pengaman kalau ScrollTrigger gagal | DONE | Kirim 1 |
| P1-3 | Satu foto dipakai 3× dengan crop berbeda | DONE | Kirim 2 |
| P1-4 | Foto AnyMind × Pantene tidak dipakai | DONE | Kirim 2 |
| P1-5 | CV mengklaim konten yang tidak pernah ditampilkan | DONE | Kirim 2 (galeri bukti + placeholder jujur) |
| P1-6 | Tidak ada case study; dua kartu menuju halaman sama | DONE (diturunkan) | Kirim 2 — deep-link ke anchor entri, bukan halaman case study terpisah |
| P1-7 | Fakta CV yang hilang | DONE | Kirim 2 |
| P1-8 | Angka masih teks statis | DONE | Kirim 3 (kerangka) + VIS-1 (rupa) |
| P1-9 | Tidak ada timeline; periode tumpang tindih membingungkan | DONE | Kirim 3 + VIS-1 |
| P1-10 | Form kontak tidak mengirim apa pun | DONE | Kirim 4 — menunggu kunci Web3Forms asli untuk uji sampai inbox |
| P1-11 | Tidak ada tautan WhatsApp | DONE | Kirim 4 |
| P1-12 | Link telanjang saat dibagikan | DONE (berkas menunggu IMG-2) | Kirim 4 — tag lengkap dan terkunci test; `public/images/og-cover.png` ada di branch `fase/img-2` |
| P1-13 | CV hanya bisa di-download | DONE | Kirim 4 |
| P2-14 | Ruang mati besar | DONE | Kirim 2 |
| P2-15 | Mode gelap kehilangan aksen | DONE | Kirim 1 |
| P2-16 | Crop potret memotong logo AnyMind | DONE | Kirim 1 |
| P2-17 | Asterisk menumpuk di lengan subjek | DONE | Kirim 1 |
| P2-18 | ContactCallout identik di 3 halaman | DONE | Kirim 2 |
| P2-19 | Disclosure membuka tanpa animasi | DONE | Kirim 1 |
| P2-20 | Accordion hanya satu terbuka | DONE | Kirim 1 |
| P2-21 | Intro memblokir kunjungan pertama | DONE | Kirim 1 |
| P2-22 | LCP mobile di atas target | DONE | Kirim 5 — 3,1 s → 2,3 s |
| P2-23 | Kosakata reveal terlalu seragam | DONE | Kirim 3 (penanda) + VIS-1 (nilai) |
| P2-24 | Satu bundle tanpa code splitting | DONE (dibatasi) | Kirim 5 — code-split per route + reduced motion tidak mengunduh chunk animasi. Phosphor sengaja tidak diganti SVG manual |
| P2-25 | Subset font untuk aksara yang tidak dipakai | **SKIP** | 47 KB artefak build, dampak runtime nol: browser hanya mengunduh `unicode-range` yang cocok |
| P2-26 | Satu ukuran gambar untuk semua layar | DONE | Kirim 5 — AVIF + WebP, 3–4 lebar per gambar, `srcset`/`sizes` |
| P2-27 | Client-side render + hash route = satu dokumen terindeks | **SKIP** | Butuh keputusan hosting + rewrite. Google tetap merender JS; sakit utamanya (preview LinkedIn/WA) diobati `og:image` di Kirim 4 |
| P2-28 | Tidak ada structured data | DONE | Kirim 5 |
| P2-29 | Tidak ada `sitemap.xml` | DONE | Kirim 5 |
| P2-30 | Tidak ada `llms.txt` | DONE | Kirim 5 — agentic-browsing 0,67 → 1,00 |
| P2-31 | Situs Indonesia, CV Inggris, tanpa opsi bahasa | **SKIP** | Item termahal di daftar; sendirian bisa memakan tiga fase |
| P3-32 | Tiga target sentuh di bawah 24 px | DONE | Kirim 1 |
| P3-33 | `role="img"` pada pita marquee | DONE | Kirim 1 |

30 DONE · 3 SKIP · 0 tertinggal tanpa alasan.

### Metrik akhir vs baseline

Kolom baseline adalah angka yang dicatat sebelum pekerjaan dimulai
(`plan.md`, audit 2026-09-18). Kolom "sebelum, hari ini" adalah build `main`
c89885e yang dibangun ulang dan diaudit di mesin dan sesi yang sama dengan
kolom akhir — itu pembanding yang sah; baseline lama diukur di sesi lain.

| Metrik | Baseline 2026-09-18 | Sebelum, hari ini | **Akhir** |
|---|---|---|---|
| Lighthouse performance | 93 | 93 | **98** |
| Lighthouse accessibility | 100 | 100 | **100** |
| Lighthouse best-practices | 100 | 100 | **100** |
| Lighthouse SEO | 100 | 100 | **100** |
| Lighthouse agentic-browsing | 0,67 | 0,67 | **1,00** |
| LCP mobile | 2,9 s | 3,1 s | **2,3 s** |
| FCP mobile | 1,7 s | 1,5 s | **1,5 s** |
| Speed Index | 3,5 s | 2,7 s | **2,5 s** |
| TBT | 110 ms | 20 ms | **20 ms** |
| CLS | 0,008 | 0 | **0** |
| Entry JS (gzip) | 132.009 B | 90.725 B | **84.398 B** |
| JS diminta saat reduced motion (gzip) | 132.009 B | 139.464 B | **84.398 B** |
| Hasil `npm test` | 9 skenario × 4 project | 164 | **196** |
| Console error | 0 | 0 | **0** |

Tidak satu pun angka gerbang turun. Entry JS baseline 132.009 B lebih kecil dari
kolom "sebelum, hari ini" karena pada saat baseline diukur GSAP/Lenis masih di
dalam satu berkas yang sama; sejak Kirim 1 keduanya jadi chunk sendiri, jadi dua
angka itu tidak mengukur benda yang sama. Yang sebanding adalah kolom dua dan
tiga.

### Sengaja tidak dikerjakan — bisa diambil kapan saja

Pakai "Prompt satuan" di `prompt.md`.

| ID | Item | Kenapa dilepas | Perkiraan biaya kalau diambil |
|---|---|---|---|
| P2-31 | Bilingual ID/EN + `hreflang` | Item termahal di seluruh daftar | Setiap string di `src/data.js` dan empat halaman, plus toggle, plus test per bahasa |
| P2-27 | Prerender / SSG per route | Butuh keputusan hosting dan rewrite; hash route jadi path route | Ganti routing, ganti `sitemap.xml` jadi empat `<loc>`, ganti canonical per halaman |
| P1-6 | Halaman case study terpisah | Diturunkan jadi deep-link anchor: 90% manfaat, 10% biaya | Route baru per entri plus copy baru |
| P2-25 | Buang subset font cyrillic/greek/vietnamese | 47 KB artefak build, nol dampak runtime | Konfigurasi `@fontsource` atau subset manual |
| P2-24 | Ganti Phosphor dengan SVG inline | ~20 KB untuk 14 ikon tulis tangan; rasio buruk | 14 ikon manual + penyesuaian ukuran/stroke |

### Slot yang masih memakai placeholder

Tiga slot bukti di halaman Pengalaman, semuanya `placeholder: true` di
`src/data.js` dan `data-placeholder="true"` di DOM, dengan caption yang
menyatakan statusnya sebagai konten yang terlihat.

| Slot | Berkas yang harus dikirim Anung | Taruh di | Lalu |
|---|---|---|---|
| `konten-sosial` | 4+ konten Instagram Anima Companion (gambar asli atau tangkapan layar) | `assets/source/placeholder/konten-sosial.png`, 1200 × 900 | `node scripts/prepare-assets.mjs`, hapus `placeholder: true`, tulis ulang `caption` + `alt`, tambah baris di `docs/asset-provenance.md` |
| `video-produk` | 3 video promosi produk + video profil perusahaan (thumbnail cukup) | `assets/source/placeholder/video-produk.png`, 1200 × 900 | sama |
| `webinar-b2b` | Rekaman atau tangkapan layar webinar B2B 15+ peserta | `assets/source/placeholder/webinar-b2b.png`, 1200 × 900 | sama |

Satu slot lagi bukan placeholder dan tidak perlu diganti: foto tim
`anymind-pantene-team.webp` adalah foto asli milik Anung.

Tiga hal lain yang masih menunggu, di luar galeri bukti:

- `public/images/og-cover.png` 1200 × 630 — sudah dibuat di branch `fase/img-2`,
  menunggu keputusan merge Milord. Selama belum di-merge ke `main`, `og:image`
  menunjuk jalur yang 404.
- `VITE_SITE_URL` — domain final belum ada. Selama kosong, canonical, `og:url`,
  `sitemap.xml` dan `llms.txt` memakai host placeholder
  `https://anung-ramadhan.example` dan `npm run build` memperingatkannya setiap
  kali. Validasi LinkedIn Post Inspector dan pratinjau WhatsApp nyata menunggu
  domain itu, karena keduanya butuh URL publik yang hidup.
- `VITE_WEB3FORMS_KEY` — tanpa kunci, form kontak jatuh ke draf `mailto:`, dan
  copy-nya mengatakan persis itu. Uji kirim sampai inbox menunggu kunci asli.

### Fase berikutnya

**Kirim 6 — Codex**, pass poles visual, branch `fase/kirim-6`. Daftar kerja dan
batasannya ada di `prompt.md` bagian "KIRIM #6". Angka yang tidak boleh turun
ada di bagian Kirim 6 di atas.

**IMG-2 — Codex** sudah dikerjakan di branch `fase/img-2` (commit `0adb7e5`) dan
menunggu keputusan merge Milord; itu bukan pekerjaan agent. Sampai branch itu
di-merge, `main` menyajikan `og:image` yang menunjuk berkas yang belum ada.

Sesi Kirim 5 berhenti di sini.
