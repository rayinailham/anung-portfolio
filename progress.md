# Progress — Putaran 2

Sumber pekerjaan: `plan.md` (2026-09-20). Papan putaran 1 sudah tutup;
ringkasannya ada di bagian "Arsip" `plan.md`, riwayat penuh di git dan
`docs/evidence/kirim-1` … `kirim-5`.

**Aturan.** Satu baris hanya `DONE` kalau kolom Bukti memuat sesuatu yang bisa
dijalankan ulang oleh orang lain. "Kelihatannya jalan" bukan bukti. Angka
diukur, tidak dikutip.

Status: `TODO` · `WIP` · `BLOCKED` · `DONE` · `SKIP`

---

## Ringkasan

| Blok | Isi | Item | Done |
|---|---|---|---|
| A | Bug | 2 | 1 |
| B | Hutang yang belum mendarat di `main` | 2 | 0 |
| C | Rombak visualisasi timeline | 1 | 0 |
| D | Poles visual menyeluruh | 1 | 0 |
| — | **Total** | **6** | **1** |

Urutan kerja: A → B → C → D. BLOK D hanya dimulai setelah A, B, C lolos.

## Baseline `main` 7b3e322, diukur 2026-09-20

Ini pembanding "sebelum" yang sah untuk putaran ini. Semua diukur di mesin dan
sesi yang sama, bukan dikutip dari catatan lama.

| Metrik | Nilai | Cara ukur |
|---|---|---|
| `npm test` | 196 passed, exit 0, 5,0 menit | `npx playwright test` |
| Build entry JS | 279,73 kB raw / 85,62 kB gzip | `npm run build` |
| Chunk route | Experience 10,59 · About 6,16 · Contact 15,82 kB | keluaran build |
| Console error | 0 | Playwright MCP, `#/pengalaman` |
| Elemen `[data-reveal]` tersangkut `opacity: 0` di `#/pengalaman` | **6–9 dari 10** (race) | gulir ke dasar, ukur 10× sampai 10,8 s |
| `dist/images/og-cover.png` | **tidak ada** | `ls` setelah build |
| Lighthouse mobile | belum diukur ulang putaran ini | — |

---

## BLOK A — Bug

| ID | Item | Status | Bukti |
|---|---|---|---|
| BUG-1 | Sepertiga bawah `#/pengalaman` permanen `opacity: 0`; tween dibuat sebelum gerbang `revealed`, semua penyelamat dipasang sesudahnya | DONE | [`docs/evidence/putaran-2/bug-1/`](docs/evidence/putaran-2/bug-1/): gerbang urutan lifecycle gagal 4/4 di `a49750b`; hasil akhir 12/12 lolos (4 route × 4 project + animasi normal), test resmi terfokus 24/24, build exit 0. |
| BUG-2 | Intro splash terlalu cepat; teks utuh hanya ±20 ms | TODO | Butuh: jendela baca ≥ 0,9 s terukur, total intro < 2,2 s, "Lewati intro" tetap bekerja di tengah animasi, reduced motion tetap melewati intro, jaring `skip` tetap lebih panjang dari intro. |

### Catatan BUG-1

Diukur di `main` 7b3e322, `#/pengalaman`, viewport 1440×1000, gulir wheel asli
sampai `scrollY 5026` dari `scrollHeight 6026`, lalu diam. `opacity` diambil
sepuluh kali sampai 10,8 detik — tetap `0` di semua pengukuran.

Enam elemen: `section.organizations`, empat `<article>` di dalamnya (BEM SB
IPB, IDEANATION, ADDVENTURES 8.0, ABEST Internship Program), dan
`section.contact-callout`.

**Akarnya sudah ditemukan — jangan investigasi ulang.** Uraian lengkap beserta
tabel empat penyelamat yang gagal ada di `plan.md` BLOK A. Ringkasnya: tween
reveal dibuat di dalam `gsap.context` **sebelum** gerbang
`if (!revealed) return` di `src/motion.js:231`, sedangkan keempat penyelamat
(backstop `refresh`, ResizeObserver, `refresh()`, jaring 5 detik) baru dipasang
**sesudah** gerbang itu. Menyembunyikan sebelum gerbang, menyelamatkan sesudah
gerbang.

Bukti kunci: resize viewport 1440→1441 px tidak mengubah apa pun, jadi
ResizeObserver-nya memang tidak terpasang; dan MutationObserver mencatat **0
tulisan** ke atribut `style` selama 9 detik, jadi jaring 5 detik memang tidak
pernah berjalan.

