# Plan — Perbaikan Portofolio Anung (putaran 2)

Ditulis 2026-09-20. Menggantikan audit 2026-09-18 yang isinya sudah tutup
(ringkasannya di "Arsip" paling bawah; riwayat penuh ada di git dan
`docs/evidence/`).

Putaran ini lahir dari dua hal: pemeriksaan manual pemilik di browser, dan
audit kode langsung yang membantah sebagian klaim `progress.md` lama.

## Kondisi `main` yang sudah diverifikasi

Diukur di `main` 7b3e322, 2026-09-20, bukan dikutip dari catatan.

| Fakta | Angka | Cara cek |
|---|---|---|
| Suite Playwright | 196 passed, exit 0, 5,0 menit | `npx playwright test` |
| Build | sukses, entry 279,73 kB / gzip 85,62 kB | `npm run build` |
| Chunk per route | Experience 10,59 · About 6,16 · Contact 15,82 kB | keluaran build |
| robots/sitemap/llms | ter-emit ke `dist/` | keluaran build |
| Rupa VIS-1 | **TIDAK ADA di `main`** | `src/motion.js` REVEAL_TIMING masih seragam |
| `public/images/og-cover.png` | **TIDAK ADA** | `og:image` menunjuk 404 |

196 test lolos **sambil** bug P0 di bawah hidup. Itu fakta penting tentang
suite-nya, bukan cuma tentang bug-nya: tidak ada satu pun test yang menuntut
konten benar-benar terlihat setelah pengguna berhenti menggulir.

## Aturan putaran ini

1. Angka diukur ulang, tidak dikutip dari catatan lama.
2. Satu baris `progress.md` hanya `DONE` kalau ada bukti yang bisa diulang.
3. `src/data.js`, angka, dan copy yang menyatakan fakta tidak berubah.
4. `tests/` boleh diubah **hanya** di BLOK C, dan hanya dengan menulis ulang
   invarian ke DOM baru — tidak melonggarkan.
5. Tanpa dependensi baru.
6. Tidak ada commit, push, atau PR tanpa perintah eksplisit pemilik.

---

# BLOK A — Bug (paling mendesak)

## BUG-1 · Sepertiga bawah halaman Pengalaman permanen tak terlihat · P0

**Gejala.** Di `#/pengalaman`, setelah menggulir sampai dasar, enam elemen
tetap `opacity: 0` selamanya: `section.organizations` ("Kegiatan selama
kuliah."), empat `<article>` di dalamnya (BEM SB IPB, IDEANATION,
ADDVENTURES 8.0, ABEST Internship Program), dan `section.contact-callout`
("Ingin tahu detail pekerjaan saya?").

**Bukti.** Gulir wheel asli sampai `scrollY 5026` dari `scrollHeight 6026`,
lalu diam. `opacity` diambil tiap 1,2 detik sampai 10,8 detik: **tetap `0` di
sepuluh pengukuran berturut-turut.**

**Kenapa ini lebih dari sekadar reveal gagal.** `src/motion.js:253` memasang
jaring pengaman 5 detik yang seharusnya membuang `opacity`/`transform` inline
dari setiap `[data-reveal]`. Jaring itu **tidak menyelamatkan elemen-elemen
ini**. Jadi P0-2 lama ("jaring pengaman kalau ScrollTrigger gagal") yang
ditandai DONE sebenarnya bocor.

**Yang harus dikerjakan.**
- Cari akarnya dulu, jangan langsung tambal. Pertanyaannya: kenapa jaring 5
  detik tidak menjangkau elemen ini — timer-nya di-clear oleh cleanup effect
  yang berjalan ulang, selektornya tidak cocok, atau tween dibuat ulang
  sesudah jaring lewat?
- Perbaiki akarnya, bukan gejalanya. Menaikkan `opacity` lewat CSS paksa
  adalah tambalan, bukan perbaikan.
- Jaring pengaman harus jadi jaminan, bukan harapan: setelah diperbaiki,
  tidak boleh ada jalan di mana `[data-reveal]` bisa berakhir `opacity: 0`
  secara permanen.

