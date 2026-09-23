import { test, expect } from '@playwright/test';
import { experience } from '../src/data.js';

test.beforeEach(async ({ page }) => {
  page.runtimeErrors = [];
  page.consoleErrors = [];
  page.on('pageerror', error => page.runtimeErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') page.consoleErrors.push(message.text()); });
});

// Tests that deliberately abort a request get a browser network diagnostic on
// the console; every other test still has to keep the console clean.
const NETWORK_FAULT_TESTS = ['GSAP blocked', 'placeholder covers missing', 'contact send survives a dead network', 'contact form offers the email draft', 'route chunks blocked'];

test.afterEach(async ({ page }, testInfo) => {
  expect(page.runtimeErrors, 'uncaught runtime errors').toEqual([]);
  if (!NETWORK_FAULT_TESTS.some(prefix => testInfo.title.startsWith(prefix))) {
    expect(page.consoleErrors, 'console errors').toEqual([]);
  }
});

// The second dev server is built with a Web3Forms key (playwright.config.js),
// so it serves the backend path of the contact form. The default origin has no
// key and serves the mailto fallback.
const BACKEND_ORIGIN = 'http://127.0.0.1:5174';

async function ready(page, route = '/', origin = '') {
  await page.goto(`${origin}/#${route}`);
  await expect(page.locator('.splash')).toHaveCount(0);
  await expect(page.locator('.app')).not.toHaveAttribute('inert');
}

test('filter layout refresh reveals organizations, every card and contact callout', async ({ page }) => {
  await ready(page, '/pengalaman');
  // Let the initial refresh finish before changing the document height.
  await page.waitForTimeout(350);
  await page.getByRole('button', { name: 'Pemasaran digital', exact: true }).click();
  await expect(page.locator('.experience-card')).toHaveCount(1);
  await page.locator('.organizations').evaluate(el => el.scrollIntoView({ block: 'start' }));
  await expect(page.locator('.organizations')).toHaveCSS('opacity', '1', { timeout: 2000 });
  for (const card of await page.locator('.organization-grid > article').all()) {
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveCSS('opacity', '1', { timeout: 2000 });
  }
  await page.locator('.contact-callout').scrollIntoViewIfNeeded();
  await expect(page.locator('.contact-callout')).toHaveCSS('opacity', '1', { timeout: 2000 });
});

async function lowerSectionsVisible(page) {
  for (const element of await page.locator('.organizations, .organization-grid > article, .contact-callout').all()) {
    await element.evaluate(el => el.scrollIntoView({ block: 'center' }));
    await expect(element).toHaveCSS('opacity', '1', { timeout: 1800 });
  }
}

for (const category of ['Semua', 'Pemasaran afiliasi', 'Kerja sama KOL', 'Pemasaran digital']) {
  test(`every filter keeps lower sections visible: ${category}`, async ({ page }) => {
    await ready(page, '/pengalaman');
    await expect(page.locator('html')).toHaveClass(/lenis/);
    await page.evaluate(async () => {
      const { ScrollTrigger } = await import('/src/motion-runtime.js');
      window.layoutRefreshes = 0;
      ScrollTrigger.addEventListener('refresh', () => window.layoutRefreshes++);
    });
    // Start with a different height, including for the 'Semua' category.
    if (category === 'Semua') await page.getByRole('button', { name: 'Pemasaran digital', exact: true }).click();
    const before = await page.evaluate(() => window.layoutRefreshes);
    await page.getByRole('button', { name: category, exact: true }).click();
    await expect.poll(() => page.evaluate(() => window.layoutRefreshes)).toBeGreaterThan(before);
    await lowerSectionsVisible(page);
  });
}

test('multiple disclosures animate height and refresh after opening and closing', async ({ page }) => {
  await ready(page, '/pengalaman');
  await expect(page.locator('html')).toHaveClass(/lenis/);
  await page.evaluate(async () => {
    const { ScrollTrigger } = await import('/src/motion-runtime.js');
    window.layoutRefreshes = 0;
    ScrollTrigger.addEventListener('refresh', () => window.layoutRefreshes++);
  });
  const cards = page.locator('.experience-card');
  for (const index of [0, 1]) {
    const card = cards.nth(index);
    await card.locator('button').scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => window.layoutRefreshes);
    const heights = await card.evaluate(async el => {
      const panel = el.querySelector('.experience-details');
      el.querySelector('button').click();
      const values = [panel.getBoundingClientRect().height];
      for (let i = 0; i < 25; i++) {
        await new Promise(requestAnimationFrame);
        values.push(panel.getBoundingClientRect().height);
      }
      return values;
    });
    const final = heights.at(-1);
    expect(final).toBeGreaterThan(50);
    expect(heights.some(height => height > 1 && height < final - 1)).toBe(true);
    await expect.poll(() => page.evaluate(() => window.layoutRefreshes)).toBeGreaterThan(before);
  }
  await expect(page.locator('.detail-button[aria-expanded="true"]')).toHaveCount(2);
  await lowerSectionsVisible(page);
  for (const index of [1, 0]) {
    const before = await page.evaluate(() => window.layoutRefreshes);
    await cards.nth(index).getByRole('button', { name: 'Tutup detail' }).click();
    await expect(cards.nth(index).locator('.experience-details')).toBeHidden();
    await expect.poll(() => page.evaluate(() => window.layoutRefreshes)).toBeGreaterThan(before);
    await lowerSectionsVisible(page);
  }
});

test('refresh recovers stopped once-reveals using their current geometry', async ({ page }) => {
  await ready(page, '/pengalaman');
  await expect(page.locator('html')).toHaveClass(/lenis/);
  await page.evaluate(async () => {
    const { gsap, ScrollTrigger } = await import('/src/motion-runtime.js');
    for (const selector of ['.organizations', '.organization-grid', '.contact-callout']) {
      const element = document.querySelector(selector);
      const trigger = ScrollTrigger.getAll().find(item => item.trigger === element);
      trigger.disable(false);
      trigger.animation.pause(0);
      // Simulate stale geometry without depending on an engine's scroll timing.
      // The offset is measured, not a constant: the page keeps getting taller.
      element.style.position = 'relative';
      element.style.top = `${-Math.round(element.getBoundingClientRect().top + innerHeight)}px`;
    }
    ScrollTrigger.refresh();
    gsap.ticker.sleep();
  });
  for (const element of await page.locator('.organizations, .organization-grid > article, .contact-callout').all()) {
    await expect(element).toHaveCSS('opacity', '1', { timeout: 1000 });
  }
});

test('native reveal deadline restores below-fold content even with a stopped GSAP ticker', async ({ page }) => {
  await ready(page, '/pengalaman');
  await expect(page.locator('html')).toHaveClass(/lenis/);
  await expect(page.locator('.contact-callout')).toHaveCSS('opacity', '0');
  await page.evaluate(async () => {
    const { gsap } = await import('/src/motion-runtime.js');
    gsap.ticker.sleep();
  });
  await expect(page.locator('.contact-callout')).toHaveCSS('opacity', '1', { timeout: 6500 });
  for (const element of await page.locator('[data-reveal], [data-reveal-group], [data-reveal-group] > *').all()) {
    await expect(element).toHaveCSS('opacity', '1');
  }
});

