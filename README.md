# Anung Ramadhan Portfolio

Personal portfolio based on the supplied CV, portrait, and color palette. Indonesian copy; React + Vite, GSAP + ScrollTrigger, and Lenis.

## Run

Node.js 24 and npm were used for development.

```sh
npm ci
npm run dev
```

Open http://localhost:5173. Production build: `npm run build`. Preview: `npm run preview`.

## Pages and interactions

- Beranda: first-session splash with skip button, availability badge, staggered headline reveal, portrait wipe-in and tilt, magnetic CTA, scroll cue, directional scroll reveals, image wipes, parallax, metric counters, and one skills strip whose speed follows scroll velocity.
- Pengalaman: three CV-backed work entries, category filters, contribution disclosures, and organization experience.
- Tentang: biography, education, GPA, capabilities, language proficiency, and the CV readable inline as page images next to the download button.
- Kontak: copy email, WhatsApp with a prefilled Indonesian greeting, LinkedIn, telephone link, and a validated contact form with real sending, loading, success and failure states.
- GSAP curtain transitions between pages, browser back/forward, page focus management, mobile menu, persistent light/dark themes, a scroll progress bar, and downloadable original CV.

Motion is declared in the markup and read by `src/motion.js`:

| Attribute | Effect |
|---|---|
| `data-reveal="up\|down\|left\|right\|zoom\|fade"` | one element enters from that direction on scroll |
| `data-reveal-group="<direction>"` | the element's direct children enter staggered |
| `data-reveal-delay="<seconds>"` | offsets a single reveal |
| `data-mask` | clip-path wipe upward, with the picture inside settling back to its resting scale |
| `data-parallax`, `data-spin`, `data-count` | scrubbed drift, scrubbed rotation, counted number |

Sideways offsets are halved below 768px and both `html` and `body` use `overflow-x: clip`, so no reveal can widen the document. Every reveal ends with `clearProps`, so the settled page carries no inline motion styles.
- Lenis smooth scrolling on pointer devices; native touch scrolling. Reduced-motion preferences disable smooth scrolling and decorative animation. No cursor replacement or scroll hijacking.

## Configuration

Both settings are optional; the site builds and runs without either. Copy `.env.example` to `.env.local` and fill it in. `.gitignore` closes every `.env*` except the example, so no key is ever committed.

| Variable | Effect when set | Effect when empty |
|---|---|---|
| `VITE_WEB3FORMS_KEY` | The contact form POSTs to `https://api.web3forms.com/submit` and reports a real send, a real failure, or a loading state. | No backend. The button says "Buka draf email" and opens a `mailto:` draft, and the copy says exactly that. |
| `VITE_SITE_URL` | `<link rel="canonical">`, `og:url`, `og:image` and `twitter:image` use that absolute origin. | The same tags use the reserved placeholder host `https://anung-ramadhan.example` and `npm run build` prints a warning. |

A Web3Forms access key is a public submission key by design — it travels in the browser bundle, like a Formspree endpoint. It is still kept out of the repository so the deployed key can be rotated or replaced without a commit. Do not put any other credential in these variables.

`src/site.js` is the single source for the site URL, the share-card metadata, the form endpoint and the WhatsApp link. `vite.config.js` renders the head tags from it at build time through the `anung-site-meta` plugin, and `index.html` carries only a `<!--site-meta-->` marker, so no URL or description is written twice.

## Contact form

With no key, the form opens the visitor's email application using `mailto:` and does not send or store anything — the copy says so. With a key, submitting POSTs the message to Web3Forms, which forwards it to Anung's inbox; nothing is stored by this site. A send that fails, for any reason including a dead network, says the message was not sent and offers the same `mailto:` draft, with what the visitor typed still in the form. Spam protection is an off-screen honeypot field, not a CAPTCHA: a submission with that field filled is silently dropped. No analytics and no server of our own are involved either way.


## Edit content

