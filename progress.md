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
| VIS-1 | Rasa visual + animasi untuk kerangka Kirim 3 | Codex | 1 | 1 |
| 4 | Konversi | Claude Code | 4 | 0 |
| IMG-2 | Gambar OG 1200×630 | Codex | 1 | 0 |
| 5 | Performa, SEO, penutup | Claude Code | 6 | 0 |
| 6 | Pass poles visual terakhir | Codex | 1 | 0 |
| — | **Total dikerjakan** | | **33** | **21** |
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

VIS-1 selesai diverifikasi pada sesi Codex 2026-09-19. Tiket:
[`docs/visual-jobs/VIS-1-visualisasi-data.md`](docs/visual-jobs/VIS-1-visualisasi-data.md).

| ID | Item | Status | Bukti |
|---|---|---|---|
| P2-23 | Kosakata reveal terlalu seragam, plus pass rasa atas seluruh keluaran Kirim 3 | DONE | Ring menyatu dengan angka; timeline berkisi bulanan; hierarki TOEFL/split/counter; timing berbeda per jenis konten. [Bukti sebelum/sesudah + reduced motion](docs/evidence/vis-1/README.md). `npm test`: **136 passed (3.0m)**, test tidak diubah; [log](docs/evidence/vis-1/full-suite.txt). [Verifikasi skala + 40 pasangan kontras](docs/evidence/vis-1/metrics.json), minimum teks **5.806:1**. Pasangan baru isian TOEFL terhadap track: **6.223:1** terang / **3.627:1** gelap, lolos grafis ≥ 3:1 ([JSON](docs/evidence/vis-1/presentation.json)). 320/390/1440 tanpa overflow, reduced motion final. Branch `fase/vis-1`. |

## Kirim 4 — Konversi

| ID | Item | Status | Bukti |
|---|---|---|---|
| P1-10 | Backend form kontak nyata (mailto jadi fallback) | TODO | Butuh: submit tes sampai ke inbox. Screenshot email masuk. |
| P1-11 | Tautan WhatsApp `wa.me/6281388116739` | TODO | Butuh: klik dari mobile membuka WA dengan pesan terisi. |
| P1-12 | `og:image` + `og:url` + `twitter:card` + canonical | TODO | Butuh: validasi LinkedIn Post Inspector & preview WhatsApp nyata. |
| P1-13 | Preview CV inline | TODO | Butuh: halaman pertama CV terlihat tanpa download. |

## IMG-2 — Gambar OG 1200×630 · Codex

Tiket: `docs/image-jobs/IMG-2-og-image.md` (ditulis oleh sesi Kirim 4).

| ID | Item | Status | Bukti |
|---|---|---|---|
| IMG-2 | `public/images/og-cover.png` 1200×630 | TODO | Butuh: berkas ada, validasi LinkedIn Post Inspector + preview WhatsApp nyata setelah berkas masuk. |

## Kirim 5 — Performa, SEO, penutup

| ID | Item | Status | Bukti |
|---|---|---|---|
| P2-24 | Bundle 414 KB — code-split per route + lazy GSAP/Lenis | TODO | Butuh: gzip sebelum/sesudah. Phosphor TIDAK diganti (di luar scope). |
| P2-26 | Satu ukuran gambar untuk semua layar | TODO | Butuh: AVIF+WebP multi-lebar dengan `srcset`, CLS tetap ≤ 0.01. |
| P2-22 | LCP mobile 2.9s → di bawah 2.5s | TODO | Butuh: audit Lighthouse mobile baru, angka dicatat di sini. |
| P2-28 | JSON-LD `Person` | TODO | Butuh: lolos Google Rich Results Test. |
| P2-29 | `sitemap.xml` | TODO | |
| P2-30 | `llms.txt` (agentic-browsing 0.67) | TODO | Butuh: skor agentic-browsing naik, dicatat di sini. |

## Kirim 6 — Pass poles visual · Codex