test('reduced motion leaves every reveal, counter and disclosure at its final value', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of ['/', '/pengalaman', '/tentang', '/kontak']) {
    await ready(page, route);
    await expect(page.locator('html')).not.toHaveClass(/lenis/);
    const values = await page.locator('[data-reveal], [data-reveal-group] > *, .hero-enter, [data-spin], .marquee-track').evaluateAll(elements =>
      elements.map(el => ({ opacity: getComputedStyle(el).opacity, transform: getComputedStyle(el).transform })));
    expect(values.length).toBeGreaterThan(0);
    expect(values.every(value => value.opacity === '1' && value.transform === 'none')).toBe(true);
    for (const counter of await page.locator('[data-count]').all()) {
      expect(await counter.textContent()).toBe(await counter.getAttribute('data-count'));
    }
    if (route === '/pengalaman') {
      await page.getByRole('button', { name: 'Lihat detail' }).first().click();
      const detail = page.locator('.experience-details').first();
      await expect(detail).toBeVisible();
      expect(await detail.evaluate(el => parseFloat(getComputedStyle(el).transitionDuration))).toBeLessThan(.001);
      await page.getByRole('button', { name: 'Tutup detail' }).click();
      await expect(detail).toBeHidden();
    }
  }
});

test('GSAP blocked still renders readable content and usable navigation on every route', async ({ page }) => {
  let blocked = 0;
  await page.route(/\/node_modules\/.*gsap.*\.js/, route => { blocked++; return route.abort(); });
  for (const route of ['/', '/pengalaman', '/tentang', '/kontak']) {
    await ready(page, route);
    await expect(page.locator('html')).not.toHaveClass(/lenis/);
    const result = await page.locator('main').evaluate(main => {
      const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
      const hidden = [];
      let checked = 0;
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.textContent.trim() || node.parentElement.closest('[aria-hidden="true"], .sr-only, svg')) continue;
        checked++;
        for (let el = node.parentElement; el && el !== main.parentElement; el = el.parentElement) {
          const style = getComputedStyle(el);
          if (Number(style.opacity) === 0 || style.visibility === 'hidden' || style.display === 'none') hidden.push(node.textContent.trim());
        }
      }
      return { checked, hidden };
    });
    expect(result.checked).toBeGreaterThan(15);
    expect(result.hidden).toEqual([]);
    if (route === '/pengalaman') {
      await page.getByRole('button', { name: 'Lihat detail' }).first().click();
      await expect(page.locator('.experience-details').first()).toBeVisible();
    }
  }
  expect(blocked).toBeGreaterThan(0);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('navigation').getByRole('link', { name: 'Tentang', exact: true }).click();
  await expect(page.locator('h1')).toContainText('saya Anung.');
});

test('fresh contact deep link skips intro immediately even while motion is loading', async ({ page }) => {
  await page.route('**/src/motion-runtime*', async route => {
    await new Promise(resolve => setTimeout(resolve, 1800));
    await route.continue();
  });
  await page.goto('/#/kontak', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.contact-form')).toHaveCSS('opacity', '1', { timeout: 1000 });
  await expect(page.locator('.splash')).toHaveCount(0);
  await expect(page.locator('.app')).not.toHaveAttribute('inert');
  await page.getByLabel('Nama', { exact: true }).fill('Perekrut');
  await expect(page.getByLabel('Nama', { exact: true })).toHaveValue('Perekrut');
});

test('intro lasts about one second and stays skipped for the session', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.splash')).toBeVisible();
  const duration = await page.evaluate(async () => {
    const { gsap } = await import('/src/motion-runtime.js');
    return gsap.globalTimeline.getChildren().find(tween => tween.vars.onComplete && tween.duration() > 1)?.duration();
  });
  expect(duration).toBeGreaterThanOrEqual(1);
  expect(duration).toBeLessThanOrEqual(1.2);
  await expect(page.locator('.splash')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.splash')).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem('anung-intro'))).toBe('seen');
});

test('mobile touch targets, marquee text and dark accent meet their requirements', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  const heights = await page.locator('.header-cv, .site-footer > div > a').evaluateAll(elements => elements.map(el => el.getBoundingClientRect().height));
  expect(heights).toHaveLength(4);
  expect(heights.every(height => height >= 24)).toBe(true);
  await expect(page.locator('.marquee')).not.toHaveAttribute('role', 'img');
  await expect(page.locator('.marquee > .sr-only')).toHaveText('Bidang: pemasaran afiliasi, kerja sama KOL, perencanaan konten.');
  await expect(page.locator('.marquee-track')).toHaveAttribute('aria-hidden', 'true');
  const tokens = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return Object.fromEntries(['--green', '--paper', '--paper-soft', '--ink', '--button-text'].map(name => [name, style.getPropertyValue(name).trim()]));
  });
  const luminance = hex => {
    const rgb = hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
  };
  for (const background of ['--paper', '--paper-soft', '--button-text']) {
    const values = [luminance(tokens['--green']), luminance(tokens[background])].sort((a, b) => b - a);
    expect((values[0] + .05) / (values[1] + .05)).toBeGreaterThanOrEqual(4.5);
  }
  expect(tokens['--green']).not.toBe(tokens['--ink']);
});

test('intro completes; route transition, back and deep links work', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await ready(page);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Halo, saya');
  await page.getByRole('link', { name: 'Lihat pengalaman', exact: true }).click();
  await expect(page.locator('.app')).not.toHaveAttribute('inert');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('magang saya.');
  await expect(page.locator('main')).toBeFocused();
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Halo, saya');
  await page.goForward();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('magang saya.');
  await ready(page, '/tentang');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('saya Anung.');
  expect(errors).toEqual([]);
});

test('experience filters and contribution disclosures work', async ({ page }) => {
  await ready(page, '/pengalaman');
  await expect(page.locator('.experience-card')).toHaveCount(3);
  await page.getByRole('button', { name: 'Kerja sama KOL', exact: true }).click();
  await expect(page.locator('.experience-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Lihat detail' }).click();
  await expect(page.locator('.experience-details:visible')).toContainText('100 mitra afiliasi Shopee');
  await page.getByRole('button', { name: 'Tutup detail' }).click();
  await expect(page.locator('.experience-details')).toBeHidden();
  await page.getByRole('button', { name: 'Semua', exact: true }).click();
  await expect(page.locator('.experience-card')).toHaveCount(3);
});

test('theme persists and CV download contains a PDF', async ({ page, request }) => {
  await ready(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const response = await request.get('/documents/anung-ramadhan-cv.pdf');
  expect(response.status()).toBe(200);
  expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-');
  await expect(page.getByRole('link', { name: 'Download CV', exact: true })).toHaveAttribute('download', '');
});

test('contact form validates inputs and prepares an honest email handoff', async ({ page }) => {
  await ready(page, '/kontak');
  const mailto = [];
  await page.route('mailto:**', route => { mailto.push(route.request().url()); return route.abort(); });
  await page.getByRole('button', { name: 'Buka draf email', exact: true }).click();
  expect(await page.locator('input[name="name"]').evaluate(el => el.validity.valueMissing)).toBe(true);
  await page.getByLabel('Nama', { exact: true }).fill('Test Portfolio');
  await page.getByLabel('Email', { exact: true }).fill('portfolio@example.com');
  await page.getByLabel('Topik pesan').selectOption('Kerja sama promosi');
  await page.getByLabel('Pesan', { exact: true }).fill('Halo Anung, mari berdiskusi tentang kolaborasi brand.');
  await page.getByRole('button', { name: 'Buka draf email', exact: true }).click();
  await expect(page.locator('.form-status')).toContainText('Draf email siap dibuka');
  await expect(page.getByRole('link', { name: 'anungramadhan17@gmail.com', exact: true })).toHaveAttribute('href', 'mailto:anungramadhan17@gmail.com');
  await expect(page.locator('.form-footer')).toContainText('Untuk mengirim pesan, tekan tombol kirim di aplikasi email.');
});

test('reduced motion bypasses intro and smooth scroll; keyboard navigation works', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  await expect(page.locator('html')).not.toHaveClass(/lenis/);
  const link = page.getByRole('link', { name: 'Lihat pengalaman', exact: true });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('magang saya.');
  await expect(page.locator('main')).toBeFocused();
});

