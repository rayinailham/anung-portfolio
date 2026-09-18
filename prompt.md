# Prompt Pengembangan — Portofolio Anung (5 Kirim)

Target: selesai dalam 5 kali kirim prompt. Tiap kirim = satu mega-batch yang diselesaikan penuh tanpa tanya-jawab di tengah.

Referensi: `plan.md` (33 temuan + bukti), `progress.md` (pelacakan).

---

## WAJIB DIPUTUSKAN SEBELUM KIRIM #1

Ini yang bikin jumlah kirim membengkak — agent berhenti nanya di tengah. Putuskan sekarang, isi jawabannya di sini, biar agent tidak pernah perlu bertanya.

| # | Keputusan | Jawaban Milord |
|---|---|---|
| 1 | Backend form: Formspree / Web3Forms / Vercel+Resend | `_______` |
| 2 | API key / form ID untuk itu (taruh di `.env.local`, jangan di sini) | sudah / belum |
| 3 | Domain final untuk canonical + `og:url` | `_______` |
| 4 | Aset konten dari Anung (4 IG, 3 video, profil, webinar) | ada / tidak ada |
| 5 | Kalau tidak ada: boleh pakai placeholder jujur bercaption? | ya / tidak |

Kalau #4 = tidak ada, Kirim #2 tetap jalan — cuma galeri buktinya diisi placeholder dan diisi belakangan tanpa perlu tulis JSX lagi.

---

## YANG DIPOTONG SUPAYA MUAT 5 KIRIM

Jujur di depan. Ini dibuang dari scope, bukan lupa:

| Dibuang | Alasan |
|---|---|
| **P2-31 Bilingual ID/EN** | Item termahal di seluruh daftar. Sendirian bisa makan 3 kirim. |
| **P2-27 Prerender / SSG** | Butuh keputusan hosting + rewrite. Google tetap bisa render JS; yang benar-benar sakit (preview LinkedIn/WA) sudah diobati `og:image` di Kirim #4. |
| **P1-6 Halaman case study terpisah** | Diturunkan jadi deep-link ke anchor kartu. 90% manfaat, 10% biaya. |
| **P2-25 Buang subset font** | 47 KB artefak build, dampak runtime nol (browser cuma unduh `unicode-range` yang cocok). Kosmetik. |
| **P2-24 Ganti Phosphor jadi SVG inline** | Tukar 14 ikon manual demi ~20 KB. Rasio buruk. Code-split tetap dikerjakan. |

Kalau nanti ada waktu, ambil dari `plan.md` pakai "Prompt satuan" di bawah.

---

## Konteks yang dipakai ulang — tempel di ATAS setiap kirim

````
## Project

Portofolio pribadi Anung Hanindhita Ramadhan — lulusan Bisnis IPB yang melamar
kerja di bidang pemasaran afiliasi / digital. Situs berbahasa Indonesia.
React 19 + Vite 8, GSAP + ScrollTrigger, Lenis. Tanpa backend. Deploy statis
dari `dist/`.

Berkas:
- `src/App.jsx`     — 4 halaman, routing hash, header, form kontak, curtain
- `src/motion.js`   — siklus hidup animasi, Lenis, semua ScrollTrigger
- `src/styles.css`  — token tema, responsif (breakpoint 1100 / 767 / 370)
- `src/data.js`     — fakta dari CV. Ada aturan kejujuran di baris 2.
- `tests/portfolio.spec.js` — Playwright, 4 project
- `scripts/prepare-assets.mjs` — pipeline gambar sharp
- `index.html`      — meta, guard tema, noscript

Perintah:
- `npm run dev` → http://localhost:5173
- `npm run build`
- `npm test`  (JANGAN `playwright install-deps` di Arch — pakai skill
               `arch-playwright-provision`)

## Aturan yang tidak bisa dilanggar

1. JANGAN mengarang angka, hasil, atau klaim. Setiap angka harus bisa
   ditelusuri ke `Anung Hanindhita Ramadhan-CV.pdf`. `src/data.js:2` melarang
   menyajikan target outreach sebagai hasil penjualan. "Buat lebih impresif"
   TIDAK PERNAH berarti menaikkan angka.
2. JANGAN merepresentasikan `public/images/connections.webp` sebagai kerja
   klien. Itu ilustrasi dekoratif AI. Lihat `docs/asset-provenance.md`.
