// Extra VIS-1 evidence: rendered containment, actual tween timing and progress.
// Run after npm run build, with vite preview serving port 4173.
import assert from 'node:assert/strict';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
const base = process.env.PORTFOLIO_URL || 'http://127.0.0.1:4173';
const output = new URL('./', import.meta.url);
const runtime = (await readdir('dist/assets')).find(name => name.startsWith('motion-runtime-') && name.endsWith('.js'));
assert(runtime);
const result = { containment: [], motion: {}, paintedContrast: [] };
const browser = await chromium.launch();
try {
  for (const theme of ['light', 'dark']) {
    for (const width of [320, 390, 1100, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      await page.addInitScript(theme => localStorage.setItem('anung-theme', theme), theme);
      await page.goto(`${base}/#/tentang`);
      await page.locator('.gpa-ring').waitFor();
      await page.evaluate(() => document.fonts.ready);
      const containment = await page.locator('.gpa').evaluate(el => {
        const ring = el.querySelector('svg').getBoundingClientRect();
        const figure = el.querySelector('.gpa-figure').getBoundingClientRect();
        const parent = el.getBoundingClientRect();
        return { ringFits: ring.left >= parent.left && ring.right <= parent.right,
          figureFits: figure.left > ring.left && figure.right < ring.right && figure.top > ring.top && figure.bottom < ring.bottom,
          centered: Math.abs((ring.left + ring.right) - (figure.left + figure.right)) < 1 };
      });
      assert(Object.values(containment).every(Boolean), `GPA containment ${theme} ${width}`);
      result.containment.push({ theme, width, ...containment });
      await page.close();
    }
  }
  for (const [id, route, selector] of [['arc', '/tentang', '.gpa-ring'], ['bar', '/pengalaman', '.timeline-track']]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 700 } });
    await page.addInitScript(() => sessionStorage.setItem('anung-intro', 'seen'));
    await page.goto(`${base}/#${route}`);
    await page.locator(selector).first().waitFor();
    await page.waitForTimeout(500);
    const motion = await page.evaluate(async ({ runtime, selector }) => {
      const { gsap, ScrollTrigger } = await import(`/assets/${runtime}`);
      const tables = ScrollTrigger.getAll().filter(t => t.animation).map(t => ({
        kind: t.trigger?.dataset.revealKind || null,
        duration: t.animation.vars.duration,
        ease: t.animation.vars.ease,
        stagger: t.animation.vars.stagger ?? null,
      }));
      const target = document.querySelector(selector);
      const samples = [];
      target.scrollIntoView({ block: 'center', behavior: 'instant' });
      // Keep browser sampling on animation frames; no hand-advanced GSAP clock.
      const start = performance.now();
      await new Promise(resolve => {
        function tick() {
          const arc = document.querySelector('[data-arc]');
          samples.push({ ms: Math.round(performance.now() - start),
            arc: arc ? 1 - parseFloat(getComputedStyle(arc).strokeDashoffset) / +arc.getAttribute('stroke-dasharray') : null,
            arcOffset: arc ? getComputedStyle(arc).strokeDashoffset : null,
            arcLength: arc ? +arc.getAttribute('stroke-dasharray') : null,
            bars: [...document.querySelectorAll('.timeline-bar')].map(el => +gsap.getProperty(el, 'scaleX')) });
          if (performance.now() - start < 1800) requestAnimationFrame(tick); else resolve();
        }
        requestAnimationFrame(tick);
      });
      return { tables, samples };
    }, { runtime, selector });
    await writeFile(new URL(`motion-${id}-raw.json`, output), JSON.stringify(motion, null, 2)+'\n');
    if (id === 'arc') {
      assert(motion.samples.some(s => s.arc > 0.01 && s.arc < .92), 'arc has intermediate values');
      // GSAP autoRound rounds intermediate CSS stroke offsets to SVG units.
      // Permit half a unit during the tween; the resting attribute stays exact.
      assert(motion.samples.every(s => s.arc >= -.5 / s.arcLength && s.arc <= .935 + .5 / s.arcLength), 'arc stays within half a rounded SVG unit');
      assert(Math.abs(motion.samples.at(-1).arc - .935) < .001, 'arc lands at final CV value');
    } else {
      assert(motion.samples.some(s => s.bars.some(v => v > .01 && v < .99)), 'bars have intermediate values');
      assert(motion.samples.every(s => s.bars.every(v => v >= 0 && v <= 1)), 'bars never overshoot');
      assert.equal(motion.samples.at(-1).bars[0], 1, 'visible bar reaches final scale');
    }
    result.motion[id] = motion;
    await page.close();
  }
} finally { await browser.close(); }
// Grid/track paint is translucent ink over the existing surface. Test these
// additional adjacent pairs, beyond the unchanged 40-pair Kirim 3 verifier.
const rgb = s => s.match(/[\d.]+/g).map(Number);
const mix = (f,b) => f.slice(0,3).map((v,i) => v*(f[3] ?? 1)+b[i]*(1-(f[3] ?? 1)));
const luminance = c => c.map(v => v/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4).reduce((s,v,i) => s+v*[.2126,.7152,.0722][i],0);
const contrast = (a,b) => { const [hi,lo]=[luminance(a),luminance(b)].sort((a,b)=>b-a); return (hi+.05)/(lo+.05); };
const metrics=JSON.parse(await readFile(new URL('metrics.json', output),'utf8'));
for (const [theme, pairs] of Object.entries(metrics.contrast)) {
  for (const id of ['gpa-arc','timeline-bar-fill','timeline-overlap-fill']) {
    const p=pairs[id];
    const ink=rgb(pairs['timeline-role-label'].front);
    const track=mix([...ink.slice(0,3),.2],rgb(p.back));
    const ratio=+contrast(rgb(p.front),track).toFixed(3);
    assert(ratio >= 3, `${theme} ${id} over grid/track ${ratio}`);
    result.paintedContrast.push({theme,id,foreground:p.front,paintedTrack:track,ratio,passes:true});
  }
}
await writeFile(new URL('polish-metrics.json', output),JSON.stringify(result,null,2)+'\n');
console.log(`VIS-1: ${result.containment.length} ring containment checks; live arc/bar samples; ${result.paintedContrast.length} painted contrast pairs OK`);
