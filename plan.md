# Plan Perbaikan Portofolio Anung

Audit dijalankan 2026-09-18 pada dev server `http://localhost:5173` (Chromium via Playwright MCP), viewport 1440×900 / 820×1000 / 390×844, mode terang dan gelap, plus pembacaan `docs/lighthouse-mobile.json` dan ekstraksi ulang CV sumber.

Kondisi sekarang: fondasinya kuat. Lighthouse a11y 100, best-practices 100, SEO 100, CLS 0.008, nol console error, kontras semua token lolos AA (paling rendah `--muted` di `--paper` = 5.81:1). Jadi masalahnya bukan "web-nya jelek" — masalahnya **bukti kerja tipis, angka tidak divisualkan, satu bug motion yang menghilangkan konten, dan beberapa ruang mati di layout**. Tebakan Milord soal "foto kurang", "appear on scroll", dan "data bisa divisualisasikan" semuanya benar.

Total 33 temuan. Diurutkan per severity.

---

## P0 — Bug yang menghapus konten

### P0-1 · Filter pengalaman membuat satu section jadi tak terlihat selamanya

**Ini temuan paling serius. Sudah direproduksi.**

Repro:
1. Buka `http://localhost:5173/#/pengalaman`
2. Klik filter **Pemasaran digital** (3 kartu → 1 kartu, tinggi dokumen 4051px → 2831px)
3. Scroll ke bawah

Hasil terukur: section `.organizations` ("Kegiatan selama kuliah") berada di `top: 166px` — jelas di dalam viewport — tapi `getComputedStyle(org).opacity === "0"`, dan keempat kartu di `.organization-grid` juga `"0"`. Layar penuh kosong. `ContactCallout` di bawahnya kena hal yang sama.

Akar masalah: `src/motion.js:58` `usePageMotion` hanya dijalankan ulang saat `route` / `revealed` / `reduced` berubah. `ScrollTrigger.refresh()` di `src/motion.js:159` hanya dipanggil sekali setelah mount. Saat `setFilter` (`src/App.jsx:156`) memotong 1220px dari tinggi dokumen, semua trigger di bawah filter menyimpan posisi lama — start point-nya sekarang berada di bawah ujung dokumen, jadi `once: true` tidak akan pernah menyala. Elemen ditinggal di `opacity: 0` permanen.

Yang sama berlaku untuk disclosure "Lihat detail" (`src/App.jsx:161`) — tinggi dokumen berubah tanpa refresh. Risikonya lebih kecil (delta ~100px) tapi akar masalahnya identik.

Perbaikan yang diminta:
- Panggil `ScrollTrigger.refresh()` setiap kali layout berubah karena state React (filter, disclosure), bukan hanya saat route berubah.
- Tambahkan jaring pengaman supaya bug sekelas ini tidak bisa menghilangkan konten lagi: elemen `[data-reveal]` yang sudah masuk viewport wajib terlihat walau trigger-nya stale. Opsi: `ScrollTrigger.create({ onRefresh })` yang memaksa `opacity: 1` untuk apa pun yang sudah lewat start point, atau `IntersectionObserver` fallback.
- Ganti `once: true` + `clearProps` dengan pola yang idempoten terhadap refresh.

Test yang harus ditambahkan (test lama tidak menangkap ini — `tests/portfolio.spec.js` mengecek jumlah kartu setelah filter, tapi tidak pernah mengecek section di bawahnya masih terlihat):
```
filter → scroll ke .organizations → expect opacity 1 untuk section dan tiap kartu
```

### P0-2 · Tidak ada jaring pengaman kalau ScrollTrigger gagal

Seluruh isi di bawah fold berada di `opacity: 0` sampai scroll membangunkannya. P0-1 membuktikan konsekuensinya. Screenshot full-page pun keluar hampir kosong. Kalau GSAP gagal load (CDN diblokir kantor, JS error di browser lama), pengunjung melihat halaman kosong, bukan halaman tanpa animasi.

Perbaikan: reveal harus *progressive enhancement* — CSS default `opacity: 1`, JS yang menurunkan ke 0 sesaat sebelum animasi, plus timeout pengaman yang memaksa semuanya terlihat setelah N detik.

