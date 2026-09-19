# Tiket rasa visual

Folder ini adalah antrean kerja untuk harness front-end (**Codex**), pasangan
dari `docs/image-jobs/`. Kalau `image-jobs/` menghasilkan berkas gambar, folder
ini menghasilkan **rupa**: bentuk SVG, kurva dan durasi animasi, ritme reveal,
spacing, tipografi, radius, bayangan, dan layering warna dalam token yang ada.

Aturannya sama dengan tiket gambar. Harness yang membangun halaman tidak
memoles rasanya. Ia memasang kerangka yang sudah benar tapi sengaja polos —
markup final, angka jujur, teks alternatif, nilai akhir reduced-motion, dan test
yang mengunci semuanya — lalu menulis tiket di sini dan lanjut. Sesi Codex
membaca satu tiket, mengerjakan rasanya di branch `fase/<id>`, lalu berhenti.

Satu tiket harus bisa dikerjakan **tanpa membaca `plan.md` atau `progress.md`**,
dan tanpa membaca `src/` selain berkas yang disebut tiket itu sendiri. Kalau
sebuah tiket butuh konteks di luar dirinya, tiket itu belum selesai ditulis.

## Nama berkas

`VIS-<n>-<slug>.md` — contoh `VIS-1-visualisasi-data.md`.

## Status

Baris pertama setelah judul: `Status: TODO | DONE`. Sesi Codex mengubahnya jadi
`DONE` dan menambahkan ringkasan apa yang berubah.

## Kenapa dipisah begini

Sifat kegagalannya berbeda. Kerangka yang salah menghasilkan angka bohong atau
halaman rusak, dan itu harus ditangkap test di `main`. Rasa yang meleset cuma
jelek, dan dibuang dengan menghapus branch. Karena itu tiket rasa selalu
mendarat di branch, tidak pernah langsung ke `main`.

## Pagar yang berlaku untuk semua tiket

Ini bukan hiasan. Semuanya sudah dikunci test atau dijanjikan ke pembaca situs.

- **Angka tidak boleh berubah.** Tidak nilainya, tidak skalanya, tidak
  urutannya. Bar tidak pernah mulai dari angka bukan-nol. Penjumlahan tetap
  terbaca sebagai penjumlahan.
- **`prefers-reduced-motion: reduce`** → setiap nilai animasi tampil final,
  tanpa animasi. Sudah ada di suite; jangan sampai rusak.
- **Kontras AA** terang dan gelap. Tiap pasangan warna yang berubah wajib
  dihitung ulang dan angkanya dilampirkan. Terendah yang tercatat sekarang
  5.81:1.
- **Teks alternatif tetap utuh.** Angka harus tetap terbaca screen reader, tidak
  boleh terkunci di dalam grafis.
- **CLS ≤ 0.01.** Apa pun yang mengubah tinggi elemen wajib punya ukuran.
- **390px tetap masuk akal.** Breakpoint yang ada: 1100 / 767 / 370.
- **`npm test` lolos tanpa mengubah test.** Gagal → berhenti dan lapor. Menaikkan
  timeout, melonggarkan assertion, atau menambah `test.skip` dihitung sebagai
  gagal.
- **Tanpa dependensi baru.** Tidak ada pustaka chart, tidak ada pustaka animasi
  tambahan. Bundle sedang dikejar Kirim 5.

Temuan di luar tiket ditulis sebagai catatan di bagian "Catatan balik", bukan
dikerjakan.

## Warna brand

- bordo `#6C151E`
- hijau `#0F3D3A`
- krem `#F5DABF`
- aksen gelap `#7FB3A8`

Tipografi: Manrope.

## Wajib setelah mengerjakan tiket

1. Tandai tiket `Status: DONE` dan sebutkan apa yang berubah.
2. Lampirkan angka kontras tiap pasangan warna yang berubah.
3. Simpan bukti di `docs/evidence/<id>/`: screenshot terang/gelap ×
   1440px/390px, screenshot reduced motion, hasil `npm test`.
4. Commit ke branch `fase/<id>`. Jangan merge, jangan buka PR.
5. Berhenti.

## Template

```markdown
# VIS-<n> — <judul singkat>

Status: TODO
Harness: Codex
Branch: fase/<id>

## Apa yang sudah ada

<kerangka polos yang dibangun harness sebelumnya, satu paragraf: elemen apa,
di halaman mana, kelihatannya sekarang bagaimana>

## Berkas yang boleh disentuh

| berkas | yang boleh diubah |
|---|---|
| `src/styles.css` | |
| `src/motion.js` | hanya nilai easing/durasi estetis |
| | |

Selain yang tercantum di tabel ini: tidak boleh.

## Kait yang tersedia

<kelas CSS, atribut data, dan nama animasi yang sudah dipasang supaya rasa bisa
diubah tanpa menyentuh logika>

## Arahan rasa

<suasana yang dituju, referensi, apa yang harus terasa berbeda sesudahnya>

## Haram berubah

<angka, skala, label, teks alternatif, urutan — sebutkan eksplisit,
jangan andalkan pembaca menebak dari README>

## Diterima kalau

- [ ] `npm test` lolos tanpa mengubah test
- [ ] kontras AA terang dan gelap, angkanya dilampirkan
- [ ] reduced motion menampilkan nilai akhir
- [ ] tetap masuk akal di 390px
- [ ] tidak ada angka, skala, atau label yang berubah
- [ ] tidak ada dependensi baru
- [ ] bukti tersimpan di `docs/evidence/<id>/`

## Catatan balik

<temuan di luar tiket — untuk Claude Code, bukan untuk dikerjakan di sini>
```
