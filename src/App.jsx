import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight, Asterisk, DownloadSimple, Sun, Moon, List, X, ArrowUpRight, ArrowDown } from '@phosphor-icons/react';
import { profile } from './data';
import { WHATSAPP_URL } from './site';
import { routes, getAnchor, getRoute } from './routes.js';
import { isRoute, loadPage, pageFor, prefetchPages } from './pages.js';
import { Link } from './ui.jsx';
import { gsap, useMotionStatus, useReducedMotion, useSmoothScroll, usePageMotion } from './motion';

// The route's own module, kept out of React's Suspense on purpose: the page has
// to be mounted before `usePageMotion` measures it, otherwise a chunk landing
// late would leave a page with no reveals set up at all. A chunk that never
// arrives returns `failed`, because an empty <main> is not an acceptable answer.
function usePage(route) {
  const [state, setState] = useState(() => ({ Page: pageFor(route), failed: false }));
  useEffect(() => {
    const ready = pageFor(route);
    setState({ Page: ready, failed: false });
    if (ready || !isRoute(route)) return;
    let active = true;
    loadPage(route).then(
      next => { if (active) setState({ Page: next, failed: false }); },
      () => { if (active) setState({ Page: null, failed: true }); },
    );
    return () => { active = false; };
  }, [route]);
  return state;
}

// A browser keeps a failed module fetch in its module map for the rest of the
// session, so re-importing the same URL cannot recover. A reload can, and this
// says so instead of pretending a retry button would work.
function PageUnavailable() {
  return <section className="not-found wrap">
    <p>Gagal dimuat</p>
    <h1>Halaman ini gagal dimuat.</h1>
    <p className="page-description">Berkas halaman ini tidak sampai ke peramban Anda. Muat ulang halaman untuk mencoba lagi, atau hubungi saya langsung di {profile.email}.</p>
    <div className="hero-actions">
      <button className="button" onClick={() => window.location.reload()}>Muat ulang halaman <ArrowRight /></button>
      <Link to="/" className="text-link">Kembali ke beranda <ArrowRight size={18} /></Link>
    </div>
  </section>;
}

function Splash({ reveal, done, reduced, motionStatus }) {
  const ref = useRef(null);
  const skip = useCallback(() => { reveal(); done(); }, [reveal, done]);
  useLayoutEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem('anung-intro') === 'seen'; } catch { /* Storage is optional. */ }
    if (reduced || seen || motionStatus === 'unavailable' || motionStatus === 'skipped') { reveal(); done(); return; }
    if (motionStatus === 'loading') return;
    const safety = setTimeout(skip, 2400);
    let readingHold;
    let timeline;
    const ctx = gsap.context(() => {
      timeline = gsap.timeline({ onComplete: done })
        .from('.splash-word span', { yPercent: 115, duration: 0.38, stagger: 0.03, ease: 'expo.out' })
        .from('.splash-caption', { opacity: 0, y: 10, duration: 0.18 }, '-=0.18')
        .to('.splash-star', { rotation: 180, duration: 0.5, ease: 'power2.inOut' }, 0)
        .call(() => {
          timeline.pause();
          readingHold = setTimeout(() => timeline.play(), 950);
        }, null, '+=0.02')
        .to('.splash-content', { y: -38, opacity: 0, duration: 0.18 }, '+=0.02')
        .to(ref.current, { yPercent: -100, duration: 0.46, ease: 'power4.inOut' }, '-=0.06')
        // The page starts moving while the intro is still lifting, so the hero is
        // never painted settled and then re-animated.
        .call(reveal, null, '<0.12');
    }, ref);
    return () => { clearTimeout(safety); clearTimeout(readingHold); ctx.revert(); };
  }, [reveal, done, reduced, motionStatus, skip]);
  return <div className="splash" ref={ref} role="dialog" aria-modal="true" aria-label="Selamat datang di portofolio Anung">
    <div className="splash-top"><span>ANUNG RAMADHAN</span><button onClick={skip}>Lewati intro <ArrowRight /></button></div>
    <div className="splash-content"><Asterisk className="splash-star" weight="bold" aria-hidden="true" /><div className="splash-word" aria-label="Halo.">{'Halo.'.split('').map((letter, i) => <span key={i} aria-hidden="true">{letter}</span>)}</div><p className="splash-caption">Terima kasih sudah berkunjung.</p></div>
    <span className="splash-bottom">PORTOFOLIO ANUNG RAMADHAN</span>
  </div>;
}

