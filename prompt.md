# Prompt Pengembangan — Portofolio Anung (putaran 2)

Ditulis ulang 2026-09-20. Versi lama memetakan fase KIRIM #1–#6 + tiket Codex
yang sudah tutup; peta itu sekarang salah dan dibuang. Riwayatnya ada di git.

Referensi: `plan.md` (rencana + spesifikasi desain), `progress.md` (papan
status, satu-satunya sumber kebenaran item mana yang sudah selesai).

**Perubahan penting dari versi lama:** dulu berkas ini memberi izin git
selimut ("commit dan push tiap akhir fase"). Izin itu **dicabut**. Tidak ada
commit, push, branch, atau PR tanpa perintah eksplisit pemilik di sesi itu.

---

# PROMPT UNIVERSAL

Tempel utuh setiap sesi. Jangan diedit.

````
Baca `prompt.md` di root project, lalu kerjakan blok berikutnya.

## Orientasi — sebelum mengubah apa pun

1. Baca `progress.md`. Ambil blok paling atas yang belum seluruh barisnya
   `DONE` atau `SKIP`. Urutannya A → B → C → D dan tidak boleh dilompati.
2. Baca blok itu di `plan.md` — daftar kerja, batasan, gerbang.
3. Baca prompt bloknya di `prompt.md` bagian "BLOK <X>".
4. Baris `BLOCKED` dilewati, bukan ditebak. Kerjakan sisanya.

Kalau papan bersih: jangan cari kerjaan baru. Lapor bahwa papan bersih dan
sebutkan sisa yang sengaja di luar scope.

## Project

Portofolio pribadi Anung Hanindhita Ramadhan — lulusan Bisnis IPB yang
melamar kerja di pemasaran afiliasi / digital. Situs berbahasa Indonesia.
React 19 + Vite 8, GSAP + ScrollTrigger, Lenis. Tanpa backend. Statis dari
`dist/`.

- `src/App.jsx`        — shell, header, routing hash, form kontak, curtain, splash
- `src/pages/`         — Home, Experience, About, Contact (tiga terakhir lazy)
- `src/pages.js`       — registry lazy-load + prefetch idle
- `src/routes.js`      — kosakata route + deep-link anchor
- `src/motion.js`      — siklus hidup animasi, Lenis, semua ScrollTrigger, jaring pengaman
- `src/motion-runtime.js` — GSAP/Lenis dimuat terpisah
- `src/styles.css`     — token tema, responsif (1100 / 767 / 370)
- `src/data.js`        — fakta dari CV. Aturan kejujuran di baris 2.
- `src/site.js`        — satu-satunya tempat URL situs & meta sosial ditulis
- `src/seo.js`         — JSON-LD Person, robots.txt, sitemap.xml, llms.txt
- `src/image-manifest.json` + `src/image-sizes.js` — sumber tunggal setiap srcset
- `tests/portfolio.spec.js` — Playwright, 4 project
- `scripts/prepare-assets.mjs` — pipeline gambar sharp
- `docs/asset-provenance.md`   — asal-usul setiap gambar. Wajib diperbarui.

Perintah:
- `npm run dev` → http://localhost:5173
- `npm run build`
- `npm test` (JANGAN `playwright install-deps` di Arch — pakai skill
  `arch-playwright-provision`)

## Aturan yang tidak bisa dilanggar

1. JANGAN mengarang angka, hasil, atau klaim. Setiap angka harus bisa
   ditelusuri ke `Anung Hanindhita Ramadhan-CV.pdf`. `src/data.js:2` melarang
   menyajikan target outreach sebagai hasil penjualan. "Buat lebih impresif"
   TIDAK PERNAH berarti menaikkan angka.
2. JANGAN merepresentasikan gambar hasil mesin sebagai kerja klien. Lihat
   "Aturan aset & placeholder".
3. Kontras wajib lolos WCAG AA terang & gelap. Lampirkan angka setiap pasangan
   yang berubah.
4. `prefers-reduced-motion: reduce` dihormati penuh: intro dilewati, Lenis
   mati, animasi dekoratif mati, setiap nilai animasi tampil final, chunk
   animasi tidak diunduh.
5. Gambar baru wajib punya `width` + `height`. CLS ≤ 0,01.
6. Jangan hapus cakupan test. `tests/` hanya boleh diubah di BLOK C, dan hanya
   dengan menulis ulang invarian ke DOM baru — tidak melonggarkan.
7. Jangan operasi git kecuali diminta eksplisit di sesi itu.
8. Tanpa dependensi baru.
9. Copy bahasa Indonesia. Nada: lugas, orang pertama, tanpa kata sifat
   pemasaran berlebihan.

## Cara kerja

- Kerjakan SELURUH daftar blok itu dalam satu sesi. Jangan berhenti di tengah
  untuk minta konfirmasi.
- Ambigu → ambil keputusan paling masuk akal, KERJAKAN, catat asumsinya di
  `progress.md` bagian "Catatan keputusan".