---

## P1 — Bukti kerja (jawaban untuk "fotonya kurang")

### P1-3 · Cuma ada 2 gambar untuk 4 halaman, dan satu foto dipakai 3×

Inventaris nyata di `public/images/`: `anung-profile.webp` dan `connections.webp`. Itu saja.

- `anung-profile.webp` dipakai di hero Beranda, di kartu "Mengelola mitra afiliasi Unicharm", dan di Tentang — foto yang sama persis, crop berbeda.
- `connections.webp` adalah ilustrasi dekoratif hasil AI (lihat `docs/asset-provenance.md`), bukan bukti kerja.
- Halaman **Pengalaman sama sekali tidak punya gambar**. Nol. Padahal itu halaman inti portofolio.

### P1-4 · Ada foto asli yang kuat tapi tidak dipakai sama sekali

`with_anymind_team.jpg` (176 KB, di root project) adalah foto tim di depan layar **"ANYMIND X PANTENE NEW PRODUCT LAUNCH"** dengan logo AnyMind, P&G, dan Pantene terbaca jelas. Ini bukti visual langsung untuk klaim "40 mitra afiliasi dikoordinasikan untuk acara Pantene" — angka yang dipajang besar-besar di Beranda tanpa bukti apa pun.

Foto ini tidak masuk `scripts/prepare-assets.mjs` dan tidak dirujuk di mana pun. Ini item dengan rasio dampak/usaha tertinggi di seluruh daftar.

### P1-5 · CV mengklaim konten yang tidak pernah ditampilkan

`src/data.js` sendiri menuliskan: "Membuat lebih dari 4 konten Instagram, 3 video promosi produk, video profil perusahaan, dan video webinar B2B." CV aslinya sama. Tidak ada satu pun yang muncul di web.

Ini portofolio orang pemasaran konten yang tidak menunjukkan konten. Yang dibutuhkan dari Anung:
- Screenshot / export 4 konten Instagram Anima Companion
- Thumbnail atau klip 3 video promosi produk
- Video profil perusahaan
- Screenshot webinar B2B (15+ peserta)
- Kalau ada: screenshot dashboard afiliasi Shopee/TikTok (angka disensor), screenshot laporan bulanan yang dia susun

Kalau materialnya tidak boleh dipublikasikan, minimal tampilkan mockup/placeholder jujur dengan caption "konten internal klien, tidak dipublikasikan" — bukan dihilangkan diam-diam.

### P1-6 · Tidak ada case study; dua kartu berbeda menuju halaman yang sama

Di Beranda, kartu "Mengelola mitra afiliasi Unicharm" dan "Konten dan KOL Anima Companion" keduanya `<Link to="/pengalaman">`. Pengunjung yang mengklik salah satunya mendarat di halaman daftar yang sama, tanpa scroll ke entri yang tepat. Information scent-nya bohong.

Perbaikan: minimal deep-link ke anchor kartu yang sesuai. Idealnya, satu halaman case study per peran (`/pengalaman/anymind`) dengan struktur situasi → tugas → yang saya kerjakan → bukti visual → hasil.

### P1-7 · Fakta CV yang hilang dan bisa memperkuat halaman

Dari ekstraksi ulang `Anung Hanindhita Ramadhan-CV.pdf`, hal berikut ada di CV tapi tidak ada di web:
- Bazar bisnis: **profit di atas IDR 100.000** dan nilai A untuk inovasi produk (web hanya menyebut "30+ transaksi")
- BEM SB IPB: **11 laporan keuangan bulanan** + laporan untuk 3+ program (web hanya menyebut anggaran Rp600.000)
- Konteks perusahaan: AnyMind = perusahaan teknologi BPaaS yang beroperasi di **15 pasar Asia & Timur Tengah**; PT Sutan Vet Medika = startup pet healthcare dengan suplemen teruji klinis. Konteks ini membuat magangnya terdengar jauh lebih berbobot, dan cuma yang kedua yang sebagian dipakai.
- ADDVENTURES: 20+ barang diadakan, 5+ jenis dekorasi, 7+ misi respons cepat

