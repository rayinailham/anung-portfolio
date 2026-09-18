import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = process.env.PORTFOLIO_URL || 'http://127.0.0.1:4173';
const output = 'docs/evidence/kirim-1';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const result = { baseURL, viewport: { width: 1440, height: 1000 }, consoleErrors: [], runtimeErrors: [] };
const luminance = hex => {
  const rgb = hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255)
    .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
};
const contrast = (a, b) => {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return Number(((values[0] + .05) / (values[1] + .05)).toFixed(3));
};
try {
  const page = await browser.newPage({ viewport: result.viewport, reducedMotion: 'reduce' });
  page.on('pageerror', error => result.runtimeErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') result.consoleErrors.push(message.text()); });
  result.contrast = {};
  for (const [route, name] of [['/', 'home'], ['/tentang', 'about']]) {
    await page.goto(`${baseURL}/#${route}`);
    await page.locator('h1').waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${output}/${name}-light-after.png` });
    if (route === '/') {
      await page.locator('.feature-photo').scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${output}/feature-after.png` });
      for (const theme of ['dark', 'light']) {
        await page.getByRole('button', { name: theme === 'dark' ? 'Aktifkan mode gelap' : 'Aktifkan mode terang' }).click();
        await page.waitForFunction(theme => document.documentElement.dataset.theme === theme &&
          getComputedStyle(document.querySelector('.main-nav a')).color === (theme === 'dark' ? 'rgb(229, 229, 229)' : 'rgb(20, 33, 61)'), theme);
        const tokens = await page.evaluate(() => {
          const style = getComputedStyle(document.documentElement);
          return Object.fromEntries(['--green', '--paper', '--paper-soft', '--ink', '--muted', '--button', '--button-text', '--gold', '--gold-ink']
            .map(name => [name, style.getPropertyValue(name).trim()]));
        });
        const pairs = {};
        for (const foreground of ['--ink', '--muted', '--green']) {
          for (const background of ['--paper', '--paper-soft']) {
            const ratio = contrast(tokens[foreground], tokens[background]);
            assert.ok(ratio >= 4.5, `${theme}: ${foreground}/${background} = ${ratio}`);
            pairs[`${foreground}/${background}`] = ratio;
          }
        }
        const buttonRatio = contrast(tokens['--button-text'], tokens['--button']);
        assert.ok(buttonRatio >= 4.5);
        pairs['--button-text/--button'] = buttonRatio;
        // .button:hover now swaps to --ink/--paper, and --gold carries the decorative accent.
        for (const [foreground, background] of [['--paper', '--ink'], ['--gold-ink', '--gold']]) {
          const ratio = contrast(tokens[foreground], tokens[background]);
          assert.ok(ratio >= 4.5, `${theme}: ${foreground}/${background} = ${ratio}`);
          pairs[`${foreground}/${background}`] = ratio;
        }
        result.contrast[theme] = { tokens, pairs };
        if (theme === 'dark') {
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.screenshot({ path: `${output}/home-dark-after.png` });
        }
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/`);
  await page.locator('.header-cv').waitFor();
  await page.evaluate(() => document.fonts.ready);
  result.touchTargets390 = await page.locator('.header-cv, .site-footer > div > a').evaluateAll(elements =>
    elements.map(el => ({ label: el.textContent.trim(), height: el.getBoundingClientRect().height })));
  assert.equal(result.touchTargets390.length, 3);
  assert.ok(result.touchTargets390.every(target => target.height >= 24));
  await page.locator('.portrait-scene').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${output}/mobile-portrait-after.png` });

  // Verify the actual static dist build, with the entire GSAP chunk blocked.
  const blocked = await browser.newPage({ viewport: result.viewport });
  result.blockedGSAP = { requests: [], pages: [], runtimeErrors: [], networkDiagnostics: [] };
  blocked.on('pageerror', error => result.blockedGSAP.runtimeErrors.push(error.message));
  blocked.on('console', message => { if (message.type() === 'error') result.blockedGSAP.networkDiagnostics.push(message.text()); });
  await blocked.route('**/assets/motion-runtime-*.js', route => {
    result.blockedGSAP.requests.push(route.request().url());
    return route.abort();
  });
  for (const route of ['/', '/pengalaman', '/tentang', '/kontak']) {
    await blocked.goto(`${baseURL}/#${route}`);
    await blocked.locator('h1').waitFor();
    await blocked.locator('.splash').waitFor({ state: 'detached' });
    const visibility = await blocked.locator('main').evaluate(main => {
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
      return { checked, hidden, inert: main.closest('.app').inert };
    });
    assert.ok(visibility.checked > 15);
    assert.deepEqual(visibility.hidden, []);
    assert.equal(visibility.inert, false);
    result.blockedGSAP.pages.push({ route, ...visibility });
    if (route === '/pengalaman') await blocked.screenshot({ path: `${output}/gsap-blocked-experience.png`, fullPage: true });
  }
  // Hash navigation reuses the document and its rejected import promise.
  assert.ok(result.blockedGSAP.requests.length > 0);
  assert.equal(result.blockedGSAP.pages.length, 4);
  assert.deepEqual(result.blockedGSAP.runtimeErrors, []);

  const deep = await browser.newPage({ viewport: result.viewport });
  await deep.goto(`${baseURL}/#/kontak`);
  await deep.locator('.contact-form').waitFor();
  result.deepLink = await deep.evaluate(() => ({
    splash: Boolean(document.querySelector('.splash')),
    inert: document.querySelector('.app').inert,
    formOpacity: getComputedStyle(document.querySelector('.contact-form')).opacity,
  }));
  assert.deepEqual(result.deepLink, { splash: false, inert: false, formOpacity: '1' });
  await deep.screenshot({ path: `${output}/contact-deep-link.png` });

  // No user input: record layout shifts caused by initial rendering and motion.
  const cls = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await cls.addInitScript(() => {
    window.layoutShifts = [];
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.layoutShifts.push({ value: entry.value, time: entry.startTime });
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await cls.goto(`${baseURL}/`);
  await cls.locator('.splash').waitFor({ state: 'detached' });
  await cls.waitForTimeout(5500);
  result.initialLayoutShifts390 = await cls.evaluate(() => window.layoutShifts);
  result.initialLayoutShiftSum390 = result.initialLayoutShifts390.reduce((sum, entry) => sum + entry.value, 0);
  await writeFile(`${output}/metrics.json`, `${JSON.stringify(result, null, 2)}\n`);
  assert.ok(result.initialLayoutShiftSum390 <= .01);
  assert.deepEqual(result.consoleErrors, []);
  assert.deepEqual(result.runtimeErrors, []);
  await writeFile(`${output}/metrics.json`, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
