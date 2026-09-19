# Bukti Kirim 3 — Kerangka visualisasi data + timeline

Semua angka di bawah berasal dari berkas di folder ini, bukan dari pengamatan mata.

- `metrics.json` — keluaran `node scripts/verify-kirim-3.mjs` pada build statis
  (`npx vite preview --host 127.0.0.1 --port 4173`). Berisi kontras, skala, dan
  nilai reduced motion.
- `verify.txt` — ringkasan keluaran skrip itu, `exit=0`.
- `full-suite.txt` — `npm test`, `exit=0`, **136 passed (3.0m)**.
- `build.txt` — `npm run build`, exit 0.
- `bundle.txt` — ukuran mentah + gzip setiap artefak build.
- Screenshot: 5 visual × {1440, 390} × {terang, gelap} + 5 versi reduced motion
  + halaman penuh `pengalaman`/`tentang` dengan reduced motion.

## Skala yang diklaim jujur, dan angkanya

| Visual | Yang dikunci | Terukur |
|---|---|---|
| Ring IPK | arc = 3.74 / 4.00 | `drawnFraction: 0.935001` di 1440, 390, dan 320 |
| Bar TOEFL | skala penuh ITP 310–677, bar mulai dari lantai skala | `measuredFraction 0.7439` = `expectedFraction 0.7439`; `startsAtScaleFloorPx: 0` |
| Split afiliasi | 150 = 100 + 50, bukan 150 orang unik | `ratio: 2`, dua segmen menutup seluruh track (selisih 0 px), caption memuat "penjumlahan dua platform, bukan hitungan orang unik" |
| Timeline | Jan–Apr 2026 dua magang bersamaan | `sharedMonths: 4` di ketiga lebar; bar AnyMind bulan 4→8, Sutan Vet koordinasi 4→11, baris "Dua magang bersamaan" 4→8 |
| Counter Pengalaman | teks akhir = angka CV | 6 counter, `shown === declared` semuanya; "+" berada di luar elemen counter (`parent: "30+"`, `declared: "30"`) |

Sumbu 310–677 adalah rentang skor total TOEFL ITP milik tesnya sendiri, bukan
klaim tentang Anung. Label "Professional Working Proficiency" dikutip apa adanya
dari baris Bahasa di CV dan ditulis di halaman sebagai kutipan CV.

## Kontras — 20 pasangan × 2 tema = 40 pemeriksaan

Semua lolos. Ambang: teks 4.5:1, objek grafis 3:1 (WCAG 1.4.11).

- Terendah keseluruhan: **5.268:1** — arc IPK (`#7fb3a8`) di atas `--paper-soft`
  gelap (`#163a36`), objek grafis, ambangnya 3:1.
- Terendah untuk teks: **5.806:1** — `--muted` di atas `--paper` terang. Ini
  angka lantai yang sudah tercatat sejak audit (5.81:1); tidak ada pasangan baru
  yang lebih rendah darinya.
- Label "Dua magang bersamaan" (`--green`): 8.956:1 terang, 6.159:1 gelap.

Angka lengkap tiap pasangan ada di `metrics.json` → `contrast`.

## Reduced motion

`metrics.json` → `reducedMotion`, diambil dengan `reducedMotion: 'reduce'` dan
jeda 1,2 detik setelah halaman siap:

- 6 counter: `shown === declared` semuanya.
- 6 bar (`[data-bar]`): `transform: "none"`, tanpa inline transform dari GSAP.
- Arc IPK: atribut `stroke-dashoffset = 21.237`, computed sama, `inline: null` —
  nilai akhir datang dari atribut SVG, bukan dari tween.
- Bar TOEFL: lebar inline `74.39%` utuh, `transform: none`.

## Lebar

`metrics.json` → `layout`: keempat route tidak meluber horizontal di 320, 390,
dan 1440.

## Yang tidak diukur di fase ini

- Lighthouse dan LCP: milik P2-22 di Kirim 5. Angka baseline belum disentuh.
- Rasa visual (kurva, gradien, spacing, tipografi): milik VIS-1, tiketnya di
  `docs/visual-jobs/VIS-1-visualisasi-data.md`.
- Tidak ada aset gambar baru, jadi `docs/asset-provenance.md` tidak berubah.
