import { expect, test } from '@playwright/test';

test('intro gives the complete text at least 0.9 seconds and finishes below 2.2 seconds', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    window.__introProbe = {};
    const settled = element => {
      const style = getComputedStyle(element);
      const matrix = style.transform === 'none' ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(style.transform);
      return Number(style.opacity) >= 0.99 && Math.abs(matrix.m41) < 0.5 && Math.abs(matrix.m42) < 0.5;
    };
    const sample = () => {
      const now = performance.now();
      const splash = document.querySelector('.splash');
      if (splash) {
        window.__introProbe.firstSeenAt ??= now;
        const content = splash.querySelector('.splash-content');
        const caption = splash.querySelector('.splash-caption');
        const letters = [...splash.querySelectorAll('.splash-word span')];
        const readable = settled(content) && settled(caption) && letters.every(settled);
        if (!readable) window.__introProbe.animationStartedAt ??= now;
        if (readable && window.__introProbe.animationStartedAt !== undefined) window.__introProbe.readableAt ??= now;
        if (!readable && window.__introProbe.readableAt !== undefined) window.__introProbe.leavingAt ??= now;
      } else if (window.__introProbe.firstSeenAt !== undefined) {
        window.__introProbe.removedAt = now;
        return;
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await page.goto('/?intro-probe=timing#/');
  await expect(page.locator('.splash')).toBeVisible();
  await expect(page.locator('.splash')).toHaveCount(0);
  const metrics = await page.evaluate(() => {
    const probe = window.__introProbe;
    return {
      readWindowMs: probe.leavingAt - probe.readableAt,
      totalMs: probe.removedAt - probe.animationStartedAt,
      readableAtMs: probe.readableAt - probe.animationStartedAt,
    };
  });
  console.log(`[intro-metrics] ${testInfo.project.name} ${JSON.stringify(metrics)}`);
  expect(metrics.readWindowMs).toBeGreaterThanOrEqual(900);
  expect(metrics.totalMs).toBeLessThan(2_200);
  await page.reload();
  await expect(page.locator('.splash')).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem('anung-intro'))).toBe('seen');
});

test('Lewati intro opens the page immediately during the reading hold', async ({ page }) => {
  await page.goto('/?intro-probe=skip#/');
  await expect(page.locator('.splash')).toBeVisible();
  await page.waitForTimeout(700);
  const started = Date.now();
  await page.getByRole('button', { name: 'Lewati intro' }).click();
  await expect(page.locator('.splash')).toHaveCount(0);
  expect(Date.now() - started).toBeLessThan(500);
  await expect(page.locator('.app')).not.toHaveAttribute('inert');
});

test('reduced motion bypasses the intro without downloading the motion runtime', async ({ page }) => {
  const runtimeRequests = [];
  page.on('request', request => {
    if (request.url().includes('motion-runtime')) runtimeRequests.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?intro-probe=reduced#/');
  await expect(page.locator('.splash')).toHaveCount(0);
  await expect(page.locator('.app')).not.toHaveAttribute('inert');
  await expect(page.locator('html')).not.toHaveClass(/lenis/);
  expect(runtimeRequests).toEqual([]);
});
