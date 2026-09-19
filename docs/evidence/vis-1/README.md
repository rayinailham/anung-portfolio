# VIS-1 — Poles visual dan ritme reveal

Tanggal: 2026-09-19. Build statis pada port 4175. Sumber aplikasi yang berubah:
`src/styles.css` dan nilai tiga tabel timing di `src/motion.js`.

- Ring IPK mengelilingi angka dan label; stroke tetap berujung datar agar
  panjang arc tidak tampak melebihi nilai sebenarnya.
- Timeline desktop memakai kolom label dan kisi 11 bulan yang sejajar. Pada
  mobile, label berada di atas track; kisi tetap mengikuti sumbu yang sama.
- TOEFL memakai hierarki angka/label dan penanda akhir bar. Split platform
  lebih tebal; caption kejujuran tetap terlihat. Counter memakai garis pemisah,
  angka tabular, dan tanda tambah yang lebih kecil di luar angka.
- Teks masuk lebih cepat daripada panel/media; arc menggambar dengan ritme
  berbeda dari bar. Tidak ada perubahan mekanisme animasi atau counter.

## Verifikasi

| Pemeriksaan | Bukti |
|---|---|
| `npm test`: exit 0, **136 passed (3.0m)** | [Log lengkap](full-suite.txt) |
| `npm run build`: exit 0 | [Build](build.txt) |
| Verifikasi Kirim 3: exit 0, 40 pasangan kontras lolos | [Log](verify.txt), [JSON](metrics.json) |
| Minimum kontras teks 5.806:1; grafis pada permukaan halaman 5.268:1 | `metrics.json → contrast` |
| Pasangan baru: isian TOEFL terhadap track transparan yang sudah dikomposit | Terang **6.223:1**, gelap **3.627:1**, ambang grafis 3:1; [JSON](presentation.json) |
| Arc 0.935001; TOEFL 0.7439; split sekitar 2:1 (pembulatan subpiksel); overlap 4 bulan | `metrics.json → scales`, di 1440/390/320px |
| Reduced motion: enam counter final, enam bar tanpa transform, arc tanpa override inline | `metrics.json → reducedMotion`; [pemeriksaan tambahan](presentation.txt) |
| Empat route tanpa overflow pada 1440/390/320px; angka tetap di dalam ring pada 320px, dua tema | `metrics.json → layout`, `presentation.json → narrowLayout` |
| Chromium, Firefox, WebKit berhasil launch | [Versi engine](env-check.txt) |

Tidak ada token warna teks yang berubah. Kisi dan garis pemisah adalah dekorasi;
tanggal, label, dan bar menyampaikan informasi tanpa bergantung pada kisi.
Warna pasangan baru TOEFL diukur terhadap latar track nyata, bukan hanya
terhadap warna halaman. Kontras minimum teks tetap sama dengan Kirim 3.

## Screenshot

Nama berkas identik antara [sebelum](before/) dan sesudah. Skrip Kirim 3
menghasilkan 27 gambar per kondisi: lima visual × dua lebar × dua tema,
lima reduced motion, dan dua halaman penuh. Tambahan VIS-1: empat gambar
320px serta dua crop timeline mobile dari halaman penuh. Total 60 WebP.

| Visual | Sebelum 1440 terang | Sesudah 1440 terang | Sesudah 390 gelap |
|---|---|---|---|
| IPK | [sebelum](before/ring-ipk-1440-light.webp) | [sesudah](ring-ipk-1440-light.webp) | [mobile](ring-ipk-390-dark.webp) |
| TOEFL | [sebelum](before/bar-toefl-1440-light.webp) | [sesudah](bar-toefl-1440-light.webp) | [mobile](bar-toefl-390-dark.webp) |
| Split | [sebelum](before/split-afiliasi-1440-light.webp) | [sesudah](split-afiliasi-1440-light.webp) | [mobile](split-afiliasi-390-dark.webp) |
| Timeline | [sebelum](before/timeline-karier-1440-light.webp) | [sesudah](timeline-karier-1440-light.webp) | [mobile](timeline-karier-390-dark-fullpage-crop.webp) |
| Counter | [sebelum](before/counter-pengalaman-1440-light.webp) | [sesudah](counter-pengalaman-1440-light.webp) | [mobile](counter-pengalaman-390-dark.webp) |

Reduced motion: [IPK](ring-ipk-reduced-motion.webp),
[TOEFL](bar-toefl-reduced-motion.webp), [split](split-afiliasi-reduced-motion.webp),
[timeline](timeline-karier-reduced-motion.webp), [counter](counter-pengalaman-reduced-motion.webp).

Inspeksi visual meliputi ring terang/gelap, timeline desktop/mobile,
bar TOEFL, split, dan tanda tambah counter. Screenshot locator timeline
390px dari skrip lama memotong sedikit bagian atas judul saat motion aktif.
Versi `fullpage-crop` diambil dari satu frame halaman penuh pada viewport yang
sama, tanpa mengganti CSS aplikasi; judul terlihat utuh. [Koordinat crop](mobile-capture.json).
Keluaran mentah skrip lama tetap disimpan.

## Pengulangan

Jalankan `npm run build`, lalu `npx vite preview --host 127.0.0.1 --port 4175 --strictPort`.
Dengan server berjalan:

```sh
PORTFOLIO_URL=http://127.0.0.1:4175 EVIDENCE_DIR=docs/evidence/vis-1 node scripts/verify-kirim-3.mjs
PORTFOLIO_URL=http://127.0.0.1:4175 EVIDENCE_DIR=docs/evidence/vis-1 node scripts/shoot-kirim-3.mjs
PORTFOLIO_URL=http://127.0.0.1:4175 node docs/evidence/vis-1/verify-presentation.mjs
PORTFOLIO_URL=http://127.0.0.1:4175 node docs/evidence/vis-1/capture-mobile-timeline.mjs
npm test
```

Bukti sebelum diambil dari build sebelum patch, memakai skrip yang sama dan
`EVIDENCE_DIR=docs/evidence/vis-1/before`. Jangan menimpa folder itu dengan build baru.

## Batas

Tidak ada perubahan data, copy, JSX, test, skrip project, dependensi, atau aset
publik. Tidak ada tiket gambar baru dan tidak ada perubahan provenance aset.
Lighthouse/CLS tidak diukur ulang pada tiket VIS-1; angka fase sebelumnya
tidak diklaim sebagai hasil baru. Kisi dekoratif mengikuti rentang 11 bulan
saat ini; bila rentang data berubah kelak, jumlah sel perlu mengikuti data.

Git fase memakai akun personal dan branch `fase/vis-1`. Branch tidak digabungkan
ke `main`. Fase berikutnya: Kirim 4 — Claude Code.
