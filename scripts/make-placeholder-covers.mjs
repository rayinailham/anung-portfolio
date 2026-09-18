// Temporary evidence-slot covers: flat brand-colour geometry, no image model.
// They exist so the gallery, its intrinsic sizes and its tests have real files
// to work against before IMG-1 delivers the editorial covers.
//
// This is NOT part of `prepare-assets.mjs` on purpose: once IMG-1 replaces the
// PNGs in `assets/source/placeholder/`, re-running the build must not overwrite
// them. Run this by hand only if the flat covers need to be regenerated.
//
// Usage: node scripts/make-placeholder-covers.mjs
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const BORDO = '#6C151E', GREEN = '#0F3D3A', CREAM = '#F5DABF';
const W = 1200, H = 900;

const covers = {
  'konten-sosial': `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="${CREAM}"/>
    <circle cx="430" cy="470" r="250" fill="${BORDO}"/>
    <circle cx="720" cy="360" r="170" fill="${GREEN}" fill-opacity="0.92"/>
    <rect x="760" y="560" width="300" height="86" rx="43" fill="${BORDO}" fill-opacity="0.78"/>
    <rect x="140" y="128" width="190" height="24" rx="12" fill="${GREEN}"/>
  </svg>`,
  'video-produk': `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="${GREEN}"/>
    <path d="M0 620 C 300 470, 620 780, 1200 560 L1200 900 L0 900 Z" fill="${CREAM}" fill-opacity="0.93"/>
    <circle cx="820" cy="300" r="196" fill="${CREAM}" fill-opacity="0.16"/>
    <circle cx="410" cy="330" r="132" fill="${BORDO}"/>
    <rect x="612" y="118" width="26" height="330" rx="13" fill="${CREAM}" fill-opacity="0.55"/>
  </svg>`,
  'webinar-b2b': `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="${BORDO}"/>
    <circle cx="600" cy="900" r="700" fill="none" stroke="${CREAM}" stroke-opacity="0.22" stroke-width="34"/>
    <circle cx="600" cy="900" r="500" fill="none" stroke="${CREAM}" stroke-opacity="0.34" stroke-width="34"/>
    <circle cx="600" cy="900" r="300" fill="none" stroke="${CREAM}" stroke-opacity="0.5" stroke-width="34"/>
    <circle cx="600" cy="300" r="118" fill="${GREEN}"/>
    <circle cx="600" cy="300" r="52" fill="${CREAM}"/>
  </svg>`,
};

await mkdir('assets/source/placeholder', { recursive: true });
for (const [slot, svg] of Object.entries(covers)) {
  await sharp(Buffer.from(svg)).png().toFile(`assets/source/placeholder/${slot}.png`);
}
console.log(`Wrote ${Object.keys(covers).length} flat placeholder sources. Run prepare-assets.mjs to encode the WebP files.`);
