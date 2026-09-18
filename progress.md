# Progress — Perbaikan Portofolio Anung

Sumber temuan: `plan.md` (audit 2026-09-18).
Aturan: satu baris hanya boleh jadi `DONE` kalau ada bukti verifikasi yang tertulis di kolom Bukti. "Kelihatannya jalan" bukan bukti.

Status: `TODO` · `WIP` · `BLOCKED` · `DONE` · `SKIP`

---

## Ringkasan

Rencana eksekusi: **5 kirim**. Pemetaan lengkap ada di `prompt.md`.

| Kirim | Isi | Item | Done |
|---|---|---|---|
| 1 | Bug P0 + semua perbaikan mekanis | 10 | 10 |
| 2 | Bukti kerja + ruang mati | 7 | 0 |
| 3 | Visualisasi data + kosakata motion | 3 | 0 |
| 4 | Konversi | 4 | 0 |
| 5 | Performa, SEO, penutup | 6 | 0 |
| — | **Total dikerjakan** | **30** | **10** |
| — | Sengaja di-SKIP | 3 | — |

Di-SKIP supaya muat 5 kirim (alasan lengkap di `prompt.md`):
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
| P1-4 | Pakai `with_anymind_team.jpg` (AnyMind × Pantene) | TODO | Butuh: masuk `prepare-assets.mjs`, tampil di halaman Pengalaman dekat klaim "40 mitra afiliasi", alt text deskriptif. |
| P1-5 | Galeri bukti digerakkan data + placeholder jujur | BLOCKED | Aset dari Anung. Komponen tetap dibangun; slot diisi belakangan tanpa tulis JSX. |
| P1-3 | Hentikan 1 foto dipakai 3×; beri gambar ke halaman Pengalaman | TODO | Butuh: audit — tidak ada gambar muncul >1× dengan crop berbeda. |
| P1-7 | Fakta CV yang hilang (profit bazar IDR 100k, 11 laporan BEM, konteks perusahaan) | TODO | Butuh: cek silang tiap angka ke `Anung Hanindhita Ramadhan-CV.pdf`. |
| P2-14 | Ruang mati: hero, `.section-heading`, `.intro-section`, `.experience-side` | TODO | Screenshot sebelum/sesudah 1440px. |
| P1-6 | Kartu Beranda deep-link ke anchor entri yang tepat | TODO | Diturunkan dari halaman case study terpisah. |
| P2-18 | ContactCallout identik di 3 halaman | TODO | |

## Kirim 3 — Visualisasi data + kosakata motion

| ID | Item | Status | Bukti |
|---|---|---|---|
| P1-8 | Ring IPK · bar TOEFL · split 100/50 Shopee-TikTok · counter halaman Pengalaman | TODO | Butuh: semua terbaca benar dengan `prefers-reduced-motion: reduce` (nilai akhir langsung tampil). |
| P1-9 | Timeline karier yang menunjukkan periode tumpang tindih | TODO | Butuh: Jan–Apr 2026 dan Jan–Jul 2026 terbaca jelas berjalan bersamaan. |
| P2-23 | Kosakata reveal terlalu seragam | TODO | |

## Kirim 4 — Konversi

| ID | Item | Status | Bukti |
|---|---|---|---|
| P1-10 | Backend form kontak nyata (mailto jadi fallback) | TODO | Butuh: submit tes sampai ke inbox. Screenshot email masuk. |
| P1-11 | Tautan WhatsApp `wa.me/6281388116739` | TODO | Butuh: klik dari mobile membuka WA dengan pesan terisi. |
| P1-12 | `og:image` + `og:url` + `twitter:card` + canonical | TODO | Butuh: validasi LinkedIn Post Inspector & preview WhatsApp nyata. |
| P1-13 | Preview CV inline | TODO | Butuh: halaman pertama CV terlihat tanpa download. |

## Kirim 5 — Performa, SEO, penutup

| ID | Item | Status | Bukti |
|---|---|---|---|
| P2-24 | Bundle 414 KB — code-split per route + lazy GSAP/Lenis | TODO | Butuh: gzip sebelum/sesudah. Phosphor TIDAK diganti (di luar scope). |
| P2-26 | Satu ukuran gambar untuk semua layar | TODO | Butuh: AVIF+WebP multi-lebar dengan `srcset`, CLS tetap ≤ 0.01. |
| P2-22 | LCP mobile 2.9s → di bawah 2.5s | TODO | Butuh: audit Lighthouse mobile baru, angka dicatat di sini. |
| P2-28 | JSON-LD `Person` | TODO | Butuh: lolos Google Rich Results Test. |
| P2-29 | `sitemap.xml` | TODO | |
| P2-30 | `llms.txt` (agentic-browsing 0.67) | TODO | Butuh: skor agentic-browsing naik, dicatat di sini. |

## Sengaja di-SKIP

