# DEBT-1 — rupa VIS-1 di `main`

Tanggal verifikasi: 2026-09-20.

## Perubahan yang dibawa

Port manual dari commit `6b10739` hanya menyentuh:

- `src/motion.js` — nilai durasi, easing, dan stagger;
- `src/styles.css` — rupa ring IPK, bar TOEFL, split bar, timeline, dan statistik.

`tests/` tidak diubah. Tidak ada token atau pasangan warna yang berubah, sehingga tidak ada rasio kontras baru yang perlu dihitung untuk item ini.

## Gerbang

```text
git diff --stat HEAD -- src/motion.js src/styles.css
 src/motion.js  | 28 +++++++++---------
 src/styles.css | 87 ++++++++++++++++++++++++++++++---------------------------
 2 files changed, 63 insertions(+), 52 deletions(-)

npm test
  196 passed (3.8m)
```

Empat project Playwright selesai: Chromium desktop, Chromium mobile, Firefox, dan WebKit. Sebelum suite, launch nyata paket Node lokal juga lolos dengan Chromium 153.0.8010.12, Firefox 155.0, dan WebKit 26.6.

Provisioner Python dari skill Arch berhenti sebelum instalasi karena executable Python `playwright` tidak ada. Itu bukan kegagalan browser proyek: proyek ini memakai `@playwright/test` Node lokal, dan ketiga engine lokal berhasil diluncurkan sebelum suite penuh.