test('mobile menu supports open, escape and navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page);
  await expect(page.getByRole('navigation')).toBeHidden();
  await page.getByRole('button', { name: 'Buka menu' }).click();
  await expect(page.getByRole('navigation')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Buka menu' })).toBeFocused();
  await page.getByRole('button', { name: 'Buka menu' }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'Kontak', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ada peluang');
  await expect(page.getByRole('navigation')).toBeHidden();
});

test('all pages keep readable text, fit narrow screens and load images in both themes', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/pengalaman', '/tentang', '/kontak']) {
      await ready(page, route);
      await expect(page.locator('h1')).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const typography = await page.evaluate(() => {
        const walker = document.createTreeWalker(document.querySelector('.app'), NodeFilter.SHOW_TEXT);
        const small = [];
        let checked = 0;
        while (walker.nextNode()) {
          const node = walker.currentNode;
          const element = node.parentElement;
          if (!node.textContent.trim() || element.closest('.sr-only, [aria-hidden="true"], svg') || !element.getClientRects().length) continue;
          checked++;
          if (parseFloat(getComputedStyle(element).fontSize) < 14) small.push(node.textContent.trim());
        }
        return { checked, small };
      });
      expect(typography.checked).toBeGreaterThan(15);
      expect(typography.small).toEqual([]);
      if (route === '/kontak') {
        const inputSizes = await page.locator('input, select, textarea').evaluateAll(elements => elements.map(element => parseFloat(getComputedStyle(element).fontSize)));
        expect(inputSizes.every(size => size >= 16)).toBe(true);
      }
      for (const theme of ['dark', 'light']) {
        await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
      const images = await page.locator('img:not([loading="lazy"])').evaluateAll(imgs => imgs.every(img => img.complete && img.naturalWidth > 0));
      expect(images).toBe(true);
    }
  }
  expect(errors).toEqual([]);
});