3. Kontras wajib tetap lolos WCAG AA terang & gelap. Terendah sekarang 5.81:1.
4. `prefers-reduced-motion: reduce` dihormati penuh: intro dilewati, Lenis
   mati, animasi dekoratif mati, setiap nilai animasi tampil final.
5. CLS sekarang 0.008. Gambar baru wajib punya `width` + `height`.
6. Jangan hapus cakupan test yang ada. Boleh nambah.
7. Jangan operasi git kecuali diminta eksplisit.
8. Copy bahasa Indonesia. Nada tetap: lugas, orang pertama, tanpa kata sifat
   pemasaran berlebihan.

## Cara kerja untuk kirim ini

- Kerjakan SELURUH daftar di bawah dalam satu sesi. Jangan berhenti di tengah
  untuk minta konfirmasi.
- Kalau ada yang ambigu, ambil keputusan paling masuk akal, KERJAKAN, lalu
  catat asumsinya di `progress.md` bagian "Catatan keputusan".
- Kalau ada satu item yang benar-benar terblokir, selesaikan SEMUA item lain
  sampai tuntas, lalu laporkan persis mana yang tertinggal dan kenapa.
- Verifikasi sendiri sebelum lapor. Jangan lapor selesai tanpa bukti.
- Di akhir: update `progress.md` (status + kolom Bukti + Log verifikasi),
  lalu tulis ringkasan pendek berisi apa yang berubah dan bukti apa yang ada.
````

---

# KIRIM #1 — Bug + semua perbaikan mekanis

Semua di sini deterministik. Tidak butuh selera desain, tidak butuh aset, tidak butuh keputusan Milord.

````
Kerjakan SEMUA item berikut dalam satu sesi. Ini semua mekanis — tidak ada yang
butuh konfirmasi saya.

## A. Bug P0 — filter menghapus satu section penuh (test-first)

Repro:
1. `npm run dev`, buka http://localhost:5173/#/pengalaman
2. Klik filter "Pemasaran digital" (3 kartu → 1 kartu, tinggi dokumen
   4051px → 2831px)
3. Scroll ke section "Kegiatan selama kuliah"

Terukur: `.organizations` di `top: 166px` — di dalam viewport — tapi
`getComputedStyle(el).opacity === "0"`. Keempat kartu `.organization-grid`
juga "0". Layar penuh kosong. `.contact-callout` di bawahnya sama.

Akar: `usePageMotion` (`src/motion.js:58`) cuma jalan ulang saat
`route`/`revealed`/`reduced` berubah. `ScrollTrigger.refresh()`
(`src/motion.js:159`) cuma sekali setelah mount. Saat `setFilter`
(`src/App.jsx:156`) memotong 1220px tinggi dokumen, trigger di bawah filter
menyimpan posisi lama; start point-nya kini di bawah ujung dokumen, `once: true`
tidak pernah nyala, elemen ditinggal `opacity: 0` permanen. Disclosure
"Lihat detail" (`src/App.jsx:161`) akar masalahnya sama.

Langkah:
1. TULIS TEST YANG GAGAL DULU di `tests/portfolio.spec.js`: filter → scroll ke
   `.organizations` → assert opacity 1 untuk section, tiap kartu, dan
   `.contact-callout`. Jalankan, buktikan gagal, tempelkan output.
2. Perbaiki akarnya: refresh ScrollTrigger setiap kali layout berubah karena
   state React (filter DAN disclosure). Refresh harus SETELAH commit DOM React.
3. Jaring pengaman: elemen `[data-reveal]`/`[data-reveal-group]` yang sudah
   melewati start point wajib terlihat setelah refresh walau trigger stale.
   Plus timeout pengaman — apa pun yang masih `opacity: 0` setelah N detik
   dipaksa terlihat. Pilih satu pendekatan, jelaskan alasannya.

## B. Reveal tanpa fallback (P0-2)

Semua isi di bawah fold `opacity: 0` sampai scroll. Kalau GSAP gagal load,
halaman kosong. Jadikan progressive enhancement: CSS default terlihat, JS yang
menyembunyikan sesaat sebelum menganimasikan. Buktikan dengan memblokir GSAP
dan menunjukkan semua teks tetap terbaca.

## C. Mode gelap kehilangan aksen (P2-15)

