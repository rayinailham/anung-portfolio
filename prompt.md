# Prompt Pengembangan — Portofolio Anung

Satu prompt untuk semua fase. Tidak ada copy-paste berbeda tiap kirim.

Cara pakai:

1. Buka sesi baru di harness yang sesuai (lihat **Papan Fase** di bawah).
2. Tempel **PROMPT UNIVERSAL** apa adanya. Sama persis setiap kali.
3. Agent menentukan sendiri fase mana yang harus dikerjakan dengan membaca
   `progress.md`, lalu membaca detail fase itu di berkas ini.
4. Selesai satu fase → agent berhenti dan lapor. Sesi berikutnya tempel prompt
   yang sama lagi.

Referensi: `plan.md` (33 temuan + bukti), `progress.md` (papan status, satu-satunya
sumber kebenaran fase mana yang sudah selesai).

---

# PROMPT UNIVERSAL

Tempel blok ini, utuh, setiap sesi. Jangan diedit.

````
Baca `prompt.md` di root project, lalu kerjakan fase berikutnya sendiri.

## Orientasi diri — lakukan ini dulu, sebelum mengubah apa pun

1. Baca `progress.md`. Cari kirim (fase) bernomor paling kecil yang belum
   seluruh barisnya `DONE` atau `SKIP`. Itu fase kamu.
2. Baca bagian fase itu di `prompt.md` (heading "KIRIM #N"). Di situ ada daftar
   kerja lengkap, batasan, dan verifikasi yang diminta.
3. Cek **Papan Fase** di `prompt.md`: fase itu milik harness mana.
   - Kalau kamu BUKAN harness pemiliknya, JANGAN kerjakan. Laporkan satu
     kalimat: fase N milik <harness>, sesi ini <harness kamu>, berhenti.
   - Kalau fase itu punya sub-job untuk harness lain (tiket di
     `docs/image-jobs/`), kerjakan bagianmu saja dan tulis di laporan bahwa
     tiket itu menunggu harness lain.
4. Baca `plan.md` hanya untuk temuan yang menjadi bagian fase itu. Jangan baca
   seluruhnya.

Kalau semua fase sudah `DONE`/`SKIP`: jangan cari kerjaan baru. Lapor bahwa
papan bersih dan sebutkan sisa yang sengaja di-SKIP.

## Project

Portofolio pribadi Anung Hanindhita Ramadhan — lulusan Bisnis IPB yang melamar
kerja di bidang pemasaran afiliasi / digital. Situs berbahasa Indonesia.
React 19 + Vite 8, GSAP + ScrollTrigger, Lenis. Tanpa backend. Deploy statis
dari `dist/`.

Berkas:
- `src/App.jsx`     — 4 halaman, routing hash, header, form kontak, curtain
- `src/motion.js`   — siklus hidup animasi, Lenis, semua ScrollTrigger
- `src/motion-runtime.js` — modul motion opsional (GSAP/Lenis di-load terpisah)
- `src/styles.css`  — token tema, responsif (breakpoint 1100 / 767 / 370)
- `src/data.js`     — fakta dari CV. Ada aturan kejujuran di baris 2.
- `tests/portfolio.spec.js` — Playwright, 4 project
- `scripts/prepare-assets.mjs` — pipeline gambar sharp
- `index.html`      — meta, guard tema, noscript
- `docs/asset-provenance.md` — asal-usul setiap gambar. Wajib diperbarui.
- `docs/image-jobs/` — tiket gambar untuk harness image-gen

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
2. JANGAN merepresentasikan gambar yang dihasilkan mesin sebagai kerja klien.
   Berlaku untuk `public/images/connections.webp` dan setiap placeholder baru.
   Lihat "Aturan aset & placeholder" di `prompt.md`.
3. Kontras wajib tetap lolos WCAG AA terang & gelap. Terendah sekarang 5.81:1.
4. `prefers-reduced-motion: reduce` dihormati penuh: intro dilewati, Lenis
   mati, animasi dekoratif mati, setiap nilai animasi tampil final.
