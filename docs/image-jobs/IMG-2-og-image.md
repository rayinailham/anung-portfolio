# IMG-2 — Gambar OG 1200×630

Status: TODO
Harness: Codex

## Kebutuhan

Portofolio ini akan dibagikan di dua tempat: LinkedIn dan WhatsApp. Keduanya
membangun kartu pratinjau dari tag `og:` di dokumen, bukan dari halaman yang
sudah dirender. Tag-nya sudah terpasang dan sudah diuji
(`share metadata is complete in the served document and shares one origin` di
`tests/portfolio.spec.js`), dan menunjuk ke `/images/og-cover.png` dengan ukuran
yang sudah dideklarasikan 1200 × 630. Berkasnya belum ada. Selama belum ada,
kartu share tampil kosong — persis masalah yang mau dihilangkan.

Tiket ini mengisi satu berkas itu.

**Ini satu-satunya gambar di project ini yang BOLEH memuat teks**, karena
teksnya adalah nama dan peran orang yang bersangkutan, bukan data hasil kerja.
Larangan umum lain di `README.md` tetap berlaku sepenuhnya.

## Berkas yang diminta

| slot-id | ukuran | rasio | jalur aset |
|---|---|---|---|
| `og-cover` | 1200 × 630 | 40:21 | `public/images/og-cover.png` |

Sumber mentah: `assets/source/og-cover.png` (1200 × 630, PNG).

Format PNG itu kontrak: `src/site.js` mendeklarasikan
`og:image:type = image/png` dan `og:image:width/height = 1200/630`. WebP atau
ukuran lain akan membuat deklarasinya bohong. Ukuran berkas jangan lewat 1 MB
(WhatsApp memotong pratinjau yang terlalu berat; 300 KB sudah lebih dari cukup).

## Wajah di gambar ini

Larangan "tanpa wajah manusia" di `README.md` ada supaya tidak ada wajah yang
**dihasilkan mesin**. Kartu ini justru memerlukan wajah Anung yang asli, jadi:

- Pakai foto asli yang sudah ada di repo: `anung_profile.jpeg` (root) atau
  turunannya `public/images/anung-profile.webp`.
- Komposisikan — potong, skala, taruh di atas bidang warna. Sharp sudah
  terpasang di repo dan cukup untuk ini.
- **Jangan menghasilkan wajah, jangan mengubah wajah, jangan menukar wajah,
  jangan "mempercantik" wajah.** Wajah di kartu ini harus tetap foto Anung apa
  adanya. Latar belakang, bidang warna, dan tipografi boleh dibuat dari nol.

## Isi teks — persis, jangan diubah

```
Anung Hanindhita Ramadhan
Afiliasi & Pemasaran Digital
Lulusan Bisnis, IPB University
```

Baris ketiga opsional kalau komposisinya jadi sesak. Dua baris pertama wajib.
Tidak ada angka, tidak ada klaim hasil kerja, tidak ada nama merek
(Unicharm, Pantene, Shopee, TikTok, AnyMind), tidak ada logo IPB. Kata "IPB
University" di baris ketiga adalah teks biasa, bukan logo.

## Arahan visual

- Palet: bordo `#6C151E`, hijau `#0F3D3A`, krem `#F5DABF`, aksen gelap
  `#7FB3A8`. Satu keluarga dengan situsnya.
- Tipografi: Manrope. Berkas variabelnya ada di
  `node_modules/@fontsource-variable/manrope/files/` kalau butuh dirender lokal.
  Nama tampil tebal dan besar; peran lebih kecil di bawahnya.
- Komposisi: potret di satu sisi, teks di sisi lain. Kartu share LinkedIn dan
  WhatsApp sering dipotong sedikit di tepi — jaga jarak aman minimal 60 px dari
  keempat sisi untuk semua teks dan untuk wajah.
- Terbaca kecil. Kartu ini sering tampil selebar ±320 px di daftar chat
  WhatsApp. Nama harus tetap terbaca di ukuran itu.
- Tenang dan editorial, sama dengan nada situsnya. Bukan spanduk iklan.

## Kontras

Teks di atas bidang warnanya wajib lolos 4.5:1. Pasangan yang sudah aman di
project ini: krem `#F5DABF` di atas bordo `#6C151E`, atau bordo `#6C151E` di
atas krem `#F5DABF`. Kalau memakai pasangan lain, hitung dulu.

## Larangan khusus tiket ini

Selain larangan umum di `README.md`, kecuali yang dikecualikan di atas:

- Tanpa angka, grafik, panah tren, atau apa pun yang terbaca sebagai hasil kerja.
- Tanpa logo merek nyata dan tanpa logo IPB.
- Tanpa tiruan antarmuka: tanpa bingkai jendela, tanpa kartu profil LinkedIn
  palsu, tanpa tombol.
- Tanpa wajah selain wajah Anung dari foto asli, dan wajah itu tidak boleh
  diubah oleh model apa pun.
- Tanpa klaim jabatan yang tidak ada di CV. Perannya "Afiliasi & Pemasaran
  Digital", bukan "Specialist", bukan "Expert", bukan "Manager".

## Cara menyimpan

Simpan di kedua jalur. Dari sumber ke aset, kalau perlu dikecilkan:

```
node -e "import('sharp').then(({default:s})=>s('assets/source/og-cover.png').resize(1200,630,{fit:'cover'}).png({compressionLevel:9}).toFile('public/images/og-cover.png'))"
```

## Cara mengecek hasilnya

```
node -e "import('sharp').then(({default:s})=>s('public/images/og-cover.png').metadata().then(m=>console.log(m.format,m.width,m.height)))"
```

Harus mencetak `png 1200 630`.

Validasi LinkedIn Post Inspector dan pratinjau WhatsApp nyata baru bisa
dilakukan setelah situsnya punya domain (`VITE_SITE_URL`) dan sudah di-deploy.
Itu bukan bagian tiket ini; catat saja di `progress.md` bahwa uji itu menunggu
domain.

## Diterima kalau

- [ ] berkas ada di `assets/source/og-cover.png` dan `public/images/og-cover.png`
- [ ] `public/images/og-cover.png` berformat PNG, tepat 1200 × 630, di bawah 1 MB
- [ ] wajah di kartu adalah foto asli Anung, tidak dihasilkan dan tidak diubah
- [ ] teksnya persis dua (atau tiga) baris di atas, tanpa tambahan
- [ ] nama masih terbaca saat kartu ditampilkan selebar ±320 px
- [ ] kontras teks terhadap latarnya ≥ 4.5:1
- [ ] tidak ada angka, logo merek, atau tiruan antarmuka
- [ ] provenance dicatat di `docs/asset-provenance.md` lengkap dengan prompt dan
      langkah komposisi yang benar-benar dipakai

## Yang TIDAK boleh disentuh sesi ini

`src/`, `index.html`, `vite.config.js`, `tests/`, `scripts/`, `progress.md`, dan
angka atau copy apa pun. Tag `og:` sudah benar dan sudah diuji; tiket ini hanya
menambahkan berkas gambarnya.
