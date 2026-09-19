import sharp from 'sharp';
import { copyFile, mkdir, mkdtemp, readdir, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
    for (const [index, name] of pages.entries()) {
      await sharp(join(scratch, name)).resize({ width: CV_PAGE_WIDTH }).webp({ quality: 82 })
        .toFile(`public/images/cv-halaman-${index + 1}.webp`);
    }
    return pages.length;
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
}

await mkdir('public/images', { recursive: true });
await mkdir('public/images/placeholder', { recursive: true });
await mkdir('public/documents', { recursive: true });
await sharp('anung_profile.jpeg').resize({ width: 900 }).webp({ quality: 83 }).toFile('public/images/anung-profile.webp');
await sharp('with_anymind_team.jpg').resize({ width: 1200 }).webp({ quality: 82 }).toFile('public/images/anymind-pantene-team.webp');
await sharp('assets/source/connections.png').resize({ width: 1200 }).webp({ quality: 82 }).toFile('public/images/connections.webp');
for (const slot of placeholderSlots) {
  await sharp(`assets/source/placeholder/${slot}.png`).resize({ width: 1200 }).webp({ quality: 82 }).toFile(`public/images/placeholder/${slot}.webp`);
}
const cvPages = await renderCvPages();
await copyFile(CV_PDF, 'public/documents/anung-ramadhan-cv.pdf');
console.log(`Prepared portrait, AnyMind x Pantene team photo, decorative illustration, ${placeholderSlots.length} placeholder covers, ${cvPages} CV page previews, and CV. Original files preserved.`);
console.log(`If the CV gained or lost a page, update cvPreview in src/data.js to match the ${cvPages} rendered pages.`);