5. CLS sekarang 0.008. Gambar baru wajib punya `width` + `height`.
6. Jangan hapus cakupan test yang ada. Boleh nambah.
7. Jangan operasi git kecuali diminta eksplisit.
8. Copy bahasa Indonesia. Nada tetap: lugas, orang pertama, tanpa kata sifat
   pemasaran berlebihan.

## Cara kerja

- Kerjakan SELURUH daftar fase itu dalam satu sesi. Jangan berhenti di tengah
  untuk minta konfirmasi.
- Kalau ada yang ambigu, ambil keputusan paling masuk akal, KERJAKAN, lalu
  catat asumsinya di `progress.md` bagian "Catatan keputusan".
- ASET TIDAK PERNAH JADI ALASAN BERHENTI. Aset dari Anung belum ada, kredensial
  belum ada, domain belum ada — semua sudah punya jalur default di `prompt.md`
  ("Aturan aset & placeholder" dan "Keputusan + default"). Pakai default, tandai
  di `progress.md`, jalan terus. Status `BLOCKED` hanya boleh dipakai kalau
  jalur default itu sendiri mustahil dijalankan, dan alasannya ditulis.
- Kalau satu item benar-benar terblokir, selesaikan SEMUA item lain sampai
  tuntas, lalu laporkan persis mana yang tertinggal dan kenapa.
- Verifikasi sendiri sebelum lapor. Jangan lapor selesai tanpa bukti.
- Simpan bukti di `docs/evidence/kirim-<N>/` mengikuti pola Kirim 1.

## Penutup sesi — wajib

1. Update `progress.md`: status tiap baris fase ini, kolom Bukti, tabel
   ringkasan di atas, "Catatan keputusan", dan "Log verifikasi".
2. Kalau fase ini melahirkan kebutuhan gambar, tulis tiketnya di
   `docs/image-jobs/` mengikuti format di `docs/image-jobs/README.md`.
3. Git — WAJIB, dan ini izin eksplisit yang berlaku untuk seluruh project ini.
   Lakukan SETELAH verifikasi lolos, JANGAN sebelumnya. Detail di `prompt.md`
   bagian "Git per fase".
   - Fase Claude Code (Kirim 2-5): commit langsung ke `main`.
   - Fase Codex (IMG-1, IMG-2, Kirim 6): commit ke branch `fase/<id>`.
   - Satu commit per fase. Push ke `origin`. Jangan force, jangan rebase,
     jangan buka PR.
   - `npm test` gagal atau ada item fase belum tuntas → JANGAN commit. Lapor.
4. Tulis ringkasan pendek: apa yang berubah, bukti apa yang ada, hash commit,
   fase berikutnya nomor berapa dan milik harness mana.
5. Berhenti. Jangan lanjut ke fase berikutnya walau masih ada sisa konteks.
````

---

# Papan Fase

Satu fase = satu sesi = satu harness.

| Fase | Isi | Harness | Alasan |
|---|---|---|---|
| Kirim 1 | Bug P0 + perbaikan mekanis | **Claude Code** | selesai |
| Kirim 2 | Bukti kerja + ruang mati | **Claude Code** | logika data, fakta CV, layout |
| IMG-1 | Placeholder galeri bukti (3 cover) | **Codex** | image gen |
| Kirim 3 | Visualisasi data + kosakata motion | **Claude Code** | angka + SVG + motion, aturan kejujuran ketat |
| Kirim 4 | Konversi (form, WA, OG, preview CV) | **Claude Code** | integrasi, env, state |
| IMG-2 | Gambar OG 1200×630 | **Codex** | image gen |
| Kirim 5 | Performa, SEO, penutup | **Claude Code** | build, audit, laporan |
| Kirim 6 | Pass poles visual terakhir | **Codex** | artistry front-end |

## Aturan harness

**Codex** dipakai HANYA untuk dua hal: menghasilkan gambar, dan pass poles
visual terakhir. Context window-nya kecil, jadi pekerjaannya selalu dibungkus
jadi tiket mandiri.

Batas keras untuk sesi Codex:
- Baca HANYA berkas yang disebut di tiketnya. Jangan baca `plan.md`,
  `progress.md`, atau `src/` kecuali tiket menyebutnya.
