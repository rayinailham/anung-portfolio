# Bukti putaran 2

## BLOK A — selesai 2026-09-20

| Item | Gerbang khusus | Hasil |
|---|---|---|
| BUG-1 | lifecycle gagal di baseline; 4 route × 4 project; reveal normal tetap hidup | baseline 4 failed; final 12 passed |
| BUG-2 | jendela baca ≥900 ms; total <2200 ms; skip; reduced motion | baseline 4 failed; final 12 passed |

Gerbang akhir dijalankan dari snapshot `git archive HEAD` di `/tmp`, dengan
salinan dependensi lokal. Snapshot tidak memuat perubahan BLOK B yang masih ada
di worktree.

```text
npm test       -> 196 passed (3.9m), exit 0
npm run build  -> Vite 8.3.0, 4579 modules transformed, exit 0
```

Peringatan build tentang `VITE_SITE_URL` placeholder memang tercatat sebagai
scope tersisa sampai domain final tersedia.

- [`bug-1/`](bug-1/) — test, baseline, hasil akhir, dan uraian lifecycle reveal.
- [`bug-2/`](bug-2/) — test, baseline, metrik timing per engine, dan hasil akhir.
