# DEBT-2 — kartu `og:image`

Tanggal verifikasi: 2026-09-20.

## Gerbang build dan pengiriman

```text
npm run build
✓ 4579 modules transformed.
dist/index.html  4.54 kB | gzip: 1.60 kB
✓ built in 278ms

assets/source/og-cover.png  png 1200 630
public/images/og-cover.png  png 1200 630
dist/images/og-cover.png    png 1200 630
```

Ketiga berkas memiliki SHA-256 yang sama:

```text
defdd0afc414906a1719e59f5172e7496d418a2b14aefd96018f4685bb5c2f4e
```

`dist/index.html` menunjuk ke `https://anung-ramadhan.example/images/og-cover.png` untuk `og:image` dan `twitter:image`; dimensi metadata 1200 × 630 dan tipe `image/png`. Host itu tetap placeholder sampai `VITE_SITE_URL` diisi saat deploy.

`node docs/evidence/kirim-img-2/verify-delivery.mjs` membuktikan HTTP 200 `image/png`, 350196 byte, hash cocok, tiga engine dapat diluncurkan, dan regenerasi di folder bersih byte-identik. `python docs/evidence/kirim-img-2/audit.py` memindai 15 berkas dengan 0 temuan serta menolak 5 umpan negatif.

Kontras kartu: bordo `#6C151E` / krem `#F5DABF` = 8,881:1; hijau `#0F3D3A` / krem `#F5DABF` = 8,956:1. Keduanya lolos WCAG AA. Metrik, skrip reproduksi, preview 320 px, dan provenance lengkap ada di [`docs/evidence/kirim-img-2/`](../../kirim-img-2/).

Gerbang suite penuh untuk tree yang sama tercatat di [`DEBT-1`](../debt-1/README.md): 196 passed dalam 3,8 menit, tanpa perubahan `tests/`.

## Sisa yang memang menunggu domain

LinkedIn Post Inspector dan pratinjau WhatsApp nyata memerlukan domain hidup serta deploy. Keduanya belum diklaim selesai.