---

## P1 — Visualisasi data (jawaban untuk "data yang bisa divisualisasikan")

### P1-8 · Angka masih teks statis di hampir semua tempat

Counter `data-count` hanya ada di 3 statistik Beranda. Di luar itu semuanya teks mati:
- `.experience-stats` di halaman Pengalaman: "200", "150", "40", "30+", "100+" — angka besar, tidak bergerak, tidak punya konteks skala
- IPK **3.74/4.00** — angka datar dalam kartu
- **TOEFL ITP 583** — tanpa konteks sama sekali (skala ITP 310–677; 583 itu kuat, pembaca tidak tahu)
- **100 afiliasi Shopee + 50 afiliasi TikTok** — pemecahan yang sempurna untuk donut/stacked bar, disajikan sebagai kalimat

Yang layak dibuat (bukan chart.js — SVG inline + GSAP, ukuran kecil, sesuai `artifact-diagram`/`dataviz`):
1. **Ring IPK** — arc 3.74/4.00 yang menggambar sendiri saat masuk viewport
2. **Bar TOEFL** — 583 pada skala 310–677, dengan penanda "Professional Working Proficiency"
3. **Split platform afiliasi** — 100 Shopee / 50 TikTok sebagai stacked bar berwarna brand
4. **Timeline karier** — lihat P1-9
5. **Counter di halaman Pengalaman** — pakai ulang `data-count` yang sudah ada, bukan teks statis

### P1-9 · Tidak ada timeline, dan periode yang tumpang tindih membingungkan

Tiga peran: AnyMind Jan–Apr 2026, Sutan Vet Jan–Jul 2026, Sutan Vet Sep–Des 2025. Dua yang pertama **berjalan bersamaan**. Dibaca sebagai daftar vertikal, ini terlihat seperti salah ketik. Dibaca sebagai timeline horizontal, ini justru jadi kekuatan: dia menangani dua magang sekaligus.

Tambahan: dua entri PT Sutan Vet Medika dipisah jadi dua kartu tanpa tanda bahwa itu perusahaan yang sama dengan promosi peran.

---

## P1 — Konversi

### P1-10 · Form kontak tidak mengirim apa pun

`src/App.jsx` `send()` hanya menyusun `window.location.href = "mailto:..."`. Untuk recruiter di desktop yang pakai Gmail web tanpa handler `mailto:` terdaftar, menekan "Buka draf email" tidak menghasilkan apa-apa yang terlihat. Pesan hilang dan Anung tidak pernah tahu ada yang mencoba menghubungi.

Ini form kontak di portofolio pencari kerja — ini titik konversi satu-satunya. Perbaikan: backend form nyata (Formspree / Web3Forms / Resend via Vercel function — semuanya punya free tier dan tanpa server sendiri), dengan `mailto:` tetap dipertahankan sebagai fallback.

### P1-11 · Tidak ada tautan WhatsApp

Nomor `+6281388116739` hanya jadi `tel:`. Di Indonesia, recruiter menghubungi lewat WhatsApp. Tambahkan `https://wa.me/6281388116739` dengan pesan pembuka terisi.

### P1-12 · Link portofolio tampil telanjang saat dibagikan

`index.html` punya `og:title`, `og:description`, `og:type` — tapi **tidak ada `og:image`**, tidak ada `og:url`, tidak ada `twitter:card`, tidak ada `<link rel="canonical">`. Dibagikan ke LinkedIn atau WhatsApp — dua tempat portofolio ini pasti dibagikan — hasilnya kartu kosong tanpa gambar.

Perbaikan: gambar OG 1200×630 (potret + nama + peran), URL absolut, `twitter:card=summary_large_image`, canonical setelah domain dipilih.

### P1-13 · CV hanya bisa di-download, tidak bisa dilihat

Recruiter yang sedang menyaring 40 kandidat tidak akan mengunduh PDF. Tambahkan preview CV inline (embed atau render halaman pertama sebagai gambar) di samping tombol download.

---

## P2 — Layout

### P2-14 · Ruang mati besar di beberapa tempat