Ini race: load pertama 6 dari 10 elemen tersangkut, load berikutnya **9 dari
10**. **P0-2 dari putaran 1 dengan demikian bocor**, meski ditandai DONE di
papan lama.

196 test lolos sambil bug ini hidup. Tidak ada test yang menuntut konten
benar-benar terlihat setelah pengguna berhenti menggulir.

### Catatan BUG-2

Dihitung dari `src/App.jsx:56-63`: huruf "Halo." selesai 0,50 s · caption
selesai 0,50 s · konten mulai diangkat 0,52 s · tirai selesai ±1,10 s.
Teks utuh dan diam hanya ±20 ms. `setTimeout(skip, 2000)` di `src/App.jsx:53`
ikut dinaikkan kalau durasi intro bertambah.

---

## BLOK B — Hutang yang belum mendarat di `main`

Branch `fase/img-1`, `fase/img-2`, `fase/vis-1` lahir **sebelum** refactor
Kirim 5. `git merge` akan menghapus `src/pages/`, `src/seo.js`, `src/site.js`,
`src/image-manifest.json`. **Port diff-nya, jangan merge.**

| ID | Item | Status | Bukti |
|---|---|---|---|
| DEBT-1 | Turunkan rupa VIS-1 (`6b10739`) ke `main` | TODO | Butuh: `git diff --stat` setelah apply hanya menyebut `src/motion.js` dan `src/styles.css`; `npm test` lolos tanpa mengubah `tests/`. |
| DEBT-2 | Pasang `public/images/og-cover.png` dari `0adb7e5` | TODO | Butuh: `dist/images/og-cover.png` ada dan 1200×630; `og:image` di `dist/index.html` menunjuk ke situ. Sisa jujur: validasi LinkedIn Post Inspector + pratinjau WhatsApp nyata menunggu domain hidup. |

### Koreksi terhadap papan lama — penting

Papan putaran 1 menandai **VIS-1 `DONE` (1/1)** dan P2-23/P1-8/P1-9 `DONE`.
**Itu salah untuk `main`.** Rupa VIS-1 tidak pernah mendarat; ia berhenti di
branch `fase/vis-1`. Buktinya di `main` hari ini, `src/motion.js:60-73`, semua
baris `REVEAL_TIMING` masih identik `duration: 0.9, ease: 'power3.out'`, dan
komentar di atasnya menyatakan nilainya memang ditinggalkan untuk pass visual.
Commit `c89885e` di `main` bahkan berjudul "catat suite penuh di main **tanpa
rupa VIS-1**".

Laporan penutup putaran 1 hanya menyebut IMG-2 dan Kirim 6 sebagai fase
terbuka. Itu tidak lengkap: VIS-1 juga belum mendarat.

Sampai DEBT-1 selesai, **P1-8, P1-9, dan P2-23 berstatus kerangka saja** —
penanda dan strukturnya ada, rupanya tidak.

---

## BLOK C — Rombak visualisasi timeline

| ID | Item | Status | Bukti |
|---|---|---|---|
| VIZ-1 | Rombak "Rentang waktu magang" jadi Gantt terbaca: dua kolom, kisi 11 bulan, sumbu di atas, overlap jadi pita bukan baris | TODO | Butuh: screenshot sebelum/sesudah 1440px + 390px × terang/gelap, angka kontras tiap pasangan yang berubah, test lama yang dipotret ulang beserta penggantinya, `npm test` lolos. |

Diminta langsung oleh pemilik; rupa sekarang ditolak. Enam cacat dan arah
desainnya ada di `plan.md` BLOK C.

**Ini satu-satunya blok yang boleh mengubah `tests/`.** Empat assertion
mengunci bentuk lama: `tests/portfolio.spec.js:611` (`.timeline-row` tepat 4),
`:626` (geometri `.timeline-overlap`), `:639` (teks periode overlap), `:640`
(`.timeline-axis` persis `"Sep 2025Jul 2026"`). Keempatnya memotret bentuk,
bukan kebenaran. Gantinya wajib ditulis dan wajib sama kerasnya — lima
invarian di `plan.md` BLOK C. Melonggarkan tanpa pengganti = gagal.

Urutan: DEBT-1 dulu, baru VIZ-1. Sebagian rupa timeline dari VIS-1 akan
ditimpa blok ini, tapi bagian non-timeline (ring IPK, bar TOEFL, split bar,
ritme reveal) tetap harus mendarat lebih dulu.

