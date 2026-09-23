// Single source for everything outside the React tree reads about this site:
// the absolute URL, the share card, the contact endpoint, and the WhatsApp
// handoff. `vite.config.js` renders the head tags from `buildSite()` at build
// time, so no URL or description is ever written twice.
//
// The domain is not chosen yet. `VITE_SITE_URL` supplies it; without that env
// var the tags fall back to a reserved `.example` host that is obviously not a
// real address, and `urlIsPlaceholder` stays true so the build can say so.
import { profile } from './data.js';

export const SITE_URL_PLACEHOLDER = 'https://anung-portfolio.vercel.app';
export const FORM_ENDPOINT = 'https://api.web3forms.com/submit';

// wa.me wants the number without '+' or separators; profile.phone stays the
// only place the number itself is written down.
export const WHATSAPP_NUMBER = profile.phone.replace(/\D/g, '');
export const WHATSAPP_GREETING = 'Halo Anung, saya melihat portofolio Anda dan ingin berdiskusi soal peluang kerja.';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_GREETING)}`;

export function buildSite(env = {}) {
  const configured = String(env.VITE_SITE_URL ?? '').trim().replace(/\/+$/, '');
  const origin = configured || SITE_URL_PLACEHOLDER;
  return {
    origin,
    urlIsPlaceholder: configured === '',
    // Hash routes all share this one document, so the canonical and og:url are
    // the same address on every page.
    url: `${origin}/`,
    siteName: 'Anung Ramadhan',
    title: 'Anung Ramadhan | Afiliasi & Pemasaran Digital',
    description: 'Saya Anung, lulusan Bisnis IPB dengan pengalaman magang di AnyMind Group dan PT Sutan Vet Medika. Lihat pengalaman saya di bidang pemasaran afiliasi dan digital.',
    socialDescription: 'Pengalaman magang saya: mengelola mitra afiliasi, membantu kerja sama KOL, dan membuat konten. Lihat portofolio dan download CV saya di sini.',
    // Produced by IMG-2 (docs/image-jobs/IMG-2-og-image.md). The tags point at
    // the agreed path before the file exists; the path is the contract.
    ogImage: `${origin}/images/og-cover.png`,
    ogImageType: 'image/png',
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: 'Kartu berbagi portofolio: potret Anung Hanindhita Ramadhan di samping namanya dan peran Afiliasi & Pemasaran Digital.',
    // Web3Forms access keys are submission keys meant to travel in the client
    // bundle, not secrets. Empty means the contact form has no backend and the
    // mailto draft is the whole path.
    formKey: String(env.VITE_WEB3FORMS_KEY ?? '').trim(),
    formEndpoint: FORM_ENDPOINT,
  };
}

// `import.meta.env` exists in the browser bundle; when this module is pulled
// into `vite.config.js` by Node it does not, and `buildSite()` is called there
// with `loadEnv()` instead.
export const site = buildSite(typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {});
