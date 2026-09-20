import sharp from 'sharp';
import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Run from the project root. No image model; only crop, resize and composition.
const dir = 'docs/evidence/kirim-img-2';
const crop = { left: 740, top: 1995, width: 630, height: 994 };
const portrait = await sharp('anung_profile.jpeg').extract(crop).resize(308, 486).png().toBuffer();
const font = await readFile('node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2');
const browser = await chromium.launch({ headless: true });
let layer;
try {
  const page = await browser.newPage();
  layer = await page.evaluate(async (font64) => {
    const font = new FontFace('Manrope', `url(data:font/woff2;base64,${font64})`, { weight: '200 800' });
    document.fonts.add(await font.load());
    await document.fonts.ready;
    const canvas = document.createElement('canvas');
    canvas.width = 1200; canvas.height = 630;
    const ctx = canvas.getContext('2d');
    const bounds = [];
    for (const [text, size, weight, x, y, color] of [
      ['Anung Hanindhita', 64, 750, 72, 215, '#6C151E'],
      ['Ramadhan', 64, 750, 72, 294, '#6C151E'],
      ['Afiliasi & Pemasaran Digital', 30, 550, 72, 371, '#6C151E'],
      ['Lulusan Bisnis, IPB University', 24, 500, 72, 505, '#0F3D3A'],
    ]) {
      ctx.font = `${weight} ${size}px Manrope`;
      ctx.fillStyle = color;
      const m = ctx.measureText(text);
      const box = { text, size, weight, color, left: x - m.actualBoundingBoxLeft, top: y - m.actualBoundingBoxAscent, right: x + m.actualBoundingBoxRight, bottom: y + m.actualBoundingBoxDescent };
      if (box.left < 60 || box.top < 60 || box.right > 1140 || box.bottom > 570) throw Error('Unsafe text margin');
      if (box.right > 775) throw Error('Text overlaps portrait');
      bounds.push(box);
      ctx.fillText(text, x, y);
    }
    return { png: canvas.toDataURL('image/png').split(',')[1], bounds, fontLoaded: document.fonts.check('750 64px Manrope') };
  }, font.toString('base64'));
} finally { await browser.close(); }
const green = await sharp({ create: { width: 56, height: 7, channels: 3, background: '#0F3D3A' } }).png().toBuffer();
const png = await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#F5DABF' } })
  .composite([{ input: green, left: 72, top: 72 }, { input: portrait, left: 820, top: 72 }, { input: Buffer.from(layer.png, 'base64'), left: 0, top: 0 }])
  .png({ compressionLevel: 9 }).toBuffer();
await writeFile('assets/source/og-cover.png', png);
await writeFile('public/images/og-cover.png', png);
await sharp(png).resize({ width: 320 }).png().toFile(`${dir}/preview-320.png`);
const lum = hex => {
  const v = hex.match(/[a-f\d]{2}/gi).map(c => parseInt(c, 16) / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
  return .2126*v[0] + .7152*v[1] + .0722*v[2];
};
const contrasts = ['#6C151E', '#0F3D3A'].map(color => ({ foreground: color, background: '#F5DABF', ratio: (lum('#F5DABF') + .05) / (lum(color) + .05) }));
if (contrasts.some(c => c.ratio < 4.5)) throw Error('Contrast below AA');
const extracted = await sharp(png).extract({ left: 820, top: 72, width: 308, height: 486 }).removeAlpha().raw().toBuffer();
const originalCrop = await sharp(portrait).removeAlpha().raw().toBuffer();
if (!extracted.equals(originalCrop)) throw Error('Portrait pixels changed in composition');
const metadata = await sharp(png).metadata();
if (metadata.format !== 'png' || metadata.width !== 1200 || metadata.height !== 630 || png.length >= 1_000_000) throw Error('Invalid PNG contract');
const metrics = { image: { format: metadata.format, width: metadata.width, height: metadata.height, bytes: png.length, sha256: createHash('sha256').update(png).digest('hex') }, sourcePhotoSha256: createHash('sha256').update(await readFile('anung_profile.jpeg')).digest('hex'), crop, placement: { left: 820, top: 72, width: 308, height: 486 }, portraitPixelExact: true, imageModelUsed: false, fontLoaded: layer.fontLoaded, textBounds: layer.bounds, contrasts };
await writeFile(`${dir}/metrics.json`, JSON.stringify(metrics, null, 2) + '\n');
console.log(JSON.stringify(metrics, null, 2));