test('unknown route has a usable recovery path', async ({ page }) => {
  await ready(page, '/missing-page');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Sepertinya salah jalan.');
  await page.getByRole('link', { name: 'Kembali ke beranda' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Halo, saya');
});

test('interrupted transition and live reduced motion never lock the page', async ({ page }) => {
  await ready(page);
  await page.evaluate(() => { location.hash = '/pengalaman'; });
  await expect(page.locator('.app')).toHaveAttribute('inert');
  await page.evaluate(() => { location.hash = '/'; });
  await expect(page.locator('.app')).not.toHaveAttribute('inert');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Halo, saya');
  await page.evaluate(() => { location.hash = '/kontak'; });
  await expect(page.locator('.app')).toHaveAttribute('inert');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.app')).not.toHaveAttribute('inert');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ada peluang');
  await expect(page.locator('body')).not.toHaveClass(/motion-locked/);
});

test('a route change inside the curtain\'s first frame gap does not strand the old page', async ({ page }) => {
  // The curtain timeline is only rendered on the GSAP ticker's next frame, while
  // React paints `inert` without waiting for one. Holding requestAnimationFrame
  // back reproduces, on every engine, the WebKit window where a second route
  // change arrives before the outgoing curtain has drawn anything at all.
  await page.addInitScript(() => {
    const nativeRaf = window.requestAnimationFrame.bind(window);
    let frozenUntil = 0;
    window.freezeFrames = (ms) => { frozenUntil = performance.now() + ms; };
    window.requestAnimationFrame = (callback) => nativeRaf((time) => {
      const wait = frozenUntil - performance.now();
      if (wait > 0) setTimeout(() => callback(performance.now()), wait + 1);
      else callback(time);
    });
  });
  await ready(page);
  await page.evaluate(() => { window.freezeFrames(1500); location.hash = '/pengalaman'; });
  await expect(page.locator('.app')).toHaveAttribute('inert');
  await page.evaluate(() => { location.hash = '/'; });
  await expect(page.locator('.app')).not.toHaveAttribute('inert');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Halo, saya');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('body')).not.toHaveClass(/motion-locked/);
  // The abandoned curtain must not commit its route once frames resume.
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Halo, saya');
  await expect(page).toHaveURL(/#\/$/);
});

test('deep link from a Beranda card lands on its own experience entry', async ({ page }) => {
  for (const [label, id] of [
    ['Lihat pengalaman pemasaran afiliasi di AnyMind Group', 'entri-anymind'],
    ['Lihat pengalaman kolaborasi KOL di PT Sutan Vet Medika', 'entri-anima-digital'],
  ]) {
    await ready(page, '/');
    const card = page.getByRole('link', { name: label, exact: true });
    await card.scrollIntoViewIfNeeded();
    await card.click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('magang saya.');
    await expect(page).toHaveURL(new RegExp(`#/pengalaman#${id}$`));
    await expect.poll(() => page.locator(`#${id}`).evaluate(el => el.getBoundingClientRect().top), { timeout: 5000 })
      .toBeLessThan(260);
    expect(await page.locator(`#${id}`).evaluate(el => el.getBoundingClientRect().bottom)).toBeGreaterThan(0);
  }
});

test('every evidence slot is declared, sized and captioned honestly', async ({ page }) => {
  await ready(page, '/pengalaman');
  await expect(page.locator('.evidence-item')).toHaveCount(4);
  await expect(page.locator('.evidence-item[data-placeholder="true"]')).toHaveCount(3);
  await expect(page.locator('.evidence-item:not([data-placeholder]) img'))
    .toHaveAttribute('src', '/images/anymind-pantene-team.webp');
  const sizes = await page.locator('.evidence-cover img').evaluateAll(images =>
    images.map(image => [Number(image.getAttribute('width')), Number(image.getAttribute('height'))]));
  expect(sizes).toHaveLength(4);
  expect(sizes.every(([width, height]) => width > 0 && height > 0)).toBe(true);
  for (const slot of await page.locator('.evidence-item[data-placeholder="true"]').all()) {
    await expect(slot.locator('figcaption')).toContainText('ilustrasi sementara');
    await expect(slot.locator('figcaption')).toBeVisible();
  }
  // The real photo is never described as work Anung produced on his own.
  await expect(page.locator('#entri-anymind .evidence-item figcaption')).toContainText('Pantene Affiliate Gathering');
});

test('placeholder covers missing still leave the evidence slots correct', async ({ page }) => {
  let aborted = 0;
  await page.route('**/images/placeholder/**', route => { aborted++; return route.abort(); });
  await ready(page, '/pengalaman');
  const slots = page.locator('.evidence-item[data-placeholder="true"]');
  await expect(slots).toHaveCount(3);
  for (const slot of await slots.all()) {
    await slot.scrollIntoViewIfNeeded();
    await expect(slot.locator('figcaption')).toBeVisible();
    const cover = slot.locator('.evidence-cover');
    expect(await cover.evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThan(40);
    expect(await cover.evaluate(el => getComputedStyle(el).backgroundImage)).toContain('linear-gradient');
    await expect(slot.locator('img')).toHaveAttribute('data-missing', 'true');
  }
  expect(aborted).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('no image is reused with a different crop', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const crops = new Map();
  for (const route of ['/', '/pengalaman', '/tentang', '/kontak']) {
    await ready(page, route);
    const used = await page.locator('img').evaluateAll(images => images.map(image => {
      const box = image.getBoundingClientRect();
      if (!box.width || !box.height) return null;
      const style = getComputedStyle(image);
      return {
        src: new URL(image.currentSrc || image.src, location.href).pathname,
        crop: `${(box.width / box.height).toFixed(2)} ${style.objectFit} ${style.objectPosition}`,
      };
    }).filter(Boolean));
    for (const { src, crop } of used) {
      if (!crops.has(src)) crops.set(src, new Set());
      crops.get(src).add(crop);
    }
  }
  expect(crops.size).toBeGreaterThan(2);
  const reused = [...crops].filter(([, variants]) => variants.size > 1)
    .map(([src, variants]) => `${src}: ${[...variants].join(' | ')}`);
  expect(reused).toEqual([]);
});

test('the contact callout says something different on each page', async ({ page }) => {
  const headings = [];
  for (const route of ['/', '/pengalaman', '/tentang']) {
    await ready(page, route);
    await expect(page.locator('.contact-callout h2')).toHaveCount(1);
    headings.push((await page.locator('.contact-callout h2').innerText()).trim());
    expect((await page.locator('.contact-callout .button').innerText()).trim().length).toBeGreaterThan(0);
  }
  expect(new Set(headings).size).toBe(3);
});

test('CV facts that were missing are on the page with their own numbers', async ({ page }) => {
  await ready(page, '/pengalaman');
  await expect(page.locator('#entri-anymind .experience-context')).toContainText('15 pasar Asia dan Timur Tengah');
  await expect(page.locator('#entri-anima-digital .experience-context')).toContainText('teruji klinis');
  const organizations = page.locator('.organization-grid');
  for (const fact of ['11 laporan keuangan bulanan', '3+ program', '20+ barang', '5+ jenis dekorasi', '7+ misi respons cepat']) {
    await expect(organizations).toContainText(fact);
  }
  await ready(page, '/tentang');
  await expect(page.locator('.education-note')).toContainText('Profit lebih dari Rp100.000');
  await expect(page.locator('.education-note')).toContainText('inovasi produk');
});

// Geometry helper: percentages are resolved against a track's content box, so
// borders never leak into a measured proportion.
const trackGeometry = (locator) => locator.evaluate((track) => {
  const box = track.getBoundingClientRect();
  const style = getComputedStyle(track);
  const left = box.left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft);
  return { left, width: track.clientWidth };
});

test('data visuals keep an honest scale in the DOM', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });

  await ready(page, '/tentang');
  // Ring: the drawn arc is exactly 3.74 of 4.00, taken off the rendered SVG.
  const ring = page.locator('.gpa[data-viz="ring"]');
  await expect(ring).toHaveAttribute('data-value', '3.74');
  await expect(ring).toHaveAttribute('data-max', '4');
  const arc = await page.locator('.gpa-ring-value').evaluate(circle => ({
    length: Number(circle.getAttribute('stroke-dasharray')),
    offset: Number(circle.getAttribute('stroke-dashoffset')),
    inline: circle.style.strokeDashoffset,
  }));
  expect(arc.inline).toBe('');
  expect(1 - arc.offset / arc.length).toBeCloseTo(3.74 / 4, 4);
  await expect(ring.locator('strong')).toHaveText('3.74/4.00');

  // TOEFL: the bar runs the full published ITP range and both ends are printed.
  const scale = page.locator('.score-scale');
  await expect(scale).toHaveAttribute('data-value', '583');
  await expect(scale).toHaveAttribute('data-scale-min', '310');
  await expect(scale).toHaveAttribute('data-scale-max', '677');
  await expect(scale.locator('.score-scale-axis')).toHaveText('310677');
  await expect(scale.locator('.score-scale-head strong')).toHaveText('583');
  const track = await trackGeometry(scale.locator('.score-scale-track'));
  const fill = await scale.locator('.score-scale-fill').evaluate(el => el.getBoundingClientRect());
  // Starts at the floor of the scale, not at some flattering offset inside it.
  expect(Math.abs(fill.left - track.left)).toBeLessThan(1.5);
  expect(fill.width / track.width).toBeCloseTo((583 - 310) / (677 - 310), 2);

  // Split: 150 is drawn as 100 + 50 and said to be a sum in words too.
  await ready(page, '/pengalaman');
  const split = page.locator('.split-bar');
  await expect(split).toHaveCount(1);
  await expect(split).toHaveAttribute('data-total', '150');
  await expect(split.locator('figcaption')).toContainText('100 Shopee + 50 TikTok = 150');
  await expect(split.locator('figcaption')).toContainText('penjumlahan dua platform, bukan hitungan orang unik');
  await expect(split.locator('.split-legend li').nth(0)).toContainText('Shopee 100');
  await expect(split.locator('.split-legend li').nth(1)).toContainText('TikTok 50');
  const splitTrack = await trackGeometry(split.locator('.split-track'));
  const segments = await split.locator('.split-segment').evaluateAll(list => list.map(el => el.getBoundingClientRect().width));
  expect(segments).toHaveLength(2);
  expect(segments[0] / segments[1]).toBeCloseTo(2, 1);
  const gap = await split.locator('.split-track').evaluate(el => parseFloat(getComputedStyle(el).columnGap) || 0);
  expect(Math.abs(segments[0] + segments[1] + gap - splitTrack.width)).toBeLessThan(1.5);
});

test('experience counters carry the CV number and keep their suffix outside it', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page, '/pengalaman');
  const stats = await page.locator('.experience-stats > div').evaluateAll(list => list.map(item => ({
    count: item.querySelector('[data-count]')?.getAttribute('data-count') ?? null,
    counted: item.querySelector('[data-count]')?.textContent ?? null,
    shown: item.querySelector('strong').textContent,
  })));
  expect(stats.map(stat => stat.shown)).toEqual(['150', '40', '200', '150', '30+', '100+']);
  // A "+" never sits inside the counted element, so its text is only the number.
  expect(stats.every(stat => stat.count !== null && stat.counted === stat.count)).toBe(true);
  expect(stats.map(stat => stat.count)).toEqual(['150', '40', '200', '150', '30', '100']);
});

// The timeline's shape changed in BLOK C; its arithmetic did not. Every number
// below is recomputed from `src/data.js` here in the test, so a bar that lies
// about its own months fails even if the markup and the page agree with each
// other.
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const monthIndex = (value) => { const [year, month] = value.split('-').map(Number); return year * 12 + month - 1; };
const monthLabel = (index) => `${MONTH_NAMES[index % 12]} ${Math.floor(index / 12)}`;
const chart = (() => {
  const entries = [...experience].sort((a, b) => monthIndex(a.start) - monthIndex(b.start));
  const first = Math.min(...entries.map(item => monthIndex(item.start)));
  const last = Math.max(...entries.map(item => monthIndex(item.end)));
  const total = last - first + 1;
  const bands = [];
  for (let month = first; month <= last; month++) {
    const active = entries.filter(item => monthIndex(item.start) <= month && month <= monthIndex(item.end));
    if (active.length < 2) continue;
    const previous = bands.at(-1);
    if (previous && previous.to === month - 1) previous.to = month;
    else bands.push({ from: month, to: month });
  }
  bands.forEach(band => {
    band.rows = entries.filter(item => monthIndex(item.start) <= band.from && band.to <= monthIndex(item.end)).map(item => item.id);
  });
  const repeats = [...new Set(entries.map(item => item.company))]
    .map(company => ({ company, periods: entries.filter(item => item.company === company) }))
    .filter(group => group.periods.length > 1);
  return { entries, first, last, total, bands, repeats };
})();

