// Taller capture keeps the sticky header outside the complete mobile timeline.
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
const browser = await chromium.launch();
try {
  for (const theme of ['light', 'dark']) {
    const page = await browser.newPage({viewport:{width:390,height:1200},reducedMotion:'reduce'});
    await page.addInitScript(theme => localStorage.setItem('anung-theme',theme),theme);
    await page.goto('http://127.0.0.1:4173/#/pengalaman');
    const section=page.locator('.timeline-section');
    await section.waitFor();
    await page.evaluate(() => document.fonts.ready);
    await section.evaluate(el => window.scrollTo(0,el.getBoundingClientRect().top+scrollY-100));
    await section.screenshot({path:fileURLToPath(new URL(`timeline-karier-390-${theme}-uncropped.webp`,import.meta.url)),type:'webp',quality:80});
    await page.close();
  }
} finally { await browser.close(); }
console.log('2 complete mobile timeline captures');
