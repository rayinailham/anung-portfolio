# Bukti IMG-2 — kartu berbagi

Kartu memakai foto asli Anung dan Manrope lokal, tanpa model gambar. Nama dan peran persis tiket; nama dibungkus dua baris. Crop mengecualikan logo di dinding. Pemeriksaan visual ukuran penuh dan [320 px](preview-320.png): nama terbaca, wajah utuh, tanpa angka, logo, atau tiruan UI.

- Aset: [PNG situs](../../../public/images/og-cover.png) dan [sumber](../../../assets/source/og-cover.png), identik.
- Ukuran: PNG 1200 × 630, **350196 byte**, batas tiket kurang dari 1 MB.
- Kontras teks terendah **8.881:1**, melampaui 4.5:1.
- [metrics.json](metrics.json): bounding box teks dengan margin minimal 60 px, crop dan posisi potret, hash sumber/aset, font dimuat, perbandingan piksel potret terhadap crop asli.
- [delivery.json](delivery.json): hasil build tersaji HTTP 200 sebagai `image/png`, hash cocok, metadata OG/Twitter sesuai; regenerasi aset di folder bersih identik. Dependensi lokal dipakai ulang, bukan simulasi instalasi baru.
- [browser-libs.txt](browser-libs.txt): pustaka WebKit lengkap. Versi dan bukti launch tiga engine di `delivery.json`.
- [build.txt](build.txt): build pada sesi pembuatan aset lolos. Peringatan domain placeholder memang masih berlaku.
- [full-suite.txt](full-suite.txt): bukti historis saat aset dibuat, **164 passed (3.3m)**. Gerbang port ke `main` diuji ulang dan menghasilkan **196 passed (3.8m)** di [`putaran-2/debt-1`](../putaran-2/debt-1/README.md); `tests/` tetap tidak berubah.
- [audit.txt](audit.txt): pemeriksaan berkas fase, kredensial, ukuran, path mesin, angka dan uji negatif. Tidak mengklaim audit seluruh riwayat repo.

Reproduksi dari root project:

```sh
node docs/evidence/kirim-img-2/compose-card.mjs
npm run build
node docs/evidence/kirim-img-2/verify-delivery.mjs
npm test
python docs/evidence/kirim-img-2/audit.py
```

Komposisi persis dan brief tersimpan di [provenance](../../asset-provenance.md#img-2--composition-and-source-record). Instruksi sesi meminta pembaruan `progress.md`, sehingga pembaruan itu dilakukan meskipun tiket lama melarangnya. Berkas aplikasi, test, pipeline dan konfigurasi tidak diubah.

Batas bukti: LinkedIn Post Inspector dan pratinjau WhatsApp nyata menunggu domain serta deploy. Screenshot kecil adalah pemeriksaan keterbacaan kartu, bukan bukti pratinjau pada kedua platform. Tidak menjalankan Lighthouse pada fase aset ini.
