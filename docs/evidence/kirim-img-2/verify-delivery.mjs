import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdtemp, mkdir, cp, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { chromium, firefox, webkit } from '@playwright/test';

const dir = 'docs/evidence/kirim-img-2';
const result = { engines: {} };
for (const [name, engine] of Object.entries({ chromium, firefox, webkit })) {
  const browser = await engine.launch({ headless: true });
  result.engines[name] = browser.version();
  await browser.close();
}
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '5182', '--strictPort'], { stdio: 'ignore' });
const base = 'http://127.0.0.1:5182';
try {
  let response;
  for (let i = 0; i < 100; i++) {
    try { response = await fetch(base); break; } catch { await new Promise(r => setTimeout(r, 100)); }
  }
  if (!response?.ok) throw Error('Preview failed');
  const html = await response.text();
  const meta = Object.fromEntries([...html.matchAll(/<meta\s+(?:property|name)="(og:[^"]+|twitter:[^"]+)"\s+content="([^"]+)"/g)].map(m => [m[1], m[2]]));
  if (!meta['og:image']) throw Error('Missing image metadata');
  const imagePath = new URL(meta['og:image']).pathname;
  const imageResponse = await fetch(`${base}${imagePath}`);
  const body = Buffer.from(await imageResponse.arrayBuffer());
  const png = await readFile('public/images/og-cover.png');
  const hash = createHash('sha256').update(body).digest('hex');
  if (!imageResponse.ok || !imageResponse.headers.get('content-type')?.startsWith('image/png') || !body.equals(png)) throw Error('Delivered asset mismatch');
  if (meta['og:image:width'] !== '1200' || meta['og:image:height'] !== '630' || meta['og:image:type'] !== 'image/png' || meta['twitter:image'] !== meta['og:image']) throw Error('Metadata mismatch');
  result.delivery = { path: imagePath, status: imageResponse.status, contentType: imageResponse.headers.get('content-type'), bytes: body.length, sha256: hash, metadata: meta };
} finally {
  server.kill('SIGTERM');
  await new Promise(r => server.once('exit', r));
}
const clean = await mkdtemp(join(tmpdir(), 'anung-img-2-'));
try {
  for (const name of ['assets/source', 'public/images', dir]) await mkdir(join(clean, name), { recursive: true });
  await cp('anung_profile.jpeg', join(clean, 'anung_profile.jpeg'));
  await cp(`${dir}/compose-card.mjs`, join(clean, dir, 'compose-card.mjs'));
  await symlink(resolve('node_modules'), join(clean, 'node_modules'));
  const child = spawn(process.execPath, [join(dir, 'compose-card.mjs')], { cwd: clean, stdio: 'ignore' });
  const code = await new Promise(r => child.once('exit', r));
  if (code !== 0) throw Error(`Clean generation failed: ${code}`);
  const original = await readFile('public/images/og-cover.png');
  const regenerated = await readFile(join(clean, 'public/images/og-cover.png'));
  if (!original.equals(regenerated)) throw Error('Clean output differs');
  result.cleanReproduction = { exitCode: code, imageByteIdentical: true, dependencies: 'Installed node_modules reused; only original photograph and composition script copied.' };
} finally { await rm(clean, { recursive: true, force: true }); }
await writeFile(`${dir}/delivery.json`, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
