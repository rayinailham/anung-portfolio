// Kirim 4 verification: share metadata in the served document, the WhatsApp
// handoff, the inline CV preview (intrinsic size + layout shift), the contact
// form's fallback path, contrast of every new text pair, and a check that no
// credential reached the build. Writes docs/evidence/kirim-4/metrics.json.
// Usage: node scripts/verify-kirim-4.mjs   (needs a served build, see PORTFOLIO_URL)
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = process.env.PORTFOLIO_URL || 'http://127.0.0.1:4173';
const output = process.env.EVIDENCE_DIR || 'docs/evidence/kirim-4';
const distDir = process.env.DIST_DIR || 'dist';
// The contact form's backend is decided at build time, so the keyed path needs
// its own server. See README, "Contact form".
const backendURL = process.env.BACKEND_URL || 'http://127.0.0.1:5174';
await mkdir(output, { recursive: true });

const parse = (value) => {
  const numbers = value.match(/[\d.]+/g).map(Number);
  return { r: numbers[0], g: numbers[1], b: numbers[2], a: numbers[3] ?? 1 };
};
const over = (front, back) => ({
  r: front.r * front.a + back.r * (1 - front.a),
  g: front.g * front.a + back.g * (1 - front.a),
  b: front.b * front.a + back.b * (1 - front.a),
  a: 1,
});
const luminance = ({ r, g, b }) => {
  const channel = (value) => { const v = value / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};
const ratio = (front, back) => {
  const solid = front.a < 1 ? over(front, back) : front;
  const values = [luminance(solid), luminance(back)].sort((a, b) => b - a);
  return Number(((values[0] + 0.05) / (values[1] + 0.05)).toFixed(3));
};

// Every colour pair this phase introduced. All of them are text on an existing
// surface, so the threshold is 4.5:1 throughout.
const PAIRS = [
  { id: 'cv-preview-lead', route: '/tentang', selector: '.cv-preview-intro p', background: '.cv-preview' },
  { id: 'cv-page-caption', route: '/tentang', selector: '.cv-pages figcaption', background: '.cv-preview' },
  { id: 'cv-preview-kicker', route: '/tentang', selector: '.cv-preview-intro .section-kicker', background: '.cv-preview' },
  { id: 'contact-whatsapp', route: '/kontak', selector: '.contact-info .contact-social', background: '.contact-grid' },
  { id: 'form-status', route: '/kontak', selector: '.form-status', background: '.contact-grid' },
  { id: 'form-footer-note', route: '/kontak', selector: '.form-footer p', background: '.contact-grid' },
];

const surfaceColor = (page, selector) => page.locator(selector).first().evaluate((element) => {
  for (let node = element; node; node = node.parentElement) {
    const value = getComputedStyle(node).backgroundColor;
    if (value && !value.startsWith('rgba(0, 0, 0, 0)')) return value;
  }
  return getComputedStyle(document.body).backgroundColor;
});

const settle = async (page) => {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
};

const browser = await chromium.launch();
const metrics = { baseURL, generatedAt: new Date().toISOString() };

try {
  // --- 1. What a crawler is served, before any JavaScript runs ---------------
  const html = await (await fetch(`${baseURL}/`)).text();
  const meta = (attribute, key) => {
    const match = html.match(new RegExp(`<meta ${attribute}="${key}" content="([^"]*)"`));
    return match ? match[1].replace(/&amp;/g, '&') : null;
  };
  const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] ?? null;
  metrics.socialMarkup = {
    documentTitle: (html.match(/<title>([^<]*)<\/title>/) || [])[1]?.replace(/&amp;/g, '&') ?? null,
    canonical,
    canonicalCount: (html.match(/rel="canonical"/g) || []).length,
    ogUrl: meta('property', 'og:url'),
    ogUrlCount: (html.match(/property="og:url"/g) || []).length,
    ogTitle: meta('property', 'og:title'),
    ogDescription: meta('property', 'og:description'),
    ogType: meta('property', 'og:type'),
    ogLocale: meta('property', 'og:locale'),
    ogSiteName: meta('property', 'og:site_name'),
    ogImage: meta('property', 'og:image'),
    ogImageType: meta('property', 'og:image:type'),
    ogImageWidth: meta('property', 'og:image:width'),
    ogImageHeight: meta('property', 'og:image:height'),
    ogImageAlt: meta('property', 'og:image:alt'),
    twitterCard: meta('name', 'twitter:card'),
    twitterTitle: meta('name', 'twitter:title'),
    twitterDescription: meta('name', 'twitter:description'),
    twitterImage: meta('name', 'twitter:image'),
    description: meta('name', 'description'),
  };
  metrics.socialMarkup.ogUrlEqualsCanonical = metrics.socialMarkup.ogUrl === canonical;
  metrics.socialMarkup.imageSharesCanonicalOrigin = metrics.socialMarkup.ogImage !== null && canonical !== null
    && new URL(metrics.socialMarkup.ogImage).origin === new URL(canonical).origin;
  metrics.socialMarkup.titlesAgree = metrics.socialMarkup.ogTitle === metrics.socialMarkup.documentTitle
    && metrics.socialMarkup.twitterTitle === metrics.socialMarkup.documentTitle;
  const ogResponse = await fetch(metrics.socialMarkup.ogImage.replace(new URL(metrics.socialMarkup.ogImage).origin, baseURL));
  metrics.socialMarkup.ogImageFilePresent = ogResponse.ok && (ogResponse.headers.get('content-type') || '').startsWith('image/');
  metrics.socialMarkup.ogImageTicket = 'docs/image-jobs/IMG-2-og-image.md';

  // --- 2. No credential travelled into the build ----------------------------
  // `buildSite(import.meta.env)` makes Vite inline the whole prefixed env
  // object, so the *names* VITE_SITE_URL and VITE_WEB3FORMS_KEY are always in
  // the bundle. What must never be there is a value: a Web3Forms access key is
  // a UUID, and nothing from a local `.env` file belongs in a commit either.
  const assets = await readdir(`${distDir}/assets`);
  const bundles = assets.filter(name => name.endsWith('.js'));
  const envValues = [];
  for (const name of (await readdir('.')).filter(file => file.startsWith('.env') && file !== '.env.example')) {
    for (const line of (await readFile(name, 'utf8')).split('\n')) {
      const value = line.split('=').slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      if (value.length > 7) envValues.push({ file: name, value });
    }
  }
  const uuid = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  const leaks = [];
  let inlinedFormKey = null;
  for (const name of bundles) {
    const source = await readFile(`${distDir}/assets/${name}`, 'utf8');
    const found = source.match(uuid);
    if (found) leaks.push(`${name}: UUID ${found[0]}`);
    for (const entry of envValues) if (source.includes(entry.value)) leaks.push(`${name}: nilai dari ${entry.file}`);
    const inlined = source.match(/VITE_WEB3FORMS_KEY:\s*`([^`]*)`/) || source.match(/VITE_WEB3FORMS_KEY:\s*"([^"]*)"/);
    if (inlined) inlinedFormKey = inlined[1];
  }
  metrics.buildSecrets = {
    bundlesScanned: bundles.length,
    envFilesOnDisk: [...new Set(envValues.map(entry => entry.file))],
    inlinedFormKey,
    inlinedFormKeyIsEmpty: inlinedFormKey === '' || inlinedFormKey === null,
    leaks,
  };
  metrics.buildSecrets.formEndpointPresent = (await Promise.all(bundles.map(name => readFile(`${distDir}/assets/${name}`, 'utf8'))))
    .some(source => source.includes('api.web3forms.com/submit'));

  // --- 3. WhatsApp, CV preview, and the form fallback in the live page -------
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.addInitScript(() => { try { sessionStorage.setItem('anung-intro', 'seen'); } catch { /* optional */ } });

  await page.goto(`${baseURL}/#/kontak`);
  await settle(page);
  const whatsappHref = await page.locator('.contact-info a[href^="https://wa.me/"]').first().getAttribute('href');
  metrics.whatsapp = {
    href: whatsappHref,
    number: new URL(whatsappHref).pathname.replace('/', ''),
    greeting: new URL(whatsappHref).searchParams.get('text'),
    channelsInContactInfo: await page.locator('.contact-info .contact-social').count(),
    inFooter: await page.locator('.site-footer a[href^="https://wa.me/"]').count(),
  };

  // The served build carries no access key, so the form must hand over a draft.
  // `mailto:` is an external protocol: Chromium never turns it into a request,
  // so what is recorded here is the state the page itself reports.
  await page.route('mailto:**', route => route.abort());
  await page.locator('input[name="name"]').fill('Uji Bukti');
  await page.locator('input[name="email"]').fill('bukti@example.com');
  await page.locator('select[name="topic"]').selectOption('Peluang kerja');
  await page.locator('textarea[name="message"]').fill('Halo Anung, ini pesan uji untuk bukti Kirim 4.');
  await page.locator('.form-footer button').click();
  await page.waitForTimeout(600);
  metrics.formFallback = {
    buttonLabel: (await page.locator('.form-footer button').innerText()).trim(),
    footerNote: (await page.locator('.form-footer p').innerText()).trim(),
    statusAttribute: await page.locator('.form-status').getAttribute('data-status'),
    statusText: (await page.locator('.form-status').innerText()).trim(),
    honeypotTabIndex: await page.locator('input[name="website"]').getAttribute('tabindex'),
    honeypotHiddenFromAssistiveTech: await page.locator('.form-trap').getAttribute('aria-hidden'),
  };

  await page.goto(`${baseURL}/#/tentang`);
  await settle(page);
  await page.locator('.cv-preview').scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  metrics.cvPreview = await page.locator('.cv-pages img').evaluateAll(async (images) => {
    const rows = [];
    for (const image of images) {
      await image.decode().catch(() => {});
      rows.push({
        src: new URL(image.currentSrc || image.src, location.href).pathname,
        declaredWidth: image.getAttribute('width'),
        declaredHeight: image.getAttribute('height'),
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        loading: image.getAttribute('loading'),
        altLength: image.alt.length,
      });
    }
    return rows;
  });
  metrics.cvDownloadStillPresent = await page.locator('.cv-preview a[download]').count();

  // --- 3b. The backend path, on the server built with a key ----------------
  // Every request is answered locally; nothing leaves this machine, and the
  // key on that server is a fake one set by the run command.
  const driveForm = async (handler) => {
    const form = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await form.addInitScript(() => { try { sessionStorage.setItem('anung-intro', 'seen'); } catch { /* optional */ } });
    let payload = null;
    await form.route('https://api.web3forms.com/submit', async (route) => {
      payload = JSON.parse(route.request().postData() || 'null');
      return handler(route);
    });
    await form.goto(`${backendURL}/#/kontak`);
    await form.locator('.contact-form').waitFor();
    await form.locator('input[name="name"]').fill('Rani Pertiwi');
    await form.locator('input[name="email"]').fill('rani@example.com');
    await form.locator('select[name="topic"]').selectOption('Peluang kerja');
    await form.locator('textarea[name="message"]').fill('Halo Anung, kami mencari kandidat affiliate marketing.');
    await form.locator('.form-footer button').click();
    return { form, payload: () => payload };
  };

  metrics.backend = { url: backendURL };

  {
    const { form, payload } = await driveForm(() => new Promise(() => {}));
    await form.waitForTimeout(700);
    metrics.backend.sending = {
      status: await form.locator('.form-status').getAttribute('data-status'),
      statusText: (await form.locator('.form-status').innerText()).trim(),
      buttonLabel: (await form.locator('.form-footer button').innerText()).trim(),
      buttonDisabled: await form.locator('.form-footer button').isDisabled(),
      ariaBusy: await form.locator('.form-footer button').getAttribute('aria-busy'),
      requestSent: payload() !== null,
      accessKeySent: payload()?.access_key ?? null,
    };
    await form.close();
  }

  {
    const { form, payload } = await driveForm(route => route.fulfill({
      status: 200, contentType: 'application/json', body: '{"success":true,"message":"Email sent successfully"}',
    }));
    await form.waitForTimeout(1200);
    metrics.backend.sent = {
      status: await form.locator('.form-status').getAttribute('data-status'),
      statusText: (await form.locator('.form-status').innerText()).trim(),
      messageFieldAfter: await form.locator('textarea[name="message"]').inputValue(),
      fallbackShown: await form.locator('.form-fallback').count(),
      payloadFields: Object.keys(payload() ?? {}).sort(),
      subjectSent: payload()?.subject ?? null,
      emailSent: payload()?.email ?? null,
    };
    await form.close();
  }

  {
    const { form } = await driveForm(route => route.fulfill({
      status: 500, contentType: 'application/json', body: '{"success":false,"message":"Internal error"}',
    }));
    await form.waitForTimeout(1200);
    metrics.backend.serverError = {
      status: await form.locator('.form-status').getAttribute('data-status'),
      statusText: (await form.locator('.form-status').innerText()).trim(),
      fallbackHref: await form.locator('.form-fallback a').getAttribute('href'),
      messageFieldAfter: await form.locator('textarea[name="message"]').inputValue(),
    };
    await form.close();
  }

  {
    const { form } = await driveForm(route => route.abort('failed'));
    await form.waitForTimeout(1200);
    const fallbackHref = await form.locator('.form-fallback a').getAttribute('href');
    metrics.backend.networkDown = {
      status: await form.locator('.form-status').getAttribute('data-status'),
      statusText: (await form.locator('.form-status').innerText()).trim(),
      fallbackHref,
      fallbackCarriesMessage: decodeURIComponent(fallbackHref || '').includes('affiliate marketing'),
      buttonUsableAgain: await form.locator('.form-footer button').isEnabled(),
      messageFieldAfter: await form.locator('textarea[name="message"]').inputValue(),
    };
    await form.close();
  }

  // --- 4. Layout shift on the page that gained the new images ---------------
  const shiftPage = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await shiftPage.addInitScript(() => {
    try { sessionStorage.setItem('anung-intro', 'seen'); } catch { /* optional */ }
    window.__shift = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__shift += entry.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await shiftPage.goto(`${baseURL}/#/tentang`);
  await settle(shiftPage);
  await shiftPage.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise(resolve => setTimeout(resolve, 120));
    }
  });
  await shiftPage.waitForTimeout(700);
  metrics.layoutShiftTentang = Number((await shiftPage.evaluate(() => window.__shift)).toFixed(4));
  await shiftPage.close();

  // --- 5. Contrast of every new text pair, both themes ----------------------
  metrics.contrast = [];
  for (const theme of ['light', 'dark']) {
    const themed = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await themed.addInitScript((value) => {
      try { sessionStorage.setItem('anung-intro', 'seen'); localStorage.setItem('anung-theme', value); } catch { /* optional */ }
    }, theme);
    for (const pair of PAIRS) {
      await themed.goto(`${baseURL}/#${pair.route}`);
      await settle(themed);
      const target = themed.locator(pair.selector).first();
      await target.scrollIntoViewIfNeeded();
      const foreground = await target.evaluate(element => getComputedStyle(element).color);
      const background = await surfaceColor(themed, pair.background);
      metrics.contrast.push({ id: pair.id, theme, foreground, background, ratio: ratio(parse(foreground), parse(background)), threshold: 4.5 });
    }
    await themed.close();
  }
  metrics.contrastFloor = metrics.contrast.reduce((low, row) => (row.ratio < low.ratio ? row : low), metrics.contrast[0]);
  metrics.contrastFailures = metrics.contrast.filter(row => row.ratio < row.threshold);

  // --- 6. No horizontal overflow at any width, all four routes --------------
  metrics.layout = [];
  for (const width of [320, 390, 1440]) {
    const sized = await browser.newPage({ viewport: { width, height: 900 } });
    await sized.addInitScript(() => { try { sessionStorage.setItem('anung-intro', 'seen'); } catch { /* optional */ } });
    for (const route of ['/', '/pengalaman', '/tentang', '/kontak']) {
      await sized.goto(`${baseURL}/#${route}`);
      await settle(sized);
      metrics.layout.push({ width, route, fits: await sized.evaluate(() => document.documentElement.scrollWidth <= innerWidth) });
    }
    await sized.close();
  }

  await page.close();
} finally {
  await browser.close();
}