**Gerbang.** Test baru yang gagal pada `main` hari ini dan lolos sesudahnya:
untuk keempat route, gulir ke dasar, tunggu melewati ambang jaring pengaman,
lalu tuntut **nol** elemen `[data-reveal]`/`[data-reveal-group] > *` dengan
`opacity < 0.99`. Jalankan di 4 project.

## BUG-2 · Intro splash terlalu cepat untuk dibaca · P1

**Gejala.** Teks "Halo." dan "Terima kasih sudah berkunjung." hilang sebelum
sempat dibaca.

**Bukti, dihitung dari `src/App.jsx:56-63`.**

| Kejadian | Detik |
|---|---|
| huruf "Halo." selesai masuk | 0,50 |
| caption selesai masuk | 0,50 |
| konten mulai diangkat keluar | 0,52 |
| tirai selesai naik | ±1,10 |

Teks utuh di layar hanya **±20 milidetik**.

**Yang harus dikerjakan.** Beri jeda baca sebelum konten diangkat — targetnya
teks utuh dan diam minimal **0,9 detik**, total intro tetap di bawah **2,2
detik** supaya kunjungan pertama tidak terasa disandera. Naikkan juga
`setTimeout(skip, 2000)` di `src/App.jsx:53` supaya jaring pengamannya tidak
memotong intro yang sah; jaring itu harus tetap ada dan tetap lebih panjang
dari durasi intro.

**Yang tidak boleh berubah.** Tombol "Lewati intro" tetap ada dan tetap
bekerja kapan saja. `prefers-reduced-motion` tetap melewati intro sepenuhnya.
Intro tetap hanya sekali per sesi (`sessionStorage`).

**Gerbang.** Test yang mengukur jendela baca: teks splash terlihat dan diam
≥ 0,9 detik; intro selesai < 2,2 detik; klik "Lewati intro" di tengah animasi
langsung membuka halaman.

## BUG-3 · Glitch yang dilaporkan pemilik · belum direproduksi

Pemilik melaporkan "sering banyak glitch" tanpa langkah reproduksi.
Kandidat paling kuat: tirai transisi antar-route (`transitioning` di
`src/App.jsx`), terutama saat route diganti sebelum tirai sebelumnya selesai.

**Yang harus dikerjakan.** Jangan menebak perbaikan. Reproduksi dulu:
klik cepat berpindah route berulang-ulang, tekan tombol Back browser di
tengah tirai, dan ganti tema di tengah tirai — di 4 project, dan pada mesin
yang di-throttle CPU. Catat apa yang rusak sebelum menyentuh kode.
Kalau tidak ada yang rusak, tulis itu apa adanya dan minta langkah
reproduksi dari pemilik; **jangan** tandai DONE.

---

# BLOK B — Hutang yang belum mendarat di `main`

Keduanya sudah ada isinya di branch, tapi branch-nya lahir **sebelum**
refactor Kirim 5. `git merge` akan menghapus `src/pages/`, `src/seo.js`,
`src/site.js`, dan `src/image-manifest.json`. **Port diff-nya, jangan merge.**

## DEBT-1 · Turunkan rupa VIS-1 ke `main`

Sumber: commit `6b10739`. Isinya `src/motion.js` (28 baris, murni nilai
easing/durasi/stagger) dan `src/styles.css` (87 baris rupa).

    git diff 60f9c5f..6b10739 -- src/motion.js src/styles.css

Yang boleh ikut: hanya dua berkas itu. Kalau `git diff --stat` setelah apply
menyebut berkas lain, itu salah.

Catatan: sebagian isi VIS-1 untuk timeline akan **ditimpa** oleh BLOK C.
Tetap turunkan dulu supaya bagian non-timeline (ring IPK, bar TOEFL, split
bar, ritme reveal) mendarat, dan supaya BLOK C berdiri di atas basis yang
sama dengan yang dulu diverifikasi.

## DEBT-2 · Pasang berkas OG

