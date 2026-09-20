# VIS-1 — Rupa visualisasi dan ritme reveal

Fase Codex, implementasi 2026-09-19; penutup 2026-09-20. **WIP: gerbang suite penuh gagal.** Implementasi hanya `src/styles.css` dan nilai `REVEAL_TIMING`, `REVEAL_GROUP_TIMING`, `VIZ_TIMING` di `src/motion.js`.

| Sebelum | Sesudah | Alasan |
|---|---|---|
| Ring 96 px terpisah jauh dari angka | Ring 212 px, angka di pusat; 196 px di mobile | Satu objek yang langsung terbaca |
| Label dan bar timeline bertumpuk tanpa kisi | Label satu kolom; bar sejajar pada kisi 11 bulan; mobile kembali bertumpuk | Tumpang tindih terlihat melalui posisi |
| Bar TOEFL dan split seperti kotak kerangka | Track ramping, hierarki angka/label, legenda dan caption lebih lega | Menyatu dengan tipografi editorial |
| Semua reveal satu timing | Teks cepat; heading tegas; media lebih lambat; stagger per jenis | Ritme masuk berbeda sesuai konten |
| Lebar digit counter berubah saat menghitung | Angka tabular dan tanda + terpisah lebih kecil | Counter lebih stabil dan mudah dipindai |

## Bukti visual

Seluruh pasangan sebelum ada di [before/](before/), diambil dari build sesi ini sebelum patch, dengan skrip yang sama. Semua WebP kualitas 80.

| Visual | 1440 terang | 1440 gelap | 390 terang | 390 gelap |
|---|---|---|---|---|
| Ring IPK | [lihat](ring-ipk-1440-light.webp) | [lihat](ring-ipk-1440-dark.webp) | [lihat](ring-ipk-390-light.webp) | [lihat](ring-ipk-390-dark.webp) |
| TOEFL | [lihat](bar-toefl-1440-light.webp) | [lihat](bar-toefl-1440-dark.webp) | [lihat](bar-toefl-390-light.webp) | [lihat](bar-toefl-390-dark.webp) |
| Split | [lihat](split-afiliasi-1440-light.webp) | [lihat](split-afiliasi-1440-dark.webp) | [lihat](split-afiliasi-390-light.webp) | [lihat](split-afiliasi-390-dark.webp) |
| Timeline | [lihat](timeline-karier-1440-light.webp) | [lihat](timeline-karier-1440-dark.webp) | [utuh](timeline-karier-390-light-uncropped.webp) | [utuh](timeline-karier-390-dark-uncropped.webp) |
| Counter | [lihat](counter-pengalaman-1440-light.webp) | [lihat](counter-pengalaman-1440-dark.webp) | [lihat](counter-pengalaman-390-light.webp) | [lihat](counter-pengalaman-390-dark.webp) |

Screenshot standar mobile timeline tetap disimpan untuk perbandingan skrip Kirim 3; header sticky memotong bagian atas ketika section lebih tinggi dari viewport. Dua versi `uncropped` memakai viewport 390×1200 dan reduced motion, dengan ruang 100 px di atas section.

Reduced motion: [ring](ring-ipk-reduced-motion.webp), [TOEFL](bar-toefl-reduced-motion.webp), [split](split-afiliasi-reduced-motion.webp), [timeline](timeline-karier-reduced-motion.webp), [counter](counter-pengalaman-reduced-motion.webp). Halaman penuh: [Tentang](tentang-1440-light-reduced-motion.webp), [Pengalaman](pengalaman-1440-light-reduced-motion.webp).

## Verifikasi

- [Build](build.txt): exit 0. Peringatan domain placeholder berasal dari default Kirim 4.
- [Skrip Kirim 3](verify.txt): exit 0. [Metrik](metrics.json): arc 0,935001; TOEFL 0,7439; rasio split sekitar 2:1 akibat pembulatan subpiksel; selisih cakupan track 0 px; overlap 4 bulan. Empat route tidak meluber pada 320/390/1440 px.
- 40 pasangan kontras standar lolos: minimum teks 5,806:1, grafis terhadap permukaan 5,268:1. Tambahan 6 pasangan grafis terhadap warna campuran kisi/track juga lolos, minimum 3,164:1. [Rincian tambahan](polish-metrics.json).
- [Reduced motion](reduced-motion.txt): 6 counter final, 6 bar `transform: none`, TOEFL final, arc tanpa inline override.
- [Probe rupa dan motion](verify-polish.txt): ring dan angka muat pada 320/390/1100/1440 di dua tema; tween arc dan bar benar-benar melewati nilai antara. Durasi/easing aktif dan sampel setiap frame ada di [polish-metrics.json](polish-metrics.json).
- [Berkas terlindungi](protected-files.txt): SHA-256 JSX, data, test, seluruh scripts, package dan lockfile identik dengan sebelum patch.
- [Suite penuh](full-suite.txt): **163 passed, 1 failed (3.3m)**. Firefox preview CV gagal pada `portfolio.spec.js:746`: `expect(rendered.natural).toBeGreaterThan(0)`, menerima `0`. Penyebab belum dipastikan. Tidak commit/push; fase tetap WIP, perlu pemeriksaan Claude Code.
- [Lingkungan browser](env-check.md): ketiga engine berhasil launch, tanpa pemasangan sistem.

## Batas pengukuran dan catatan balik

Probe pertama memakai batas pecahan arc yang terlalu ketat untuk nilai antara CSS: [kegagalan](probe-arc-first.txt). GSAP membulatkan offset CSS sementara ke satuan SVG; sampel offset 21 menghasilkan pecahan 0,935726, lalu cleanup mengembalikan atribut 21,237 (pecahan 0,935001). Probe tambahan memakai toleransi setengah satuan SVG hanya selama tween; nilai akhir tetap diperiksa. Logika aplikasi dan test yang ada tidak diubah. Kurva tidak memakai bounce/back/elastic.

Kisi 11 bulan dekoratif mengikuti rentang data saat ini. Jika tanggal CV berubah, harness kode perlu meninjau jumlah sel kisi; posisi bar tetap digerakkan `--from`/`--span` dari data.

Tidak ada angka CV, label, caption, aset publik, dependency atau token tema yang berubah. Tidak membuat tiket gambar baru. Lighthouse dan audit CLS bukan cakupan tiket VIS-1; tidak mengklaim hasil pengukuran baru untuk keduanya.

## Ulangi bukti

```sh
npm run build
npx vite preview --host 127.0.0.1 --port 4173 --strictPort
EVIDENCE_DIR=docs/evidence/vis-1 node scripts/verify-kirim-3.mjs
EVIDENCE_DIR=docs/evidence/vis-1 node scripts/shoot-kirim-3.mjs
node docs/evidence/vis-1/verify-polish.mjs
node docs/evidence/vis-1/shoot-mobile.mjs
npm test
```

Jalankan preview di terminal tersendiri. Folder `before/` adalah snapshot; jangan ditimpa pada verifikasi berikutnya.