await writeFile(`${output}/metrics.json`, `${JSON.stringify(metrics, null, 2)}\n`);

const problems = [];
const social = metrics.socialMarkup;
if (!social.ogUrlEqualsCanonical) problems.push('og:url tidak sama dengan canonical');
if (!social.imageSharesCanonicalOrigin) problems.push('og:image beda origin dengan canonical');
if (!social.titlesAgree) problems.push('og:title / twitter:title tidak sama dengan <title>');
if (social.canonicalCount !== 1 || social.ogUrlCount !== 1) problems.push('canonical atau og:url ditulis lebih dari sekali');
if (social.twitterCard !== 'summary_large_image') problems.push('twitter:card salah');
if (metrics.buildSecrets.leaks.length) problems.push(`kredensial bocor ke bundel: ${metrics.buildSecrets.leaks.join(', ')}`);
if (!metrics.whatsapp.href.startsWith('https://wa.me/')) problems.push('tautan WhatsApp salah');
if (!metrics.whatsapp.greeting) problems.push('pesan pembuka WhatsApp kosong');
if (metrics.whatsapp.inFooter < 1) problems.push('WhatsApp tidak ada di footer');
if (metrics.formFallback.statusAttribute !== 'drafted') problems.push('build tanpa kunci tidak jatuh ke draf email');
if (!metrics.formFallback.buttonLabel.startsWith('Buka draf email')) problems.push('label tombol tidak jujur saat tidak ada backend');
if (metrics.formFallback.honeypotTabIndex !== '-1' || metrics.formFallback.honeypotHiddenFromAssistiveTech !== 'true') problems.push('honeypot bisa dijangkau manusia');
if (!metrics.backend.sent.statusText.startsWith('Pesan terkirim')) problems.push('kirim berhasil tidak dilaporkan');
if (metrics.backend.sent.messageFieldAfter !== '') problems.push('form tidak dikosongkan setelah terkirim');
if (metrics.backend.networkDown.status !== 'failed') problems.push('kegagalan jaringan tidak dilaporkan');
if (!(metrics.backend.networkDown.fallbackHref || '').startsWith('mailto:')) problems.push('fallback mailto tidak muncul saat pengiriman gagal');
if (!metrics.backend.sending.buttonDisabled) problems.push('tombol tidak dikunci selama pengiriman');
if (metrics.cvPreview.length < 1) problems.push('preview CV tidak ada');
for (const row of metrics.cvPreview) {
  if (String(row.naturalWidth) !== row.declaredWidth || String(row.naturalHeight) !== row.declaredHeight) {
    problems.push(`ukuran intrinsik ${row.src} tidak cocok dengan atribut width/height`);
  }
}
if (metrics.cvDownloadStillPresent < 1) problems.push('tombol download CV hilang dari preview');
if (metrics.contrastFailures.length) problems.push(`kontras gagal: ${metrics.contrastFailures.map(row => `${row.id}/${row.theme} ${row.ratio}`).join(', ')}`);
const overflow = metrics.layout.filter(row => !row.fits);
if (overflow.length) problems.push(`meluber horizontal: ${overflow.map(row => `${row.width}${row.route}`).join(', ')}`);