- ASET TIDAK PERNAH JADI ALASAN BERHENTI. Aset, kredensial, dan domain punya
  jalur default di bawah. Pakai default, tandai, jalan terus. `BLOCKED` hanya
  kalau jalur defaultnya sendiri mustahil, dan alasannya ditulis.
- Satu item benar-benar terblokir → selesaikan SEMUA item lain sampai tuntas,
  lalu laporkan persis mana yang tertinggal dan kenapa.
- Angka diukur, bukan dikutip dari catatan. Pembanding "sebelum" harus
  dibangun ulang di mesin dan sesi yang sama dengan "sesudah".
- Verifikasi sendiri sebelum lapor. Bukti di `docs/evidence/putaran-2/`.

## Penutup sesi — wajib

1. Update `progress.md`: status tiap baris, kolom Bukti, tabel ringkasan,
   "Catatan keputusan", "Log verifikasi".
2. Tulis ringkasan pendek: apa yang berubah, bukti apa yang ada, apa yang
   tersisa, blok berikutnya apa.
3. JANGAN commit, push, atau buka PR. Laporkan diff dan tunggu perintah.
4. Berhenti. Jangan lanjut ke blok berikutnya walau konteks masih sisa.
````

---

# BLOK A — Bug

Tiga item: `BUG-1`, `BUG-2`, `BUG-3`. Detail dan gerbangnya di `plan.md`.

**`BUG-1` — sepertiga bawah `#/pengalaman` permanen `opacity: 0`. P0.**
Cari akarnya dulu. Jaring pengaman 5 detik di `src/motion.js:253` sudah ada
tapi tidak menjangkau enam elemen ini — pertanyaannya kenapa: timer di-clear
oleh cleanup effect yang berjalan ulang, selektor tidak cocok, atau tween
dibuat ulang sesudah jaring lewat. Menaikkan `opacity` lewat CSS paksa adalah
tambalan dan ditolak. Gerbangnya satu test baru yang **gagal pada `main`
7b3e322** dan lolos sesudahnya, di 4 route × 4 project.

**`BUG-2` — intro splash terlalu cepat.** Teks utuh hanya ±20 ms. Target:
jendela baca ≥ 0,9 detik, total intro < 2,2 detik. Naikkan juga
`setTimeout(skip, 2000)` di `src/App.jsx:53`; jaring itu tetap ada dan tetap
lebih panjang dari intro. "Lewati intro" tetap bekerja kapan saja, reduced
motion tetap melewati intro, intro tetap sekali per sesi.

**`BUG-3` — glitch, status `BLOCKED`.** Jangan menebak perbaikan. Reproduksi
dulu: klik cepat berpindah route, Back di tengah tirai, ganti tema di tengah
tirai — 4 project + CPU throttle. Tidak ada yang rusak → tulis apa adanya dan
minta langkah reproduksi dari pemilik. Jangan tandai `DONE`.

---

# BLOK B — Hutang yang belum mendarat di `main`

Branch `fase/img-1`, `fase/img-2`, `fase/vis-1` lahir **sebelum** refactor
Kirim 5. `git merge` akan menghapus `src/pages/`, `src/seo.js`, `src/site.js`,
`src/image-manifest.json`. **Port diff-nya, jangan merge.**

**`DEBT-1` — turunkan rupa VIS-1.**

    git diff 60f9c5f..6b10739 -- src/motion.js src/styles.css > /tmp/vis-1.patch
    git apply --3way /tmp/vis-1.patch

Konflik → selesaikan manual: pertahankan SEMUA milik Kirim 5, ambil hanya nilai
estetis VIS-1. Setelah apply, `git diff --stat` wajib hanya menyebut dua berkas
itu. Gerbang: `npm test` lolos tanpa mengubah `tests/`.

**`DEBT-2` — pasang berkas OG.**

    git checkout 0adb7e5 -- public/images/og-cover.png assets/source/og-cover.png \
      docs/asset-provenance.md docs/evidence/kirim-img-2 docs/image-jobs/IMG-2-og-image.md

Jangan ambil `progress.md` dari commit itu. Gerbang: `npm run build`, lalu
buktikan `dist/images/og-cover.png` ada dan 1200×630 dan `og:image` menunjuk ke
situ. Sisa jujur: validasi LinkedIn Post Inspector dan pratinjau WhatsApp nyata
menunggu domain hidup — tulis sebagai sisa, jangan diklaim.

---

# BLOK C — Rombak visualisasi timeline

Satu item: `VIZ-1`. Enam cacat, arah desain, dan lima invarian pengganti ada di
`plan.md` BLOK C. Baca dari sana, jangan dirangkum ulang di sini.

**Ini satu-satunya blok yang boleh mengubah `tests/`.** Empat assertion
memotret bentuk lama: `tests/portfolio.spec.js:611`, `:626`, `:639`, `:640`.
Tulis penggantinya, sama kerasnya. Melonggarkan tanpa pengganti = gagal.

