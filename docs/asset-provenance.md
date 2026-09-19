# Asset provenance

The supplied `anung_profile.jpeg`, `with_anymind_team.jpg` and `Anung Hanindhita Ramadhan-CV.pdf` remain unchanged. Photographs are resized and encoded as WebP for delivery; their visible framing uses CSS. Colors come from the supplied `color_palette.jpg`.

Every image the site ships is produced by `node scripts/prepare-assets.mjs`. Nothing under `public/images/` is hand-edited.

## Real photographs supplied by Anung

| Website asset | Source | Used for |
|---|---|---|
| `public/images/anung-profile.webp` | `anung_profile.jpeg` (root, unchanged) | Portrait. Beranda hero and Tentang, both at the same crop (`aspect-ratio: .9`, `object-position: 50% 100%`). |
| `public/images/anymind-pantene-team.webp` | `with_anymind_team.jpg` (root, unchanged) | Team photo at the AnyMind × Pantene New Product Launch. Beranda feature card and the evidence slot in the AnyMind entry on Pengalaman, both at `aspect-ratio: 4 / 3`, `object-position: 50% 50%`. |

Neither photo is presented as work Anung produced on his own. The team photo's caption names the event in the picture and states separately which event he coordinated, because they are not the same event.

No image is used twice with a different crop — enforced by `no image is reused with a different crop` in `tests/portfolio.spec.js` and recorded in `docs/evidence/kirim-2/metrics-after.json`.

## Decorative connections illustration

- Generator: built-in image generation tool.
- Source: `assets/source/connections.png`.
- Website asset: `public/images/connections.webp`.
- Purpose: decorative visual metaphor for collaboration. It is not represented as client campaign work.

Prompt used:

> Use case: stylized-concept. Asset type: decorative editorial illustration for a personal affiliate-marketing portfolio, NOT a real client campaign. Primary request: a sculptural still life of two interlinked oversized smooth tubular loops symbolizing human connections, one deep burgundy #6C151E, one forest green #0F3D3A, resting on a warm cream #F5DABF studio floor. Materials: beautifully matte lacquer with subtle realistic surface grain. Close-up editorial photography of a physical sculpture, art directed, cinematic soft side light and convincing shadows, restrained luxury. Composition: landscape 3:2, loops in center, generous surrounding breathing room. No text, logos, people, gradients, extra props or watermark.

## Evidence slot covers (placeholders)

The evidence gallery on Pengalaman is data-driven from `src/data.js`. A slot whose real material is not published yet keeps `placeholder: true`, renders `data-placeholder="true"` in the DOM, and carries a caption that says so in the visible copy — not in a `title` or `alt` attribute. Its `alt` describes the illustration as what it is, never the work that is not shown.

File contract, fixed before any image existed:

- raw source: `assets/source/placeholder/<slot-id>.png` — 1200 × 900 PNG
- website asset: `public/images/placeholder/<slot-id>.webp` — 1200 × 900 WebP, quality 82

| slot-id | claim it stands in for | source of the claim |
|---|---|---|
| `konten-sosial` | 4+ konten Instagram | CV, Digital Marketing Internship: "Produced 4+ Instagram publication contents" |
| `video-produk` | 3 video produk + video profil perusahaan | CV, Digital Marketing Internship: "Created 3 promotional product videos, a company profile video" |
| `webinar-b2b` | webinar B2B 15+ peserta | CV, Digital Marketing Internship: "Organized and executed a B2B webinar attended by 15+ participants" |

### Cover awal Kirim 2 — arsip metode, sudah diganti IMG-1

- Generator: `sharp`, rendering a hand-written SVG of flat brand-colour geometry. No image model, no photography.
- Written by: the Kirim 2 session, so the layout, the intrinsic size attributes and the tests have real files to work against.
- Content: circles, bars, a wave and concentric rings in `#6C151E`, `#0F3D3A` and `#F5DABF`. No text, no logos, no faces, no interface, no data.
- Status: keenam berkas telah diganti cover editorial IMG-1; rincian generator dan prompt aktual ada di bagian IMG-1 di bawah. Flag `placeholder: true` tetap berlaku.

Metode lama tersimpan di `scripts/make-placeholder-covers.mjs`. Jangan jalankan untuk membangun aset IMG-1 karena menimpa PNG editorial dengan geometri lama. Gunakan `scripts/prepare-assets.mjs` untuk mengonversi sumber PNG yang sekarang.

### Why a CSS block sits behind every cover

`.evidence-cover` paints a brand-colour gradient underneath the image, and a failed image load sets `data-missing="true"` and hides the `<img>`. The slot therefore stays correct — sized, captioned and flagged — with no image file present at all. Proven by `placeholder covers missing still leave the evidence slots correct` in `tests/portfolio.spec.js` and by `blockedPlaceholders` in `docs/evidence/kirim-2/metrics-after.json`.

## Swapping a placeholder for real material

1. Put the real file at the same `src` path listed in `src/data.js`, at 1200 × 900.
2. Delete `placeholder: true` from that slot in `src/data.js`.
3. Rewrite that slot's `caption` and `alt` to describe the real material.
4. Add a row to this file naming the source.

No JSX, CSS or test changes are required. The DOM shape, the intrinsic size attributes and the grid are identical either way.

## IMG-1 — Cover editorial abstrak (2026-09-19)

Generator: built-in `image_gen` (Codex), tiga panggilan terpisah. Ketiganya ilustrasi hasil mesin; bukan materi kampanye atau bukti kerja klien. `placeholder: true` dan caption tetap berlaku.

