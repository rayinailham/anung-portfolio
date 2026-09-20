# POLISH-1 — poles visual menyeluruh

BLOK D, putaran 2. Diukur 2026-09-20 di mesin dan sesi yang sama untuk
"sebelum" dan "sesudah". Pembanding "sebelum" adalah `src/styles.css` di
`a764db0`, dibangun ulang di sesi ini — bukan angka yang dikutip dari catatan.

Satu berkas berubah: `src/styles.css`. `tests/`, `src/data.js`, `src/App.jsx`,
`src/pages/`, `scripts/`, dan konfigurasi build tidak disentuh.

## Cara ukur ulang

```bash
npm run build
npx vite preview --host 127.0.0.1 --port 4273 --strictPort    # biarkan hidup

node docs/evidence/putaran-2/polish-1/shoot.mjs sesudah        # 16 potret
node docs/evidence/putaran-2/polish-1/ritme.mjs sesudah        # ritme + skala
node docs/evidence/putaran-2/polish-1/kontras.mjs sesudah      # kontras nyata
node docs/evidence/putaran-2/polish-1/lebar.mjs                # 64 kombinasi
node docs/evidence/putaran-2/polish-1/mercusuar.mjs sesudah    # Lighthouse
bash docs/evidence/putaran-2/polish-1/kosakata.sh src/styles.css
npx playwright test
```

Untuk mendapatkan kolom "sebelum": `git show a764db0:src/styles.css >
src/styles.css`, `npm run build`, jalankan skrip yang sama dengan argumen
`sebelum`, lalu kembalikan berkasnya.

## Lima poin `plan.md` BLOK D dan hasilnya

| # | Permintaan | Hasil terukur |
|---|---|---|
| 1 | Angka lepas di `src/styles.css` dirasionalkan jadi skala spacing bertoken | Angka px lepas untuk jarak: **57 → 1**. Yang tersisa satu-satunya adalah `margin: -1px` pada `.sr-only`, trik clip baku, bukan jarak. |
| 2 | Skala tipografi konsisten untuk `h2`/`h3`/body | Ukuran font teks tampak di 4 halaman × 2 lebar: **36 → 19 nilai berbeda**, semuanya langkah dari `--text-*` / `--title-*` / `--figure-*` / `--display`. |
| 3 | Ritme vertikal antar-section sama lintas 4 halaman | Nilai padding vertikal berbeda per halaman: **7/7/5/6 → 3/3/3/3** di 1440px dan **6/6/4/3 → 2/2/2/2** di 390px. Keempat halaman sekarang bernapas dengan 96/64/40px (1440px) dan 56/40px (390px) yang sama. |
| 4 | Durasi dan easing hover/focus disamakan | Durasi transisi yang hidup di DOM: **160/180/250/320/620ms → 220/320ms**. 220ms untuk setiap hover dan fokus, 320ms hanya untuk yang membuka (disclosure, skala gambar). Easing tunggal `var(--ease)`. |
| 5 | Radius dan bayangan dalam token warna yang ada | Radius yang hidup di DOM: **5 → 3** (`--radius-pill`, `--radius-circle`, `--radius-arch`). Bayangan jadi satu token `--shadow-drop` yang punya nilai sendiri di tema gelap; sebelumnya bordo `#6c151e0a` yang praktis tak terlihat di atas hijau gelap. |

Rincian angkanya: [`ritme-sebelum.md`](ritme-sebelum.md) dan
[`ritme-sesudah.md`](ritme-sesudah.md).

## Kontras

Diukur hidup, bukan dari daftar pasangan yang diketik tangan: setiap simpul
teks tampak diukur terhadap latar efektif yang dihitung dari rantai leluhurnya,
termasuk lapisan yang dilukis saudara absolut seperti `.timeline-bar-fill`.

| | Simpul diukur | Pasangan unik | Gagal |
|---|---|---|---|
| sebelum | 1240 | 96 | **0** |
| sesudah | 1240 | 96 | **0** |

Empat halaman × dua tema × dua lebar. Tidak ada token warna yang berubah di
item ini, jadi tidak ada pasangan yang rasionya bergeser; tabel lengkapnya
tetap dilampirkan di [`kontras-sebelum.md`](kontras-sebelum.md) dan
[`kontras-sesudah.md`](kontras-sesudah.md) supaya klaim itu bisa dicek, bukan
dipercaya. Terendah di kedua kolom sama persis: `span` terang **5,806:1**
terhadap ambang 4,5:1.

## Lebar

