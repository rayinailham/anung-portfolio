// Rasio kontras setiap pasangan warna yang berubah di VIZ-1.
// Warna diambil dari token :root di src/styles.css, bukan diketik ulang.
// Pakai: node docs/evidence/putaran-2/viz-1/contrast.mjs
const hex = (value) => value.replace('#', '').match(/../g).map(part => parseInt(part, 16));
const channel = (value) => { const c = value / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const luminance = (rgb) => 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
const ratio = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const over = (front, back, alpha) => front.map((value, index) => Math.round(value * alpha + back[index] * (1 - alpha)));

const THEMES = {
  terang: { paper: '#f5dabf', ink: '#6c151e', muted: '#75463c', green: '#0f3d3a' },
  gelap: { paper: '#102e2b', ink: '#f5dabf', muted: '#cfb9a5', green: '#7fb3a8' },
};

const rows = [];
for (const [theme, token] of Object.entries(THEMES)) {
  const paper = hex(token.paper);
  const ink = hex(token.ink);
  const band = over(hex(token.green), paper, 0.12);
  rows.push([theme, '.timeline-period di atas .timeline-bar-fill', 'var(--paper) / var(--ink)', ratio(hex(token.paper), ink), 4.5]);
  rows.push([theme, '.timeline-band-note di atas pita overlap', 'var(--green) / var(--green) 12% + var(--paper)', ratio(hex(token.green), band), 4.5]);
  rows.push([theme, '.timeline-period di bawah bar (<=767px) di atas halaman', 'var(--ink) / var(--paper)', ratio(ink, paper), 4.5]);
  rows.push([theme, '.timeline-period di bawah bar (<=767px) di atas pita overlap', 'var(--ink) / var(--green) 12% + var(--paper)', ratio(ink, band), 4.5]);
  rows.push([theme, '.timeline-tick di atas halaman', 'var(--muted) / var(--paper)', ratio(hex(token.muted), paper), 4.5]);
  rows.push([theme, '.timeline-bar-fill di atas halaman', 'var(--ink) / var(--paper)', ratio(ink, paper), 3]);
  rows.push([theme, 'garis tepi pita overlap di atas halaman', 'var(--green) / var(--paper)', ratio(hex(token.green), paper), 3]);
}

let failed = 0;
console.log('| Tema | Pasangan | Token | Rasio | Ambang | Hasil |');
console.log('|---|---|---|---|---|---|');
for (const [theme, label, token, value, threshold] of rows) {
  const pass = value >= threshold;
  if (!pass) failed++;
  console.log(`| ${theme} | ${label} | ${token} | ${value.toFixed(3).replace('.', ',')}:1 | ${threshold.toString().replace('.', ',')}:1 | ${pass ? 'LOLOS' : 'GAGAL'} |`);
}
console.log(`\n${rows.length} pasangan diperiksa, ${failed} gagal.`);
process.exit(failed ? 1 : 0);
