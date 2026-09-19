import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  page.runtimeErrors = [];
  page.consoleErrors = [];
  page.on('pageerror', error => page.runtimeErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') page.consoleErrors.push(message.text()); });
});

// Tests that deliberately abort a request get a browser network diagnostic on
// the console; every other test still has to keep the console clean.
const NETWORK_FAULT_TESTS = ['GSAP blocked', 'placeholder covers missing'];

test.afterEach(async ({ page }, testInfo) => {
  expect(page.runtimeErrors, 'uncaught runtime errors').toEqual([]);
  if (!NETWORK_FAULT_TESTS.some(prefix => testInfo.title.startsWith(prefix))) {
    expect(page.consoleErrors, 'console errors').toEqual([]);
  }
});

async function ready(page, route = '/') {
  await page.goto(`/#${route}`);
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
  expect(heights).toHaveLength(3);
  expect(heights.every(height => height >= 24)).toBe(true);
  await expect(page.locator('.marquee')).not.toHaveAttribute('role', 'img');
  await expect(page.locator('.marquee > .sr-only')).toHaveText('Bidang: pemasaran afiliasi, kerja sama KOL, perencanaan konten.');
  await expect(page.locator('.marquee-track')).toHaveAttribute('aria-hidden', 'true');
  await page.getByRole('button', { name: 'Aktifkan mode gelap' }).click();
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
  await page.getByRole('button', { name: 'Aktifkan mode gelap' }).click();
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

test('the career timeline draws the two overlapping internships on one axis', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page, '/pengalaman');
  const timeline = page.locator('.timeline');
  await expect(timeline).toHaveAttribute('data-span', 'Sep 2025/Jul 2026');
  await expect(page.locator('.timeline-row')).toHaveCount(4);
  await expect(page.locator('.timeline-lead')).toContainText('4 bulan dengan dua magang berjalan bersamaan');
  await expect(page.locator('.timeline-note')).toContainText('PT Sutan Vet Medika muncul 2 kali: perusahaan yang sama');
  await expect(page.locator('.timeline-note')).toContainText('Digital Marketing Intern (Sep - Des 2025) lalu Marketing Intern (Coordination Role) (Jan - Jul 2026)');

  const span = 11; // Sep 2025 through Jul 2026, inclusive.
  const bar = async (selector) => {
    const row = page.locator(selector);
    const track = await trackGeometry(row.locator('.timeline-track'));
    const box = await row.locator('.timeline-bar').evaluate(el => el.getBoundingClientRect());
    return { from: (box.left - track.left) / track.width, to: (box.right - track.left) / track.width, unit: track.width / span };
  };
  const digital = await bar('.timeline-row[data-entry="anima-digital"]');
  const anymind = await bar('.timeline-row[data-entry="anymind"]');
  const coordination = await bar('.timeline-row[data-entry="anima-coordination"]');
  const overlap = await bar('.timeline-overlap');
  expect(digital.from).toBeCloseTo(0, 2);
  expect(digital.to).toBeCloseTo(4 / span, 2);
  expect(anymind.from).toBeCloseTo(4 / span, 2);
  expect(anymind.to).toBeCloseTo(8 / span, 2);
  expect(coordination.from).toBeCloseTo(4 / span, 2);
  expect(coordination.to).toBeCloseTo(11 / span, 2);
  // The two 2026 roles really do cover the same months, and the marker row is
  // exactly that shared stretch rather than a decorative band.
  const shared = [Math.max(anymind.from, coordination.from), Math.min(anymind.to, coordination.to)];
  expect(shared[1] - shared[0]).toBeCloseTo(4 / span, 2);
  expect(overlap.from).toBeCloseTo(shared[0], 2);
  expect(overlap.to).toBeCloseTo(shared[1], 2);
  await expect(page.locator('.timeline-overlap .timeline-period')).toHaveText('Jan 2026 - Apr 2026');
  await expect(page.locator('.timeline-axis')).toHaveText('Sep 2025Jul 2026');
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
  expect(bars).toHaveLength(4);
  expect(bars.every(width => width > 20)).toBe(true);
  expect(blocked).toBeGreaterThan(0);
});