---

## BLOK D — Poles visual menyeluruh

| ID | Item | Status | Bukti |
|---|---|---|---|
| POLISH-1 | Skala spacing bertoken, skala tipografi, ritme vertikal, easing hover/focus, radius/bayangan | TODO | Butuh: screenshot sebelum/sesudah 4 halaman × terang/gelap × 1440px/390px, angka kontras tiap pasangan yang berubah, Lighthouse sebelum/sesudah, `npm test` lolos tanpa mengubah `tests/`. |

---

## Yang sengaja tidak dikerjakan putaran ini

| Item | Alasan |
|---|---|
| Foto/video asli dari Anung | Belum dikirim. Tiga slot bukti tetap placeholder jujur bercaption, bukan blocker. |
| Deploy | Keputusan pemilik. |
| `VITE_SITE_URL` | Domain final belum ada. Canonical, `og:url`, `sitemap.xml`, `llms.txt` memakai host placeholder `https://anung-ramadhan.example`; `npm run build` memperingatkan setiap kali. |
| `VITE_WEB3FORMS_KEY` | Tanpa kunci, form kontak jatuh ke draf `mailto:` dan copy-nya mengatakan persis itu. Uji sampai inbox menunggu kunci asli. |
| P2-31 bilingual · P2-27 prerender/SSG · P2-25 subset font · P2-24 SVG manual | Di-SKIP sejak putaran 1; alasan masih berlaku, ada di `plan.md`. |

## Slot yang masih placeholder

Tiga slot bukti di halaman Pengalaman, `placeholder: true` di `src/data.js`
dan `data-placeholder="true"` di DOM, dengan caption yang menyatakan
statusnya: `konten-sosial`, `video-produk`, `webinar-b2b`.

Cara menukar: taruh berkas di `assets/source/placeholder/<slot-id>.png`
(1200×900), jalankan `node scripts/prepare-assets.mjs`, hapus
`placeholder: true`, tulis ulang `caption` dan `alt`, tambah baris di
`docs/asset-provenance.md`. Tidak ada JSX yang perlu ditulis ulang.

`anymind-pantene-team.webp` bukan placeholder — itu foto asli milik Anung.

---

## Catatan keputusan

Diisi saat pengerjaan berlangsung: apa yang diputuskan, kenapa, dan apa yang
dilepas.

- **2026-09-20** — Papan putaran 1 diganti papan ini. Alasannya bukan
  kerapian: papan lama menyatakan VIS-1 sudah mendarat padahal tidak, dan
  menyatakan P0-2 tertutup padahal bocor. Papan yang salah lebih berbahaya
  daripada papan yang panjang.
- **2026-09-20** — `BUG-3` (glitch) dicabut atas keputusan pemilik: dianggap
  tidak ada. Tidak pernah direproduksi, jadi tidak ada yang hilang selain
  baris `BLOCKED`. Kalau gejalanya muncul lagi, buka sebagai item baru
  dengan langkah reproduksi.
- **2026-09-20** — `tests/` dibuka untuk BLOK C saja. Empat assertion timeline
  memotret bentuk lama; mempertahankannya berarti mengunci desain yang sudah
  ditolak pemilik.
- **2026-09-20 — BUG-1.** Gerbang regresi ditempatkan di
  `docs/evidence/putaran-2/bug-1/`, bukan `tests/`, karena aturan putaran hanya
  membuka `tests/` pada BLOK C. Probe natural race lolos sekali pada snapshot
  baseline, jadi pembeda baseline memakai invarian deterministik: guard
  `revealed` dan deadline native wajib terpasang sebelum `gsap.context`.
  Test perilaku tetap mengunci nol konten tersembunyi di 4 route × 4 project,
  dan test pendamping membuktikan tween normal masih hidup.

## Log verifikasi

Diisi per item saat selesai: perintah yang dijalankan, keluarannya, dan di
mana buktinya disimpan (`docs/evidence/putaran-2/`).

- **BUG-1 — 2026-09-20.** `npx playwright test --config
  docs/evidence/putaran-2/bug-1/playwright.config.js`: 12 passed final; guard
  yang sama 4 failed di snapshot `a49750b`. Test resmi terfokus: 24 passed.
  `npm run build`: exit 0. Bukti dan perintah ulang:
  [`docs/evidence/putaran-2/bug-1/`](docs/evidence/putaran-2/bug-1/).