Sumber: commit `0adb7e5`, hanya menambah berkas.

    git checkout 0adb7e5 -- public/images/og-cover.png assets/source/og-cover.png \
      docs/asset-provenance.md docs/evidence/kirim-img-2 docs/image-jobs/IMG-2-og-image.md

Jangan ambil `progress.md` dari commit itu.

**Gerbang.** `npm run build`, lalu buktikan `dist/images/og-cover.png` ada dan
1200×630, dan `og:image` di `dist/index.html` menunjuk ke situ.

**Sisa yang jujur.** Validasi LinkedIn Post Inspector dan pratinjau WhatsApp
nyata **tidak bisa** dilakukan tanpa domain hidup. Tulis sebagai sisa, jangan
diklaim.

---

# BLOK C — Rombak visualisasi "Rentang waktu magang"

Pemilik menolak rupa timeline sekarang. Ini satu-satunya blok yang boleh
mengubah JSX dan test.

## Yang salah sekarang

| # | Cacat | Sumber |
|---|---|---|
| 1 | Label di atas bar, selebar penuh; mata harus lompat untuk memasangkan | `.timeline-row` grid tanpa kolom |
| 2 | Tidak ada kisi bulan, posisi bar tidak bisa dibaca | `.timeline-track` hanya satu border |
| 3 | Sumbu hanya dua label dan jauh di bawah semua bar | `.timeline-axis` |
| 4 | "Dua magang bersamaan" sebaris dengan tiga peran asli, terbaca sebagai **pekerjaan keempat** | dirender sebagai `<li>` biasa |
| 5 | Bar kotak datar tanpa angka, menempel tepi | `.timeline-bar` |
| 6 | Kalimat lead mengulang isi baris hijau | redundan |

## Arah desain yang diminta

Bentuknya Gantt yang terbaca, bukan empat balok terpisah.

- **Dua kolom.** Label kiri dengan lebar tetap (`clamp(200px, 26vw, 320px)`),
  track kanan. Label sebaris dengan bar-nya.
- **Kisi 11 bulan** di belakang track, Sep 2025 – Jul 2026, sebagai garis
  vertikal tipis. Kisi murni dekoratif: `--from` dan `--span` tetap satu-satunya
  sumber posisi, tetap dihitung dari `start`/`end` di `src/data.js`.
- **Sumbu di atas track, bukan di bawah.** Label tiap 2 bulan di desktop, tiap
  kuartal di bawah 700px. Sumbu lama yang hanya dua label dihapus.
- **Bar**: tinggi ±28px, ujung pill, periode ditulis di ujung bar sehingga
  angkanya bisa dibaca tanpa mengukur ke sumbu.
- **Overlap berhenti jadi baris.** Bulan yang tumpang tindih digambar sebagai
  pita vertikal di belakang dua baris yang menghasilkannya, dengan satu
  anotasi "4 bulan bersamaan". Overlap harus terbaca sebagai hubungan antara
  dua baris, bukan sebagai baris ketiga.
- **Mobile**: label menumpuk di atas bar, kisi tetap ada, sumbu tetap di atas.
- Warna hanya dari token yang sudah ada. Kontras AA wajib lolos terang dan
  gelap; lampirkan angka setiap pasangan yang berubah.

## Test yang harus ditulis ulang

Desain lama dikunci di `tests/portfolio.spec.js`:

- `:611` `.timeline-row` tepat 4 — ikut hitungan baris overlap
- `:626` `bar('.timeline-overlap')` — geometri baris overlap
- `:639` `.timeline-overlap .timeline-period` teks persis
- `:640` `.timeline-axis` teks persis `"Sep 2025Jul 2026"`

Empat assertion itu memotret **bentuk lama**, bukan kebenaran. Tulis ulang ke
DOM baru dengan invarian yang sama kerasnya:

1. Lebar setiap bar proporsional terhadap jumlah bulannya, dihitung dari
   `src/data.js`, bukan dari angka yang diketik di test.