Hanya dijalankan setelah Kirim 5 seluruhnya `DONE`.

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
Menukarnya = taruh berkas di jalur yang sama dan hapus `placeholder: true`.
Tidak ada JSX yang perlu ditulis ulang.

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
| 2026-09-19 | VIS-1: ring dipusatkan lewat CSS, timeline diberi kisi dekoratif 11 bulan, teks tidak ditaruh di atas kisi | JSX dan data tetap utuh; posisi/lebar bar tetap memakai `--from`/`--span`. Kisi mengikuti rentang Sep 2025–Jul 2026 yang ada; bila rentang data berubah, jumlah sel perlu disesuaikan. |
| 2026-09-19 | VIS-1: hanya nilai tiga tabel timing yang berubah; durasi counter tetap | Tabel adalah batas izin tiket. Reveal teks dipercepat, media/arc lebih tenang, tanpa mengubah lifecycle, fallback, atau reduced motion. |
| 2026-09-19 | VIS-1: bukti di `docs/evidence/vis-1/`, progres dan status tiket ditutup oleh Codex | Jalur mengikuti tiket; update progres mengikuti instruksi penutup sesi pengguna. Tidak ada gambar publik baru, jadi provenance dan tiket gambar tidak berubah. |
| 2026-09-19 | VIS-1: crop halaman penuh tambahan untuk timeline 390px | Screenshot locator skrip lama memotong bagian atas judul saat motion aktif pada section yang lebih tinggi dari viewport. Crop frame halaman penuh merekam judul utuh tanpa mengubah aplikasi; keluaran mentah tetap disimpan. |
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
| 2026-09-19 | VIS-1: `arch-playwright-provision --check` + launch Node Playwright | Nol library WebKit hilang. Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6 launch sukses; [bukti](docs/evidence/vis-1/env-check.txt). |
| 2026-09-19 | VIS-1: `npm run build` | Exit 0, 217ms; [log](docs/evidence/vis-1/build.txt). |
| 2026-09-19 | VIS-1: `EVIDENCE_DIR=docs/evidence/vis-1 node scripts/verify-kirim-3.mjs` dengan `PORTFOLIO_URL=http://127.0.0.1:4175` | Exit 0. Arc 0.935001, TOEFL 0.7439, split 2.0001 di desktop (pembulatan subpiksel), overlap 4 bulan. 40 pasangan kontras lolos, teks minimum 5.806:1. [Log](docs/evidence/vis-1/verify.txt). |
| 2026-09-19 | VIS-1: `node docs/evidence/vis-1/verify-presentation.mjs` | Exit 0. Kontras track TOEFL baru 6.223:1 / 3.627:1; enam bar reduced motion tanpa transform; tiga split menutup track; ring 320px memuat angka di kedua tema, error aplikasi 0. [Log](docs/evidence/vis-1/presentation.txt). |
| 2026-09-19 | VIS-1: `scripts/shoot-kirim-3.mjs` sebelum/sesudah + `capture-mobile-timeline.mjs` | Exit 0; 60 WebP termasuk empat gambar 320px dan dua crop timeline 390px. [Indeks bukti](docs/evidence/vis-1/README.md). |
| 2026-09-19 | VIS-1: `npm test` | Exit 0, **136 passed (3.0m)** pada chromium/mobile/firefox/webkit, tanpa mengubah test. [Log penuh](docs/evidence/vis-1/full-suite.txt). |

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

### Penutup VIS-1 — 2026-09-19

VIS-1 **DONE**; Ringkasan **21/33**. Perubahan aplikasi hanya `src/styles.css` dan nilai tiga tabel timing `src/motion.js`. Bukti, batas pengukuran, dan cara mengulang ada di [docs/evidence/vis-1/README.md](docs/evidence/vis-1/README.md). Tidak ada kebutuhan gambar baru. Lighthouse/CLS tidak diaudit ulang pada tiket ini.

Satu commit fase ditujukan ke `fase/vis-1`, remote personal `origin`; hash dan hasil push dilaporkan dalam penutup sesi. Tidak merge ke `main`. Fase berikutnya: **Kirim 4 — Claude Code**. Sesi ini berhenti setelah push.