const boxOf = (locator) => locator.evaluate((el) => { const box = el.getBoundingClientRect(); return { left: box.left, right: box.right, width: box.width }; });

test('the career timeline measures every internship against one month axis', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page, '/pengalaman');
  const { entries, first, last, total, bands, repeats } = chart;

  // The range is announced from the data, and the roles are the only rows.
  await expect(page.locator('.timeline')).toHaveAttribute('data-span', `${monthLabel(first)}/${monthLabel(last)}`);
  await expect(page.locator('.timeline')).toHaveAttribute('data-months', String(total));
  await expect(page.locator('.timeline-axis')).toHaveAttribute('data-range', `${monthLabel(first)}/${monthLabel(last)}`);
  await expect(page.locator('.timeline-row')).toHaveCount(entries.length);

  // Every tick that is actually shown names the month its offset points at and
  // stands where that month begins. The tick closing the range is pinned to the
  // end of the axis, so it is measured against that edge instead.
  const axis = await trackGeometry(page.locator('.timeline-axis'));
  const ticks = await page.locator('.timeline-tick').evaluateAll(list => list
    .filter(el => getComputedStyle(el).display !== 'none')
    .map(el => ({ offset: Number(el.dataset.offset), text: el.textContent, closes: el.hasAttribute('data-last'), left: el.getBoundingClientRect().left, right: el.getBoundingClientRect().right })));
  expect(ticks.length).toBeGreaterThanOrEqual(4);
  expect(ticks[0].offset).toBe(0);
  expect(ticks.filter(tick => tick.closes)).toHaveLength(1);
  expect(ticks.at(-1).closes).toBe(true);
  for (const tick of ticks) {
    expect(tick.text).toBe(monthLabel(first + tick.offset));
    if (tick.closes) expect(Math.abs(tick.right - (axis.left + axis.width))).toBeLessThan(1.5);
    else expect(Math.abs(tick.left - (axis.left + axis.width * tick.offset / total))).toBeLessThan(1.5);
  }
  // One step, applied to the end: no gap widened or dropped to make it fit.
  const steps = new Set(ticks.slice(1).map((tick, index) => tick.offset - ticks[index].offset));
  expect(steps.size).toBe(1);
  const [step] = [...steps];
  expect(ticks.at(-1).offset + step).toBeGreaterThan(total - 1);

  // Each bar's box is its own months over the chart's months, and its period is
  // legible on the bar instead of measured back to the axis.
  for (const item of entries) {
    const row = page.locator(`.timeline-row[data-entry="${item.id}"]`);
    const track = await trackGeometry(row.locator('.timeline-track'));
    const box = await boxOf(row.locator('.timeline-bar'));
    expect((box.left - track.left) / track.width).toBeCloseTo((monthIndex(item.start) - first) / total, 2);
    expect(box.width / track.width).toBeCloseTo((monthIndex(item.end) - monthIndex(item.start) + 1) / total, 2);
    // Inside the bar on a wide screen, directly under it on a narrow one; either
    // way it overlaps its own bar's months and never leaves the track.
    await expect(row.locator('.timeline-period')).toHaveText(item.period);
    const period = await boxOf(row.locator('.timeline-period'));
    expect(period.right).toBeGreaterThan(box.left);
    expect(period.left).toBeLessThan(box.right);
    expect(period.left).toBeGreaterThanOrEqual(track.left - 0.5);
    expect(period.right).toBeLessThanOrEqual(track.left + track.width + 0.5);
  }

  // The shared months are a ribbon behind the rows that produced them. It is
  // drawn once per owning row, never as a row of its own.
  expect(bands.length).toBeGreaterThan(0);
  for (const band of bands) {
    const key = `${monthLabel(band.from)}/${monthLabel(band.to)}`;
    const spans = band.rows.map(id => entries.find(item => item.id === id));
    expect(spans.length).toBeGreaterThanOrEqual(2);
    // The ribbon really is where two periods coincide, not a decorative strip.
    expect(band.from).toBe(Math.max(...spans.map(item => monthIndex(item.start))));
    expect(band.to).toBe(Math.min(...spans.map(item => monthIndex(item.end))));
    const slices = page.locator(`.timeline-band[data-band="${key}"]`);
    await expect(slices).toHaveCount(band.rows.length);
    expect(await slices.evaluateAll(list => list.map(el => el.closest('.timeline-row').dataset.entry))).toEqual(band.rows);
    for (const id of band.rows) {
      const row = page.locator(`.timeline-row[data-entry="${id}"]`);
      const track = await trackGeometry(row.locator('.timeline-track'));
      const box = await boxOf(row.locator(`.timeline-band[data-band="${key}"]`));
      expect((box.left - track.left) / track.width).toBeCloseTo((band.from - first) / total, 2);
      expect(box.width / track.width).toBeCloseTo((band.to - band.from + 1) / total, 2);
    }
    const months = band.to - band.from + 1;
    await expect(page.locator(`.timeline-band[data-band="${key}"] .timeline-band-note`)).toHaveCount(1);
    await expect(page.locator(`.timeline-band[data-band="${key}"][data-band-head="true"] .timeline-band-note`)).toHaveText(`${months} bulan bersamaan`);
    // The chip carries the count; the months behind it stay readable to a
    // screen reader, which cannot see where the ribbon sits.
    await expect(page.locator('.timeline-lead')).toContainText(`${monthLabel(band.from)} - ${monthLabel(band.to)}: ${months} bulan dengan dua magang berjalan bersamaan`);
  }

  // Two periods at the same company are still spelled out as one employer.
  expect(repeats.length).toBeGreaterThan(0);
  await expect(page.locator('.timeline-note')).toHaveCount(repeats.length);
  for (const group of repeats) {
    await expect(page.locator('.timeline-note')).toContainText(`${group.company} muncul ${group.periods.length} kali: perusahaan yang sama, ${group.periods.length} periode magang`);
    await expect(page.locator('.timeline-note')).toContainText(group.periods.map(item => `${item.role} (${item.period})`).join(' lalu '));
  }
});

test('the month grid is decoration: switching it off moves no bar', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page, '/pengalaman');
  const geometry = () => page.locator('.timeline-bar').evaluateAll(list => list.map(el => {
    const box = el.getBoundingClientRect();
    return [Math.round(box.left * 100) / 100, Math.round(box.width * 100) / 100];
  }));
  const before = await geometry();
  expect(before).toHaveLength(chart.entries.length);
  // One line per month, from the same count the bars are measured against.
  await expect(page.locator('.timeline-row').first().locator('.timeline-grid > span')).toHaveCount(chart.total);
  await page.addStyleTag({ content: '.timeline-grid { display: none !important; }' });
  expect(await geometry()).toEqual(before);
});