- `src/data.js`: verified profile details, work history, organizations, skills, CV page previews.
- `src/site.js`: site URL, share-card metadata, contact endpoint, WhatsApp link.
- `src/App.jsx`: page structure, editorial copy, routing, and contact form.
- `src/motion.js`: animation lifecycle and Lenis integration.
- `src/styles.css`: responsive layout and theme tokens.
- `public/documents/anung-ramadhan-cv.pdf`: downloadable CV.
- `public/images/cv-halaman-*.webp`: page renderings of that same PDF, shown inline on Tentang.

Brand colors follow the supplied reference: bordo `#6C151E`, green `#0F3D3A`, cream `#F5DABF`. Typography is self-hosted Manrope. Design-taste-frontend informed the asymmetric layout; emil-design-eng informed motion timing, interaction feedback, and reduced-motion behavior.

The sculpture image is a decorative AI-generated illustration, not client work or campaign evidence. See `docs/asset-provenance.md`. Profile photos and CV are supplied assets. No campaign results or revenue claims were invented. The combined 150 affiliates in the coordination role are the 100 Shopee + 50 TikTok affiliates listed in the CV; this is not a deduplicated count of individuals.

Regenerate optimized images after changing source assets:

```sh
node scripts/prepare-assets.mjs
```

That script also re-renders the CV page previews from the PDF and needs poppler's `pdftoppm` on `PATH`. It is the only step that shells out; `npm run build` never does.

## Verification

```sh
npm run build
npx playwright install chromium firefox webkit
npm test
```

On Arch, do not run `playwright install-deps`: use the machine's `arch-playwright-provision` skill for the WebKit user-space libraries. Keep existing browser revisions needed by MCP tools. See `docs/env-check.md` for the local verification environment.

The tests cover navigation/history, filters/disclosures, theme persistence, real PDF content, contact validation, the contact form's send/failure/honeypot paths, the WhatsApp handoff, the served share metadata, the inline CV preview, keyboard and reduced motion, mobile menu, responsive overflow, loaded images, and unknown routes.

`npm test` starts two dev servers: 5173 with no Web3Forms key, for the `mailto:` fallback, and 5174 with a fake key, for the backend path with the request intercepted. Both keys are set explicitly in `playwright.config.js`, so a local `.env` cannot change what the suite tests. `docs/lighthouse-mobile.json` is a production-build lab audit, not a claim about field performance.

Verified on 2026-09-18: build passed; 9 scenarios passed across Chromium desktop, Chromium mobile emulation, Firefox, and WebKit (36 distinct cases, run in two batches). Browser tests use emulation, not physical phones.

The motion rework was additionally checked with a direct instrumented run against the production build in Chromium, Firefox, and WebKit: the page curtain travels 110% down to 0 and on to -110% with no stall; the intro lifts while the hero is still animating, so the settled hero is never painted and then re-animated; after scrolling each route end to end, no revealed element is left below full opacity; horizontal overflow is 0 at every route; and no page or console errors were raised. The skills strip was measured separately: it drifts at about 75 px/s at rest, speeds up while the page is scrolling, and returns to resting speed once scrolling stops.

Final production mobile Lighthouse audit (`docs/lighthouse-mobile.json`): performance 93, accessibility 100, best practices 100, SEO 100; LCP 2.9 seconds, CLS 0.008, TBT 110 ms. LCP remains above the 2.5-second target under this simulated mobile run. It is 0.2 seconds slower than the previous audit because the hero copy is now held hidden until the intro lifts instead of being painted behind the opaque splash; for a visitor who has already seen the intro this session, measured LCP is about 0.4 seconds. Scores vary with machine load. Screenshots are in `docs/*-preview.png`.

## Publishing

`dist/` is the static deployment artifact. Hash routes (`/#/pengalaman`, `/#/tentang`, `/#/kontak`) work on static hosts without rewrite rules. Individual hash pages share the site's entry document; they are not independent server-rendered SEO pages. Set `VITE_SITE_URL` before building for a real domain; otherwise the canonical and Open Graph URLs point at the placeholder host. `og:image` expects `public/images/og-cover.png` (1200 × 630), which is not produced yet — see `docs/image-jobs/IMG-2-og-image.md`. No deployment has been performed.