- Jangan sentuh `src/data.js`, `src/App.jsx` logika, `tests/`, atau angka apa
  pun. Kirim 6 hanya boleh menyentuh `src/styles.css` dan berkas yang
  disebut tiketnya.
- Jangan jalankan audit Lighthouse, jangan refactor, jangan perbaiki bug.
  Temuan di luar tiket ditulis sebagai catatan, bukan dikerjakan.
- Selesai satu tiket → berhenti.

**Claude Code** mengerjakan sisanya: bug, data, fakta, integrasi, performa, SEO,
test, dan semua penulisan `progress.md`.

Kalau sebuah fase butuh gambar, Claude Code TIDAK menghasilkan gambarnya
sendiri. Claude Code menulis tiket di `docs/image-jobs/`, memasang slot dengan
placeholder CSS sementara supaya layout tetap utuh dan test tetap lolos, lalu
lanjut. Sesi Codex mengeksekusi tiket itu dan menaruh berkasnya di jalur yang
sudah ditentukan. Tidak ada yang saling menunggu.

---

# Git per fase

Izin git untuk project ini sudah diberikan di depan. Agent tidak perlu bertanya
lagi. Yang dilarang tetap dilarang.

Remote: `origin` → `rayin-personal:rayinailham/anung-portfolio.git`
(akun **personal**, `rayinailham`). Jangan pakai akun kerja, jangan pakai `gh`
dengan sesi akun lain.

## Kapan

Satu commit di **akhir fase**, setelah seluruh verifikasi fase itu lolos dan
`progress.md` sudah diperbarui. Tidak ada commit di tengah kerja.

Gerbang sebelum commit:
- `npm test` lolos penuh
- tidak ada item fase yang tertinggal tanpa alasan tertulis
- `git status` bersih dari `.env*`, `dist/`, `node_modules/`, berkas sampah

## Ke mana

| Fase | Tujuan |
|---|---|
| Kirim 2, 3, 4, 5 (Claude Code) | commit langsung ke `main` |
| IMG-1, IMG-2, Kirim 6 (Codex) | branch `fase/img-1`, `fase/img-2`, `fase/kirim-6` |

Alasan pemisahan: fase Codex berbasis selera. Gambar atau poles visual yang
tidak disukai Milord harus bisa dibuang dengan menghapus branch, bukan dengan
`git revert` di `main`. Riwayat `main` sudah memuat satu revert palet warna —
persis kasus ini.

Merge branch fase Codex ke `main` adalah keputusan Milord, bukan agent. Agent
push branch-nya lalu berhenti.

## Format pesan commit

```
<tipe>(kirim-<n>): <ringkas, bahasa Indonesia, huruf kecil>

- <ID temuan>: apa yang berubah
- <ID temuan>: apa yang berubah

Bukti: docs/evidence/kirim-<n>/
Test: npm test <hasil>
```

Tipe: `feat`, `fix`, `perf`, `docs`, `chore`, `style`.
Contoh: `fix(kirim-2): tampilkan bukti kerja dan isi ruang mati`.

Baris atribusi harness ditambahkan sesuai aturan harness masing-masing.

## Yang dilarang

- `--force`, `--force-with-lease`, rebase riwayat yang sudah di-push
- `git reset --hard` pada kerja yang belum di-commit
- commit `.env*` atau kunci apa pun
- membuat PR, mengubah setelan repo di GitHub, mengubah remote
- commit walau ada test gagal — "biar tidak hilang" bukan alasan

Push ditolak → laporkan pesan aslinya, jangan diakali.

## Berat repo

Bukti screenshot ikut di-commit; itu memang deliverable. Tapi jaga ukurannya:
PNG bukti di atas 500 KB dikonversi ke WebP kualitas 80 sebelum di-commit,
kecuali perbandingan piksel memang butuh lossless. Trace Playwright hanya
di-commit kalau trace itu bukti utama sebuah temuan. Rekaman video tidak
di-commit (sudah masuk `.gitignore`).

---

# Aturan aset & placeholder

Aset dari Anung belum ada dan mungkin tidak akan pernah ada. Itu bukan blocker.

## Urutan yang dipakai untuk setiap slot gambar

