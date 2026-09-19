# VIS-1 — Rasa visual untuk lima visualisasi data dan timeline karier

Status: DONE
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

- [x] `npm test` lolos tanpa mengubah test (patokan sekarang: **136 passed**)
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

Selesai 2026-09-19 oleh Codex. [Bukti lengkap](../evidence/vis-1/README.md): build dan verifikasi skala exit 0; `npm test` 136 passed; screenshot sebelum/sesudah, reduced motion, dan kontras lengkap. Perubahan sumber hanya CSS dan nilai tiga tabel timing. Tidak ada kebutuhan gambar baru.

Catatan untuk Claude Code: kisi dekoratif memiliki 11 sel sesuai rentang data sekarang. Jika rentang magang berubah kelak, jumlah sel harus disesuaikan atau disuplai dari data. Tidak ada perubahan logika yang dibutuhkan untuk menutup tiket ini. Screenshot locator timeline 390px dari skrip lama memotong sedikit judul saat motion aktif; bukti crop halaman penuh tambahan merekamnya utuh tanpa mengubah aplikasi.

Pemeriksaan tautan menemukan tujuh rujukan lama di `progress.md` menuju `docs/evidence/kirim-img-1/` yang tidak ada pada checkout ini. Ketujuh rujukan sudah ada di `HEAD` sebelum VIS-1. Tidak diperbaiki di tiket visual ini; seluruh tautan bukti VIS-1 tersedia.
