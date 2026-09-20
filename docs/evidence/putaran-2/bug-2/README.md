# BUG-2 — jendela baca intro

Tanggal: 2026-09-20. Cakupan: `src/App.jsx`; `tests/` tidak diubah.

## Perbaikan

Timeline berhenti 0,95 detik setelah kata “Halo.” dan caption mencapai posisi
final. Jeda dimulai 20 ms setelah tween teks selesai agar WebKit juga memotret
frame final sebelum pause. Timeline lalu melanjutkan exit yang sama. Safety
native dinaikkan dari 2,0 menjadi 2,4 detik, tetap lebih panjang daripada total
intro terukur. Cleanup membatalkan safety dan timer jeda, sehingga tombol
“Lewati intro” tetap langsung membuka halaman.

## Gerbang

Jalankan dari root:

```sh
npx playwright test --config docs/evidence/putaran-2/bug-2/playwright.config.js
```

Hasil akhir: **12 passed** di Chromium desktop, Chromium mobile, Firefox, dan
WebKit. Cakupan: jendela baca, total intro, reload satu sesi, skip saat jeda,
reduced motion, Lenis mati, dan nol request chunk `motion-runtime`.

Angka run final ada di [`metrics.json`](metrics.json). Jendela baca terendah
**1000,0 ms**; total intro tertinggi **2072 ms**. Safety 2400 ms memberi margin
328 ms di atas hasil terlama.

Test timing yang sama dijalankan pada snapshot bersih `a49750b`: **4 failed**.
Jendela baca lama hanya 34,0–50,4 ms. Ringkasan ada di
[`baseline.txt`](baseline.txt); hasil akhir di [`after.txt`](after.txt).

## Verifikasi lain

- Test resmi intro/routing/reduced-motion: **16 passed**, empat project.
- `npm run build`: exit 0.
- Intro tetap sekali per sesi melalui `sessionStorage`.
- Reduced motion tetap melewati intro dan tidak mengunduh chunk animasi.