test('every revealing element says what kind of content it is', async ({ page }) => {
  const kinds = new Set();
  for (const route of ['/', '/pengalaman', '/tentang', '/kontak']) {
    await ready(page, route);
    const found = await page.locator('[data-reveal], [data-reveal-group]').evaluateAll(list =>
      list.map(el => ({ tag: el.className, kind: el.dataset.revealKind || '' })));
    expect(found.length).toBeGreaterThan(0);
    expect(found.filter(item => !item.kind)).toEqual([]);
    found.forEach(item => kinds.add(item.kind));
  }
  // A vocabulary, not one uniform word: the visual pass targets these.
  expect(kinds.size).toBeGreaterThanOrEqual(4);
});

// The animation chunk lands a moment after the markup. Whatever the intro is
// going to do to the word, the reader must not first read it finished and then
// watch it be taken away.
test('the intro word is never painted finished before it animates', async ({ page }) => {
  // Warm the dev server's transform of the animation chunk, so the intro is not
  // skipped over a cold compile and this measures the intro rather than a miss.
  await page.request.get('/src/motion-runtime.js');
  await page.addInitScript(() => {
    window.__introY = [];
    const sample = () => {
      const letter = document.querySelector('.splash-word span');
      if (letter) window.__introY.push(Math.round(new DOMMatrixReadOnly(getComputedStyle(letter).transform).f));
      if (window.__introY.length < 400) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await page.goto('/#/');
  await expect(page.locator('.splash')).toHaveCount(0);
  const travel = await page.evaluate(() => window.__introY);
  expect(travel.length).toBeGreaterThan(4);
  // The first frame anyone can see is the first frame of the entrance: the
  // letter is below its own mask, not sitting at rest waiting to be yanked.
  expect(travel[0]).toBeGreaterThan(20);
  // And from there it only travels one way, up to its resting place.
  const backwards = travel.filter((y, i) => i > 0 && y > travel[i - 1] + 2);
  expect(backwards, 'the word is pulled back down after being shown').toEqual([]);
  expect(travel[travel.length - 1]).toBeLessThan(3);
});

// Every reveal hides its own content and waits for a scroll position to hand it
// back, so a trigger that never fires costs the content, not just its animation.
// Scroll position is the second opinion, and this proves it is consulted.
test('a reveal whose trigger is gone still arrives when it is scrolled to', async ({ page }) => {
  for (const route of ['/', '/pengalaman', '/tentang']) {
    await ready(page, route);
    await page.waitForTimeout(350);
    const killed = await page.evaluate(async () => {
      const { ScrollTrigger } = await import('/src/motion-runtime.js');
      let gone = 0;
      for (const trigger of ScrollTrigger.getAll()) {
        if (trigger.animation && !trigger.animation.progress()) { trigger.kill(false); gone++; }
      }
      return gone;
    });
    expect(killed, `no pending reveal trigger on ${route}`).toBeGreaterThan(0);
    for (const element of await page.locator('[data-reveal], [data-reveal-group] > *').all()) {
      await element.evaluate(el => el.scrollIntoView({ block: 'center' }));
      await expect(element).toHaveCSS('opacity', '1', { timeout: 2500 });
    }
  }
});

test('GSAP blocked still leaves every data visual on its final value', async ({ page }) => {
  let blocked = 0;
  await page.route(/\/node_modules\/.*gsap.*\.js/, route => { blocked++; return route.abort(); });
  await ready(page, '/tentang');
  const arc = await page.locator('.gpa-ring-value').evaluate(circle => ({
    length: Number(circle.getAttribute('stroke-dasharray')),
    offset: Number(getComputedStyle(circle).strokeDashoffset.replace('px', '')),
  }));
  expect(1 - arc.offset / arc.length).toBeCloseTo(3.74 / 4, 3);
  const scaleTrack = await trackGeometry(page.locator('.score-scale-track'));
  const scaleFill = await page.locator('.score-scale-fill').evaluate(el => el.getBoundingClientRect());
  expect(scaleFill.width / scaleTrack.width).toBeCloseTo((583 - 310) / (677 - 310), 2);
  await ready(page, '/pengalaman');
  const segments = await page.locator('.split-segment').evaluateAll(list => list.map(el => el.getBoundingClientRect().width));
  expect(segments[0] / segments[1]).toBeCloseTo(2, 1);
  const bars = await page.locator('.timeline-bar').evaluateAll(list => list.map(el => el.getBoundingClientRect().width));
  expect(bars).toHaveLength(experience.length);
  expect(bars.every(width => width > 20)).toBe(true);
  expect(blocked).toBeGreaterThan(0);
});

// --- Kirim 4: konversi ---------------------------------------------------

async function fillContactForm(page) {
  await page.getByLabel('Nama', { exact: true }).fill('Test Portfolio');
  await page.getByLabel('Email', { exact: true }).fill('portfolio@example.com');
  await page.getByLabel('Topik pesan').selectOption('Kerja sama promosi');
  await page.getByLabel('Pesan', { exact: true }).fill('Halo Anung, mari berdiskusi tentang kolaborasi brand.');
}

test('WhatsApp stands beside email and LinkedIn with a prefilled Indonesian message', async ({ page }) => {
  await ready(page, '/kontak');
  const whatsapp = page.locator('.contact-info').getByRole('link', { name: 'WhatsApp', exact: true });
  await expect(whatsapp).toBeVisible();
  const href = await whatsapp.getAttribute('href');
  expect(href.startsWith('https://wa.me/6281388116739?text=')).toBe(true);
  const greeting = new URL(href).searchParams.get('text');
  expect(greeting).toContain('Halo Anung');
  expect(greeting.length).toBeGreaterThan(30);
  // Same weight as the other two channels, and repeated in the footer.
  await expect(page.locator('.contact-info .contact-social')).toHaveCount(3);
  await expect(page.locator('.contact-info').getByRole('link', { name: 'LinkedIn', exact: true })).toBeVisible();
  await expect(page.locator('.site-footer').getByRole('link', { name: 'WhatsApp', exact: true })).toHaveAttribute('href', href);
});

// A share preview is built by a crawler that never runs JavaScript, so this
// reads the served document instead of the live DOM.
test('share metadata is complete in the served document and shares one origin', async ({ request }) => {
  const html = await (await request.get('/')).text();
  const content = (attribute, key) => {
    const match = html.match(new RegExp(`<meta ${attribute}="${key}" content="([^"]*)"`));
    return match && match[1].replace(/&amp;/g, '&');
  };
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)[1];
  expect(canonical).toBeTruthy();
  expect(content('property', 'og:url')).toBe(canonical);
  const image = content('property', 'og:image');
  expect(new URL(image).origin).toBe(new URL(canonical).origin);
  expect(new URL(image).pathname).toBe('/images/og-cover.png');
  expect(content('property', 'og:image:width')).toBe('1200');
  expect(content('property', 'og:image:height')).toBe('630');
  expect(content('property', 'og:image:alt').length).toBeGreaterThan(30);
  expect(content('property', 'og:type')).toBe('website');
  expect(content('property', 'og:description').length).toBeGreaterThan(30);
  expect(content('name', 'description').length).toBeGreaterThan(30);
  expect(content('name', 'twitter:card')).toBe('summary_large_image');
  expect(content('name', 'twitter:image')).toBe(image);
  expect(content('name', 'twitter:description')).toBe(content('property', 'og:description'));
  // og:title and the document title come from the same constant in src/site.js,
  // so the shared card and the tab can never drift apart.
  const title = html.match(/<title>([^<]*)<\/title>/)[1].replace(/&amp;/g, '&');
  expect(content('property', 'og:title')).toBe(title);
  expect(content('name', 'twitter:title')).toBe(title);
  // Exactly one canonical and one og:url; no repeated strings to drift.
  expect(html.match(/rel="canonical"/g)).toHaveLength(1);
  expect(html.match(/property="og:url"/g)).toHaveLength(1);
});

test('the CV can be read on the page without downloading it', async ({ page }) => {
  await ready(page, '/tentang');
  const pages = page.locator('.cv-pages img');
  await expect(pages).toHaveCount(2);
  const first = pages.first();
  await first.scrollIntoViewIfNeeded();
  // Scrolling only starts the lazy request. Firefox rejects decode() while that
  // request is still in flight ("EncodingError: Invalid image request") instead
  // of waiting for it, so decode() alone measures an image that has not landed
  // yet. Wait for the load, then decode has to succeed: that is what proves the
  // bytes are a readable page and not just a box of the right size.
  await expect.poll(() => first.evaluate(image => image.naturalWidth), { timeout: 10000 }).toBeGreaterThan(0);
  const rendered = await first.evaluate(async (image) => {
    const decoded = await image.decode().then(() => 'ok', error => `${error.name}: ${error.message}`);
    return { decoded, natural: image.naturalWidth, width: image.getAttribute('width'), height: image.getAttribute('height'), alt: image.alt };
  });
  // width + height on every new image is what keeps CLS where it is.
  expect(rendered.decoded).toBe('ok');
  expect(rendered.natural).toBeGreaterThan(0);
  expect(rendered.width).toBe('1000');
  expect(rendered.height).toBe('1413');
  expect(rendered.alt).toContain('Halaman 1');
  await expect(page.locator('.cv-pages figcaption').first()).toHaveText('Halaman 1 dari 2');
  // The download button does not go away.
  await expect(page.locator('.cv-preview').getByRole('link', { name: 'Download CV', exact: true })).toHaveAttribute('download', '');
});

test('contact form reports a real send when the backend accepts it', async ({ page }) => {
  await ready(page, '/kontak', BACKEND_ORIGIN);
  let payload = null;
  await page.route('https://api.web3forms.com/submit', async (route) => {
    payload = JSON.parse(route.request().postData());
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'Email sent successfully' }) });
  });
  await expect(page.locator('.form-footer p')).toContainText('Situs ini tidak menyimpan pesan Anda.');
  await fillContactForm(page);
  await page.getByRole('button', { name: 'Kirim pesan', exact: true }).click();
  await expect(page.locator('.form-status')).toContainText('Pesan terkirim ke anungramadhan17@gmail.com');
  await expect(page.locator('.form-status')).toHaveAttribute('data-status', 'sent');
  expect(payload.access_key).toBe('uji-kunci-bukan-kunci-asli');
  expect(payload.email).toBe('portfolio@example.com');
  expect(payload.name).toBe('Test Portfolio');
  expect(payload.message).toContain('kolaborasi brand');
  expect(payload.subject).toContain('Kerja sama promosi');
  // A sent message is cleared; nothing is promised about a reply.
  await expect(page.getByLabel('Pesan', { exact: true })).toHaveValue('');
  await expect(page.locator('.form-status')).not.toContainText('24 jam');
  await expect(page.locator('.form-fallback')).toHaveCount(0);
});

