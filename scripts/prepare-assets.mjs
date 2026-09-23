import sharp from 'sharp';
import { copyFile, mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);

// Covers for evidence slots whose real material is not published yet. They are
// abstract brand-colour blocks, never a mock-up of real work. IMG-1 replaces
// both the source PNG and the WebP at the same paths.
const placeholderSlots = ['konten-sosial', 'video-produk', 'webinar-b2b'];

const CV_PDF = 'Anung Hanindhita Ramadhan-CV.pdf';
// Page images are a rendering of that same PDF, never a redrawn or edited
// version of it. 1000 px wide keeps A4 body text readable without shipping a
// 200 KB file per page; the PDF itself stays the downloadable original.
const CV_PAGE_WIDTH = 1000;
const CV_PAGE_WIDTHS = [400, 660, CV_PAGE_WIDTH];

// One table for every responsive image on the site. `out` is the canonical path
// the markup keeps in `src`, `widths` are the widths actually encoded for the
// box that image is displayed in, and the largest width IS the canonical file —
// no width is ever written twice. This script is the only writer of the
// variants and of `src/image-manifest.json`, so the markup can never advertise
// a width nobody encoded.
const responsive = [
  { source: 'anung_profile.jpeg', out: 'images/anung-profile.webp', widths: [320, 440, 640, 900], quality: 83 },
  { source: 'with_anymind_team.jpg', out: 'images/anymind-pantene-team.webp', widths: [400, 640, 900, 1200], quality: 82 },
  { source: 'assets/source/connections.png', out: 'images/connections.webp', widths: [400, 640, 900, 1200], quality: 82 },
  { source: 'assets/source/konten-sosial.jpg', out: 'images/konten-sosial.webp', widths: [320, 480, 720, 1200], quality: 82 },
  { source: 'assets/source/video-produk.jpg', out: 'images/video-produk.webp', widths: [320, 480, 720, 1200], quality: 82 },
  { source: 'assets/source/webinar-b2b.jpg', out: 'images/webinar-b2b.webp', widths: [320, 480, 720, 1200], quality: 82 },
  ...placeholderSlots.map(slot => ({
    source: `assets/source/placeholder/${slot}.png`,
    out: `images/placeholder/${slot}.webp`,
    widths: [320, 480, 720, 1200],
    quality: 82,
  })),
];

// AVIF is offered first and WebP second; a browser that decodes neither still
// gets the canonical WebP from the <img> itself.
const AVIF_QUALITY = 52;

async function encode(source, out, widths, quality) {
  const base = out.replace(/\.webp$/, '');
  const largest = Math.max(...widths);
  const { width: sourceWidth } = await sharp(source).metadata();
  if (sourceWidth < largest) throw new Error(`${source} hanya ${sourceWidth}px, tidak cukup untuk varian ${largest}px.`);
  await mkdir(dirname(`public/${out}`), { recursive: true });
  const webp = [];
  const avif = [];
  for (const width of widths) {
    const webpPath = width === largest ? out : `${base}-${width}.webp`;
    const avifPath = `${base}-${width}.avif`;
    await sharp(source).resize({ width }).webp({ quality }).toFile(`public/${webpPath}`);
    await sharp(source).resize({ width }).avif({ quality: AVIF_QUALITY }).toFile(`public/${avifPath}`);
    webp.push(`/${webpPath} ${width}w`);
    avif.push(`/${avifPath} ${width}w`);
  }
  return [`/${out}`, { widths, avif: avif.join(', '), webp: webp.join(', ') }];
}

// Renders every page of the real CV to public/images/cv-halaman-<n>.webp.
// Needs poppler's pdftoppm, and only here — the site build never shells out.
// The intermediate PNGs are pure derivatives of a tracked PDF, so they live in
// a temporary directory instead of assets/source/.
async function renderCvPages() {
  let pdftoppm = true;
  try { await run('pdftoppm', ['-v']); } catch (error) { pdftoppm = error.code !== 'ENOENT'; }
  if (!pdftoppm) throw new Error('pdftoppm (poppler) tidak ditemukan. Pasang poppler untuk merender halaman CV.');
  const scratch = await mkdtemp(join(tmpdir(), 'anung-cv-'));
  try {
    await run('pdftoppm', ['-png', '-r', '150', CV_PDF, join(scratch, 'halaman')]);
    const pages = (await readdir(scratch)).filter(name => name.endsWith('.png')).sort();
    const entries = [];
    for (const [index, name] of pages.entries()) {
      entries.push(await encode(join(scratch, name), `images/cv-halaman-${index + 1}.webp`, CV_PAGE_WIDTHS, 82));
    }
    return entries;
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
}

await mkdir('public/images', { recursive: true });
await mkdir('public/images/placeholder', { recursive: true });
await mkdir('public/documents', { recursive: true });

const manifest = Object.fromEntries([
  ...await Promise.all(responsive.map(item => encode(item.source, item.out, item.widths, item.quality))),
  ...await renderCvPages(),
]);
await writeFile('src/image-manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
await copyFile(CV_PDF, 'public/documents/anung-ramadhan-cv.pdf');

const variants = Object.values(manifest).reduce((total, entry) => total + entry.widths.length * 2, 0);
const cvPages = Object.keys(manifest).filter(path => path.startsWith('/images/cv-halaman-')).length;
console.log(`Prepared ${Object.keys(manifest).length} responsive images (${variants} AVIF + WebP files), ${placeholderSlots.length} placeholder covers, ${cvPages} CV page previews, and the CV download. Original files preserved.`);
console.log('src/image-manifest.json rewritten: every srcset in the markup comes from that file.');
console.log(`If the CV gained or lost a page, update cvPreview in src/data.js to match the ${cvPages} rendered pages.`);