1. **Aset asli dari Anung** — kalau ada di root project atau `assets/source/`.
2. **Foto nyata yang sudah dimiliki** — `with_anymind_team.jpg`,
   `anung_profile.jpeg`.
3. **Placeholder hasil image gen** — lewat tiket ke Codex.
4. Jangan pernah: kosongkan slot diam-diam, atau hapus klaimnya dari copy.

## Apa yang boleh dan tidak boleh digambar

Placeholder BOLEH berupa: komposisi abstrak, bentuk geometris, still life
bergaya editorial, tekstur, kartu warna brand — sesuatu yang jelas bukan
tangkapan layar.

Placeholder TIDAK BOLEH berupa: tiruan tangkapan layar Instagram, tiruan
dashboard afiliasi, tiruan grafik penjualan, logo merek nyata (Unicharm,
Pantene, Shopee, TikTok, AnyMind), wajah manusia, atau teks yang terbaca sebagai
data. Gambar yang bisa disalahartikan sebagai bukti kerja adalah kebohongan,
sekalipun captionnya jujur.

## Kontrak teknis placeholder

- Jalur berkas: `public/images/placeholder/<slot-id>.webp`
- Sumber: `assets/source/placeholder/<slot-id>.png`
- Di `src/data.js`, slot bukti punya bentuk:
  `{ id, type, caption, src, placeholder: true }`
- Di DOM wajib ada `data-placeholder="true"` pada elemen slot.
- Caption wajib menyebut statusnya dengan kata sendiri, contoh:
  "Materi asli belum dipublikasikan — ilustrasi sementara." Caption ini bagian
  dari konten, bukan `title` atau `alt` saja.
- `alt` mendeskripsikan gambarnya apa adanya (ilustrasi abstrak), bukan
  mendeskripsikan pekerjaan yang tidak ditampilkan.
- Wajib punya `width` + `height`.
- Mengganti placeholder dengan aset asli nanti = taruh berkas di jalur yang
  sama dan hapus `placeholder: true`. Tidak boleh perlu menulis JSX lagi.
- Setiap gambar hasil generate wajib dicatat di `docs/asset-provenance.md`
  lengkap dengan prompt yang dipakai.

---

# Keputusan + default

Tabel ini menggantikan "wajib diputuskan sebelum kirim 1" yang lama. Kolom
"Jawaban" kosong bukan alasan berhenti — agent pakai kolom "Default".

| # | Keputusan | Jawaban Milord | Default kalau kosong |
|---|---|---|---|
| 1 | Backend form kontak | `_______` | Web3Forms, dibaca dari `VITE_WEB3FORMS_KEY` |
| 2 | Kredensial form | sudah / belum | Kalau env var tidak ada saat runtime: UI tetap lengkap, submit jatuh ke `mailto:`, test menutup kedua jalur |
| 3 | Domain final | `_______` | `VITE_SITE_URL`, fallback konstanta di `src/site.js` yang ditandai placeholder |
| 4 | Aset konten dari Anung | ada / tidak ada | Anggap tidak ada → jalur placeholder di atas |
| 5 | Placeholder hasil image gen | ya / tidak | Ya, dengan semua batasan di "Aturan aset & placeholder" |

---

# YANG DIPOTONG DARI SCOPE

Jujur di depan. Ini dibuang, bukan lupa:

| Dibuang | Alasan |
|---|---|
| **P2-31 Bilingual ID/EN** | Item termahal di seluruh daftar. Sendirian bisa makan 3 fase. |
| **P2-27 Prerender / SSG** | Butuh keputusan hosting + rewrite. Google tetap bisa render JS; yang benar-benar sakit (preview LinkedIn/WA) sudah diobati `og:image` di Kirim 4. |
| **P1-6 Halaman case study terpisah** | Diturunkan jadi deep-link ke anchor kartu. 90% manfaat, 10% biaya. |
| **P2-25 Buang subset font** | 47 KB artefak build, dampak runtime nol (browser cuma unduh `unicode-range` yang cocok). Kosmetik. |
| **P2-24 Ganti Phosphor jadi SVG inline** | Tukar 14 ikon manual demi ~20 KB. Rasio buruk. Code-split tetap dikerjakan. |

