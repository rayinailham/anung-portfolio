import { useEffect, useLayoutEffect, useState } from 'react';
let gsap, ScrollTrigger, Lenis;
let runtime;

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

// Animation is optional: a rejected or stalled chunk must not stop React.
// Under `prefers-reduced-motion: reduce` nothing in that chunk is allowed to
// run, so it is never fetched either — 'skipped' is the same answer as
// 'unavailable' to every caller. Turning the preference off later still loads
// it, which is why this watches the query instead of reading it once.
export function useMotionStatus() {
  const reduced = useReducedMotion();
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    if (reduced) { setStatus('skipped'); return; }
    let active = true;
    const timeout = setTimeout(() => { active = false; setStatus('unavailable'); }, 6000);
    runtime ||= import('./motion-runtime');
    runtime.then(modules => {
      if (!active) return;
      ({ gsap, ScrollTrigger, Lenis } = modules);
      clearTimeout(timeout);
      setStatus('ready');
    }).catch(() => {
      if (!active) return;
      clearTimeout(timeout);
      setStatus('unavailable');
    });
    return () => { active = false; clearTimeout(timeout); };
  }, [reduced]);
  return status;
}

// Reveal directions for [data-reveal] / [data-reveal-group]. Offsets are scaled
// down on narrow screens so a sideways reveal never pushes past the gutter.
const REVEAL_FROM = {
  up: { y: 44, opacity: 0 },
  down: { y: -40, opacity: 0 },
  left: { x: -48, opacity: 0 },
  right: { x: 48, opacity: 0 },
  zoom: { scale: 0.93, opacity: 0 },
  fade: { opacity: 0 },
};
const REVEAL_TO = { x: 0, y: 0, opacity: 1, scale: 1 };

// Per-kind timing for [data-reveal-kind]. Kirim 3 deliberately ships one shared
// curve in every row: the vocabulary is the hook, the values belong to the
// visual pass. Changing a row here changes only that kind of content.
const REVEAL_TIMING = {
  heading: { duration: 0.82, ease: 'power4.out' },
  text: { duration: 0.56, ease: 'power2.out' },
  stat: { duration: 0.68, ease: 'power3.out' },
  media: { duration: 1.05, ease: 'power3.out' },
  panel: { duration: 0.76, ease: 'power3.out' },
  viz: { duration: 0.62, ease: 'power2.out' },
};
const REVEAL_GROUP_TIMING = {
  heading: { duration: 0.78, stagger: 0.07, ease: 'power4.out' },
  text: { duration: 0.52, stagger: 0.035, ease: 'power2.out' },
  stat: { duration: 0.66, stagger: 0.075, ease: 'power3.out' },
  media: { duration: 1, stagger: 0.08, ease: 'power3.out' },
  panel: { duration: 0.72, stagger: 0.06, ease: 'power3.out' },
  viz: { duration: 0.6, stagger: 0.045, ease: 'power2.out' },
};
// Data visuals draw towards the value the DOM already holds, never away from it.
const VIZ_TIMING = {
  arc: { duration: 1.2, ease: 'power3.out' },
  bar: { duration: 0.88, ease: 'power2.out' },
};
const timingFor = (table, kind, fallback) => table[kind] || table[fallback];

function revealFrom(name, scale) {
  const preset = REVEAL_FROM[name] || REVEAL_FROM.up;
  const vars = { ...preset };
  if (vars.x) vars.x *= scale;
  if (vars.y) vars.y *= scale;
  return vars;
}

export function useSmoothScroll(ref, reduced) {
  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true, syncTouch: false });
    ref.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const frame = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(frame);
    gsap.ticker.lagSmoothing(0);
    const visibility = () => { if (document.hidden) lenis.stop(); else lenis.start(); };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      gsap.ticker.remove(frame);
      lenis.destroy();
      ref.current = null;
    };
  }, [ref, reduced]);
}

