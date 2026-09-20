import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { buildSite } from './src/site.js';

// `index.html` carries one marker instead of a dozen hand-written meta tags.
// Title, description, Open Graph, Twitter and canonical all come from
// `src/site.js`, so the site URL is written in exactly one place.
const MARKER = '<!--site-meta-->';

const escape = (value) => String(value)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const headTags = (site) => [
  `<title>${escape(site.title)}</title>`,
  ...[
    ['name', 'description', site.description],
    ['property', 'og:site_name', site.siteName],
    ['property', 'og:title', site.title],
    ['property', 'og:description', site.socialDescription],
    ['property', 'og:type', 'website'],
    ['property', 'og:locale', 'id_ID'],
    ['property', 'og:url', site.url],
    ['property', 'og:image', site.ogImage],
    ['property', 'og:image:type', site.ogImageType],
    ['property', 'og:image:width', site.ogImageWidth],
    ['property', 'og:image:height', site.ogImageHeight],
    ['property', 'og:image:alt', site.ogImageAlt],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', site.title],
    ['name', 'twitter:description', site.socialDescription],
    ['name', 'twitter:image', site.ogImage],
    ['name', 'twitter:image:alt', site.ogImageAlt],
  ].map(([attribute, key, value]) => `<meta ${attribute}="${key}" content="${escape(value)}" />`),
  `<link rel="canonical" href="${escape(site.url)}" />`,
].join('\n    ');

export default defineConfig(({ mode }) => {
  const site = buildSite(loadEnv(mode, process.cwd(), 'VITE_'));
  if (site.urlIsPlaceholder) {
    console.warn(`[site-meta] VITE_SITE_URL belum diisi. og:url dan canonical memakai host placeholder ${site.origin}. Isi VITE_SITE_URL sebelum deploy.`);
  }
  return {
    plugins: [
      react(),
      {
        name: 'anung-site-meta',
        transformIndexHtml: {
          order: 'pre',
          handler(html) {
            if (!html.includes(MARKER)) throw new Error(`index.html kehilangan penanda ${MARKER}; tag sosial tidak bisa dipasang.`);
            return html.replace(MARKER, headTags(site));
          },
        },
      },
    ],
    server: { port: 5173, strictPort: true },
    build: { target: 'es2022' },
  };
});