Kalau nanti ada waktu, ambil dari `plan.md` pakai "Prompt satuan" di bawah.

---

# KIRIM #1 — Bug + semua perbaikan mekanis · Claude Code · SELESAI

Status di `progress.md`: 10/10 DONE. Jangan dikerjakan ulang. Ringkasan apa yang
sudah berubah ada di "Catatan keputusan" `progress.md`.

Isi aslinya: P0-1 refresh ScrollTrigger saat layout berubah, P0-2 reveal
progressive enhancement, P2-15 aksen mode gelap `#7fb3a8`, P2-16 crop potret,
P2-17 asterisk, P2-19/P2-20 disclosure, P2-21 gerbang intro, P3-32 target
sentuh, P3-33 marquee.

---

# KIRIM #2 — Bukti kerja + ruang mati · Claude Code

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
- Ikuti "Aturan aset & placeholder": tiap slot yang asetnya belum ada memakai
  cover placeholder, `placeholder: true`, `data-placeholder="true"`, dan caption
  jujur
- Placeholder-nya BELUM ada gambarnya saat kamu kerja. Pasang fallback CSS
  (blok warna brand + caption) supaya layout dan test tetap benar tanpa berkas
  gambar, lalu tulis tiket `docs/image-jobs/IMG-1-bukti-placeholder.md` untuk
  Codex. Begitu berkasnya masuk, tidak boleh ada perubahan JSX lagi.
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

## Verifikasi yang diminta

- screenshot sebelum/sesudah: Beranda, Pengalaman, Tentang — 1440px dan 390px,
  terang dan gelap
- tiap angka baru dikutip bersama baris CV sumbernya
- tidak ada gambar muncul >1× dengan crop berbeda
- deep-link kartu Beranda mendarat di entri yang benar
- slot placeholder: caption jujur terlihat, `data-placeholder="true"` ada,
  dan halaman tetap benar TANPA berkas gambar apa pun
- CLS ≤ 0.01 pada audit Lighthouse mobile baru
- `npm test` lolos — termasuk test regresi filter dari Kirim 1

Update `progress.md`: P1-3, P1-4, P1-5, P1-6, P1-7, P2-14, P2-18.
Tulis tiket: `docs/image-jobs/IMG-1-bukti-placeholder.md`.

---

# IMG-1 — Cover placeholder galeri bukti · Codex

Tiket penuh: `docs/image-jobs/IMG-1-bukti-placeholder.md` (ditulis oleh sesi
Kirim 2). Sesi Codex membaca tiket itu saja.

Ringkas: tiga cover abstrak bergaya editorial dengan warna brand — satu untuk
slot konten sosial, satu untuk slot video, satu untuk slot webinar. Tanpa teks,
tanpa logo, tanpa wajah, tanpa tiruan antarmuka.

---

# KIRIM #3 — Visualisasi data + kosakata motion · Claude Code

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
  dan Kirim 5 bertugas mengecilkannya.
- Skala ordinat jujur. Jangan mulai bar dari angka bukan-nol untuk
  melebih-lebihkan selisih.
- `prefers-reduced-motion: reduce` → nilai akhir langsung tampil, tanpa
  animasi. Sudah ada di suite; jangan sampai rusak.
- Tiap visual butuh teks alternatif. Angka harus terbaca screen reader, tidak
  boleh terkunci di dalam grafis.
- Warna dari token brand, lolos AA terang DAN gelap. Token aksen gelap sudah
  diperbaiki di Kirim 1 — pakai itu.
- Tiap visual tetap masuk akal di 390px.
- Semua visual baru mengubah tinggi dokumen → jaring pengaman ScrollTrigger
  dari Kirim 1 harus tetap jalan. Verifikasi.
- Visual dibuat sebagai SVG inline oleh Claude Code. Ini bukan pekerjaan image
  gen — jangan buat tiket untuk ini.

## Verifikasi yang diminta

- screenshot tiap visual: terang dan gelap, 1440px dan 390px
- screenshot dengan reduced motion aktif, menunjukkan nilai akhir
- cek kontras semua warna baru
- delta ukuran bundle gzip
- `npm test` lolos, plus test yang mengassert angka final ada di DOM dengan
  reduced motion aktif