function Header({ route, theme, setTheme, reduced }) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const navRef = useRef(null);
  useEffect(() => setOpen(false), [route]);
  useEffect(() => {
    if (!open) return;
    const key = (event) => { if (event.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); } };
    const outside = (event) => { if (!event.target.closest('.site-header')) setOpen(false); };
    document.addEventListener('keydown', key);
    document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('keydown', key); document.removeEventListener('pointerdown', outside); };
  }, [open]);
  useLayoutEffect(() => {
    if (!open || reduced) return;
    const ctx = gsap.context(() => gsap.from('a', { y: 12, opacity: 0, duration: 0.25, stagger: 0.045, clearProps: 'all' }), navRef);
    return () => ctx.revert();
  }, [open, reduced]);
  return <header className="site-header wrap">
    <Link to="/" className="wordmark" aria-label="Anung, beranda">anung<span>.</span></Link>
    <nav id="main-navigation" ref={navRef} className={open ? 'main-nav is-open' : 'main-nav'} aria-label="Navigasi utama">
      {Object.entries(routes).map(([path, label]) => <Link key={path} to={path} onNavigate={() => setOpen(false)} aria-current={path === route ? 'page' : undefined}>{label}<span className="nav-line" /></Link>)}
    </nav>
    <div className="header-actions">
      <button className="icon-button theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}>{theme === 'dark' ? <Sun /> : <Moon />}</button>
      <a className="header-cv" href={profile.cv} download>Download CV <DownloadSimple size={16} /></a>
      <button ref={toggleRef} className="icon-button menu-toggle" aria-expanded={open} aria-controls="main-navigation" aria-label={open ? 'Tutup menu' : 'Buka menu'} onClick={() => setOpen(!open)}>{open ? <X /> : <List />}</button>
    </div>
  </header>;
}

function Footer() {
  return <footer className="site-footer wrap"><Link to="/" className="wordmark" aria-label="Anung, beranda">anung<span>.</span></Link><span>© {new Date().getFullYear()} Anung Ramadhan</span><div><a href={WHATSAPP_URL} target="_blank" rel="noreferrer">WhatsApp <ArrowUpRight size={15} /></a><a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={15} /></a><a href={`mailto:${profile.email}`}>Email <ArrowUpRight size={15} /></a><button onClick={() => window.dispatchEvent(new Event('portfolio:top'))} aria-label="Kembali ke atas"><ArrowDown className="up-arrow" size={18} /></button></div></footer>;
}

