# Perbaikan 1 — dua cacat muat pertama

Dilaporkan dari pemakaian langsung di `npm run dev`, setelah putaran 2 ditutup
(`d1fca7b`). Dua keluhan, dua sebab berbeda, keduanya hanya muncul pada muat
pertama dan hilang saat halaman dikunjungi kedua kalinya.

Diukur 2026-09-20 di mesin dan sesi yang sama. Kolom "sebelum" adalah
`src/App.jsx`, `src/motion.js` dan `src/styles.css` di `d1fca7b`, dijalankan
ulang di sesi ini — bukan angka yang dikutip dari catatan.

## Cara ukur ulang

```bash
npm run dev                                                  # biarkan hidup di 5173

node docs/evidence/perbaikan-1/intro.mjs                     # posisi huruf tiap frame
ENGINE=firefox node docs/evidence/perbaikan-1/intro.mjs
for r in '#/' '#/pengalaman' '#/tentang' '#/kontak'; do
  node docs/evidence/perbaikan-1/pemulihan.mjs "$r"          # trigger dimatikan paksa
done
npx playwright test
```

Untuk kolom "sebelum": `git stash push -- src/App.jsx src/motion.js
src/styles.css`, jalankan skrip yang sama, lalu `git stash pop`.

## 1. Kata intro sempat terbaca utuh sebelum dianimasikan

Markup intro sampai lebih dulu, chunk animasi menyusul. Selama jeda itu kata
"Halo." dicat pada posisi akhirnya; begitu GSAP datang, `.from()` menarik kata
itu kembali ke bawah topengnya lalu memainkan masuknya. Yang terlihat: teks
muncul, hilang, baru masuk.

Perbaikannya memindahkan keadaan diam kata dan kapsinya ke `src/styles.css`,
sehingga frame pertama yang bisa dilihat siapa pun **adalah** frame pertama
animasi. `src/App.jsx` memakai `fromTo` — `from` akan membaca posisi parkir itu
sebagai tujuan dan kata itu tidak akan pernah sampai. `y: 0` di kedua ujung
membersihkan offset piksel yang GSAP baca dari transform CSS tadi.

`intro.mjs` mencicip posisi vertikal huruf pertama setiap frame sejak cat
pertama:

| | frame pertama | bentuk gerak (px) | tarikan mundur |
|---|---|---|---|
| sebelum, Chromium | **0** | 0 → 325 → 271 → 203 → … | **1** |
| sebelum, Firefox | **0** | 0 → 271 → 189 → 158 → … | **1** |
| sesudah, Chromium | **419** | 419 → 302 → 239 → 179 → … | **0** |
| sesudah, Firefox | **419** | 419 → 281 → 252 → 182 → … | **0** |

419px adalah tinggi satu baris kata itu di 1440px, yaitu tepat di bawah
topengnya sendiri. Angka mentahnya: [`ukuran-sebelum.txt`](ukuran-sebelum.txt)
dan [`ukuran-sesudah.txt`](ukuran-sesudah.txt).

## 2. Isi halaman hilang saat digulir pada muat pertama

Setiap reveal menyembunyikan isinya sendiri lalu menunggu satu posisi gulir
untuk mengembalikannya. Kalau trigger sekali-jalan itu meleset — ukuran yang
basi, chunk rute yang mendarat setelah tata letak diukur, refresh yang jatuh di
tengah frame gulir halus — yang hilang bukan animasinya, melainkan isinya, dan
tidak ada lagi yang tersisa untuk menyalakannya.

Saya **tidak berhasil menirukan kesalahan pengukuran itu** di harness ini:
Chromium, Firefox, dan WebKit tanpa kepala, throttle CPU 4–10×, jaringan lambat,
deep link, gulir cepat, gulir saat intro, dan tur empat halaman semuanya bersih.
Jadi yang saya perbaiki bukan tebakan tentang lomba itu, melainkan akibatnya:
sekarang posisi gulir menjadi pendapat kedua. Elemen yang sudah melewati garis
mulainya sendiri berhak atas reveal-nya, apa pun yang diyakini trigger-nya —
saat refresh berarti melompat ke frame akhir, saat gulir berarti memainkannya.
Pendengar gulir itu mencopot dirinya sendiri begitu semua reveal sudah jalan.

`[data-mask]`, `[data-arc]` dan `[data-bar]` ikut masuk daftar pemulihan. Bar
atau cincin yang tidak pernah tumbuh terbaca sebagai nilai nol, dan itu bukan
sekadar animasi yang hilang melainkan angka yang salah.

`pemulihan.mjs` mematikan setiap trigger reveal yang belum menyala, lalu
menggulir ke dasar halaman:

| Rute | Trigger dimatikan | Tersembunyi di layar, sebelum | sesudah |
|---|---|---|---|
| `#/` | 13 | **3** | **0** |
| `#/pengalaman` | 14 | **6** | **0** |
| `#/tentang` | 10 | **2** | **0** |
| `#/kontak` | 2 | **1** | **0** |

Kolom "setelah 6 detik" di berkas mentah nol di kedua sisi: jaring pengaman 5
detik yang sudah ada di `usePageMotion` memang akhirnya menyapu semuanya. Itu
cocok dengan laporan — isinya hilang beberapa detik, bukan selamanya — tetapi
lima detik halaman kosong bukan jawaban, dan jaring itu membuang animasinya
untuk semua orang sekaligus.

## Gerbang

| Gerbang | Hasil |
|---|---|
| `npx playwright test` | **208 passed**, 4 project |
| dua test baru terhadap kode lama | **8 failed / 8** di Chromium, Chromium mobile, Firefox, WebKit |
| `npm run build` | exit 0, 4579 modul, CSS 42,03 kB mentah / 11,04 kB gzip |
| dependensi | tidak ada yang ditambah |

Dua test baru itu — `the intro word is never painted finished before it
animates` dan `a reveal whose trigger is gone still arrives when it is scrolled
to` — gagal di keempat project pada `d1fca7b` dan lulus di keempatnya setelah
perbaikan. Tidak ada test lama yang diubah atau dihapus.

## Sisa jujur

- Sebab persis meleset-nya trigger di peramban pelapor belum terbukti. Yang
  terbukti adalah akibatnya bisa dihilangkan, dan itulah yang diuji.
- Pendengar gulir membaca geometri sekali per frame selama masih ada reveal yang
  menunggu, lalu berhenti sendiri. Pada halaman terpanjang daftar itu 14 elemen.
