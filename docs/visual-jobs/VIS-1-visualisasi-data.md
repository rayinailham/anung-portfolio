# VIS-1 — Rasa visual untuk lima visualisasi data dan timeline karier

Status: WIP — implementasi rupa selesai, gerbang suite Firefox belum lolos
Harness: Codex
Branch: fase/vis-1

## Apa yang sudah ada

Halaman **Tentang** (`#/tentang`) sekarang punya dua visual: sebuah ring SVG
yang menggambar IPK 3.74 dari 4.00 di dalam `.education-card`, dan sebuah bar
skor TOEFL di bawah baris bahasa pada `.skills-section`. Halaman **Pengalaman**
(`#/pengalaman`) punya tiga: timeline karier horizontal tepat di bawah judul
halaman, sebuah stacked bar 100 Shopee + 50 TikTok di dalam kartu pengalaman
"Marketing Intern (Coordination Role)", dan lima angka besar di
`.experience-stats` yang kini menghitung naik saat masuk viewport. Semuanya
sengaja dibuat polos: persegi panjang datar bertepi 1px, satu warna isi per bar,
tanpa radius, tanpa bayangan, tanpa gradien, tanpa kurva khusus. Bentuknya sudah
benar dan terbaca; rupanya belum digarap sama sekali. Itu tugas tiket ini.

Dua tema aktif: terang (kertas krem) dan gelap (hijau tua). Tombol tema ada di
kanan atas. Semua visual harus tetap bagus di keduanya.

## Berkas yang boleh disentuh

| berkas | yang boleh diubah |
|---|---|
| `src/styles.css` | seluruh aturan rupa: warna dari token, radius, tebal garis, spacing, ukuran dan berat tipografi, layering, breakpoint yang sudah ada (1100 / 767 / 370) |
| `src/motion.js` | hanya nilai di dalam `REVEAL_TIMING`, `REVEAL_GROUP_TIMING`, dan `VIZ_TIMING` — yaitu `duration`, `ease`, `stagger`. Tidak ada baris lain di berkas ini |
| `src/App.jsx` | hanya atribut presentasi SVG pada `GpaRing`: `viewBox`, `r`, `cx`, `cy`, `width`, `height`, `stroke-linecap`, dan penambahan `<circle>`/`<path>` dekoratif ber-`aria-hidden` |

Selain yang tercantum di tabel ini: tidak boleh. Khususnya `src/data.js`,
`tests/`, `scripts/`, konfigurasi build, dan seluruh logika `src/App.jsx`
(routing, form, state, efek, perhitungan angka) bukan milik tiket ini.

Kalau `GpaRing` diubah, `strokeDasharray` dan `strokeDashoffset` tetap dihitung
dari `radius` seperti sekarang. Keduanya adalah nilai akhir yang jujur; menulis
angka tetap di situ akan memalsukan IPK.

## Kait yang tersedia

Kelas dan atribut ini sudah dipasang supaya rupa bisa diubah tanpa menyentuh
logika sama sekali.

**Ring IPK** — `.gpa[data-viz="ring"]`
- `.gpa-ring` (svg), `.gpa-ring-track` (lingkaran latar), `.gpa-ring-value`
  (arc yang menggambar), `.gpa-figure` (angka 3.74/4.00 dan label "IPK")
- `[data-arc]` pada arc: dianimasikan `VIZ_TIMING.arc`

**Bar TOEFL** — `.score-scale[data-viz="scale"]`
- `.score-scale-head`, `.score-scale-label`, `.score-scale-level`,
  `.score-scale-track`, `.score-scale-fill`, `.score-scale-axis`
- `[data-bar-fill]` pada isian: dianimasikan `VIZ_TIMING.bar`

**Split afiliasi** — `.split-bar[data-viz="split"]`
- `.split-track`, `.split-segment[data-segment="shopee"]`,
  `.split-segment[data-segment="tiktok"]`, `.split-legend`, `.split-key`
- `[data-bar]` pada tiap segmen

**Timeline** — `.timeline-section`, `.timeline[data-viz="timeline"]`
- `.timeline-row`, `.timeline-row[data-entry="anymind"]`,
  `[data-entry="anima-coordination"]`, `[data-entry="anima-digital"]`,
  `.timeline-overlap` (baris "Dua magang bersamaan"), `.timeline-label`,
  `.timeline-period`, `.timeline-track`, `.timeline-bar`, `.timeline-axis`,
  `.timeline-lead`, `.timeline-note`
- Posisi tiap bar datang dari dua custom property inline: `--from` (offset,
  0–1) dan `--span` (lebar, 0–1), dipakai sebagai `calc(var(--from) * 100%)`.
  Kedua nilai itu dihitung dari tanggal di `src/data.js`. **Jangan** menimpanya
  di CSS; ubah hanya rupa kotaknya.