Update `progress.md`: P1-8, P1-9, P2-23.

---

# KIRIM #4 — Konversi · Claude Code

Portofolio ini punya satu tujuan: membuat recruiter menghubungi Anung. Jalur itu
bocor di empat tempat.

Keputusan diambil dari tabel "Keputusan + default". Kalau kolom Jawaban kosong,
pakai kolom Default dan catat di `progress.md`. Jangan berhenti untuk bertanya.

## A. Form kontak tidak mengirim apa pun (P1-10)

`send()` di `src/App.jsx` cuma menyusun `window.location.href = "mailto:..."`.
Untuk recruiter di desktop yang pakai Gmail web tanpa handler `mailto:`
terdaftar, menekan "Buka draf email" tidak menghasilkan apa-apa yang terlihat.
Pesannya hilang dan Anung tidak pernah tahu ada yang mencoba menghubungi.

- Pakai backend dari tabel keputusan
- `mailto:` tetap ada sebagai fallback kalau pengiriman gagal ATAU kalau
  kredensial tidak tersedia saat build
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

- Tambahkan `og:image`, `og:image:width`, `og:image:height`, `og:image:alt`,
  `og:url`, `twitter:card=summary_large_image`
- Canonical dan `og:url` dari satu sumber tunggal (`src/site.js` + env var),
  bukan string yang diulang-ulang
- Gambar OG-nya BUKAN pekerjaanmu. Tulis tiket
  `docs/image-jobs/IMG-2-og-image.md` untuk Codex, tunjuk `og:image` ke
  `public/images/og-cover.png`, dan pastikan tag-nya benar walau berkasnya belum
  ada. Catat di `progress.md` bahwa berkasnya menunggu IMG-2.

## D. CV cuma bisa di-download (P1-13)

Recruiter yang menyaring 40 kandidat tidak akan mengunduh PDF. Tambahkan
preview CV inline di samping tombol download yang ada — embed, atau render
halaman pertama sebagai gambar saat build lewat `prepare-assets.mjs`. Tombol
download tetap ada. Ini render dari PDF nyata, bukan image gen.

## Verifikasi yang diminta

- pengiriman form tes benar-benar sampai ke inbox — screenshot email masuk
  (kalau kredensial belum ada: buktikan jalur fallback `mailto:` dan tulis
  bahwa uji inbox menunggu kunci)
- form gagal dengan baik saat jaringan diputus, fallback `mailto:` muncul
- tautan WhatsApp membuka WA dengan pesan terisi
- markup OG benar dan menunjuk ke jalur yang disepakati; validasi LinkedIn Post
  Inspector dilakukan setelah IMG-2 masuk
- tidak ada kunci API di berkas yang dilacak — `git status` bersih dari `.env*`
- `npm test` lolos, plus test baru untuk state sukses/gagal form

Update `progress.md`: P1-10, P1-11, P1-12, P1-13.
Tulis tiket: `docs/image-jobs/IMG-2-og-image.md`.

---

# IMG-2 — Gambar OG 1200×630 · Codex

Tiket penuh: `docs/image-jobs/IMG-2-og-image.md` (ditulis oleh sesi Kirim 4).
Sesi Codex membaca tiket itu saja.

Ringkas: kartu share 1200×630 dengan potret Anung, nama, peran, warna brand,
Manrope. Ini satu-satunya gambar yang BOLEH memuat teks, karena teksnya adalah
nama dan peran orang yang bersangkutan — bukan data hasil kerja.

---

# KIRIM #5 — Performa, SEO, penutup · Claude Code

Ini fase kode terakhir. Di akhir, laporkan juga status penuh seluruh project
terhadap `plan.md`.

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
Dengan gambar-gambar baru dari Kirim 2 dan placeholder dari IMG-1, jadikan
pipeline benar: AVIF + WebP, beberapa lebar, `srcset`/`sizes` yang tepat. CLS
wajib tetap ≤ 0.01.

## C. LCP (P2-22)

