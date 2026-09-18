import sharp from 'sharp';
import { copyFile, mkdir } from 'node:fs/promises';

await mkdir('public/images', { recursive: true });
await mkdir('public/documents', { recursive: true });
await sharp('anung_profile.jpeg').resize({ width: 900 }).webp({ quality: 83 }).toFile('public/images/anung-profile.webp');
await sharp('assets/source/connections.png').resize({ width: 1200 }).webp({ quality: 82 }).toFile('public/images/connections.webp');
await copyFile('Anung Hanindhita Ramadhan-CV.pdf', 'public/documents/anung-ramadhan-cv.pdf');
console.log('Prepared portrait, decorative illustration, and CV. Original files preserved.');