Terukur pada 1440px:
- **Hero**: `.hero-copy` mengambil kolom `1.2fr` tapi `.hero-description` dibatasi `max-width: 360px` (`src/styles.css:80`). Ada sekitar 380px kosong antara paragraf dan potret.
- **`.section-heading`** di Beranda ("Yang saya kerjakan selama magang."): judul + paragraf hanya mengisi separuh kiri, separuh kanan kosong total sampai kartu muncul jauh di bawah.
- **`.intro-section`** (`src/styles.css:119`): grid `1fr 2.4fr` di mana kolom `1fr` hanya berisi kicker "SEDIKIT TENTANG SAYA" — satu baris teks kecil memegang 30% lebar dengan `padding-block: 128px`.
- **Halaman Pengalaman**: `.experience-side` (periode/perusahaan/peran/lokasi) tingginya ~200px sementara `.experience-main` ~600px. Sisi kiri kosong 400px per kartu × 3 kartu.

Ruang kosong editorial itu sengaja dan bagus — tapi ini ruang kosong tanpa niat. Isi dengan bukti visual dari P1-4/P1-5, atau kurangi agar jadi napas yang disengaja.

### P2-15 · Mode gelap kehilangan warna aksen sepenuhnya

`src/styles.css:31` mengoverride `--green: #f5dabf` di tema gelap — nilainya sama persis dengan `--ink`. Akibatnya setiap pemakaian aksen jadi hilang:
- `.title-line .last-line` (`:77`) — "Anung." yang hijau di mode terang jadi krem sama seperti "Halo, saya". Hierarki dua warna pada judul, elemen identitas visual paling menonjol di situs ini, lenyap.
- `.wordmark span` (titik setelah "anung") hilang
- `.about-statement h2 span` hilang
- `.scroll-progress span` jadi krem di atas hijau gelap
- `.pulse` (indikator "Terbuka untuk kerja sama") hilang aksennya

Sudah dikonfirmasi lewat screenshot mode gelap. Perbaikan: token aksen tersendiri untuk mode gelap — hijau yang dicerahkan (mis. `#7FB3A8`) atau krem yang dihangatkan, yang tetap lolos AA di `#102e2b` tapi tidak identik dengan `--ink`.

### P2-16 · Crop potret memotong logo AnyMind

`src/styles.css:87`: `object-position: 46% 72%; transform: scale(1.6)`. Hasilnya logo terbaca **"AnyM"** — terpotong di tengah kata di ketiga tempat foto ini muncul. Kelihatan seperti kecelakaan, bukan keputusan. Logo AnyMind utuh justru kredensial; potong lebih longgar atau geser fokus.

### P2-17 · Asterisk menumpuk di atas lengan subjek

`.portrait-asterisk` (`src/styles.css:89`) di `left: -43px; bottom: 77px` mendarat tepat di lengan dan jam tangan Anung. Turunkan atau geser ke luar siluet.

### P2-18 · ContactCallout identik diulang di 3 halaman

Blok "Membutuhkan anggota tim pemasaran?" muncul kata per kata di Beranda, Pengalaman, dan Tentang. Berulang di kunjungan multi-halaman. Variasikan copy-nya per konteks halaman.

### P2-19 · Disclosure membuka tanpa animasi

`hidden={expanded !== item.id}` (`src/App.jsx:161`) — konten muncul instan, halaman melompat. Satu-satunya interaksi di situs ini yang tidak dianimasikan, di tengah situs yang isinya animasi. Tambahkan transisi tinggi.

### P2-20 · Accordion hanya bisa satu terbuka

`setExpanded(expanded === item.id ? null : item.id)` menutup entri lain. Recruiter tidak bisa membandingkan dua peran berdampingan. Izinkan banyak terbuka.

---

## P2 — Motion

### P2-21 · Intro memblokir kunjungan pertama, termasuk deep link

Timeline `Splash` berjalan ~1,8 detik sebelum konten bisa dibaca. Disimpan per-sesi, jadi navigasi berikutnya bebas — tapi kunjungan pertama selalu kena. Lebih parah: recruiter yang mengklik tautan langsung ke `#/kontak` tetap disuguhi animasi "Halo." sebelum melihat form kontak.