- `[data-bar]` pada tiap bar

**Counter** — `[data-count]` pada `.experience-stats`, `+` hidup di
`.stat-unit` yang bersebelahan. Durasi hitungnya ada di `src/motion.js` baris
`data-count` (biarkan, atau sesuaikan bersama `VIZ_TIMING` kalau perlu ritme
yang sama).

**Kosakata reveal** — setiap elemen yang muncul saat scroll kini membawa
`data-reveal-kind` dengan salah satu nilai: `heading`, `text`, `stat`, `media`,
`panel`, `viz`. `REVEAL_TIMING` dan `REVEAL_GROUP_TIMING` di `src/motion.js`
punya satu baris per nilai itu, dan saat ini **keenam barisnya sengaja diisi
angka yang sama** (0.9 / 0.85, `power3.out`, stagger 0.09). Di situlah P2-23
dikerjakan: beri kurva, durasi, dan stagger yang berbeda per jenis konten,
cukup dengan mengubah nilai di tabel itu. Tidak ada logika yang perlu disentuh.

## Arahan rasa

Nada situsnya editorial dan lugas: kertas krem, bordo, hijau, Manrope, panel
persegi, potret melengkung. Visual data sekarang terasa seperti wireframe yang
ditempel — kotak abu bertepi tipis di tengah halaman yang sudah punya karakter.
Yang dicari: visual yang terlihat seperti bagian dari halaman yang sama, bukan
tempelan dashboard.

Tiga hal yang paling terasa kalau diperbaiki:
1. **Ring IPK** masih lingkaran stroke polos di sebelah angka. Hubungan antara
   arc dan angkanya belum terbaca sebagai satu objek.
2. **Timeline** adalah empat bar datar yang berdiri sendiri tanpa penanda bulan
   di antara ujung-ujungnya. Tumpang tindihnya sudah terbaca, tapi hanya karena
   ada satu baris khusus yang menyebutkannya. Sumbu, kisi bulan, atau penanda
   vertikal akan membuat hubungannya terlihat tanpa harus dibaca.
3. **Ritme masuk**. Semua visual memakai satu kurva yang sama dengan seluruh
   halaman. Angka yang menghitung, arc yang menggambar, dan bar yang tumbuh
   layak punya waktunya sendiri.

Boleh menambah elemen SVG dekoratif ber-`aria-hidden` pada `GpaRing`, kisi dan
penanda dari pseudo-element di CSS, serta memakai token warna yang ada dengan
transparansi.

## Haram berubah

Ini bukan selera; semuanya dikunci test di `main` dan dihitung di
`docs/evidence/kirim-3/metrics.json`.

- **Arc IPK = 3.74 / 4.00.** Fraksi tergambar harus tetap `0.935001`.
- **Bar TOEFL berjalan di skala penuh 310–677 dan mulai dari 310.** Fraksi
  terisi tetap `0.7439`. Angka `310` dan `677` tetap tampil sebagai teks.
  Jangan memotong sumbu supaya 583 terlihat lebih jauh ke kanan.
- **Split tetap 100 : 50, rasio lebar tepat 2 : 1,** dan dua segmen tetap
  menutup seluruh track. Caption "100 Shopee + 50 TikTok = 150. Angka 150 di
  atas adalah penjumlahan dua platform, bukan hitungan orang unik." tetap utuh,
  tetap terlihat, tetap bukan `title` atau `alt`.
- **Timeline tetap 11 bulan, Sep 2025 sampai Jul 2026.** AnyMind bulan 4→8,
  Sutan Vet koordinasi 4→11, Sutan Vet digital 0→4, baris tumpang tindih 4→8.
  Tumpang tindih tetap 4 bulan.
- **Counter tetap 150, 40, 200, 150, 30+, 100+,** dan `+` tetap berada di luar
  elemen `[data-count]`.
- Semua teks: label, caption, `.timeline-note`, `.timeline-lead`, teks
  `.sr-only`, dan isi `aria-label`. Jangan menyembunyikan teks yang sekarang
  terlihat ke dalam `sr-only`, dan jangan sebaliknya.
- Urutan baris timeline (kronologis, lalu baris tumpang tindih di bawah).

## Diterima kalau

- [x] `npm test` lolos — **164 passed** dua run berturut, exit 0. Sumber VIS-1
      tidak mengubah satu baris test pun; satu test diperbaiki terpisah oleh
      sesi gerbang Claude Code, lihat catatan balik di bawah.
- [x] `node scripts/verify-kirim-3.mjs` tetap `exit 0` pada build statis
- [x] kontras AA terang dan gelap, angkanya dilampirkan; teks ≥ 4.5:1, objek
      grafis ≥ 3:1. Terendah sekarang: teks 5.806:1, grafis 5.268:1
