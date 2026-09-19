# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portfolio.spec.js >> interrupted transition and live reduced motion never lock the page
- Location: tests/portfolio.spec.js:386:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByRole('heading', { level: 1 })
Expected substring: "Halo, saya"
Received string:    "Pengalamanmagang saya."
Timeout: 5000ms

Call log:
  - Expect "toContainText" getByRole('heading', { level: 1 }) with timeout 5000ms
  - waiting for getByRole('heading', { level: 1 })
    13 × locator resolved to <h1 class="">…</h1>
       - unexpected value "Pengalamanmagang saya."

```

```yaml
- heading "Pengalaman magang saya." [level=1]
```

# Test source

```ts
  292 |   const response = await request.get('/documents/anung-ramadhan-cv.pdf');
  293 |   expect(response.status()).toBe(200);
  294 |   expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-');
  295 |   await expect(page.getByRole('link', { name: 'Download CV', exact: true })).toHaveAttribute('download', '');
  296 | });
  297 | 
  298 | test('contact form validates inputs and prepares an honest email handoff', async ({ page }) => {
  299 |   await ready(page, '/kontak');
  300 |   const mailto = [];
  301 |   await page.route('mailto:**', route => { mailto.push(route.request().url()); return route.abort(); });
  302 |   await page.getByRole('button', { name: 'Buka draf email', exact: true }).click();
  303 |   expect(await page.locator('input[name="name"]').evaluate(el => el.validity.valueMissing)).toBe(true);
  304 |   await page.getByLabel('Nama', { exact: true }).fill('Test Portfolio');
  305 |   await page.getByLabel('Email', { exact: true }).fill('portfolio@example.com');
  306 |   await page.getByLabel('Topik pesan').selectOption('Kerja sama promosi');
  307 |   await page.getByLabel('Pesan', { exact: true }).fill('Halo Anung, mari berdiskusi tentang kolaborasi brand.');
  308 |   await page.getByRole('button', { name: 'Buka draf email', exact: true }).click();
  309 |   await expect(page.locator('.form-status')).toContainText('Draf email siap dibuka');
  310 |   await expect(page.getByRole('link', { name: 'anungramadhan17@gmail.com', exact: true })).toHaveAttribute('href', 'mailto:anungramadhan17@gmail.com');
  311 |   await expect(page.locator('.form-footer')).toContainText('Untuk mengirim pesan, tekan tombol kirim di aplikasi email.');
  312 | });
  313 | 
  314 | test('reduced motion bypasses intro and smooth scroll; keyboard navigation works', async ({ page }) => {
  315 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  316 |   await ready(page);
  317 |   await expect(page.locator('html')).not.toHaveClass(/lenis/);
  318 |   const link = page.getByRole('link', { name: 'Lihat pengalaman', exact: true });
  319 |   await link.focus();
  320 |   await page.keyboard.press('Enter');
  321 |   await expect(page.getByRole('heading', { level: 1 })).toContainText('magang saya.');
  322 |   await expect(page.locator('main')).toBeFocused();
  323 | });
  324 | 
  325 | test('mobile menu supports open, escape and navigation', async ({ page }) => {
  326 |   await page.setViewportSize({ width: 390, height: 844 });
  327 |   await ready(page);
  328 |   await expect(page.getByRole('navigation')).toBeHidden();
  329 |   await page.getByRole('button', { name: 'Buka menu' }).click();
  330 |   await expect(page.getByRole('navigation')).toBeVisible();
  331 |   await page.keyboard.press('Escape');
  332 |   await expect(page.getByRole('button', { name: 'Buka menu' })).toBeFocused();
  333 |   await page.getByRole('button', { name: 'Buka menu' }).click();
  334 |   await page.getByRole('navigation').getByRole('link', { name: 'Kontak', exact: true }).click();
  335 |   await expect(page.getByRole('heading', { level: 1 })).toContainText('Ada peluang');
  336 |   await expect(page.getByRole('navigation')).toBeHidden();
  337 | });
  338 | 
  339 | test('all pages keep readable text, fit narrow screens and load images in both themes', async ({ page }) => {
  340 |   const errors = [];
  341 |   page.on('pageerror', error => errors.push(error.message));
  342 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  343 |   for (const width of [320, 768, 1440]) {
  344 |     await page.setViewportSize({ width, height: 900 });
  345 |     for (const route of ['/', '/pengalaman', '/tentang', '/kontak']) {
  346 |       await ready(page, route);
  347 |       await expect(page.locator('h1')).toHaveCount(1);
  348 |       expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  349 |       const typography = await page.evaluate(() => {
  350 |         const walker = document.createTreeWalker(document.querySelector('.app'), NodeFilter.SHOW_TEXT);
  351 |         const small = [];
  352 |         let checked = 0;
  353 |         while (walker.nextNode()) {
  354 |           const node = walker.currentNode;
  355 |           const element = node.parentElement;
  356 |           if (!node.textContent.trim() || element.closest('.sr-only, [aria-hidden="true"], svg') || !element.getClientRects().length) continue;
  357 |           checked++;
  358 |           if (parseFloat(getComputedStyle(element).fontSize) < 14) small.push(node.textContent.trim());
  359 |         }
  360 |         return { checked, small };
  361 |       });
  362 |       expect(typography.checked).toBeGreaterThan(15);
  363 |       expect(typography.small).toEqual([]);
  364 |       if (route === '/kontak') {
  365 |         const inputSizes = await page.locator('input, select, textarea').evaluateAll(elements => elements.map(element => parseFloat(getComputedStyle(element).fontSize)));
  366 |         expect(inputSizes.every(size => size >= 16)).toBe(true);
  367 |       }
  368 |       for (const theme of ['dark', 'light']) {
  369 |         await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
  370 |         expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  371 |       }
  372 |       const images = await page.locator('img:not([loading="lazy"])').evaluateAll(imgs => imgs.every(img => img.complete && img.naturalWidth > 0));
  373 |       expect(images).toBe(true);
  374 |     }
  375 |   }
  376 |   expect(errors).toEqual([]);
  377 | });
  378 | 
  379 | test('unknown route has a usable recovery path', async ({ page }) => {
  380 |   await ready(page, '/missing-page');
  381 |   await expect(page.getByRole('heading', { level: 1 })).toContainText('Sepertinya salah jalan.');
  382 |   await page.getByRole('link', { name: 'Kembali ke beranda' }).click();
  383 |   await expect(page.getByRole('heading', { level: 1 })).toContainText('Halo, saya');
  384 | });
  385 | 
  386 | test('interrupted transition and live reduced motion never lock the page', async ({ page }) => {
  387 |   await ready(page);
  388 |   await page.evaluate(() => { location.hash = '/pengalaman'; });
  389 |   await expect(page.locator('.app')).toHaveAttribute('inert');
  390 |   await page.evaluate(() => { location.hash = '/'; });
  391 |   await expect(page.locator('.app')).not.toHaveAttribute('inert');
> 392 |   await expect(page.getByRole('heading', { level: 1 })).toContainText('Halo, saya');
      |                                                         ^ Error: expect(locator).toContainText(expected) failed
  393 |   await page.evaluate(() => { location.hash = '/kontak'; });
  394 |   await expect(page.locator('.app')).toHaveAttribute('inert');
  395 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  396 |   await expect(page.locator('.app')).not.toHaveAttribute('inert');
  397 |   await expect(page.getByRole('heading', { level: 1 })).toContainText('Ada peluang');
  398 |   await expect(page.locator('body')).not.toHaveClass(/motion-locked/);
  399 | });
  400 | 
  401 | test('deep link from a Beranda card lands on its own experience entry', async ({ page }) => {
  402 |   for (const [label, id] of [
  403 |     ['Lihat pengalaman pemasaran afiliasi di AnyMind Group', 'entri-anymind'],
  404 |     ['Lihat pengalaman kolaborasi KOL di PT Sutan Vet Medika', 'entri-anima-digital'],
  405 |   ]) {
  406 |     await ready(page, '/');
  407 |     const card = page.getByRole('link', { name: label, exact: true });
  408 |     await card.scrollIntoViewIfNeeded();
  409 |     await card.click();
  410 |     await expect(page.getByRole('heading', { level: 1 })).toContainText('magang saya.');
  411 |     await expect(page).toHaveURL(new RegExp(`#/pengalaman#${id}$`));
  412 |     await expect.poll(() => page.locator(`#${id}`).evaluate(el => el.getBoundingClientRect().top), { timeout: 5000 })
  413 |       .toBeLessThan(260);
  414 |     expect(await page.locator(`#${id}`).evaluate(el => el.getBoundingClientRect().bottom)).toBeGreaterThan(0);
  415 |   }
  416 | });
  417 | 
  418 | test('every evidence slot is declared, sized and captioned honestly', async ({ page }) => {
  419 |   await ready(page, '/pengalaman');
  420 |   await expect(page.locator('.evidence-item')).toHaveCount(4);
  421 |   await expect(page.locator('.evidence-item[data-placeholder="true"]')).toHaveCount(3);
  422 |   await expect(page.locator('.evidence-item:not([data-placeholder]) img'))
  423 |     .toHaveAttribute('src', '/images/anymind-pantene-team.webp');
  424 |   const sizes = await page.locator('.evidence-cover img').evaluateAll(images =>
  425 |     images.map(image => [Number(image.getAttribute('width')), Number(image.getAttribute('height'))]));
  426 |   expect(sizes).toHaveLength(4);
  427 |   expect(sizes.every(([width, height]) => width > 0 && height > 0)).toBe(true);
  428 |   for (const slot of await page.locator('.evidence-item[data-placeholder="true"]').all()) {
  429 |     await expect(slot.locator('figcaption')).toContainText('ilustrasi sementara');
  430 |     await expect(slot.locator('figcaption')).toBeVisible();
  431 |   }
  432 |   // The real photo is never described as work Anung produced on his own.
  433 |   await expect(page.locator('#entri-anymind .evidence-item figcaption')).toContainText('Pantene Affiliate Gathering');
  434 | });
  435 | 
  436 | test('placeholder covers missing still leave the evidence slots correct', async ({ page }) => {
  437 |   let aborted = 0;
  438 |   await page.route('**/images/placeholder/**', route => { aborted++; return route.abort(); });
  439 |   await ready(page, '/pengalaman');
  440 |   const slots = page.locator('.evidence-item[data-placeholder="true"]');
  441 |   await expect(slots).toHaveCount(3);
  442 |   for (const slot of await slots.all()) {
  443 |     await slot.scrollIntoViewIfNeeded();
  444 |     await expect(slot.locator('figcaption')).toBeVisible();
  445 |     const cover = slot.locator('.evidence-cover');
  446 |     expect(await cover.evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThan(40);
  447 |     expect(await cover.evaluate(el => getComputedStyle(el).backgroundImage)).toContain('linear-gradient');
  448 |     await expect(slot.locator('img')).toHaveAttribute('data-missing', 'true');
  449 |   }
  450 |   expect(aborted).toBeGreaterThan(0);
  451 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  452 | });
  453 | 
  454 | test('no image is reused with a different crop', async ({ page }) => {
  455 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  456 |   const crops = new Map();
  457 |   for (const route of ['/', '/pengalaman', '/tentang', '/kontak']) {
  458 |     await ready(page, route);
  459 |     const used = await page.locator('img').evaluateAll(images => images.map(image => {
  460 |       const box = image.getBoundingClientRect();
  461 |       if (!box.width || !box.height) return null;
  462 |       const style = getComputedStyle(image);
  463 |       return {
  464 |         src: new URL(image.currentSrc || image.src, location.href).pathname,
  465 |         crop: `${(box.width / box.height).toFixed(2)} ${style.objectFit} ${style.objectPosition}`,
  466 |       };
  467 |     }).filter(Boolean));
  468 |     for (const { src, crop } of used) {
  469 |       if (!crops.has(src)) crops.set(src, new Set());
  470 |       crops.get(src).add(crop);
  471 |     }
  472 |   }
  473 |   expect(crops.size).toBeGreaterThan(2);
  474 |   const reused = [...crops].filter(([, variants]) => variants.size > 1)
  475 |     .map(([src, variants]) => `${src}: ${[...variants].join(' | ')}`);
  476 |   expect(reused).toEqual([]);
  477 | });
  478 | 
  479 | test('the contact callout says something different on each page', async ({ page }) => {
  480 |   const headings = [];
  481 |   for (const route of ['/', '/pengalaman', '/tentang']) {
  482 |     await ready(page, route);
  483 |     await expect(page.locator('.contact-callout h2')).toHaveCount(1);
  484 |     headings.push((await page.locator('.contact-callout h2').innerText()).trim());
  485 |     expect((await page.locator('.contact-callout .button').innerText()).trim().length).toBeGreaterThan(0);
  486 |   }
  487 |   expect(new Set(headings).size).toBe(3);
  488 | });
  489 | 
  490 | test('CV facts that were missing are on the page with their own numbers', async ({ page }) => {
  491 |   await ready(page, '/pengalaman');
  492 |   await expect(page.locator('#entri-anymind .experience-context')).toContainText('15 pasar Asia dan Timur Tengah');
```