Perbaikan: lewati intro kalau route awal bukan `/`. Pertimbangkan memperpendek jadi ~1,1 detik.

### P2-22 · LCP mobile 2,9 detik — di atas target

`docs/lighthouse-mobile.json`: LCP 2,9s (target 2,5s), FCP 1,7s, Speed Index 3,5s, TBT 110ms, performance 93. README sendiri mengakui bahwa menahan copy hero sampai intro terangkat menambah 0,2 detik. Untuk pengunjung yang sudah melihat intro di sesi itu, LCP terukur sekitar 0,4 detik.

Perbaikan terkait P2-21: dengan intro yang tidak memblokir paint, LCP turun ke angka sesi-kedua.

### P2-23 · Kosakata reveal terlalu seragam

Setiap `[data-reveal]` memakai `duration: 0.9`, `ease: power3.out`, offset 44px (`src/motion.js:90`). Judul, statistik, kartu, blok teks — semuanya masuk dengan cara yang sama persis. Efeknya jadi pola, bukan ritme. Yang kurang: stagger per-karakter untuk judul, `data-mask` clip-wipe untuk media baru, dan kurva berbeda untuk elemen berbeda.

---

## P2 — Performa & aset

### P2-24 · Satu bundle 414 KB (132 KB gzip), tanpa code splitting

`dist/assets/index-DlpgcT3G.js` = 413.852 byte mentah / 132.009 byte gzip / 115.067 byte brotli. Semuanya masuk ke satu file: React 19 + GSAP + ScrollTrigger + Lenis + Phosphor Icons. Lighthouse melaporkan perkiraan penghematan 57 KiB dari JS tak terpakai.

Perbaikan: lazy-load GSAP/Lenis di belakang `prefers-reduced-motion`, code-split per route, ganti Phosphor dengan SVG inline (hanya ~14 ikon yang dipakai).

### P2-25 · Subset font untuk aksara yang tidak akan pernah dipakai

Build menghasilkan woff2 Manrope untuk cyrillic, greek, latin-ext, dan vietnamese di samping latin. Browser hanya mengunduh yang cocok dengan `unicode-range`, jadi dampak runtime-nya kecil — tapi 47 KB artefak yang sia-sia untuk situs berbahasa Indonesia.

### P2-26 · Satu ukuran gambar untuk semua layar

`scripts/prepare-assets.mjs` menghasilkan satu WebP 900px. Tidak ada `srcset`, tidak ada AVIF, tidak ada varian mobile. Ponsel 390px mengunduh 127 KB potret 900px. Dengan bertambahnya gambar dari P1-4/P1-5, ini harus jadi pipeline yang benar: AVIF + WebP, beberapa lebar, `srcset`/`sizes`.

---

## P2 — SEO & visibilitas AI

### P2-27 · Client-side render + hash route = satu dokumen terindeks

`index.html` mengirim `<div id="root"></div>` kosong. `#/pengalaman`, `#/tentang`, `#/kontak` berbagi dokumen yang sama; fragmen hash tidak pernah dikirim ke server. Google bisa merender JS, tapi preview LinkedIn/WhatsApp tidak — itu sebabnya P1-12 berdampak besar. README mengakui keterbatasan ini tapi belum ada yang dikerjakan.

Opsi, dari murah ke mahal: prerender statis per route saat build (`vite-plugin-prerender` atau script Playwright pasca-build) → pindah ke path route + hosting dengan rewrite → SSG penuh.

### P2-28 · Tidak ada structured data

Tidak ada JSON-LD. Untuk portofolio pribadi, schema `Person` dengan `jobTitle`, `alumniOf`, `knowsAbout`, `sameAs` (LinkedIn), `email` adalah standar dan langsung membantu Google dan asisten AI memahami siapa ini.

### P2-29 · Tidak ada sitemap.xml

`public/robots.txt` hanya `User-agent: * / Allow: /`. Tidak ada sitemap.

### P2-30 · Tidak ada llms.txt