console.log(`canonical ${social.canonical}`);
console.log(`og:image ${social.ogImage} (berkas ada: ${social.ogImageFilePresent} — menunggu ${social.ogImageTicket})`);
console.log(`whatsapp ${metrics.whatsapp.href}`);
console.log(`tanpa kunci: tombol "${metrics.formFallback.buttonLabel}", status "${metrics.formFallback.statusAttribute}"`);
console.log(`dengan kunci: sending(tombol terkunci ${metrics.backend.sending.buttonDisabled}) -> sent("${metrics.backend.sent.statusText}") -> jaringan mati("${metrics.backend.networkDown.status}", draf ${metrics.backend.networkDown.fallbackHref ? 'ada' : 'tidak ada'})`);
console.log(`preview CV: ${metrics.cvPreview.length} halaman, ${metrics.cvPreview.map(row => `${row.naturalWidth}x${row.naturalHeight} ${row.loading}`).join(' + ')}`);
console.log(`layout-shift /tentang: ${metrics.layoutShiftTentang}`);
console.log(`kontras terendah: ${metrics.contrastFloor.id} ${metrics.contrastFloor.theme} ${metrics.contrastFloor.ratio}:1`);
console.log(`bundel dipindai: ${metrics.buildSecrets.bundlesScanned}, bocor: ${metrics.buildSecrets.leaks.length}`);
if (problems.length) {
  console.error(`\nGAGAL:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('\nSemua pemeriksaan Kirim 4 lolos.');
