# BUG-1 — reveal tidak boleh tertinggal tersembunyi

Tanggal: 2026-09-20. Cakupan: `src/motion.js`; `tests/` tidak diubah.

## Perbaikan

`usePageMotion` sekarang berhenti sebelum membuat `gsap.context` saat halaman
belum boleh di-reveal. Deadline native 5 detik dipasang sebelum tween pertama,
dan pemeriksaan geometri dijalankan langsung setelah semua trigger tersedia.
Cleanup hanya membatalkan deadline bila scope sudah lepas dari DOM atau semua
tween reveal sudah selesai.

## Gerbang

Jalankan dari root:

```sh
npx playwright test --config docs/evidence/putaran-2/bug-1/playwright.config.js
```

Config menjalankan Chromium desktop, Chromium mobile, Firefox, dan WebKit.
Test perilaku mengunjungi empat route, menggulir ke dasar, menunggu 5,4 detik,
lalu menuntut nol elemen reveal dengan opacity di bawah 0,99. Test pendamping
memaksa tween normal berjalan dan membuktikan opacity melewati nilai antara 0
dan 1 sebelum selesai.

Snapshot bersih `a49750b` dibuat dengan `git archive` di `/tmp`, memakai salinan
dependensi lokal yang sama. Gerbang urutan lifecycle gagal **4/4** di snapshot:
guard `revealed` belum berada sebelum `gsap.context`. Keluaran ringkas ada di
[`baseline.txt`](baseline.txt). Pada pohon akhir, seluruh gerbang lolos
**12/12**; lihat [`after.txt`](after.txt).

Test perilaku 4 route bersifat perlindungan hasil. Test urutan lifecycle membuat
race lama deterministik: ia menolak kode yang baru memasang guard atau deadline
setelah GSAP sudah boleh menulis from-state.

## Verifikasi lain

- Test resmi terfokus: **24 passed**, empat project. Mencakup refresh, deadline
  native, reduced motion, fallback GSAP, dan bagian bawah halaman Pengalaman.
- `npm run build`: exit 0.
- Playwright lokal 1.63.0: Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6
  berhasil launch headless. Skrip provision global gagal sebelum install karena
  default runner Python `playwright` tidak ada di proyek Node ini; tidak ada
  `install-deps`, `sudo`, atau perubahan paket sistem.
