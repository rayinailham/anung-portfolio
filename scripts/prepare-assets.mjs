import sharp from 'sharp';
import { copyFile, mkdir } from 'node:fs/promises';

// Covers for evidence slots whose real material is not published yet. They are
// abstract brand-colour blocks, never a mock-up of real work. IMG-1 replaces
// both the source PNG and the WebP at the same paths.
const placeholderSlots = ['konten-sosial', 'video-produk', 'webinar-b2b'];

await mkdir('public/images', { recursive: true });
await mkdir('public/images/placeholder', { recursive: true });
await mkdir('public/documents', { recursive: true });
await sharp('anung_profile.jpeg').resize({ width: 900 }).webp({ quality: 83 }).toFile('public/images/anung-profile.webp');
await sharp('with_anymind_team.jpg').resize({ width: 1200 }).webp({ quality: 82 }).toFile('public/images/anymind-pantene-team.webp');
await sharp('assets/source/connections.png').resize({ width: 1200 }).webp({ quality: 82 }).toFile('public/images/connections.webp');
for (const slot of placeholderSlots) {
  await sharp(`assets/source/placeholder/${slot}.png`).resize({ width: 1200 }).webp({ quality: 82 }).toFile(`public/images/placeholder/${slot}.webp`);
}
await copyFile('Anung Hanindhita Ramadhan-CV.pdf', 'public/documents/anung-ramadhan-cv.pdf');
console.log(`Prepared portrait, AnyMind x Pantene team photo, decorative illustration, ${placeholderSlots.length} placeholder covers, and CV. Original files preserved.`);