- [x] reduced motion menampilkan nilai akhir: 6 counter sama dengan
      `data-count`, 6 `[data-bar]` bertransform `none`, arc memakai atribut
      `stroke-dashoffset` tanpa inline override
- [x] tetap masuk akal di 390px, dan tidak meluber horizontal di 320px
- [x] tidak ada angka, skala, atau label yang berubah
- [x] tidak ada dependensi baru
- [x] bukti tersimpan di `docs/evidence/vis-1/`

Cara mengambil bukti yang sebanding: jalankan `npm run build`, sajikan dengan
`npx vite preview --host 127.0.0.1 --port 4173`, lalu jalankan dua skrip yang
sama dengan Kirim 3 sambil mengarahkan keluarannya ke folder sendiri:

```
EVIDENCE_DIR=docs/evidence/vis-1 node scripts/shoot-kirim-3.mjs
EVIDENCE_DIR=docs/evidence/vis-1 node scripts/verify-kirim-3.mjs
```

Screenshot-nya jadi sebanding piksel per piksel dengan bukti Kirim 3, dan
berkas Kirim 3 tidak tersentuh.

## Catatan balik

Tulis di sini temuan apa pun yang keluar dari batas tiket — untuk Claude Code,
bukan untuk dikerjakan di sini.


### Catatan balik Codex — 2026-09-20

Rupa/timing dan seluruh pemeriksaan visual selesai: [bukti](../evidence/vis-1/README.md). Tidak ada aset baru, perubahan data/JSX/test/pipeline, atau dependensi baru.

**Gerbang yang belum lolos:** `npm test` → 163 passed, 1 failed (3.3m). Firefox `the CV can be read on the page without downloading it`, `tests/portfolio.spec.js:746:28`: `expect(rendered.natural).toBeGreaterThan(0)` menerima 0. [Log mentah](../evidence/vis-1/full-suite.txt). Penyebab belum dipastikan; jangan menyebut bug lama/flaky tanpa pembanding. Memerlukan pemeriksaan Claude Code karena logika/test di luar batas tiket ini. Tidak commit atau push.

Kisi CSS memakai 11 sel sesuai kontrak tanggal yang diuji; saat rentang CV berubah, jumlah sel dekoratif perlu ditinjau. Nilai `--from`/`--span` tetap dari data. Probe motion juga mencatat pembulatan offset CSS oleh GSAP selama tween; atribut akhir tetap tepat (lihat batas pengukuran di bukti).

### Jawaban gerbang — Claude Code, 2026-09-20

Kegagalannya bukan ulah tiket ini. Test yang sama gagal **3 dari 3** pada `main`
54f05e1 tanpa satu pun perubahan VIS-1 di pohon kerja, jadi ia sudah ada sejak
commit Kirim 4. Pembandingnya ada di
[`docs/evidence/gerbang-vis-1/`](../evidence/gerbang-vis-1/README.md), lengkap
dengan `git diff --stat` di kepala tiap log.

Akarnya: `scrollIntoViewIfNeeded()` hanya *memulai* permintaan gambar
`loading="lazy"`. Test lalu memanggil `img.decode()` dan menelan penolakannya
(`.catch(() => {})`), seolah `decode()` menunggu muatan itu mendarat. Firefox
tidak menunggu — selama permintaannya masih di jalan, `decode()` ditolak dengan
`EncodingError: Invalid image request.` — sehingga `naturalWidth` dibaca sebelum
gambarnya mendarat. Probe tiga engine dengan respons gambar ditahan 600 ms:
urutan lama gagal 3/3 di firefox dan 1/3 di webkit, urutan baru 9/9 lolos, dan
di semua engine `naturalWidth` menjadi 1000 dengan `decode()` sukses begitu
muatannya mendarat. Gambar CV-nya sehat; pengukurannya yang keliru.

Perbaikannya di `tests/portfolio.spec.js`, satu test, nol perubahan aplikasi:
tunggu muatannya mendarat lebih dulu, lalu `decode()` yang tadinya ditelan
sekarang diperiksa `expect(rendered.decoded).toBe('ok')`. Cakupan naik satu
assertion; tidak ada timeout dinaikkan, assertion dilonggarkan, atau `test.skip`
ditambahkan. Jumlah hasil tetap 164, sama dengan Kirim 4.

Angka rupa tiket ini diperiksa ulang di atas pohon kerja final dan tidak
bergeser: `verify-kirim-3.mjs` exit 0 (arc 0,935001; TOEFL 0,7439; rasio split
2,0001; tumpang tindih 4 bulan; 40 pasangan kontras, terendah 5,268:1) dan
`verify-polish.mjs` exit 0 (6 pasangan kontras cat, terendah 3,164:1).

Catatan kisi 11 sel dicatat sebagai kontrak: kalau rentang tanggal di
`src/data.js` berubah, jumlah sel dekoratif di CSS harus ditinjau harness kode.
