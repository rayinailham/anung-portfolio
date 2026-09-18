# IMG-1 — Cover placeholder galeri bukti

Status: TODO
Harness: Codex

## Kebutuhan

Halaman Pengalaman punya galeri bukti yang digerakkan data. Tiga slot di entri
"PT Sutan Vet Medika — Digital Marketing Intern" mengacu pada materi yang nyata
dibuat (konten Instagram, video produk dan profil perusahaan, webinar B2B),
tetapi materi aslinya belum boleh atau belum bisa dipublikasikan. Slot-slot itu
tetap tayang dengan caption jujur yang menyatakan gambarnya ilustrasi
sementara. Yang ada sekarang di kedua jalur adalah blok geometris datar yang
dihasilkan dari token warna brand lewat `scripts/prepare-assets.mjs` — cukup
untuk menjaga layout dan test, tapi mentah secara visual. Tiket ini
menggantinya dengan tiga cover bergaya editorial yang enak dipandang
berdampingan dengan satu foto acara asli di halaman yang sama.

Ketiganya harus **jelas bukan tangkapan layar**. Gambar yang bisa
disalahartikan sebagai bukti kerja adalah kebohongan, sekalipun captionnya
jujur.

## Berkas yang diminta

| slot-id | ukuran | rasio | jalur aset |
|---|---|---|---|
| `konten-sosial` | 1200 × 900 | 4:3 | `public/images/placeholder/konten-sosial.webp` |
| `video-produk` | 1200 × 900 | 4:3 | `public/images/placeholder/video-produk.webp` |
| `webinar-b2b` | 1200 × 900 | 4:3 | `public/images/placeholder/webinar-b2b.webp` |

Sumber mentah masing-masing: `assets/source/placeholder/<slot-id>.png`
(1200 × 900, PNG).

Rasio 4:3 itu kontrak — CSS memakai `aspect-ratio: 4 / 3` dan atribut
`width="1200" height="900"` sudah tertulis di `src/data.js`. Ukuran lain akan
merusak CLS.

Cara menghasilkan `.webp` dari `.png` di repo ini (sharp sudah terpasang):

```
node -e "import('sharp').then(({default:s})=>s('assets/source/placeholder/<slot-id>.png').resize({width:1200}).webp({quality:82}).toFile('public/images/placeholder/<slot-id>.webp'))"
```

Atau, kalau ketiga PNG sumber sudah diganti, cukup jalankan
`node scripts/prepare-assets.mjs` — skrip itu mengonversi ketiganya sekaligus.

## Arahan visual

Satu keluarga visual untuk ketiganya: terlihat sebagai satu set, bukan tiga
gambar yang tidak berhubungan. Tampil berdampingan dalam satu baris selebar
kartu, jadi harus terbaca pada lebar ±420 px dan tetap enak pada lebar penuh.

- Palet: bordo `#6C151E`, hijau `#0F3D3A`, krem `#F5DABF`, aksen gelap
  `#7FB3A8`. Boleh mendominasi berbeda per slot asal ketiganya sekeluarga.
- Gaya: still life bergaya editorial atau komposisi geometris/tekstur. Cahaya
  samping lembut, bayangan meyakinkan, kesan mewah yang tertahan — sama dengan
  arah `public/images/connections.webp` yang sudah ada di situs.
- Setiap slot punya metafora abstrak, bukan ilustrasi harfiah:
  - `konten-sosial` — pengulangan dan irama. Beberapa bentuk sejenis tersusun
    berirama. JANGAN berupa kisi 3×3 atau kartu bertumpuk yang menyerupai feed.
  - `video-produk` — gerak dan urutan. Satu bentuk yang bergeser atau
    memanjang. JANGAN segitiga "play", JANGAN bingkai layar, JANGAN garis waktu.
  - `webinar-b2b` — banyak orang mengarah ke satu titik. Riak sepusat atau
    bentuk-bentuk kecil yang mengorbit satu bentuk besar. JANGAN kepala/siluet
    manusia, JANGAN kisi kotak peserta.
- Ruang napas murah hati di sekitar subjek; komposisi tetap tenang saat
  dipotong sedikit.
- Terang dan gelap: situs punya dua tema, tapi gambarnya sama di keduanya.
  Hindari latar yang nyaris identik dengan `#F5DABF` (tema terang) atau
  `#102E2B` (tema gelap) supaya kartunya tidak lenyap.

## Larangan khusus tiket ini

