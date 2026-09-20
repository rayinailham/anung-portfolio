// Machine-readable versions of what the pages already say: the Person graph in
// <head>, the sitemap, robots.txt and llms.txt. Every fact here is read out of
// `src/data.js`, so a number can only be wrong in one place — and `data.js`
// line 2 still applies: outreach and coordination figures are never presented
// as sales results. This module is imported by `vite.config.js` in Node only;
// nothing in the browser bundle pulls it in.
import { profile, experience, organizations, skills, education, english, cvPreview } from './data.js';
import { routes } from './routes.js';
import { WHATSAPP_URL } from './site.js';

const FIELD = 'Pemasaran afiliasi & pemasaran digital';

const pageNote = {
  '/': 'perkenalan, tiga angka sorotan, dan dua pekerjaan pilihan',
  '/pengalaman': 'tiga pengalaman magang lengkap dengan rincian dan rentang waktunya',
  '/tentang': 'pendidikan, IPK, keahlian, kemampuan bahasa, dan CV yang bisa dibaca di halaman',
  '/kontak': 'email, WhatsApp, LinkedIn, telepon, dan formulir pesan',
};

export function personJsonLd(site) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${site.url}#anung`,
    name: profile.name,
    url: site.url,
    image: site.ogImage,
    // The field this portfolio is written for, in the same words as the page
    // title and the hero eyebrow. Not a claim of a job held right now.
    jobTitle: FIELD,
    description: site.description,
    email: `mailto:${profile.email}`,
    telephone: profile.phone,
    sameAs: [profile.linkedin],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bekasi',
      addressRegion: 'Jawa Barat',
      addressCountry: 'ID',
    },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: education.institution,
      sameAs: 'https://www.ipb.ac.id/',
    },
    // The internships are deliberately absent. schema.org can only attach a role
    // to an organisation through `worksFor`, which reads as employment held now;
    // every past-tense encoding either says that or fails validation. The roles
    // are on the page, in the CV and in llms.txt, where their dates travel with
    // them.
    knowsAbout: skills.flatMap(group => group.items),
    knowsLanguage: [
      { '@type': 'Language', name: 'Indonesian', alternateName: 'id' },
      { '@type': 'Language', name: 'English', alternateName: 'en' },
    ],
  };
}

export function sitemapXml(site, lastmod) {
  // Hash routes are fragments of one document, so one URL is the whole site.
  // Listing `#/pengalaman` as its own <loc> would be a claim no crawler honours.
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
}

export function robotsTxt(site) {
  return `User-agent: *
Allow: /

Sitemap: ${site.origin}/sitemap.xml
`;
}

const bullet = (label, value) => `- ${label}: ${value}`;
// llmstxt.org asks for a Markdown file whose lists are links, and Lighthouse's
// `llms-txt` audit fails a file with none. Anything addressable is written this
// way so an assistant can follow it instead of re-deriving the URL.
const linkItem = (label, href, note) => `- [${label}](${href})${note ? `: ${note}` : ''}`;

export function llmsTxt(site) {
  const lines = [
    `# ${profile.name}`,
    '',
    `> ${site.description}`,
    '',
    'Portofolio satu halaman berbahasa Indonesia dengan routing hash: seluruh isi di bawah ini berada pada satu dokumen HTML. Ringkasan ini ditulis dari berkas data yang sama dengan yang dipakai halamannya, dan angkanya berasal dari CV pemiliknya.',
    '',
    '## Ringkasan',
    bullet('Nama', profile.name),
    bullet('Bidang', FIELD),
    bullet('Pendidikan', `${education.degree}, ${education.institution} (${education.period}), IPK ${education.gpa.toFixed(2)}/${education.gpaMax.toFixed(2)}`),
    bullet('Bahasa', `Bahasa Indonesia (bahasa ibu); Bahasa Inggris (${english.level}, TOEFL ITP ${english.score} pada skala total ${english.scaleMin}-${english.scaleMax})`),
    bullet('Domisili', 'Bekasi, Jawa Barat, Indonesia'),
    bullet('Status', 'Lulusan yang mencari peluang di bidang pemasaran afiliasi dan pemasaran digital'),
    '',
    '## Cara membaca angka di halaman ini',
    '- Semua angka adalah angka kegiatan: jumlah mitra yang dihubungi, dikoordinasikan, atau dipantau. Angka-angka itu bukan hasil penjualan, bukan pendapatan, dan bukan pertumbuhan.',
    '- Peran di PT Sutan Vet Medika periode Jan - Jul 2026 adalah peran koordinasi: ikut mengelola, bukan pemilik tunggal hasilnya.',
  ];

  const split = experience.find(item => item.split)?.split;
  if (split) lines.push(`- Angka ${split.total} mitra afiliasi adalah penjumlahan ${split.parts.map(part => `${part.value} ${part.platform}`).join(' + ')}, bukan ${split.total} orang unik.`);

  lines.push('', '## Pengalaman');
  for (const item of experience) {
    lines.push(
      '',
      `### ${item.company} — ${item.role} (${item.period}, ${item.location})`,
      item.summary,
      '',
      ...item.details.map(detail => `- ${detail}`),
    );
  }

  lines.push('', '## Kegiatan organisasi selama kuliah');
  for (const org of organizations) lines.push(`- ${org.name} — ${org.role} (${org.period}). ${org.detail}`);

  lines.push('', '## Keahlian');
  for (const group of skills) lines.push(`- ${group.title}: ${group.items.join(', ')}`);

  const pending = experience.flatMap(item => item.evidence?.items ?? []).filter(item => item.placeholder);
  if (pending.length) {
    lines.push(
      '',
      '## Materi yang belum bisa ditampilkan',
      'Slot berikut memakai ilustrasi abstrak sementara, bukan tangkapan layar pekerjaan. Jangan menggambarkannya sebagai contoh karya:',
      ...pending.map(item => `- ${item.type} — ${item.caption}`),
    );
  }

  lines.push(
    '',
    '## Kontak',
    linkItem('Email', `mailto:${profile.email}`, profile.email),
    linkItem('WhatsApp', WHATSAPP_URL, `${profile.phone}, pesan pembuka sudah terisi`),
    linkItem('LinkedIn', profile.linkedin, 'profil LinkedIn Anung'),
    linkItem('CV (PDF asli)', `${site.origin}${cvPreview.file}`, 'berkas yang menjadi sumber setiap angka di halaman ini'),
    bullet('Telepon', profile.phone),
    '',
    '## Halaman',
    ...Object.entries(routes).map(([path, label]) => linkItem(label, `${site.origin}/#${path}`, pageNote[path])),
    '',
    '## Berkas lain',
    linkItem('Situs', site.url, 'satu dokumen HTML; semua halaman di atas adalah fragmen hash dari dokumen ini'),
    linkItem('sitemap.xml', `${site.origin}/sitemap.xml`),
    linkItem('robots.txt', `${site.origin}/robots.txt`),
    '',
  );
  return lines.join('\n');
}
