# Gerbang IMG-1 — transisi route terputus di WebKit

Tanggal: 2026-09-19. Harness: Claude Code. Cakupan: satu bug race di `src/App.jsx`.
Tiket ini tidak menyentuh berkas gambar, caption, `src/data.js`, angka, atau token warna.

## Gejala

`[webkit] tests/portfolio.spec.js:392 interrupted transition and live reduced motion never lock the page`.
Setelah `location.hash` dikembalikan ke `/`, `.app` sudah lepas dari `inert`, tetapi heading
bertahan di `"Pengalamanmagang saya."` sampai timeout 5 detik. Log aslinya ada di
`docs/evidence/kirim-img-1/full-suite-first.txt` (110/2) dan `full-suite.txt` (111/1),
konteks error di `docs/evidence/kirim-img-1/webkit-route-error-context.md`.

## Reproduksi

Sendirian test ini selalu lolos: 3/3 run, lalu 12/12 run pada `--repeat-each=12 --workers=4`.
Sapuan jeda tetap 0–800 ms antara dua `hashchange` juga lolos 21/21. Racenya bukan soal
panjang jeda, melainkan soal **frame**, jadi reproduksi dibuat deterministik: `requestAnimationFrame`
ditahan 1500 ms lewat `addInitScript`, sementara React tetap berjalan (scheduler-nya memakai
MessageChannel, bukan rAF). Probe-nya disimpan di `probe-frame-gap.spec.js.txt`.

- `probe-sebelum-gagal.txt` — probe pada kode sebelum perbaikan, dengan instrumentasi sementara
  di `src/App.jsx` (dibuang sesudahnya). Gagal, dan mencatat urutan persisnya.

Baris yang menentukan:

```
1978 | change | /pengalaman | routeRef=/ | active=false   <- curtain 1 dibuat
1978 | curtain path start
1991 | change | /           | routeRef=/ | active=false   <- interupsi, TIDAK ada reset
3902 | commit | /pengalaman                               <- curtain yatim tetap commit
4497 | timeline complete | /pengalaman                    <- inert dilepas di route lama
```

## Sebab

`transition.current?.isActive()` dipakai sebagai penjaga "apakah ada curtain yang sedang jalan".
GSAP menjawab `false` untuk timeline yang sudah dibuat tetapi belum dirender: `isActive()`
mensyaratkan `_initted`, dan `_initted` baru `true` setelah tick ticker pertama. React memasang
`inert` tanpa menunggu frame. Jadi ada jendela antara "`inert` sudah terlihat" dan "timeline sudah
punya frame pertama". `hashchange` kedua yang jatuh di jendela itu masuk cabang route-sama,
penjaganya bilang tidak ada apa-apa yang berjalan, tidak ada yang di-`kill`, dan curtain yatim itu
lanjut: pada 0.45 dt ia `commit()` route lama, pada 1.05 dt `onComplete`-nya melepas `inert`.
Halaman berhenti di route yang sudah ditinggalkan.

Urutannya memang tidak pernah dijamin di engine mana pun — WebKit hanya yang paling sering
menunda frame pertama itu, apalagi saat suite penuh berjalan 3 worker. Buktinya: test regresi baru
gagal di **keempat** project saat dijalankan pada kode sebelum perbaikan (`regresi-tanpa-perbaikan-gagal.txt`),
dengan string gejala yang sama persis.

## Perbaikan

`src/App.jsx`. Status "ada curtain yang sedang jalan" tidak lagi ditanyakan ke GSAP, tapi dimiliki
sendiri: `transition.current` berisi timeline selama curtain hidup, dan hanya kode yang mengakhiri
curtain yang mengosongkannya (`stopTransition()`, plus `onComplete` yang membersihkan refnya).
Cabang route-sama, cabang route-beda, cleanup listener, dan penyelamat reduced-motion memakai
pintu yang sama. Tidak ada timeout, assertion, atau cakupan test yang dilonggarkan.

## Verifikasi

- `webkit-gerbang-5-run.txt` — `npm test -- --project=webkit -g 'interrupted transition'`
  lima kali berturut-turut, lima-limanya `1 passed`, exit 0.
- `regresi-tanpa-perbaikan-gagal.txt` — test regresi baru dijalankan pada `src/App.jsx` sebelum
  perbaikan: 4 failed (chromium, mobile, firefox, webkit). Gerbangnya nyata, bukan hiasan.
- `suite-penuh-sesudah.txt` — `npm test` exit 0, 116 passed (2.3m).
- `suite-penuh-sesudah-2.txt` — `npm test` diulang, exit 0, 116 passed (2.3m). Kegagalan aslinya
  butuh dua run untuk stabil, jadi gerbangnya juga dibuktikan dua run.
- `build.txt` — `npm run build` exit 0.
- `suite-penuh-main-58003a9.txt` — commit `main` ini **berdiri sendiri**, di `git worktree`
  terpisah tanpa aset IMG-1 yang masih belum di-commit: exit 0, 116 passed (2.5m). Percobaan
  worktree pertama dibuang karena tidak sah: worktree-nya di `/tmp` dengan `node_modules`
  simbolik, Vite menolak melayaninya (403) dan mencemari assertion console. Worktree kedua
  dibuat satu filesystem dengan project dan `node_modules` disalin hard-link.
  `58003a9` adalah hash commit ini sebelum di-`--amend`; amend-nya hanya menambahkan log ini
  dan barisnya di `progress.md`, jadi `src/` dan `tests/` yang diuji identik dengan commit final.

112 test lama tetap utuh; satu test ditambahkan (`a route change inside the curtain's first frame
gap does not strand the old page`), sehingga 112 → 116 hasil di empat project.

Browser Arch: engine yang terpasang sudah jalan, WebKit launch normal di setiap run di atas.
Tidak ada instalasi, tambalan, atau `playwright install-deps` pada sesi ini.

Batas bukti: tidak ada audit Lighthouse/CLS, tidak ada screenshot. Yang diklaim di sini hanya
perilaku route + `inert`, dan itu seluruhnya terbaca dari keluaran test yang dilampirkan.
