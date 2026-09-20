# VIZ-1 — Rombak visualisasi "Rentang waktu magang"

Diukur 2026-09-20 di mesin yang sama dengan pembanding "sebelum". Pembanding
dibangun ulang dari `git archive HEAD` pada sesi ini, bukan dikutip dari
catatan lama.

## Apa yang berubah

| Cacat lama (`plan.md` BLOK C) | Penggantinya |
|---|---|
| 1. Label di atas bar, mata harus lompat | Label kiri (`clamp(200px, 26vw, 320px)`) sebaris dengan barnya |
| 2. Tidak ada kisi bulan | `.timeline-grid`: 11 garis bulan, lapisan sendiri di belakang bar |
| 3. Sumbu dua label, jauh di bawah | `.timeline-axis` di atas track, label tiap 2 bulan (>767px) / tiap kuartal (<=767px) |
| 4. Overlap jadi baris keempat | `.timeline-band`: pita vertikal di belakang dua baris yang menghasilkannya, plus satu anotasi "4 bulan bersamaan" |
| 5. Bar kotak datar tanpa angka | Bar pill 28px (24px di mobile), periode dibaca di ujung barnya sendiri |
| 6. Kalimat lead mengulang isi baris hijau | Baris hijau hilang; kalimat lead jadi `sr-only` di `<figcaption>` karena chip pita sudah menyampaikannya secara visual |

Yang tidak disentuh: `src/data.js`, setiap angka, `start`/`end`, teks fakta.
`--from` dan `--span` tetap satu-satunya sumber posisi bar.

## Test lama yang dipotret ulang

Empat assertion mengunci bentuk lama. Semuanya diganti, tidak ada yang
dilonggarkan — dua test baru menggantikan satu test lama, jadi suite naik dari
196 ke 200.

| Assertion lama | Penggantinya |
|---|---|
| `:611` `.timeline-row` tepat 4 | `.timeline-row` tepat `experience.length`, dihitung dari `src/data.js` |
| `:626` geometri `bar('.timeline-overlap')` | Geometri tiap `.timeline-band` per baris pemiliknya, plus `band.from/to` wajib sama dengan irisan `start`/`end` dua peran itu |
| `:639` teks `.timeline-overlap .timeline-period` | `.timeline-band-note` tepat `${n} bulan bersamaan`, tepat satu per pita, `n` dihitung dari data |
| `:640` `.timeline-axis` persis `"Sep 2025Jul 2026"` | Setiap tick yang tampil wajib menyebut bulan yang ditunjuk offsetnya dan berdiri di posisi bulan itu; jarak antar-tick wajib satu langkah |

Invarian yang sebelumnya tidak ada sama sekali:

- Lebar setiap bar = bulannya sendiri / bulan grafik, dihitung dari `src/data.js`.
- Periode wajib menempel pada barnya dan tidak keluar track, di lebar berapa pun.
- Kisi bulan dekorasi: mematikan `.timeline-grid` tidak boleh menggeser satu bar pun.
- `.timeline-note` wajib satu per perusahaan yang muncul lebih dari sekali.

## Gerbang: test baru gagal di DOM lama

Snapshot `git archive HEAD` (yaitu `9b7b4d8`, sebelum VIZ-1) diberi
`tests/portfolio.spec.js` yang baru. Supaya kegagalannya bukan sekadar atribut
yang belum ada, snapshot itu lebih dulu ditambahi `data-months` dan
`data-range` — jadi yang gagal adalah invarian isinya, bukan penanda barunya.

Hasil: **8 failed / 8** (4 project × 2 test). Kegagalan pertama tiap test:

- `.timeline-row` toHaveCount: diminta 3, DOM lama punya 4 (baris overlap ikut terhitung).
- `.timeline-bar` toHaveLength: diminta 3, DOM lama punya 4.

Log: [`gerbang-dom-lama.txt`](gerbang-dom-lama.txt).

Ulangi:

    SNAP=$(mktemp -d)
    git archive 9b7b4d8 | tar -x -C "$SNAP"
    ln -s "$PWD/node_modules" "$SNAP/node_modules"
    cp tests/portfolio.spec.js "$SNAP/tests/"
    # geser port di $SNAP/playwright.config.js ke 5273/5274
    # tambahkan data-months + data-range di $SNAP/src/pages/Experience.jsx
    cd "$SNAP" && npx playwright test -g "career timeline|month grid is decoration"

## Kontras

`node docs/evidence/putaran-2/viz-1/contrast.mjs` — 14 pasangan, 0 gagal.
Angka lengkap: [`contrast.txt`](contrast.txt). Warna diambil dari token `:root`
di `src/styles.css`, tidak diketik ulang.

Pasangan terendah: `.timeline-band-note` di tema gelap, **4,947:1** terhadap
pita overlap (var(--green) 12% di atas var(--paper)), ambang AA 4,5:1.

## Lebar

`node docs/evidence/putaran-2/viz-1/measure.mjs` — 8 lebar (320 … 1920), 0
gagal: tidak ada label sumbu yang menggantung di luar sumbu, setiap periode
menempel pada barnya dan berada di dalam track, dan tidak ada halaman yang bisa
digeser mendatar. Angka: [`lebar.txt`](lebar.txt).

Label sumbu terakhir (`data-last`) sengaja dipaku ke ujung sumbu, bukan ke
posisi bulannya, karena teks di posisi 90,9% menggantung keluar di 1024px dan
di bawahnya.

## Potret

`node docs/evidence/putaran-2/viz-1/shoot.mjs <sebelum|sesudah>` dengan dev
server di 5173. Delapan berkas: 1440px dan 390px × terang dan gelap.

- [`sebelum/`](sebelum/) — `main` 9b7b4d8
- [`sesudah/`](sesudah/)

## Suite dan build

- `npx playwright test`: **200 passed**, 3,7 menit, 4 project. [`full-suite.txt`](full-suite.txt)
- `npm run build`: exit 0, 4579 modul. [`build.txt`](build.txt)

## Sisa yang jujur

Anotasi pita di mobile (<=390px) sedikit lebih lebar daripada pitanya sendiri,
jadi teksnya melewati garis tepi pita. Terbaca, tapi belum rapi; kandidat
BLOK D.