[`lebar.md`](lebar.md): **64 kombinasi** (8 lebar 320–1920px × 2 tema × 4
halaman), **0 gagal**. Tidak ada geser mendatar, tidak ada kotak yang lebih
lebar dari layarnya, tidak ada teks tampak di bawah 14px.

## Lighthouse mobile

Dua putaran "sebelum" dan dua putaran "sesudah", semuanya terhadap build
produksi yang dilayani `vite preview` di mesin ini.

| Halaman | Performance sebelum | Performance sesudah | CLS sebelum | CLS sesudah |
|---|---|---|---|---|
| Beranda | 96 · 96 | 97 · 97 | 0,0000 | 0,0000 |
| Pengalaman | 96 · 96 | 96 · 96 | 0,0000 | 0,0000 |
| Tentang | 90 · 90 | 97 · 98 | **0,1602** | **0,0000** |
| Kontak | 90 · 90 | 97 · 97 | **0,1602** | **0,0000** |

Berkasnya: [`lighthouse-sebelum-1.md`](lighthouse-sebelum-1.md),
[`lighthouse-sebelum-2.md`](lighthouse-sebelum-2.md),
[`lighthouse-sesudah-1.md`](lighthouse-sesudah-1.md),
[`lighthouse-sesudah-2.md`](lighthouse-sesudah-2.md). Kedua putaran "sesudah"
diukur terhadap build akhir yang sama dengan yang di-commit.

Accessibility, best practices, dan SEO: **100** di semua halaman, sebelum dan
sesudah.

CLS 0,1602 di Tentang dan Kontak adalah cacat yang ditemukan saat mengukur,
bukan yang dibawa item ini: `<main>` kosong satu putaran jaringan saat chunk
rute malas datang, jadi footer duduk di bawah header lalu turun. Satu aturan
CSS — `main:empty { min-height: calc(100dvh - var(--header-height)); }` —
menahan tingginya sampai isinya datang. Terulang di dua putaran di kedua
kolom, jadi ini bukan kebetulan satu run.

Gerbang `plan.md` menuntut performance mobile ≥ 98. Di harness ini angkanya
berhenti di 96–98 dan bergoyang ±1 antar-run; hanya Tentang yang menyentuh 98,
dan hanya di satu putaran. Yang bisa saya buktikan adalah arah dan besarnya
perbaikan pada mesin yang sama: **90 → 97–98** di dua rute terburuk. Angka 98
yang tercatat di putaran 1 diukur dengan cara lain (bukan `vite preview`
lokal), jadi saya tidak menyamakan keduanya.

## Gerbang lain

| Gerbang | Hasil |
|---|---|
| `npx playwright test` | **200 passed**, 4 project, `tests/` tidak berubah sebaris pun |
| `npm run build` | exit 0, 4579 modul. CSS 39,66 → 41,98 kB mentah, **11,38 → 11,03 kB gzip** |
| `prefers-reduced-motion` | blok `@media (prefers-reduced-motion: reduce)` utuh; test `reduced motion never downloads the animation chunk` dan `reduced motion leaves every reveal, counter and disclosure at its final value` lolos |

## Potret

[`sebelum/`](sebelum/) dan [`sesudah/`](sesudah/): 16 potret halaman penuh
masing-masing — 4 halaman × 2 tema × 1440px dan 390px.

## Yang sengaja tidak ikut ditoken

- `font-size: .48em` pada `.experience-stats .stat-unit` — satuan angka yang
  memang harus ikut ukuran angkanya sendiri, bukan langkah skala.
- `clamp(110px, 22vw, 280px)` pada `.splash-word` — lebih besar dari apa pun
  yang pernah ditampilkan halaman; menjadikannya langkah skala berarti
  menambah token yang tak dipakai siapa pun lagi.
- Geometri visual data: tinggi bar timeline, lebar cincin IPK, tinggi track
  skor, ukuran ikon. Angka-angka itu bentuk, bukan jarak.

## Sisa jujur

- Performance mobile 96–98 dan tidak stabil di 98, jadi gerbang ≥ 98 belum
  terpenuhi utuh. Penyebab
  terbesarnya bundel utama 279,74 kB (React + GSAP + ikon), yang tidak boleh
  disentuh item ini dan tidak bisa diperbaiki oleh CSS.
- Angka Lighthouse di sini berasal dari `vite preview` lokal tanpa kompresi
  atau header cache produksi. Setelah domain hidup dan deploy, angkanya wajib
  diukur ulang di sana; yang di atas hanya sah sebagai pembanding sebelum ↔
  sesudah pada mesin yang sama.
- `VITE_SITE_URL` masih kosong, jadi build tetap memperingatkan soal host
  placeholder. Di luar scope putaran ini.
