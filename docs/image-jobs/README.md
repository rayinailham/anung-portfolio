# Tiket gambar

Folder ini adalah antrean kerja untuk harness image-gen (**Codex**).

Aturannya: harness yang membangun halaman tidak menghasilkan gambar. Ia menulis
tiket di sini, memasang fallback CSS supaya layout dan test tetap benar tanpa
berkas gambar, lalu lanjut. Sesi Codex membaca satu tiket, menghasilkan
berkasnya, mencatat provenance, lalu berhenti.

Satu tiket harus bisa dikerjakan **tanpa membaca `src/`, `plan.md`, atau
`progress.md`**. Kalau sebuah tiket butuh konteks di luar dirinya, tiket itu
belum selesai ditulis.

## Nama berkas

`IMG-<n>-<slug>.md` — contoh `IMG-1-bukti-placeholder.md`.

## Status

Baris pertama setelah judul: `Status: TODO | DONE`. Sesi Codex mengubahnya jadi
`DONE` dan menambahkan daftar berkas yang dihasilkan.

## Aturan isi gambar — berlaku untuk semua tiket

BOLEH: komposisi abstrak, bentuk geometris, still life bergaya editorial,
tekstur, bidang warna brand.

TIDAK BOLEH:
- tiruan tangkapan layar (Instagram, TikTok, Shopee, dashboard, spreadsheet)
- grafik atau angka yang terbaca sebagai data
- logo merek nyata: Unicharm, Pantene, P&G, Shopee, TikTok, AnyMind, IPB
- wajah manusia
- teks apa pun, kecuali tiket menyatakan sebaliknya secara eksplisit

Alasannya satu: gambar yang bisa disalahartikan sebagai bukti kerja adalah
kebohongan, sekalipun captionnya jujur.

## Warna brand

- bordo `#6C151E`
- hijau `#0F3D3A`
- krem `#F5DABF`
- aksen gelap `#7FB3A8`

Tipografi (kalau tiket mengizinkan teks): Manrope.

## Jalur berkas

- sumber mentah: `assets/source/placeholder/<slot-id>.png`
- aset situs: `public/images/placeholder/<slot-id>.webp`
- pengecualian OG: `public/images/og-cover.png`

Jalur ini kontrak. Halaman sudah menunjuk ke sana sebelum berkasnya ada.

## Wajib setelah menghasilkan gambar

1. Simpan di kedua jalur di atas (sumber + aset situs).
2. Tambahkan entri di `docs/asset-provenance.md`: generator, jalur sumber, jalur
   aset, tujuan, dan **prompt persis** yang dipakai.
3. Tandai tiket `Status: DONE` dan sebutkan berkas yang dihasilkan.
4. Berhenti. Jangan mengubah `src/data.js`, JSX, test, atau copy apa pun.

## Template

```markdown
# IMG-<n> — <judul singkat>

Status: TODO
Harness: Codex

## Kebutuhan

<kenapa gambar ini ada, satu paragraf>

## Berkas yang diminta

| slot-id | ukuran | rasio | jalur aset |
|---|---|---|---|
| | | | |

## Arahan visual

<gaya, komposisi, warna, suasana>

## Larangan khusus tiket ini

<selain larangan umum di README>

## Prompt yang disarankan

> <draf prompt, boleh disesuaikan sesi Codex asal larangannya dipatuhi>

## Diterima kalau

- [ ] berkas ada di kedua jalur
- [ ] tidak ada teks / logo / wajah / tiruan antarmuka
- [ ] terbaca jelas di ukuran kecil dan tetap enak di ukuran penuh
- [ ] cocok berdampingan dengan foto nyata di halaman yang sama
- [ ] provenance dicatat di `docs/asset-provenance.md`
```