test('contact form offers the email draft when the backend rejects the send', async ({ page }) => {
  await ready(page, '/kontak', BACKEND_ORIGIN);
  await page.route('https://api.web3forms.com/submit', route => route.fulfill({
    status: 500, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Internal error' }),
  }));
  await fillContactForm(page);
  await page.getByRole('button', { name: 'Kirim pesan', exact: true }).click();
  await expect(page.locator('.form-status')).toContainText('Pesan belum terkirim');
  await expect(page.locator('.form-status')).toContainText('anungramadhan17@gmail.com');
  const fallback = page.locator('.form-fallback a');
  await expect(fallback).toBeVisible();
  const href = await fallback.getAttribute('href');
  expect(href.startsWith('mailto:anungramadhan17@gmail.com?subject=')).toBe(true);
  expect(decodeURIComponent(href)).toContain('kolaborasi brand');
  // What the visitor typed is still in the form.
  await expect(page.getByLabel('Pesan', { exact: true })).toHaveValue(/kolaborasi brand/);
});

test('contact send survives a dead network and keeps the draft reachable', async ({ page }) => {
  await ready(page, '/kontak', BACKEND_ORIGIN);
  await page.route('https://api.web3forms.com/submit', route => route.abort('failed'));
  await fillContactForm(page);
  await page.getByRole('button', { name: 'Kirim pesan', exact: true }).click();
  await expect(page.locator('.form-status')).toHaveAttribute('data-status', 'failed');
  await expect(page.locator('.form-status')).toContainText('Pesan belum terkirim');
  expect(await page.locator('.form-fallback a').getAttribute('href')).toContain('mailto:anungramadhan17@gmail.com');
  // The button comes back; a dead network does not lock the form.
  await expect(page.getByRole('button', { name: 'Kirim pesan', exact: true })).toBeEnabled();
});

test('a filled honeypot sends nothing and the trap stays out of the way', async ({ page }) => {
  await ready(page, '/kontak', BACKEND_ORIGIN);
  let calls = 0;
  await page.route('https://api.web3forms.com/submit', (route) => {
    calls++;
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });
  await expect(page.locator('.form-trap')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('input[name="website"]')).toHaveAttribute('tabindex', '-1');
  await fillContactForm(page);
  await page.locator('input[name="website"]').evaluate((element) => { element.value = 'https://spam.example'; });
  await page.getByRole('button', { name: 'Kirim pesan', exact: true }).click();
  await page.waitForTimeout(700);
  expect(calls).toBe(0);
  await expect(page.locator('.form-status')).toHaveAttribute('data-status', 'idle');
});

// --- Kirim 5: performa, SEO, penutup ---

test('every responsive image offers AVIF and WebP widths that all resolve', async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const files = new Set();
  for (const route of ['/', '/pengalaman', '/tentang']) {
    await ready(page, route);
    const pictures = await page.locator('picture').evaluateAll(nodes => nodes.map(node => ({
      src: node.querySelector('img')?.getAttribute('src'),
      sizes: node.querySelector('img')?.getAttribute('sizes'),
      sources: [...node.querySelectorAll('source')].map(source => ({ type: source.type, srcset: source.srcset, sizes: source.sizes })),
    })));
    expect(pictures.length, `responsive images on ${route}`).toBeGreaterThan(0);
    for (const picture of pictures) {
      expect(picture.sizes, `sizes attribute on ${picture.src}`).toBeTruthy();
      expect(picture.sources.map(source => source.type)).toEqual(['image/avif', 'image/webp']);
      for (const source of picture.sources) {
        // One sizes string for the whole element: a source that disagrees with
        // the <img> makes the browser preload one file and display another.
        expect(source.sizes, `sizes on ${source.type} of ${picture.src}`).toBe(picture.sizes);
        const candidates = source.srcset.split(',').map(part => part.trim().split(/\s+/));
        expect(candidates.length, `widths offered for ${picture.src}`).toBeGreaterThan(1);
        for (const [path, descriptor] of candidates) {
          expect(descriptor, `descriptor for ${path}`).toMatch(/^\d+w$/);
          files.add(path);
        }
      }
    }
  }
  expect(files.size).toBeGreaterThan(20);
  // A srcset that names a file nobody encoded is a silent 404 per viewport.
  const missing = [];
  for (const path of files) {
    const response = await request.get(path);
    if (response.status() !== 200) missing.push(`${path} -> ${response.status()}`);
  }
  expect(missing).toEqual([]);
});