`src/styles.css:31` mengoverride `--green: #f5dabf` — identik dengan `--ink`.
Akibatnya aksen lenyap di: `.title-line .last-line` (`:77`, "Anung." yang hijau
jadi krem sama seperti "Halo, saya" — hierarki dua warna pada judul hilang),
`.wordmark span`, `.about-statement h2 span`, `.scroll-progress span`, `.pulse`.

Perbaikan: token aksen tersendiri untuk mode gelap. Hijau dicerahkan
(sekitar #7FB3A8) atau krem dihangatkan. Wajib lolos AA di `#102e2b` dan jelas
berbeda dari `--ink`. Lampirkan angka kontrasnya.

## D. Crop potret memotong logo (P2-16)

`src/styles.css:87`: `object-position: 46% 72%; transform: scale(1.6)`. Logo
terbaca "AnyM" — terpotong di tengah kata di ketiga tempat foto ini muncul.
Kelihatan seperti kecelakaan. Logo AnyMind utuh justru kredensial. Perbaiki
crop supaya logo terbaca penuh, subjek tetap jadi fokus.

## E. Asterisk menumpuk di lengan subjek (P2-17)

`.portrait-asterisk` (`:89`) di `left: -43px; bottom: 77px` mendarat tepat di
lengan dan jam tangan Anung. Geser ke luar siluet.

## F. Intro memblokir deep link (P2-21)

Timeline `Splash` ~1,8 detik sebelum konten bisa dibaca. Recruiter yang klik
tautan langsung ke `#/kontak` tetap disuguhi animasi "Halo." dulu.
- Lewati intro kalau route awal BUKAN `/`
- Perpendek intro jadi sekitar 1,1 detik
- Perilaku sessionStorage yang ada dipertahankan

## G. Target sentuh 22px (P3-32)

Di viewport 390px: `.header-cv`, footer "LinkedIn", footer "Email" tingginya
22px. WCAG 2.2 SC 2.5.8 butuh 24px. Tambahkan padding blok.

## H. Disclosure (P2-19, P2-20)

- `hidden={...}` (`src/App.jsx:161`) bikin konten muncul instan, halaman
  melompat. Satu-satunya interaksi tak dianimasikan di situs penuh animasi.
  Tambahkan transisi tinggi.
- Hanya satu boleh terbuka — recruiter tidak bisa membandingkan dua peran.
  Izinkan banyak terbuka.
- Keduanya mengubah tinggi dokumen. Perbaikan A harus tetap menanganinya —
  VERIFIKASI, jangan diasumsikan.

## I. role="img" pada marquee (P3-33)

`<div className="marquee" role="img" aria-label="Bidang: ...">` pada pita teks
bergerak. Jadikan teks statis untuk screen reader dengan konten visual
`aria-hidden`.

## Verifikasi yang saya minta

- test baru gagal dulu, lalu lolos (tempelkan kedua output)
- `npm test` penuh lolos di keempat project
- filter tiap kategori lalu scroll — tidak ada yang kosong
- buka/tutup beberapa detail lalu scroll — tidak ada yang kosong
- GSAP diblokir → semua teks tetap terbaca
- deep link `#/kontak` di sesi baru langsung menampilkan form
- ukur ulang target sentuh di 390px → semua ≥ 24px
- angka kontras token aksen gelap baru
- screenshot sebelum/sesudah: mode gelap, crop potret, asterisk
- console error tetap 0

Update `progress.md`: P0-1, P0-2, P2-15, P2-16, P2-17, P2-19, P2-20, P2-21,
P3-32, P3-33.
````

---

# KIRIM #2 — Bukti kerja + ruang mati

Dua hal ini saling mengunci: ruang matinya diisi oleh buktinya. Dikerjakan barengan biar tidak dua kali bongkar layout.

````
Kerjakan SEMUA item berikut dalam satu sesi.

Situs ini portofolio orang pemasaran konten yang tidak menunjukkan satu pun
konten, dan punya ruang kosong besar persis di tempat konten itu seharusnya
berada. Perbaiki dua-duanya sekaligus.

## A. Pakai foto yang menganggur (P1-4)

`with_anymind_team.jpg` di root project (176 KB): foto tim di depan layar
"ANYMIND X PANTENE NEW PRODUCT LAUNCH", logo AnyMind, P&G, dan Pantene terbaca
jelas. Ini bukti visual langsung untuk klaim "40 mitra afiliasi dikoordinasikan
untuk acara Pantene" yang sekarang dipajang besar-besar di Beranda tanpa bukti
apa pun.

- Tambahkan ke `scripts/prepare-assets.mjs` (ikuti pola yang ada, simpan
  original)
- Tampilkan di halaman Pengalaman di dalam entri AnyMind, dekat angka 40
- Alt text deskriptif dan jujur: ini foto tim di acara, bukan klaim bahwa Anung
  menjalankan acaranya sendiri
- `width` + `height` wajib — CLS 0.008 harus bertahan

## B. Galeri bukti yang digerakkan data (P1-5)

`src/data.js` mengklaim: 4+ konten Instagram, 3 video promosi produk, video
profil perusahaan, video webinar B2B, webinar B2B 15+ peserta. Nol ditampilkan.

- Rancang komponen galeri bukti per peran
- Digerakkan data dari `src/data.js` — menambah bukti nanti cukup menambah
  entri, tidak perlu tulis JSX
- Sediakan state placeholder JUJUR untuk slot yang asetnya belum ada. Jujur
  artinya pembaca mengerti materialnya ada tapi tidak ditampilkan. Bukan gambar
  palsu, bukan stock photo, bukan ilustrasi AI yang menyamar jadi bukti kerja.
- Dokumentasikan formatnya di `docs/asset-provenance.md`

## C. Hentikan satu foto dipakai tiga kali (P1-3)

`anung-profile.webp` muncul di hero Beranda, kartu "Mengelola mitra afiliasi
Unicharm", dan halaman Tentang — foto sama, crop beda. Kartu Unicharm paling
menyesatkan: dipajang sebagai gambar pekerjaan padahal cuma potret yang
di-crop ulang. Putuskan pemakaian mana yang bertahan, ganti sisanya dengan
bukti nyata dari A/B.

## D. Isi ruang mati (P2-14)

Terukur di 1440px:
- **Hero**: `.hero-copy` kolom `1.2fr` tapi `.hero-description` dibatasi
  `max-width: 360px` (`src/styles.css:80`). ~380px kosong antara paragraf dan
  potret.
- **`.section-heading`** di Beranda: judul + paragraf mengisi separuh kiri,
  separuh kanan kosong total.
- **`.intro-section`** (`:119`): grid `1fr 2.4fr`, kolom `1fr` cuma berisi
  kicker "SEDIKIT TENTANG SAYA" — satu baris teks kecil memegang 30% lebar
  dengan `padding-block: 128px`.
- **Halaman Pengalaman**: `.experience-side` tingginya ~200px, `.experience-main`
  ~600px. Kosong 400px per kartu × 3 kartu. Ini tempat terbaik untuk galeri B.

Ruang kosong editorial itu sengaja dan bagus. Ini bukan itu. Isi dengan sesuatu
yang berguna atau kurangi jadi napas yang disengaja.

## E. Fakta CV yang hilang (P1-7)

Ada di `Anung Hanindhita Ramadhan-CV.pdf`, tidak ada di situs:
- Bazar bisnis: profit di atas IDR 100.000, nilai A untuk inovasi produk
  (situs cuma menyebut "30+ transaksi")
- BEM SB IPB: 11 laporan keuangan bulanan + laporan untuk 3+ program
  (situs cuma menyebut anggaran Rp600.000)
- Konteks perusahaan: AnyMind = perusahaan teknologi BPaaS yang beroperasi di
  15 pasar Asia & Timur Tengah; PT Sutan Vet Medika = startup pet healthcare
  dengan suplemen teruji klinis untuk imunitas, stres, kesehatan kulit, nafsu
  makan
- ADDVENTURES: 20+ barang diadakan, 5+ jenis dekorasi, 7+ misi respons cepat

Cek silang tiap angka ke PDF sebelum menulis. Tidak ada di CV = tidak ditulis.

## F. Kartu Beranda menuju tempat yang sama (P1-6, versi ringkas)

Kartu "Mengelola mitra afiliasi Unicharm" dan "Konten dan KOL Anima Companion"
keduanya `<Link to="/pengalaman">`. Pengunjung mendarat di halaman daftar yang
sama tanpa scroll ke entri yang tepat. Deep-link ke anchor kartunya. JANGAN
bikin halaman case study terpisah — di luar scope.

## G. Variasikan ContactCallout (P2-18)

Blok "Membutuhkan anggota tim pemasaran?" muncul kata per kata di Beranda,
Pengalaman, dan Tentang. Variasikan copy per konteks halaman.

## Verifikasi yang saya minta

- screenshot sebelum/sesudah: Beranda, Pengalaman, Tentang — 1440px dan 390px,
  terang dan gelap
- tiap angka baru dikutip bersama baris CV sumbernya
- tidak ada gambar muncul >1× dengan crop berbeda
- deep-link kartu Beranda mendarat di entri yang benar
- CLS ≤ 0.01 pada audit Lighthouse mobile baru
- `npm test` lolos — termasuk test regresi filter dari Kirim #1

Update `progress.md`: P1-3, P1-4, P1-5, P1-6, P1-7, P2-14, P2-18.
````

---

# KIRIM #3 — Visualisasi data + kosakata motion

````
Kerjakan SEMUA item berikut dalam satu sesi.

## A. Visualisasi angka (P1-8)

Counter `data-count` cuma ada di 3 statistik Beranda. Sisanya teks mati.

1. **Ring IPK** — 3.74 / 4.00, arc yang menggambar sendiri saat masuk viewport.
   Sekarang teks datar di `.education-card` halaman Tentang.
2. **Bar TOEFL** — 583 pada skala ITP 310–677. Sekarang angka telanjang "583"
   tanpa konteks; pembaca tidak tahu itu bagus. Beri skala + penanda
   "Professional Working Proficiency".
3. **Split platform afiliasi** — 100 Shopee + 50 TikTok, sekarang terkubur
   dalam kalimat. Stacked bar atau donut warna brand.
   PENTING: "150" di Beranda adalah penjumlahan 100 + 50, BUKAN hitungan
   individu unik. README sudah menyatakan ini; visualisasinya tidak boleh
   menyiratkan sebaliknya.
4. **Counter halaman Pengalaman** — `.experience-stats` menampilkan "200",
   "150", "40", "30+", "100+" sebagai teks mati. Pakai ulang mekanisme
   `data-count` di `src/motion.js`.

## B. Timeline karier (P1-9)

Tiga peran: AnyMind Jan–Apr 2026, Sutan Vet Jan–Jul 2026, Sutan Vet
Sep–Des 2025. Dua yang pertama BERJALAN BERSAMAAN. Sebagai daftar vertikal itu
terbaca seperti salah ketik. Sebagai timeline horizontal itu jadi kekuatan: dia
menangani dua magang sekaligus. Tunjukkan tumpang tindihnya eksplisit.
Tampilkan juga bahwa dua entri Sutan Vet adalah perusahaan sama dengan promosi
peran.

## C. Kosakata reveal terlalu seragam (P2-23)

Setiap `[data-reveal]` memakai `duration: 0.9`, `ease: power3.out`, offset 44px
(`src/motion.js:90`). Judul, statistik, kartu, blok teks — semuanya masuk
dengan cara yang sama persis. Jadinya pola, bukan ritme. Beri kurva dan durasi
berbeda untuk jenis konten berbeda. Jangan ditambah-tambahi — ini portofolio,
bukan demo showreel.

## Batasan

- SVG inline + GSAP. JANGAN tambah pustaka chart — bundle sudah 132 KB gzip
  dan Kirim #5 bertugas mengecilkannya.
- Skala ordinat jujur. Jangan mulai bar dari angka bukan-nol untuk
  melebih-lebihkan selisih.
- `prefers-reduced-motion: reduce` → nilai akhir langsung tampil, tanpa
  animasi. Sudah ada di suite; jangan sampai rusak.
- Tiap visual butuh teks alternatif. Angka harus terbaca screen reader, tidak
  boleh terkunci di dalam grafis.
- Warna dari token brand, lolos AA terang DAN gelap. Token aksen gelap sudah
  diperbaiki di Kirim #1 — pakai itu.
- Tiap visual tetap masuk akal di 390px.
- Semua visual baru mengubah tinggi dokumen → jaring pengaman ScrollTrigger
  dari Kirim #1 harus tetap jalan. Verifikasi.

## Verifikasi yang saya minta

- screenshot tiap visual: terang dan gelap, 1440px dan 390px
- screenshot dengan reduced motion aktif, menunjukkan nilai akhir
- cek kontras semua warna baru
- delta ukuran bundle gzip
- `npm test` lolos, plus test yang mengassert angka final ada di DOM dengan
  reduced motion aktif

Update `progress.md`: P1-8, P1-9, P2-23.
````

---

# KIRIM #4 — Konversi

Keputusan #1–#3 di tabel atas HARUS sudah terisi sebelum kirim ini.

````
Kerjakan SEMUA item berikut dalam satu sesi.

Portofolio ini punya satu tujuan: membuat recruiter menghubungi Anung. Jalur itu
bocor di empat tempat.

Keputusan yang sudah saya ambil — pakai ini, jangan tanya lagi:
- Backend form: <ISI>
- Kredensial: sudah ada di `.env.local` sebagai <ISI NAMA VAR>
- Domain: <ISI>

## A. Form kontak tidak mengirim apa pun (P1-10)

`send()` di `src/App.jsx` cuma menyusun `window.location.href = "mailto:..."`.
Untuk recruiter di desktop yang pakai Gmail web tanpa handler `mailto:`
terdaftar, menekan "Buka draf email" tidak menghasilkan apa-apa yang terlihat.
Pesannya hilang dan Anung tidak pernah tahu ada yang mencoba menghubungi.

- Pakai backend yang sudah saya pilih di atas
- `mailto:` tetap ada sebagai fallback kalau pengiriman gagal
- State loading, sukses, dan gagal yang nyata — bukan `setSent(true)`
  optimistis seperti sekarang
- Proteksi spam yang tidak mengganggu manusia (honeypot, bukan CAPTCHA)
- Jangan commit kunci. Env var Vite, dokumentasikan di README, pastikan
  `.gitignore` sudah menutup `.env*` (sudah, verifikasi)
- Copy jujur: kalau terkirim bilang terkirim. Jangan klaim "dibalas dalam
  24 jam" yang tidak bisa dijamin siapa pun.

## B. Tidak ada WhatsApp (P1-11)

Nomor `+6281388116739` cuma jadi `tel:`. Di Indonesia recruiter menghubungi
lewat WhatsApp. Tambahkan `https://wa.me/6281388116739` dengan pesan pembuka
terisi dalam bahasa Indonesia yang wajar. Setara dengan email dan LinkedIn,
jangan disembunyikan.

## C. Link telanjang saat dibagikan (P1-12)

`index.html` punya `og:title`, `og:description`, `og:type` — tapi tidak ada
`og:image`, `og:url`, `twitter:card`, `<link rel="canonical">`. Dibagikan ke
LinkedIn atau WhatsApp — dua tempat portofolio ini pasti dibagikan — hasilnya
kartu kosong tanpa gambar.

- Buat gambar OG 1200×630: potret + nama + peran, warna brand
  (bordo #6C151E, hijau #0F3D3A, krem #F5DABF), Manrope
- Tambahkan `og:image`, `og:image:width`, `og:image:height`, `og:image:alt`,
  `og:url`, `twitter:card=summary_large_image`
- Canonical pakai domain yang sudah saya isi di atas

## D. CV cuma bisa di-download (P1-13)

Recruiter yang menyaring 40 kandidat tidak akan mengunduh PDF. Tambahkan
preview CV inline di samping tombol download yang ada — embed, atau render
halaman pertama sebagai gambar saat build lewat `prepare-assets.mjs`. Tombol
download tetap ada.

## Verifikasi yang saya minta

- pengiriman form tes benar-benar sampai ke inbox — screenshot email masuk
- form gagal dengan baik saat jaringan diputus, fallback `mailto:` muncul
- tautan WhatsApp membuka WA dengan pesan terisi
- preview OG divalidasi lewat LinkedIn Post Inspector dan kiriman WhatsApp nyata
- tidak ada kunci API di berkas yang dilacak — `git status` bersih dari `.env*`
- `npm test` lolos, plus test baru untuk state sukses/gagal form

Update `progress.md`: P1-10, P1-11, P1-12, P1-13.
````

---

# KIRIM #5 — Performa, SEO, penutup

````
Kerjakan SEMUA item berikut dalam satu sesi. Ini kirim terakhir — di akhir,
laporkan juga status penuh seluruh project terhadap `plan.md`.

## A. Bundle (P2-24, versi ringkas)

`dist/assets/index-*.js` = 413.852 B mentah / 132.009 B gzip / 115.067 B
brotli. Satu file: React 19 + GSAP + ScrollTrigger + Lenis + Phosphor.
Lighthouse melaporkan perkiraan penghematan 57 KiB dari JS tak terpakai.

- Code-split per route
- Lazy-load GSAP/Lenis di belakang `prefers-reduced-motion`
- JANGAN ganti Phosphor dengan SVG manual — di luar scope, rasio buruk

Catat gzip sebelum dan sesudah.

## B. Gambar (P2-26)

`scripts/prepare-assets.mjs` menghasilkan satu WebP 900px. Tidak ada `srcset`,
tidak ada AVIF, tidak ada varian mobile. Ponsel 390px mengunduh potret 900px.
Dengan gambar-gambar baru dari Kirim #2, jadikan pipeline benar: AVIF + WebP,
beberapa lebar, `srcset`/`sizes` yang tepat. CLS wajib tetap ≤ 0.01.

## C. LCP (P2-22)

Baseline Lighthouse mobile: LCP 2.9s (target 2.5s), FCP 1.7s, Speed Index 3.5s,
TBT 110ms, performance 93. Perbaikan gerbang intro di Kirim #1 mestinya sudah
menurunkan ini. Ukur ulang, kejar sisa selisihnya, catat angkanya.

## D. Structured data (P2-28)

Tidak ada JSON-LD. Tambahkan schema `Person`: `name`, `jobTitle`, `alumniOf`
(IPB University), `knowsAbout`, `sameAs` (LinkedIn), `email`, `address`.
Wajib lolos Google Rich Results Test.

## E. sitemap.xml (P2-29)

`public/robots.txt` cuma `User-agent: * / Allow: /`. Tambahkan sitemap, rujuk
dari robots.txt. Pakai domain yang sama dengan canonical di Kirim #4.

## F. llms.txt (P2-30)

Kategori `agentic-browsing` Lighthouse memberi skor 0.67; satu-satunya audit
yang gagal adalah `llms-txt`. Recruiter makin sering menempelkan tautan
kandidat ke asisten AI untuk minta ringkasan. `llms.txt` berisi ringkasan
terstruktur — peran, angka, kontak — membuat ringkasan itu akurat alih-alih
hasil tebakan. Tiap angka di sana tunduk pada aturan kejujuran yang sama.
Catat skor barunya.

## G. Laporan penutup

Setelah semuanya selesai, tulis di akhir `progress.md`:
- tabel akhir: tiap temuan `plan.md` → DONE / SKIP (+ alasan skip)
- metrik akhir vs baseline: Lighthouse 4 kategori + agentic-browsing, LCP, CLS,
  TBT, gzip bundle, jumlah test
- daftar sisa yang sengaja tidak dikerjakan (bilingual, prerender, case study
  terpisah, subset font, Phosphor) supaya saya tahu apa yang masih bisa diambil
- hal apa pun yang masih terblokir aset dari Anung

## Verifikasi yang saya minta

- audit Lighthouse mobile baru, keempat kategori + agentic-browsing,
  dibandingkan baseline di `progress.md`
- performance / a11y / best-practices / SEO TIDAK BOLEH turun dari
  93 / 100 / 100 / 100
- gzip sebelum/sesudah
- lolos Rich Results Test
- `npm test` lolos penuh di keempat project

Update `progress.md`: P2-22, P2-24, P2-26, P2-28, P2-29, P2-30, plus laporan
penutup.
````

---

## Prompt satuan — untuk ambil sisa yang dipotong

````
Baca `plan.md` dan kerjakan HANYA temuan <ID>. Ikuti blok "Konteks yang dipakai
ulang" di `prompt.md`. Jangan sentuh apa pun di luar temuan itu. Tunjukkan bukti
sebelum/sesudah, jalankan `npm test`, update baris yang sesuai di `progress.md`.
````

## Prompt review — kalau curiga ada yang dilapor selesai padahal belum

````
Baca `plan.md`, `progress.md`, dan diff kerja terakhir. Untuk setiap item
DONE, verifikasi buktinya nyata dan cocok dengan klaimnya — jalankan sendiri
perintahnya. Laporkan item mana pun yang ditandai selesai tanpa verifikasi yang
bisa diulang. Periksa juga pelanggaran aturan di "Konteks yang dipakai ulang",
terutama kejujuran angka dan `connections.webp` yang tidak boleh disajikan
sebagai kerja klien.
````