Kategori `agentic-browsing` Lighthouse memberi skor **0,67**, satu-satunya audit yang gagal adalah `llms-txt`. Recruiter makin sering menempelkan tautan kandidat ke ChatGPT/Claude untuk minta ringkasan. `llms.txt` berisi ringkasan terstruktur — peran, angka, kontak — membuat ringkasan itu akurat alih-alih hasil tebakan.

### P2-31 · Situs Indonesia, CV bahasa Inggris, tanpa opsi

Situs seluruhnya Indonesia (`lang="id"`). CV yang diunduh seluruhnya bahasa Inggris. AnyMind beroperasi di 15 pasar dan mempekerjakan lintas negara. Recruiter regional mendarat di halaman yang tidak bisa dibaca lalu mengunduh CV yang bisa. Pertimbangkan toggle ID/EN dengan `hreflang`.

---

## P3 — Poles aksesibilitas

### P3-32 · Tiga target sentuh di bawah 24px

Diukur pada viewport 390px, `WCAG 2.2 SC 2.5.8 Target Size (Minimum)` mensyaratkan 24×24 CSS px:
- `.header-cv` "Download CV" — 113×**22**
- Footer "LinkedIn" — 76×**22**
- Footer "Email" — 56×**22**

Tambahkan padding blok. Selisihnya 2px.

### P3-33 · Marquee memakai `role="img"` untuk pita teks panjang

`<div className="marquee" role="img" aria-label="Bidang: pemasaran afiliasi, ...">`. Berfungsi, tapi `role="img"` + `aria-label` pada pita bergerak lebih tepat sebagai teks statis untuk screen reader dengan konten visual `aria-hidden`.

---

## Urutan pengerjaan yang disarankan

**Batch 1 — Stop the bleeding** (P0-1, P0-2, P3-32)
Perbaiki bug filter, pasang jaring pengaman reveal, benahi target sentuh. Ini yang membuat situs bisa dipercaya. Tambahkan regression test untuk bug filter sebelum memperbaikinya.

**Batch 2 — Bukti** (P1-4, P1-5, P1-3, P1-7)
Masukkan foto AnyMind × Pantene. Kumpulkan aset konten dari Anung. Bangun galeri bukti di halaman Pengalaman. Tambahkan fakta CV yang hilang. Ini yang mengubah "web yang rapi" jadi "portofolio".

**Batch 3 — Konversi** (P1-10, P1-11, P1-12, P1-13)
Backend form, WhatsApp, kartu OG, preview CV. Ini yang mengubah pengunjung jadi percakapan.

**Batch 4 — Visualisasi data** (P1-8, P1-9)
Ring IPK, bar TOEFL, split platform, timeline karier, counter di halaman Pengalaman.

**Batch 5 — Layout & motion** (P2-14 sampai P2-23)
Ruang mati, aksen mode gelap, crop potret, disclosure, kosakata reveal, gerbang intro.

**Batch 6 — Infrastruktur** (P2-24 sampai P2-31, P3-33)
Bundle, gambar, prerender, structured data, sitemap, llms.txt, bilingual.

Batch 1 dan 2 memberi nilai terbesar per jam. Batch 6 bisa ditunda tanpa ada yang menyadarinya.

---

## Yang sengaja TIDAK saya rekomendasikan

Supaya jelas bahwa hal-hal ini sudah diperiksa dan memang baik:

- **Kontras** lolos AA di mana-mana, terang maupun gelap. Jangan disentuh.
- **Skema warna** (bordo/hijau/krem dari palet yang disuplai) kuat dan khas. Jangan diganti.
- **Tipografi** — Manrope self-hosted, skala clamp, letter-spacing negatif pada judul — sudah tepat.
- **Reduced motion** ditangani menyeluruh: intro dilewati, Lenis mati, animasi dekoratif mati.
- **Perilaku history** (back/forward, kill curtain, fokus ke `main`) benar dan sudah dites.
- **Kejujuran copy** — `src/data.js:2` secara eksplisit melarang menyajikan target outreach sebagai hasil penjualan, dan copy-nya mematuhi itu. Pertahankan. Jangan biarkan permintaan "buat lebih impresif" berubah jadi angka yang dikarang.
- **CLS 0.008** hampir sempurna. Setiap gambar baru wajib punya `width`/`height` supaya tetap begitu.