export function usePageMotion(ref, route, revealed, reduced, skipOpening = false) {
  useLayoutEffect(() => {
    const scope = ref.current;
    // Never create a from-state until the page is allowed to animate. A tween
    // created while the intro or route curtain owns the page can hide content,
    // then lose every recovery hook when this effect returns early.
    if (!scope || reduced || !revealed) return;
    const reveals = [];
    const safetyElements = [...scope.querySelectorAll('[data-reveal], [data-reveal-group], [data-reveal-group] > *, [data-mask], .hero-enter, .title-line > span, .portrait-frame, [data-arc], [data-bar], [data-bar-fill]')];
    const counters = [...scope.querySelectorAll('[data-count]')];
    let lastTick = Date.now();
    const markTick = () => { lastTick = Date.now(); };
    gsap.ticker.add(markTick);
    // Arm the native deadline before GSAP is allowed to paint a hidden frame.
    // It only restores elements if the GSAP ticker is dead / sleeping, never killing healthy tweens.
    const safety = setTimeout(() => {
      if (!gsap || (Date.now() - lastTick > 1000)) {
        gsap?.killTweensOf(safetyElements);
        for (const element of safetyElements) {
          element.style.removeProperty('opacity');
          element.style.removeProperty('transform');
          element.style.removeProperty('clip-path');
          // Dropping the inline override hands the arc back to its own attribute.
          element.style.removeProperty('stroke-dashoffset');
        }
        counters.forEach(element => { element.textContent = `${element.dataset.count}${element.dataset.suffix || ''}`; });
      }
    }, 5000);
    const context = gsap.context(() => {
      const title = scope.querySelectorAll('.title-line > span');
      const entrance = scope.querySelectorAll('.hero-enter');
      const frame = scope.querySelector('.page-opening .portrait-frame');

      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (!skipOpening && title.length) intro.fromTo(title, { yPercent: 118 }, { yPercent: 0, duration: 1, stagger: 0.08, ease: 'expo.out', clearProps: 'transform' }, 0);
      if (!skipOpening && entrance.length) intro.fromTo(entrance, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75, stagger: 0.08, clearProps: 'transform,opacity' }, 0.14);
      if (!skipOpening && frame) {
        intro.fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.inOut', clearProps: 'clipPath' }, 0.2);
        const portrait = frame.querySelector('img');
        if (portrait) {
          const base = Number(gsap.getProperty(portrait, 'scaleX')) || 1;
          intro.fromTo(portrait, { scale: base * 1.14 }, { scale: base, duration: 1.4, ease: 'power3.out' }, 0.2);
        }
      }

      const scale = window.innerWidth < 768 ? 0.5 : 1;
      gsap.utils.toArray('[data-reveal]').forEach((element) => {
        const tween = gsap.fromTo(element, revealFrom(element.dataset.reveal, scale), {
          ...REVEAL_TO,
          ...timingFor(REVEAL_TIMING, element.dataset.revealKind, 'text'),
          delay: Number(element.dataset.revealDelay) || 0,
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true },
        });
        reveals.push({ element, tween, start: 0.88 });
      });
      gsap.utils.toArray('[data-reveal-group]').forEach((group) => {
        const children = [...group.children];
        if (!children.length) return;
        const tween = gsap.fromTo(children, revealFrom(group.dataset.revealGroup, scale), {
          ...REVEAL_TO,
          ...timingFor(REVEAL_GROUP_TIMING, group.dataset.revealKind, 'text'),
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: group, start: 'top 86%', once: true },
        });
        reveals.push({ element: group, tween, start: 0.86 });
      });
      // Wipe media in rather than fading it: the frame opens upward while the
      // picture inside settles back to its resting scale.
      gsap.utils.toArray('[data-mask]').forEach((element) => {
        const timeline = gsap.timeline({ scrollTrigger: { trigger: element, start: 'top 90%', once: true } });
        timeline.fromTo(element, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.05, ease: 'power3.inOut', clearProps: 'clipPath' });
        const media = element.querySelector('img');
        if (media) {
          const base = Number(gsap.getProperty(media, 'scaleX')) || 1;
          timeline.fromTo(media, { scale: base * 1.16 }, { scale: base, duration: 1.3, ease: 'power3.out' }, 0);
        }
        reveals.push({ element, tween: timeline, start: 0.9 });
      });
      gsap.utils.toArray('[data-parallax]').forEach((element) => {
        gsap.fromTo(element, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: element.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      gsap.utils.toArray('[data-spin]').forEach((element) => {
        gsap.fromTo(element, { rotate: -25 }, { rotate: 25, ease: 'none', scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      // The arc's resting `stroke-dashoffset` attribute is the honest value;
      // the tween starts from an empty ring and lands exactly back on it.
      gsap.utils.toArray('[data-arc]').forEach((element) => {
        const length = Number(element.getAttribute('stroke-dasharray'));
        const tween = gsap.from(element, {
          strokeDashoffset: length,
          ...VIZ_TIMING.arc,
          clearProps: 'strokeDashoffset',
          scrollTrigger: { trigger: element, start: 'top 92%', once: true },
        });
        reveals.push({ element, tween, start: 0.92 });
      });
      // Bars grow from zero width, never from a non-zero baseline. The box keeps
      // its measured size, so nothing shifts and no value is exaggerated.
      gsap.utils.toArray('[data-bar], [data-bar-fill]').forEach((element) => {
        const trigger = element.closest('figure, li, section') || element;
        const tween = gsap.from(element, {
          scaleX: 0,
          transformOrigin: 'left center',
          ...VIZ_TIMING.bar,
          clearProps: 'transform',
          scrollTrigger: { trigger, start: 'top 92%', once: true },
        });
        // A bar that never grows reads as a value of zero, so it is measured
        // against the element its trigger actually watches, not against itself.
        reveals.push({ element: trigger, tween, start: 0.92 });
      });
      gsap.utils.toArray('[data-count]').forEach((element) => {
        const value = Number(element.dataset.count);
        const counter = { value: 0 };
        gsap.to(counter, { value, duration: 1.2, ease: 'power2.out', onUpdate: () => { element.textContent = `${Math.round(counter.value)}${element.dataset.suffix || ''}`; }, scrollTrigger: { trigger: element, start: 'top 95%', once: true } });
      });
      const progress = scope.querySelector('.scroll-progress span');
      if (progress) {
        gsap.fromTo(progress, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
      }
      const marquee = scope.querySelector('.marquee-track');
      if (marquee) {
        const loop = gsap.to(marquee, { xPercent: -50, duration: 26, repeat: -1, ease: 'none', paused: true });
        // One reusable tween that is retargeted. Creating a fresh tween on every
        // scroll tick would restart the ramp each frame and the strip would never
        // actually reach the faster speed.
        const setSpeed = gsap.quickTo(loop, 'timeScale', { duration: 0.5, ease: 'power2.out' });
        // onUpdate stops firing the moment scrolling stops, so the strip needs its
        // own way back to resting speed rather than holding the last velocity.
        const settle = gsap.delayedCall(0.2, () => setSpeed(1)).pause();
        ScrollTrigger.create({
          trigger: marquee.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: ({ isActive }) => isActive ? loop.play() : loop.pause(),
          // Scrolling drags the strip along, so the band reacts instead of idling.
          onUpdate: (self) => { setSpeed(1 + Math.min(Math.abs(self.getVelocity()) / 700, 2.5)); settle.restart(true); },
        });
      }
    }, scope);
    // Every reveal hides its own content first and waits for a scroll position to
    // hand it back. A once-trigger that misses its start — a stale measurement, a
    // route chunk that landed after the layout was measured, a refresh that fell
    // inside a smooth-scroll frame — therefore costs the content itself, with
    // nothing left to fire it. Current geometry is the second opinion: an element
    // already past its own start line is owed its reveal whatever its trigger
    // believes. On a refresh that means snapping to the finished frame, because
    // the page was already scrolled there; on a scroll it means playing the
    // reveal, because the reader is watching it arrive.
    let checking;
    const settle = (snap) => {
      let waiting = false;
      for (const { element, tween, start } of reveals) {
        if (tween.progress() >= 1 || !element.isConnected) continue;
        waiting = true;
        // Leave anything already under way alone; snapping it would cut the
        // very animation this exists to protect.
        if (tween.isActive() || tween.progress() > 0) continue;
        if (element.getBoundingClientRect().top > innerHeight * start) continue;
        if (snap) tween.progress(1); else tween.play();
      }
      // Nothing left to rescue: stop reading layout on every scroll frame.
      if (!waiting) removeEventListener('scroll', onScroll);
    };
    const revealPassed = () => settle(true);
    const onScroll = () => {
      cancelAnimationFrame(checking);
      checking = requestAnimationFrame(() => settle(false));
    };
    ScrollTrigger.addEventListener('refresh', revealPassed);
    addEventListener('scroll', onScroll, { passive: true });
    // Do not depend on a later refresh event: stale once-triggers need a check
    // as soon as every tween and recovery hook exists.
    revealPassed();
    // ResizeObserver runs after React commits and also sees intermediate heights
    // during disclosure transitions. Coalesce to one refresh per animation frame.
    let frame;
    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    const observer = new ResizeObserver(refresh);
    observer.observe(scope.querySelector('main'));
    refresh();
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(checking);
      clearTimeout(safety);
      gsap.ticker.remove(markTick);
      observer.disconnect();
      removeEventListener('scroll', onScroll);
      ScrollTrigger.removeEventListener('refresh', revealPassed);
      context.revert();
      counters.forEach(element => { element.textContent = `${element.dataset.count}${element.dataset.suffix || ''}`; });
    };
  }, [ref, route, revealed, reduced, skipOpening]);
}

export { gsap, ScrollTrigger };
