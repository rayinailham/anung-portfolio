# IMG-1 — Bukti cover placeholder

Tanggal: 2026-09-19. Harness: Codex. Cakupan: tiga cover pada tiket IMG-1.

- `metrics.json`: ukuran, format, byte dan SHA-256 keenam aset; versi tiga engine; pemeriksaan DOM pada 1440/390 px × terang/gelap.
- `verify.mjs`: pemeriksaan yang bisa diulang pada build statis. Jalankan `npm run build`, `npm run preview -- --host 127.0.0.1 --port 4175`, lalu `node docs/evidence/kirim-img-1/verify.mjs`.
- `verify.txt`: keluaran pemeriksaan.
- `pengalaman-*.webp`: empat screenshot halaman lengkap, gambar lazy sudah dimuat, reduced motion aktif; WebP kualitas 80.
- `galeri-*.webp`: dua screenshot viewport untuk menilai cover dan caption pada ukuran tampil sebenarnya.
- `build.txt`: hasil build.
- `full-suite.txt`: hasil seluruh suite Playwright tanpa perubahan test.

Pemeriksaan visual langsung atas tiga keluaran generator dan screenshot: cakram, pita, serta kubah dengan orbit bola terbaca sebagai satu keluarga still life; tidak ada teks, logo, wajah, hewan, kemasan, tiruan UI, atau grafik data. Metafora bentuk adalah dekorasi, jumlah objek bukan data CV. Gambar tetap terpisah jelas dari latar tema terang/gelap dan cocok dengan foto dokumentasi asli. Cover dapat dibaca pada kartu desktop sekitar 420 px dan kartu mobile yang lebih kecil.

Prompt persis dan jalur final: `docs/asset-provenance.md`, bagian IMG-1. Generator bawaan menghasilkan 1448×1086 (4:3); sharp menormalkan ke 1200×900 tanpa crop, lalu WebP kualitas 82. Verifikasi membandingkan byte WebP dengan hasil pipeline yang diulang dari PNG sumber.

Browser Arch: pemeriksaan `arch-playwright-provision --check` menemukan nol library hilang pada bundle WPE/GTK revisi 2336 dan 2359. Launch headless nyata dengan Playwright project: Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6. Tidak ada instalasi/tambalan baru.

Batas bukti: tidak ada audit Lighthouse/CLS ulang pada tiket gambar ini; dimensi intrinsik dan rasio tetap. Tidak ada perubahan token warna, CSS, data, caption, JSX, atau test. Kontras teks mengikuti implementasi sebelumnya. Sumber PNG merupakan aset yang diminta, sehingga tetap PNG meski melebihi 500 KB; aturan konversi bukti screenshot diterapkan pada screenshot WebP.

## Hasil suite dan gerbang git

- Run pertama: `npm test` exit 1, 110 passed / 2 failed (4.2m), lihat `full-suite-first.txt`.
- Run ulang identik tanpa perubahan kode/config/test: exit 1, 111 passed / 1 failed (4.2m), lihat `full-suite.txt`.
- Kegagalan yang berulang: WebKit, `interrupted transition and live reduced motion never lock the page`, `portfolio.spec.js:392`. Setelah hash dikembalikan ke Beranda, heading masih “Pengalamanmagang saya.” saat assertion menunggu “Halo, saya”. Penyebab belum dipastikan.
- Kegagalan sampel tinggi disclosure pada run pertama tidak muncul pada run ulang. Ini belum membuktikan penyebabnya.
- Tidak commit/push: syarat suite penuh belum lolos. Gambar lengkap, tiket gambar DONE; fase keseluruhan WIP sampai verifikasi regresi dituntaskan oleh harness yang berwenang mengubah kode.