export default function App() {
  const [route, setRoute] = useState(getRoute);
  const [initialIntro] = useState(() => {
    if (getRoute() !== '/' || matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    try { return sessionStorage.getItem('anung-intro') !== 'seen'; } catch { return true; }
  });
  const [booting, setBooting] = useState(initialIntro);
  const [revealed, setRevealed] = useState(!initialIntro);
  const initialRoute = useRef(route);
  const [transitioning, setTransitioning] = useState(false);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');
  const userReduced = useReducedMotion();
  const motionStatus = useMotionStatus();
  const reduced = userReduced || motionStatus !== 'ready';
  const { Page, failed: pageFailed } = usePage(route);
  const root = useRef(null);
  const curtain = useRef(null);
  const lenis = useRef(null);
  const routeRef = useRef(route);
  const [anchor, setAnchor] = useState(getAnchor);
  const anchorRef = useRef(anchor);
  const applyAnchor = useCallback(() => {
    anchorRef.current = getAnchor();
    setAnchor(anchorRef.current);
  }, []);
  const transition = useRef(null);
  // A curtain is in flight while this ref holds its timeline, and only the code
  // that ends the curtain clears it. GSAP cannot answer this: `isActive()` stays
  // false until the first ticker frame renders the timeline, so a route change
  // landing inside that frame gap would look like "nothing is running".
  const stopTransition = useCallback(() => {
    const running = transition.current;
    transition.current = null;
    running?.kill();
    return !!running;
  }, []);
  const focusedRoute = useRef(route);
  useSmoothScroll(lenis, reduced);
  // The page has to be in the DOM before its reveals can be built, so a route
  // whose chunk has not landed yet counts as not revealed.
  usePageMotion(root, route, revealed && !!Page, reduced, initialRoute.current !== '/' && route === initialRoute.current);
  const revealPage = useCallback(() => setRevealed(true), []);
  const finishIntro = useCallback(() => {
    try { sessionStorage.setItem('anung-intro', 'seen'); } catch { /* Storage is optional. */ }
    setBooting(false);
  }, []);
  // The curtain's resting place is owned by GSAP. Zeroing `y` alongside
  // `yPercent` clears the px offset GSAP parses out of the CSS transform,
  // which would otherwise stack on top of the percentage and strand the
  // curtain over the page.
  const parkCurtain = useCallback(() => { gsap?.set(curtain.current, { yPercent: 110, y: 0 }); }, []);
  useLayoutEffect(parkCurtain, [parkCurtain, motionStatus]);
  useEffect(() => { if (!initialIntro) finishIntro(); }, [initialIntro, finishIntro]);
  // The other three routes are fetched once the browser is idle. The timeout is
  // deliberately past the point where LCP is decided: a prefetch that competed
  // with the first paint would trade one delay for another.
  useEffect(() => {
    if (!revealed) return;
    const idle = window.requestIdleCallback;
    if (!idle) { const id = setTimeout(prefetchPages, 2500); return () => clearTimeout(id); }
    const id = idle(prefetchPages, { timeout: 4000 });
    return () => window.cancelIdleCallback(id);
  }, [revealed]);
  useEffect(() => {
    // Nothing may leave the opening frame hidden, whatever interrupts a curtain.
    if (booting || transitioning || revealed) return;
    const id = setTimeout(revealPage, 700);
    return () => clearTimeout(id);
  }, [booting, transitioning, revealed, revealPage]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#102e2b' : '#F5DABF';
    try { localStorage.setItem('anung-theme', theme); } catch { /* Storage is optional. */ }
  }, [theme]);
  useEffect(() => {
    if (booting || transitioning) lenis.current?.stop(); else lenis.current?.start();
    document.body.classList.toggle('motion-locked', booting || transitioning);
    return () => document.body.classList.remove('motion-locked');
  }, [booting, transitioning, reduced]);
  useEffect(() => {
    document.title = `${routes[route] || 'Halaman tidak ditemukan'} | Anung Ramadhan`;
    if (!booting && !transitioning && focusedRoute.current !== route) {
      root.current?.querySelector('main')?.focus({ preventScroll: true });
      focusedRoute.current = route;
    }
  }, [route, booting, transitioning]);
  useEffect(() => {
    let keyboard = false;
    const noteKey = () => { keyboard = true; };
    const notePointer = () => { keyboard = false; };
    const top = () => { if (lenis.current) lenis.current.scrollTo(0, { immediate: reduced }); else window.scrollTo({ top: 0, behavior: 'instant' }); };
    const change = () => {
      const next = getRoute();
      if (next === routeRef.current) {
        // Same page, new deep-link anchor: no curtain, just move to the entry.
        if (getAnchor() !== anchorRef.current) applyAnchor();
        // Back can arrive before the outgoing curtain has committed its target,
        // even before that curtain has drawn a single frame.
        if (stopTransition()) {
          parkCurtain();
          setTransitioning(false);
          setRevealed(true);
        }
        return;
      }
      stopTransition();
      // Start the chunk before the curtain does, so the incoming page is already
      // mounted by the time the curtain lifts off it.
      loadPage(next).catch(() => { /* The route renders PageUnavailable instead. */ });
      const commit = () => {
        routeRef.current = next;
        applyAnchor();
        window.scrollTo({ top: 0, behavior: 'instant' });
        lenis.current?.scrollTo(0, { immediate: true, force: true });
        setRoute(next);
      };
      if (reduced || keyboard) { parkCurtain(); setTransitioning(false); commit(); setRevealed(true); return; }
      setTransitioning(true);
      curtain.current.querySelector('span').textContent = routes[next] || 'Anung.';
      const star = curtain.current.querySelector('svg');
      // Every step is placed on an absolute position: the asterisk spin runs the
      // full length of the curtain, and appended steps must not queue behind it.
      const timeline = gsap.timeline({ onComplete: () => { transition.current = null; setTransitioning(false); } })
        .fromTo(curtain.current, { yPercent: 110, y: 0 }, { yPercent: 0, duration: 0.45, ease: 'power3.inOut' }, 0)
        // Hold the incoming page hidden, then release it as the curtain lifts.
        .call(() => { setRevealed(false); commit(); }, null, 0.45)
        .to(curtain.current, { yPercent: -110, duration: 0.55, ease: 'power3.inOut' }, 0.5)
        .call(revealPage, null, 0.62);
      if (star) timeline.fromTo(star, { rotate: 0 }, { rotate: 200, duration: 1.05, ease: 'power2.inOut' }, 0);
      transition.current = timeline;
    };
    document.addEventListener('keydown', noteKey);
    document.addEventListener('pointerdown', notePointer);
    window.addEventListener('hashchange', change);
    window.addEventListener('portfolio:top', top);
    return () => {
      stopTransition();
      document.removeEventListener('keydown', noteKey);
      document.removeEventListener('pointerdown', notePointer);
      window.removeEventListener('hashchange', change);
      window.removeEventListener('portfolio:top', top);
    };
  }, [reduced, parkCurtain, revealPage, applyAnchor, stopTransition]);

  // Deep link from a Beranda card lands on its own entry, not on a list top.
  // Runs after the page is revealed so ScrollTrigger has measured the layout.
  useEffect(() => {
    if (!anchor || booting || transitioning || !revealed) return;
    const target = root.current?.querySelector(`#${CSS.escape(anchor)}`);
    if (!target) return;
    const id = setTimeout(() => {
      if (lenis.current) lenis.current.scrollTo(target, { offset: -100, immediate: reduced, force: true });
      else target.scrollIntoView({ behavior: 'instant', block: 'start' });
    }, 80);
    return () => clearTimeout(id);
  }, [anchor, route, booting, transitioning, revealed, reduced]);
  useEffect(() => {
    // A live OS preference change must never leave the page inert mid-transition.
    if (reduced && transitioning) {
      stopTransition();
      parkCurtain();
      routeRef.current = getRoute();
      setRoute(routeRef.current);
      setTransitioning(false);
      setRevealed(true);
    }
  }, [reduced, transitioning, parkCurtain, stopTransition]);
  return <>
    {booting && <Splash reveal={revealPage} done={finishIntro} reduced={userReduced} motionStatus={motionStatus} />}
    <div className="page-curtain" ref={curtain} aria-hidden="true"><Asterisk weight="bold" /><span /></div>
    <div className="app" ref={root} inert={booting || transitioning ? true : undefined}>
      <div className="scroll-progress" aria-hidden="true"><span /></div>
      <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); root.current.querySelector('main')?.focus(); }}>Lewati ke konten</a>
      <Header route={route} theme={theme} setTheme={setTheme} reduced={reduced} />
      <main id="main-content" tabIndex={-1} key={route}>{Page ? <Page /> : pageFailed ? <PageUnavailable /> : isRoute(route) ? null : <section className="not-found wrap"><p>404</p><h1>Sepertinya salah jalan.</h1><Link to="/" className="button">Kembali ke beranda <ArrowRight /></Link></section>}</main>
      <Footer />
    </div>
  </>;
}
