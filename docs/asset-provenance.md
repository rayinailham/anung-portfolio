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

### Current cover files — temporary, generated from brand tokens

- Generator: `sharp`, rendering a hand-written SVG of flat brand-colour geometry. No image model, no photography.
- Written by: the Kirim 2 session, so the layout, the intrinsic size attributes and the tests have real files to work against.
- Content: circles, bars, a wave and concentric rings in `#6C151E`, `#0F3D3A` and `#F5DABF`. No text, no logos, no faces, no interface, no data.
- Status: placeholder for a placeholder. `docs/image-jobs/IMG-1-bukti-placeholder.md` replaces all six files with editorial covers. The `placeholder: true` flag stays either way.

Reproducible with `node scripts/make-placeholder-covers.mjs`, which holds the SVG source for all three. It is deliberately not part of `prepare-assets.mjs`: once IMG-1 replaces the PNGs, a build must not overwrite them.

### Why a CSS block sits behind every cover

`.evidence-cover` paints a brand-colour gradient underneath the image, and a failed image load sets `data-missing="true"` and hides the `<img>`. The slot therefore stays correct — sized, captioned and flagged — with no image file present at all. Proven by `placeholder covers missing still leave the evidence slots correct` in `tests/portfolio.spec.js` and by `blockedPlaceholders` in `docs/evidence/kirim-2/metrics-after.json`.

## Swapping a placeholder for real material

1. Put the real file at the same `src` path listed in `src/data.js`, at 1200 × 900.
2. Delete `placeholder: true` from that slot in `src/data.js`.
3. Rewrite that slot's `caption` and `alt` to describe the real material.
4. Add a row to this file naming the source.

No JSX, CSS or test changes are required. The DOM shape, the intrinsic size attributes and the grid are identical either way.