2. Rentang sumbu masih Sep 2025 – Jul 2026 dan diturunkan dari data.
3. Bulan tumpang tindih tetap tergambar dan tetap disebut 4 bulan.
4. Dua periode di perusahaan yang sama tetap dijelaskan lewat `.timeline-note`.
5. Kisi bulan tidak boleh memengaruhi posisi bar: bar dengan kisi disembunyikan
   harus punya geometri identik.

Melonggarkan assertion tanpa penggantinya = gagal.

---

# BLOK D — Poles visual menyeluruh

Hanya setelah BLOK A, B, C lolos. Boleh menyentuh `src/styles.css` dan nilai
estetis di `src/motion.js`. Tidak boleh menyentuh `src/data.js`, angka, copy
fakta, logika, routing, form, state, `scripts/`, konfigurasi build.

1. `src/styles.css` penuh angka lepas (31px, 58px, 22px, 67px, 27px…).
   Rasionalkan jadi skala spacing berbasis token di `:root`.
2. Skala tipografi konsisten: `h1` sudah `clamp()`, samakan `h2`/`h3`/body.
3. Ritme vertikal antar-section disamakan lintas 4 halaman.
4. Durasi dan easing hover/focus disamakan — sekarang campur 180/250/620ms
   tanpa alasan.
5. Radius dan bayangan dalam token warna yang ada.

---

# Di luar scope putaran ini

| Item | Alasan |
|---|---|
| Foto/video asli dari Anung | Belum dikirim. Tiga slot bukti tetap placeholder jujur bercaption. |
| Deploy | Keputusan pemilik. |
| `VITE_SITE_URL` | Domain final belum ada; canonical/OG/sitemap/llms tetap host placeholder dan build tetap memperingatkan. |
| `VITE_WEB3FORMS_KEY` | Tanpa kunci, form jatuh ke draf `mailto:` dan copy-nya mengatakan persis itu. |
| P2-31 bilingual · P2-27 prerender/SSG · P2-25 subset font · P2-24 SVG manual | Di-SKIP sejak putaran 1, alasannya masih berlaku. |

---

# Gerbang rilis putaran ini

Diukur ulang di akhir, bukan dikutip.

| Gerbang | Ambang |
|---|---|
| `npm test` | lolos penuh, 4 project |
| Test baru BUG-1 | gagal di `main` hari ini, lolos sesudahnya |
| Lighthouse mobile | performance ≥ 98 · a11y 100 · best-practices 100 · SEO 100 · agentic-browsing 1,00 |
| CLS | ≤ 0,01 |
| Kontras | AA lolos terang dan gelap; angka setiap pasangan yang berubah dilampirkan |
| `prefers-reduced-motion` | dihormati; chunk animasi tetap tidak diunduh |
| Console error | 0 |
| Bukti | `docs/evidence/putaran-2/` |

---

# Arsip — audit 2026-09-18

Putaran 1 menutup 30 temuan dan mem-SKIP 3. Rinciannya ada di git
(`git log`, commit Kirim 1–5) dan `docs/evidence/kirim-1` … `kirim-5`.

| Kelompok | Hasil |
|---|---|
| P0-1, P0-2 | DONE — **P0-2 terbukti bocor, dibuka lagi sebagai BUG-1** |
| P1-3 … P1-13 | DONE — kecuali P1-8/P1-9/P2-23 yang rupanya tertahan di branch, lihat DEBT-1 |
| P2-14 … P2-30 | DONE, kecuali yang di-SKIP |
| P2-24, P2-25, P2-27, P2-31 | SKIP / dibatasi |
| P3-32, P3-33 | DONE |

Metrik akhir putaran 1, diverifikasi ulang hari ini kecuali baris Lighthouse:
performance 98 · a11y 100 · best-practices 100 · SEO 100 · agentic-browsing
1,00 · LCP 2,3 s · CLS 0 · 196 test lolos.

**Peringatan yang dibawa dari putaran 1:** branch `fase/img-1`, `fase/img-2`,
dan `fase/vis-1` sudah usang. Jangan di-merge.