test('the portrait a narrow screen downloads is not the desktop file', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const measure = async (width) => {
    await page.setViewportSize({ width, height: 900 });
    await ready(page, '/');
    const portrait = page.locator('.portrait-frame img');
    await expect(portrait).toHaveJSProperty('complete', true);
    return portrait.evaluate(node => ({
      current: new URL(node.currentSrc, location.href).pathname,
      natural: node.naturalWidth,
      box: Math.round(node.getBoundingClientRect().width),
      dpr: window.devicePixelRatio,
    }));
  };
  const narrow = await measure(390);
  const wide = await measure(1440);
  for (const shot of [narrow, wide]) {
    // Never smaller than the box it fills, and never larger than the widest
    // width the pipeline actually encodes.
    expect(shot.natural, `${shot.current} in a ${shot.box}px box`).toBeGreaterThanOrEqual(shot.box);
    expect(shot.natural, shot.current).toBeLessThanOrEqual(900);
  }
  // At 1x and 2x the phone box is far below the desktop file. A 3x screen
  // genuinely needs the widest source, so it is not held to this.
  if (narrow.dpr <= 2) expect(narrow.natural).toBeLessThan(wide.natural);
});

test('no image is reused with a different crop, whichever width is served', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const crops = new Map();
  for (const route of ['/', '/pengalaman', '/tentang', '/kontak']) {
    await ready(page, route);
    const used = await page.locator('img').evaluateAll(images => images.map(image => {
      const box = image.getBoundingClientRect();
      if (!box.width || !box.height) return null;
      const style = getComputedStyle(image);
      // Keyed on the canonical src, not on the width the browser happened to
      // pick, so responsive sources cannot hide a second crop of one picture.
      return { src: image.getAttribute('src'), crop: `${(box.width / box.height).toFixed(2)} ${style.objectFit} ${style.objectPosition}` };
    }).filter(Boolean));
    for (const { src, crop } of used) {
      if (!crops.has(src)) crops.set(src, new Set());
      crops.get(src).add(crop);
    }
  }
  expect(crops.size).toBeGreaterThan(2);
  const reused = [...crops].filter(([, variants]) => variants.size > 1)
    .map(([src, variants]) => `${src}: ${[...variants].join(' | ')}`);
  expect(reused).toEqual([]);
});

test('reduced motion never downloads the animation chunk', async ({ page }) => {
  const requested = [];
  await page.route(/motion-runtime|gsap|lenis/, (route) => { requested.push(route.request().url()); return route.continue(); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of ['/', '/pengalaman', '/tentang', '/kontak']) {
    await ready(page, route);
    await expect(page.locator('h1')).toHaveCount(1);
  }
  await page.waitForTimeout(800);
  // The stylesheet is part of the shell; the 131 KB of animation code is not.
  expect(requested.filter(url => !/\.css(\?|$)/.test(url))).toEqual([]);
});

test('route chunks blocked still leave Beranda complete and say so on the other routes', async ({ page }) => {
  await page.route(/\/src\/pages\/(Experience|About|Contact)\.jsx/, route => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page, '/');
  // Beranda is part of the shell, so losing the other three chunks cannot touch it.
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Halo, saya');
  await expect(page.locator('.portrait-frame img')).toBeVisible();
  await expect(page.locator('.contact-callout')).toBeVisible();
  // Widened first, because below 1100px the nav lives behind the menu toggle and
  // this test is about the chunk, not about the menu.
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('navigation').getByRole('link', { name: 'Pengalaman', exact: true }).click();
  // A chunk that never arrives has to produce a page that says so, never a blank
  // <main>. The browser keeps a failed module fetch for the whole session, so the
  // only real way back is a reload and the copy says exactly that.
  await expect(page.getByRole('heading', { level: 1 })).toContainText('gagal dimuat');
  await expect(page.getByRole('button', { name: 'Muat ulang halaman' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Kembali ke beranda' })).toBeVisible();
  await expect(page.locator('main')).toContainText('anungramadhan17@gmail.com');
  await expect(page.locator('.app')).not.toHaveAttribute('inert');
});

test('route chunks blocked on a cold deep link say so without a page error', async ({ page }) => {
  await page.route(/\/src\/pages\/Experience\.jsx/, route => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // The entry module asks for the deep link's chunk before React renders. That
  // request failing must reach the page as this message, not as an unhandled
  // rejection nobody is listening for — `afterEach` fails the test on either.
  await ready(page, '/pengalaman');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('gagal dimuat');
  await expect(page.getByRole('button', { name: 'Muat ulang halaman' })).toBeVisible();
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('.app')).not.toHaveAttribute('inert');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('navigation').getByRole('link', { name: 'Tentang', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('saya Anung.');
});

test('the document carries a Person graph built from the CV facts', async ({ request }) => {
  const html = await (await request.get('/')).text();
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
  expect(blocks).toHaveLength(1);
  const person = blocks[0];
  expect(person['@type']).toBe('Person');
  expect(person.name).toBe('Anung Hanindhita Ramadhan');
  expect(person.email).toBe('mailto:anungramadhan17@gmail.com');
  expect(person.alumniOf.name).toBe('IPB University');
  expect(person.sameAs).toContain('https://www.linkedin.com/in/anung-hanindhita-ramadhan');
  expect(person.address.addressLocality).toBe('Bekasi');
  expect(person.knowsAbout.length).toBeGreaterThan(5);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)[1];
  expect(person.url).toBe(canonical);
  // Nothing in the graph may read as a job held right now.
  expect(JSON.stringify(person)).not.toContain('worksFor');
});

test('robots, sitemap and llms.txt are served and agree on one origin', async ({ request }) => {
  const html = await (await request.get('/')).text();
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)[1];
  const origin = new URL(canonical).origin;

  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain(`Sitemap: ${origin}/sitemap.xml`);

  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const sitemapBody = await sitemap.text();
  // Hash routes are fragments of this one document; a second <loc> would be a
  // claim no crawler honours.
  expect(sitemapBody.match(/<loc>/g)).toHaveLength(1);
  expect(sitemapBody).toContain(`<loc>${canonical}</loc>`);
  expect(sitemapBody).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);

  const llms = await request.get('/llms.txt');
  expect(llms.status()).toBe(200);
  const llmsBody = await llms.text();
  // llmstxt.org asks for an H1 and Markdown links; Lighthouse's `llms-txt` audit
  // fails a file that has none, which is the whole reason this file exists.
  expect(llmsBody.startsWith('# Anung Hanindhita Ramadhan')).toBe(true);
  expect([...llmsBody.matchAll(/\[[^\]]+\]\((https?:\/\/|mailto:)[^)]+\)/g)].length).toBeGreaterThan(5);
  expect(llmsBody).toContain(`(${origin}/#/pengalaman)`);
  // The honesty rules have to travel with the numbers, or an assistant reading
  // this file will restate outreach as sales.
  expect(llmsBody).toContain('bukan hasil penjualan');
  expect(llmsBody).toContain('100 Shopee + 50 TikTok, bukan 150 orang unik');
  expect(llmsBody).toContain('ilustrasi abstrak sementara');
  for (const figure of ['150', '200', '583', '3.74']) expect(llmsBody, `angka ${figure}`).toContain(figure);
});
