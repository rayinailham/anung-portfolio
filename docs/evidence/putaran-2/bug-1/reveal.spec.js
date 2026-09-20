import { expect, test } from '@playwright/test';

const routes = ['/', '/pengalaman', '/tentang', '/kontak'];

let navigation = 0;

async function openReady(page, route) {
  navigation += 1;
  await page.goto(`/?reveal-probe=${navigation}#${route}`);
  await expect(page.locator('.splash')).toHaveCount(0);
  await expect(page.locator('.app')).not.toHaveAttribute('inert');
  await expect(page.locator('main')).not.toBeEmpty();
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('anung-intro', 'seen'));
});

test('the revealed guard and native deadline are armed before GSAP can hide content', async ({ request }) => {
  const source = await (await request.get('/src/motion.js')).text();
  const guard = source.indexOf('if (!scope || reduced || !revealed) return;');
  const deadline = source.indexOf('const safety = setTimeout');
  const context = source.indexOf('const context = gsap.context');
  expect(guard).toBeGreaterThan(-1);
  expect(deadline).toBeGreaterThan(guard);
  expect(context).toBeGreaterThan(deadline);
});

test('scrolling to the end leaves zero hidden reveals on every route after the deadline', async ({ page }) => {
  await openReady(page, '/');
  for (const route of routes) {
    await page.evaluate(next => { location.hash = `#${next}`; }, route);
    await expect(page.locator('.app')).not.toHaveAttribute('inert');
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await page.waitForTimeout(5_400);
    const result = await page.locator('[data-reveal], [data-reveal-group] > *').evaluateAll(elements => ({
      checked: elements.length,
      hidden: elements.map((element, index) => ({ index, opacity: Number(getComputedStyle(element).opacity) })).filter(item => item.opacity < 0.99),
    }));
    expect(result.checked, `${route} must contain reveal coverage`).toBeGreaterThan(0);
    expect(result.hidden, `${route} left hidden content`).toEqual([]);
  }
});

test('normal scroll reveal still animates from hidden to visible', async ({ page }) => {
  await openReady(page, '/pengalaman');
  const result = await page.evaluate(async () => {
    const { ScrollTrigger } = await import('/src/motion-runtime.js');
    const element = document.querySelector('.organizations');
    const trigger = ScrollTrigger.getAll().find(item => item.trigger === element);
    const animation = trigger.animation;
    animation.pause(0);
    const values = [];
    animation.play();
    const started = performance.now();
    while (performance.now() - started < 1_500) {
      values.push(Number(getComputedStyle(element).opacity));
      await new Promise(requestAnimationFrame);
    }
    return { duration: animation.duration(), values };
  });
  expect(result.duration).toBeGreaterThan(0);
  expect(result.values[0]).toBeLessThan(0.99);
  expect(result.values.some(value => value > 0 && value < 0.99)).toBe(true);
  expect(result.values.at(-1)).toBeGreaterThanOrEqual(0.99);
});
