import { readFileSync } from 'node:fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { buildSite } from './src/site.js';
import { PORTRAIT_SRC, SIZES } from './src/image-sizes.js';
import { llmsTxt, personJsonLd, robotsTxt, sitemapXml } from './src/seo.js';

// `index.html` carries one marker instead of a dozen hand-written meta tags.
// Title, description, Open Graph, Twitter, canonical, the Person graph and the
// portrait preload all come from `src/site.js`, `src/seo.js` and the image
// manifest, so the site URL is written in exactly one place.
const MARKER = '<!--site-meta-->';

const images = JSON.parse(readFileSync(new URL('./src/image-manifest.json', import.meta.url), 'utf8'));

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
  // The portrait decides LCP on the landing page. The preload repeats the
  // <picture>'s own AVIF srcset and sizes exactly, so the browser preloads the
  // same file it would have picked and nothing is fetched twice. A browser
  // without AVIF ignores this because of `type` and loads WebP from the markup.
  `<link rel="preload" as="image" type="image/avif" imagesrcset="${escape(images[PORTRAIT_SRC].avif)}" imagesizes="${escape(SIZES.portrait)}" fetchpriority="high" />`,
  // Everything in this graph is read out of src/data.js by src/seo.js.
  `<script type="application/ld+json">${JSON.stringify(personJsonLd(site)).replace(/</g, '\\u003c')}</script>`,
].join('\n    ');

// robots.txt, sitemap.xml and llms.txt are written from the same site object as
// the canonical tag, so the domain can never disagree with itself. They are
// generated rather than kept in `public/` for exactly that reason, and the dev
// server serves the same bytes the build emits.
const documents = (site) => ({
  'robots.txt': { type: 'text/plain', body: robotsTxt(site) },
  'sitemap.xml': { type: 'application/xml', body: sitemapXml(site, new Date().toISOString().slice(0, 10)) },
  'llms.txt': { type: 'text/plain', body: llmsTxt(site) },
});

export default defineConfig(({ mode }) => {
  const site = buildSite(loadEnv(mode, process.cwd(), 'VITE_'));
  const docs = documents(site);
  if (site.urlIsPlaceholder) {
    console.warn(`[site-meta] VITE_SITE_URL belum diisi. og:url, canonical, sitemap.xml dan llms.txt memakai host placeholder ${site.origin}. Isi VITE_SITE_URL sebelum deploy.`);
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
        configureServer(server) {
          server.middlewares.use((request, response, next) => {
            const name = (request.url ?? '').split('?')[0].replace(/^\//, '');
            // `hasOwn`, not a truthiness check: a request for `/constructor`
            // would otherwise find something on Object.prototype and get served
            // a broken response instead of the app.
            if (!Object.hasOwn(docs, name)) return next();
            const doc = docs[name];
            response.setHeader('Content-Type', `${doc.type}; charset=utf-8`);
            response.end(doc.body);
          });
        },
        generateBundle() {
          for (const [fileName, doc] of Object.entries(docs)) this.emitFile({ type: 'asset', fileName, source: doc.body });
        },
      },
    ],
    server: { port: 5173, strictPort: true },
    build: { target: 'es2022' },
  };
});