Keluaran asli generator 1448×1086 (4:3), dinormalisasi dengan sharp menjadi PNG 1200×900; WebP kualitas 82 mengikuti pipeline project. Tidak ada crop atau perubahan isi. Original generator tetap tersimpan di penyimpanan generator; sumber portabel ada di repo.

### konten-sosial

- Sumber: `assets/source/placeholder/konten-sosial.png` (1200×900).
- Aset situs: `public/images/placeholder/konten-sosial.webp` (1200×900).
- Tujuan: cover ilustrasi sementara untuk slot konten-sosial, tanpa mengklaim menampilkan materi asli.

Prompt persis:

```text
Use case: stylized-concept. Asset type: abstract editorial placeholder cover for a personal Indonesian marketing portfolio, explicitly NOT a screenshot and NOT real client work. Style: art-directed physical sculpture still-life photography, restrained luxury, matte lacquer with subtle realistic fine grain, soft cinematic side lighting from upper left, convincing soft shadows. Color palette: deep burgundy #6C151E, forest green #0F3D3A, warm cream #F5DABF, muted mint #7FB3A8. Landscape 4:3 composition, ideally 1200 x 900 pixels, generous breathing room with the sculpture safely inside the central 75 percent. One image only, no collage. Clearly abstract decorative objects. Absolutely no text or pseudo-text, letters, numerals, logos, brands, watermark, people, faces, silhouettes, animals, pets, product packaging, screens, window frames, cards, grids, user interface, buttons, play triangles, timelines, progress bars, chat bubbles, social media icons, charts, graphs, data, or trend arrows. Subject: five smooth thick circular discs in a calm rhythmic curved arrangement, like a sequence of rounded sculptural pebbles standing partly upright and leaning gently, graduated sizes, alternating burgundy and forest green with one muted mint accent. Backdrop: warm muted clay studio floor, darker and more terracotta than pale cream; seamless background. Metaphor: repetition and rhythm. Not a grid, not stacked cards.
```

### video-produk

- Sumber: `assets/source/placeholder/video-produk.png` (1200×900).
- Aset situs: `public/images/placeholder/video-produk.webp` (1200×900).
- Tujuan: cover ilustrasi sementara untuk slot video-produk, tanpa mengklaim menampilkan materi asli.

Prompt persis:

```text
Use case: stylized-concept. Asset type: abstract editorial placeholder cover for a personal Indonesian marketing portfolio, explicitly NOT a screenshot and NOT real client work. Style: art-directed physical sculpture still-life photography, restrained luxury, matte lacquer with subtle realistic fine grain, soft cinematic side lighting from upper left, convincing soft shadows. Color palette: deep burgundy #6C151E, forest green #0F3D3A, warm cream #F5DABF, muted mint #7FB3A8. Landscape 4:3 composition, ideally 1200 x 900 pixels, generous breathing room with the sculpture safely inside the central 75 percent. One image only, no collage. Clearly abstract decorative objects. Absolutely no text or pseudo-text, letters, numerals, logos, brands, watermark, people, faces, silhouettes, animals, pets, product packaging, screens, window frames, cards, grids, user interface, buttons, play triangles, timelines, progress bars, chat bubbles, social media icons, charts, graphs, data, or trend arrows. Subject: one continuous thick forest-green sculptural ribbon, a compact rounded end gradually elongating into a broad sweeping curved strip, resting on its side; one small burgundy sphere rests beside it. Backdrop: warm muted clay studio floor, darker and more terracotta than pale cream; seamless background. Metaphor: movement and sequence, a physical sculpture frozen mid-stretch. No arrow shape, no screen rectangle, no play triangle.
```

### webinar-b2b

- Sumber: `assets/source/placeholder/webinar-b2b.png` (1200×900).
- Aset situs: `public/images/placeholder/webinar-b2b.webp` (1200×900).
- Tujuan: cover ilustrasi sementara untuk slot webinar-b2b, tanpa mengklaim menampilkan materi asli.

Prompt persis:

```text
Use case: stylized-concept. Asset type: abstract editorial placeholder cover for a personal Indonesian marketing portfolio, explicitly NOT a screenshot and NOT real client work. Style: art-directed physical sculpture still-life photography, restrained luxury, matte lacquer with subtle realistic fine grain, soft cinematic side lighting from upper left, convincing soft shadows. Color palette: deep burgundy #6C151E, forest green #0F3D3A, warm cream #F5DABF, muted mint #7FB3A8. Landscape 4:3 composition, ideally 1200 x 900 pixels, generous breathing room with the sculpture safely inside the central 75 percent. One image only, no collage. Clearly abstract decorative objects. Absolutely no text or pseudo-text, letters, numerals, logos, brands, watermark, people, faces, silhouettes, animals, pets, product packaging, screens, window frames, cards, grids, user interface, buttons, play triangles, timelines, progress bars, chat bubbles, social media icons, charts, graphs, data, or trend arrows. Subject: a large smooth forest-green hemispherical dome, surrounded by a loose oval orbit of small warm cream spheres of varied sizes, with one muted mint sphere; an elevated three-quarter view makes the calm converging arrangement legible. Backdrop: matte deep burgundy studio floor and seamless background, softly illuminated so the outline of the green dome is distinct. Metaphor: gathering around a shared center. No heads, bodies, participants, grids, diagrams, or data.
```