| ID | Item | Alasan |
|---|---|---|
| P2-31 | Toggle bilingual ID/EN + `hreflang` | Item termahal di daftar; sendirian bisa makan 3 kirim. |
| P2-27 | Prerender / SSG per route | Butuh keputusan hosting + rewrite. Google tetap bisa render JS; sakit utamanya (preview LinkedIn/WA) diobati `og:image` di Kirim 4. |
| P2-25 | Buang subset font cyrillic/greek/vietnamese | 47 KB artefak build, dampak runtime nol — browser cuma unduh `unicode-range` yang cocok. |

Ambil lagi kapan saja lewat "Prompt satuan" di `prompt.md`.

## Aset yang ditunggu dari Anung

Blocker untuk P1-5. Sampai ini ada, halaman Pengalaman tetap tanpa gambar.

- [ ] 4+ konten Instagram Anima Companion (screenshot atau file asli)
- [ ] 3 video promosi produk (file, atau thumbnail + tautan)
- [ ] Video profil perusahaan
- [ ] Rekaman/screenshot webinar B2B (15+ peserta)
- [ ] Foto tambahan dari masa AnyMind (selain `with_anymind_team.jpg`)
- [ ] Opsional: screenshot dashboard afiliasi Shopee/TikTok, angka sensitif disensor
- [ ] Opsional: screenshot laporan bulanan yang dia susun, angka disensor
- [ ] Konfirmasi: mana yang boleh dipublikasikan, mana yang NDA

Kalau materialnya tidak boleh dipublikasikan, keputusannya bukan "hilangkan diam-diam" — tampilkan placeholder jujur dengan caption yang menjelaskan.

---

## Catatan keputusan

Dicatat saat pengerjaan berlangsung — apa yang diputuskan, kenapa, dan apa yang dilepas.

| Tanggal | Keputusan | Alasan |
|---|---|---|
| 2026-09-18 | Audit awal, 33 temuan | Baseline |
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

| 2026-09-18 | `arch-playwright-provision/scripts/provision_playwright_arch.sh --check` + launch headless Node Playwright | Library hilang 0; Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6 berhasil launch; lihat [env-check](docs/env-check.md). |
| 2026-09-18 | `npm test -- --project=chromium -g 'filter layout refresh'` sebelum implementasi | `1 failed`; `.organizations`: `Expected: "1"`, `Received: "0"`. [Output asli](docs/evidence/kirim-1/regression-before.txt), [trace](docs/evidence/kirim-1/regression-before-trace.zip). |
| 2026-09-18 | `npm test -- --project=chromium -g 'filter layout refresh'` sesudah implementasi | `1 passed (4.6s)` — [output asli](docs/evidence/kirim-1/regression-after.txt). |
| 2026-09-18 | `npm test` | `88 passed (1.9m)` — 22 skenario × chromium/mobile/firefox/webkit; sembilan skenario lama tetap ada. Semua skenario normal memeriksa console error 0 dan runtime error 0. [Output asli](docs/evidence/kirim-1/full-suite.txt). |
| 2026-09-18 | `npm run build` | Exit 0; `✓ built in 257ms` — lihat [output asli](docs/evidence/kirim-1/build.txt) untuk durasi build terakhir. |
| 2026-09-18 | `npm run preview -- --host 127.0.0.1 --port 4173` lalu `node scripts/verify-kirim-1.mjs` | Exit 0; [output asli](docs/evidence/kirim-1/production-check.txt), [JSON](docs/evidence/kirim-1/metrics.json). Teks GSAP diblokir: 43 + 66 + 49 + 21 = 179 node, 0 tersembunyi. Tiga target sentuh 32,390625px. Kontras aksen gelap 6,159:1; minimum seluruh pasangan termasuk hover 5,055:1. |
| 2026-09-18 | `PerformanceObserver('layout-shift')` pada build statis, 390×844, tanpa input | Setelah preload: `initialLayoutShifts390: []`, jumlah 0. Pengukuran lokal initial render hingga 5,5 detik setelah intro; bukan audit Lighthouse ulang. [JSON](docs/evidence/kirim-1/metrics.json). |

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

### Batas bukti dan pemeriksaan visual

- Screenshot sebelum direkam sebelum implementasi; sesudah direkam dari build statis dengan ukuran sama (desktop 1440×1000). Motion dikurangi untuk membandingkan crop final. Screenshot gelap awal diambil dengan mengganti atribut tema langsung; header sempat menyimpan warna frame lama. Screenshot akhir memakai tombol tema dan menunggu warna tautan selesai berubah. Penilaian kontras memakai warna terukur di JSON, bukan piksel screenshot awal.
- Hero, kartu beranda, dan Tentang diperiksa visual: logo AnyMind utuh; asterisk tidak menimpa lengan. Screenshot mobile tambahan pada 390×844.
- Uji GSAP diblokir sengaja menghasilkan satu diagnostik jaringan `Failed to load resource: net::ERR_FAILED`; tidak ada runtime error. Angka console error 0 berlaku untuk skenario normal, bukan request yang sengaja digagalkan.
- Data CV, klaim, foto sumber, dan ilustrasi dekoratif tidak diubah. Tidak ada gambar publik baru; width/height foto tetap 900×1200 dan ilustrasi tetap 1200×800.
- Kirim 1 selesai seluruhnya; status kirim berikutnya tetap sesuai rencana sebelumnya.