Urutan: `DEBT-1` harus mendarat lebih dulu. Sebagian rupa timeline dari VIS-1
akan ditimpa blok ini; bagian non-timeline (ring IPK, bar TOEFL, split bar,
ritme reveal) tetap harus mendarat.

Yang tidak berubah: `src/data.js`, angka, `start`/`end`, teks fakta. `--from`
dan `--span` tetap satu-satunya sumber posisi bar.

---

# BLOK D — Poles visual menyeluruh

Satu item: `POLISH-1`. Hanya setelah A, B, C lolos. Daftar kerjanya lima poin
di `plan.md` BLOK D.

Boleh: `src/styles.css`, nilai easing/durasi murni estetis di `src/motion.js`.
Tidak boleh: `src/data.js`, angka, copy fakta, logika `src/App.jsx`, routing,
form, state, `tests/`, `scripts/`, konfigurasi build, dependensi baru.

---

# Aturan aset & placeholder

Aset dari Anung belum ada dan mungkin tidak akan pernah ada. Itu bukan blocker.

Urutan untuk setiap slot gambar:

1. Aset asli dari Anung — kalau ada di root atau `assets/source/`.
2. Foto nyata yang sudah dimiliki — `with_anymind_team.jpg`, `anung_profile.jpeg`.
3. Placeholder abstrak.
4. Jangan pernah: kosongkan slot diam-diam, atau hapus klaimnya dari copy.

Placeholder BOLEH: komposisi abstrak, bentuk geometris, still life editorial,
tekstur, kartu warna brand — sesuatu yang jelas bukan tangkapan layar.

Placeholder TIDAK BOLEH: tiruan tangkapan layar Instagram, tiruan dashboard
afiliasi, tiruan grafik penjualan, logo merek nyata (Unicharm, Pantene, Shopee,
TikTok, AnyMind), wajah manusia, atau teks yang terbaca sebagai data. Gambar
yang bisa disalahartikan sebagai bukti kerja adalah kebohongan, sekalipun
captionnya jujur.

Kontrak teknis:

- Berkas: `public/images/placeholder/<slot-id>.webp`, sumber
  `assets/source/placeholder/<slot-id>.png` (1200×900).
- Di `src/data.js`: `{ id, type, caption, src, width, height, placeholder: true }`.
- Di DOM wajib ada `data-placeholder="true"`.
- Caption wajib menyebut statusnya dengan kata sendiri dan jadi bagian konten,
  bukan hanya `title` atau `alt`.
- `alt` mendeskripsikan gambarnya apa adanya (ilustrasi abstrak), bukan
  mendeskripsikan pekerjaan yang tidak ditampilkan.
- Mengganti dengan aset asli = taruh berkas di jalur yang sama, jalankan
  `node scripts/prepare-assets.mjs`, hapus `placeholder: true`. Tidak boleh
  perlu menulis JSX lagi.
- Setiap gambar hasil generate dicatat di `docs/asset-provenance.md` lengkap
  dengan prompt yang dipakai.

Tiga slot yang masih placeholder: `konten-sosial`, `video-produk`,
`webinar-b2b`. `anymind-pantene-team.webp` bukan placeholder — itu foto asli.

---

# Default kalau keputusan belum ada

Kolom kosong bukan alasan berhenti.

| # | Keputusan | Default |
|---|---|---|
| 1 | Backend form kontak | Web3Forms lewat `VITE_WEB3FORMS_KEY` |
| 2 | Kredensial form | Env var tidak ada → UI tetap lengkap, submit jatuh ke `mailto:`, test menutup kedua jalur |
| 3 | Domain final | `VITE_SITE_URL`; kosong → host placeholder di `src/site.js`, build memperingatkan |
| 4 | Aset konten dari Anung | Anggap tidak ada → jalur placeholder di atas |
| 5 | Deploy | Bukan pekerjaan agent. Keputusan pemilik. |

---

# Prompt satuan — untuk mengambil sisa yang dipotong

````
Baca `plan.md` dan kerjakan HANYA item <ID>. Ikuti "PROMPT UNIVERSAL" di
`prompt.md` untuk konteks dan aturan, tapi lewati langkah orientasi — itemnya
sudah ditentukan. Jangan sentuh apa pun di luar item itu. Tunjukkan bukti
sebelum/sesudah, jalankan `npm test`, update baris yang sesuai di
`progress.md`. Jangan commit.
````

# Prompt review — kalau curiga ada yang dilapor selesai padahal belum

````
Baca `plan.md`, `progress.md`, dan diff kerja terakhir. Untuk setiap item
`DONE`, verifikasi buktinya nyata dan cocok dengan klaimnya — jalankan sendiri
perintahnya, jangan percaya kolom Status. Periksa juga apakah pekerjaan itu
benar-benar ada di `main`, bukan hanya di branch. Laporkan setiap item yang
ditandai selesai tanpa verifikasi yang bisa diulang, dan setiap pelanggaran
"Aturan yang tidak bisa dilanggar" — terutama kejujuran angka dan setiap slot
placeholder yang bisa terbaca sebagai bukti kerja.
````
