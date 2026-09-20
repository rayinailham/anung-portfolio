# Gerbang VIS-1 — preview CV gagal di Firefox

Sesi tiket **Claude Code**, 2026-09-20. Codex menyerahkan VIS-1 dalam keadaan
`WIP`: seluruh pekerjaan rupa selesai, tetapi `npm test` berhenti di
`163 passed, 1 failed`. Yang gagal satu:

```
[firefox] › tests/portfolio.spec.js:746:28
  the CV can be read on the page without downloading it
  expect(rendered.natural).toBeGreaterThan(0)   diterima: 0
```

Codex tidak boleh menyentuh `tests/` maupun logika, dan menolak menyebutnya
"bug lama" atau "flaky" tanpa pembanding. Sesi ini yang menyediakan pembandingnya.

## Bukan ulah VIS-1

| Keadaan pohon kerja | Hasil | Log |
|---|---|---|
| `main` 54f05e1 + perubahan VIS-1 (`src/motion.js`, `src/styles.css`) | 3 dari 3 gagal | [`sebelum-vis-1-terpasang.txt`](sebelum-vis-1-terpasang.txt) |
| `main` 54f05e1 apa adanya, nol perubahan VIS-1 | 3 dari 3 gagal | [`sebelum-tanpa-vis-1.txt`](sebelum-tanpa-vis-1.txt) |

Kedua log memuat `git diff --stat` saat run diambil, jadi keadaan pohon kerjanya
bisa dibaca dari berkasnya sendiri. Kegagalannya sudah ada di commit Kirim 4,
sebelum satu baris pun milik VIS-1 masuk.

## Penyebabnya: balapan `decode()`, bukan gambar rusak

`scrollIntoViewIfNeeded()` hanya *memulai* permintaan gambar `loading="lazy"`.
Test lama lalu memanggil `img.decode()` dan menelan penolakannya
(`.catch(() => {})`), dengan asumsi `decode()` menunggu muatan itu mendarat.
Firefox tidak menunggu: selama permintaan gambar masih di jalan, `decode()`
**ditolak** dengan `EncodingError: Invalid image request.` Penolakan itu ditelan,
`naturalWidth` dibaca pada detik yang sama, dan nilainya masih 0.

[`probe-cv.mjs`](probe-cv.mjs) membuktikannya tanpa menebak: respons
`/images/cv-halaman-1.webp` ditahan 600 ms — berkasnya tetap berkas asli dari
server — supaya jendela balapan selalu terbuka, lalu dua urutan dijalankan pada
halaman yang sama di tiga engine.

| Urutan | chromium | firefox | webkit |
|---|---|---|---|
| Lama: `decode()` lalu baca ukuran | 3/3 lolos | **0/3 lolos** — `EncodingError: Invalid image request.` | 2/3 lolos — 1 kali `EncodingError: Aborted by source change.` |
| Baru: tunggu muatan mendarat, lalu `decode()` | 3/3 | 3/3 | 3/3 |

Keluaran mentah: [`probe-cv.txt`](probe-cv.txt). Di setiap engine, setelah
muatannya mendarat, `naturalWidth` selalu 1000 dan `decode()` selalu sukses —
gambarnya sehat di ketiga engine. Yang salah cara test mengukurnya. Itu juga
sebabnya sesi Kirim 4 sempat melihatnya lolos: kalau server sempat menjawab
sebelum `decode()` dipanggil, jendela balapannya tertutup.

## Perbaikannya

`tests/portfolio.spec.js`, satu test, tanpa menyentuh aplikasi:

- tunggu muatan gambar benar-benar mendarat (`expect.poll` atas `naturalWidth`,
  batas 10 detik) sebelum mengukur apa pun;
- `decode()` yang tadinya ditelan sekarang **diperiksa**: `expect(rendered.decoded).toBe('ok')`.

Tidak ada timeout aplikasi dinaikkan, assertion dilonggarkan, `test.skip`
ditambahkan, atau cakupan dikurangi. Assertion `naturalWidth > 0`, `width`,
`height`, `alt`, figcaption dan tombol download tetap utuh, dan satu assertion
baru ditambahkan di atasnya. Jumlah hasil tetap 164 — sama dengan Kirim 4.

## Verifikasi

| Perintah | Hasil |
|---|---|
| `npx playwright test -g 'the CV can be read…' --repeat-each=5` (4 project) | **20 passed (23.8s)**, exit 0 — [log](sesudah-ulang-5.txt) |
| `npm test` run 1 | **164 passed (3.2m)**, exit 0 — [log](suite-penuh-1.txt) |
| `npm test` run 2, tanpa perubahan apa pun | **164 passed (3.3m)**, exit 0 — [log](suite-penuh-2.txt) |
| `npm test` pada `main` 60f9c5f apa adanya (tanpa rupa VIS-1) | **164 passed (3.1m)**, exit 0 — [log](suite-penuh-main.txt) |
| `npm run build` | exit 0 — [log](build.txt) |
| `EVIDENCE_DIR=docs/evidence/gerbang-vis-1 node scripts/verify-kirim-3.mjs` | exit 0: arc IPK 0.935001, TOEFL 0.7439 = harapan, rasio split 2.0001, tumpang tindih 4 bulan, 40 pasangan kontras terendah 5.268:1 — [log](verify-kirim-3.txt), [metrik](metrics.json) |
| `node docs/evidence/vis-1/verify-polish.mjs` | exit 0: 8 pemeriksaan ring–angka, sampel tween langsung, 6 pasangan kontras cat terendah 3.164:1 — [log](verify-polish.txt) |

Dua verifikasi terakhir dijalankan ulang di atas pohon kerja final (VIS-1 +
perbaikan gerbang) dan mengembalikan angka yang sama persis dengan sesi Codex,
jadi gerbang ini tidak menggeser satu pun angka VIS-1.

Suite dijalankan dua kali karena gerbang IMG-1 dulu baru stabil pada run kedua;
di sini dua-duanya exit 0.