Baseline Lighthouse mobile: LCP 2.9s (target 2.5s), FCP 1.7s, Speed Index 3.5s,
TBT 110ms, performance 93. Perbaikan gerbang intro di Kirim 1 mestinya sudah
menurunkan ini. Ukur ulang, kejar sisa selisihnya, catat angkanya.

## D. Structured data (P2-28)

Tidak ada JSON-LD. Tambahkan schema `Person`: `name`, `jobTitle`, `alumniOf`
(IPB University), `knowsAbout`, `sameAs` (LinkedIn), `email`, `address`.
Wajib lolos Google Rich Results Test.

## E. sitemap.xml (P2-29)

`public/robots.txt` cuma `User-agent: * / Allow: /`. Tambahkan sitemap, rujuk
dari robots.txt. Pakai sumber domain yang sama dengan canonical di Kirim 4.

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
  terpisah, subset font, Phosphor) supaya masih bisa diambil nanti
- daftar slot yang masih memakai placeholder, dan berkas apa persisnya yang
  harus dikirim Anung untuk menggantinya

## Verifikasi yang diminta

- audit Lighthouse mobile baru, keempat kategori + agentic-browsing,
  dibandingkan baseline di `progress.md`
- performance / a11y / best-practices / SEO TIDAK BOLEH turun dari
  93 / 100 / 100 / 100
- gzip sebelum/sesudah
- lolos Rich Results Test
- `npm test` lolos penuh di keempat project

Update `progress.md`: P2-22, P2-24, P2-26, P2-28, P2-29, P2-30, plus laporan
penutup.

---

# KIRIM #6 — Pass poles visual · Codex

Fase terakhir. Hanya dijalankan setelah Kirim 5 `DONE`.

Tugasnya satu: melihat situs yang sudah jadi dan menaikkan kualitas rasa
visualnya tanpa menyentuh fakta, data, atau logika.

Boleh disentuh:
- `src/styles.css` — spacing, skala tipografi, berat font, radius, bayangan,
  layering warna dalam token yang ada
- nilai easing/durasi di `src/motion.js` yang murni estetis

TIDAK boleh disentuh:
- `src/data.js`, angka apa pun, copy apa pun yang menyatakan fakta
- logika `src/App.jsx`, routing, form, state
- `tests/`, `scripts/`, konfigurasi build
- token warna yang mengubah hasil kontras — kalau mau ganti warna, hitung ulang
  kontrasnya dan lampirkan angkanya

Batasan:
- Kontras AA terang dan gelap wajib tetap lolos. Lampirkan angka setiap pasangan
  yang berubah.
- `prefers-reduced-motion` tetap dihormati.
- CLS ≤ 0.01 dan skor Lighthouse tidak boleh turun. Ukur ulang.
- `npm test` wajib tetap lolos tanpa mengubah test.
- Jangan tambah dependensi.

Verifikasi: screenshot sebelum/sesudah 4 halaman × terang/gelap × 1440px/390px,
angka kontras yang berubah, hasil `npm test`, Lighthouse sebelum/sesudah.

Update `progress.md`: baris baru "Kirim 6 — poles visual" plus bukti.

---

# Prompt satuan — untuk ambil sisa yang dipotong

````
Baca `plan.md` dan kerjakan HANYA temuan <ID>. Ikuti "PROMPT UNIVERSAL" di
`prompt.md` untuk konteks dan aturan, tapi lewati langkah orientasi diri —
fasenya sudah ditentukan. Jangan sentuh apa pun di luar temuan itu. Tunjukkan
bukti sebelum/sesudah, jalankan `npm test`, update baris yang sesuai di
`progress.md`.
````

# Prompt review — kalau curiga ada yang dilapor selesai padahal belum

````
Baca `plan.md`, `progress.md`, dan diff kerja terakhir. Untuk setiap item
DONE, verifikasi buktinya nyata dan cocok dengan klaimnya — jalankan sendiri
perintahnya. Laporkan item mana pun yang ditandai selesai tanpa verifikasi yang
bisa diulang. Periksa juga pelanggaran aturan di "PROMPT UNIVERSAL", terutama
kejujuran angka, `connections.webp`, dan setiap slot placeholder yang tidak
boleh terbaca sebagai bukti kerja.
````