Selain larangan umum di `README.md`:

- Tanpa segitiga play, tombol, bilah kemajuan, bingkai jendela, kisi peserta,
  gelembung chat, ikon hati/komentar/share, atau apa pun yang membentuk
  antarmuka.
- Tanpa kotak bertuliskan apa pun, termasuk teks palsu atau aksara acak.
- Tanpa hewan peliharaan dan tanpa kemasan produk. Kliennya merek suplemen
  hewan; gambar produk atau anjing/kucing akan terbaca sebagai materi kampanye
  asli.
- Tanpa grafik, panah tren, angka, atau apa pun yang terbaca sebagai data.

## Prompt yang disarankan

Boleh disesuaikan sesi Codex asal larangan di atas dipatuhi. Catat prompt yang
**benar-benar dipakai** di `docs/asset-provenance.md`, bukan draf ini.

> `konten-sosial` — Use case: stylized-concept. Asset type: abstract editorial
> placeholder cover for a personal marketing portfolio, explicitly NOT a
> screenshot and NOT real client work. Primary request: a sculptural still life
> of five identical smooth matte discs of graduated size arranged in a calm
> rhythmic arc, deep burgundy #6C151E and forest green #0F3D3A, resting on a
> warm cream #F5DABF studio floor. Materials: matte lacquer with subtle surface
> grain. Close-up editorial photography of a physical object, art directed,
> soft cinematic side light, convincing shadows, restrained luxury. Composition:
> landscape 4:3, subject centred, generous breathing room. No text, no logos, no
> people, no screens, no user interface, no grids, no icons, no watermark.

> `video-produk` — Use case: stylized-concept. Asset type: abstract editorial
> placeholder cover, explicitly NOT a screenshot and NOT real client work.
> Primary request: a sculptural still life of one smooth matte bar caught
> mid-stretch, elongating from a compact block into a long sweeping ribbon,
> forest green #0F3D3A over a warm cream #F5DABF studio floor with a single deep
> burgundy #6C151E sphere at rest beside it. Materials: matte lacquer, subtle
> grain. Close-up editorial photography of a physical object, art directed, soft
> cinematic side light, convincing shadows, restrained luxury. Composition:
> landscape 4:3, generous breathing room. No text, no logos, no people, no play
> buttons, no screens, no frames, no timelines, no user interface, no watermark.

> `webinar-b2b` — Use case: stylized-concept. Asset type: abstract editorial
> placeholder cover, explicitly NOT a screenshot and NOT real client work.
> Primary request: a sculptural still life of many small smooth matte spheres in
> warm cream #F5DABF orbiting one larger forest green #0F3D3A dome, set on a
> deep burgundy #6C151E studio floor, arranged as concentric rings converging on
> the dome. Materials: matte lacquer, subtle grain. Close-up editorial
> photography of a physical object, art directed, soft cinematic side light,
> convincing shadows, restrained luxury. Composition: landscape 4:3, generous
> breathing room. No text, no logos, no people, no faces, no silhouettes, no
> screens, no participant grids, no user interface, no watermark.

## Diterima kalau

- [ ] berkas ada di kedua jalur, untuk ketiga slot
- [ ] setiap `.webp` berukuran tepat 1200 × 900
- [ ] tidak ada teks / logo / wajah / tiruan antarmuka / grafik data
- [ ] terbaca jelas pada lebar ±420 px dan tetap enak pada ukuran penuh
- [ ] ketiganya terbaca sebagai satu keluarga visual
- [ ] cocok berdampingan dengan foto acara asli di halaman yang sama
- [ ] tetap terbaca di tema terang (`#F5DABF`) dan gelap (`#102E2B`)
- [ ] provenance tiap berkas dicatat di `docs/asset-provenance.md` lengkap
      dengan prompt persis yang dipakai

## Yang TIDAK boleh disentuh sesi ini

`src/data.js`, `src/App.jsx`, `src/styles.css`, `tests/`, caption, atau angka
apa pun. Slot, caption, `data-placeholder="true"`, dan atribut `width`/`height`
sudah terpasang dan sudah diuji. Tiket ini hanya mengganti isi berkas gambar.

Caption tetap menyatakan gambarnya ilustrasi sementara. Cover hasil tiket ini
tetap placeholder — `placeholder: true` di `src/data.js` TIDAK boleh dihapus.
Flag itu hanya hilang kalau materi asli dari Anung yang masuk.
