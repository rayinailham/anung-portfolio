import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowRight, ArrowDown, Asterisk, DownloadSimple, Sun, Moon, List, X, LinkedinLogo, Copy, Check, Plus, Minus } from '@phosphor-icons/react';
import { profile, experience, organizations, skills } from './data';
import { gsap, useMotionStatus, useReducedMotion, useSmoothScroll, usePageMotion } from './motion';

const routes = { '/': 'Beranda', '/pengalaman': 'Pengalaman', '/tentang': 'Tentang', '/kontak': 'Kontak' };
const getRoute = () => window.location.hash.slice(1) || '/';
const canMove = () => gsap && matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches;

function Link({ to, children, className = '', onNavigate, ...props }) {
  return <a href={`#${to}`} className={className} onClick={onNavigate} {...props}>{children}</a>;
}

function Magnet({ children, className = '' }) {
  const ref = useRef(null);
  const move = (event) => {
    if (!canMove()) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    gsap.to(ref.current, { x: (event.clientX - bounds.left - bounds.width / 2) * 0.12, y: (event.clientY - bounds.top - bounds.height / 2) * 0.18, duration: 0.25, overwrite: true });
  };
  const reset = () => gsap?.to(ref.current, { x: 0, y: 0, duration: 0.35, ease: 'power3.out', overwrite: true });
  useEffect(() => { const node = ref.current; return () => gsap?.killTweensOf(node); }, []);
  return <span className={`magnet ${className}`} onPointerMove={move} onPointerLeave={reset}><span ref={ref}>{children}</span></span>;
}

function Splash({ reveal, done, reduced, motionStatus }) {
  const ref = useRef(null);
  const skip = useCallback(() => { reveal(); done(); }, [reveal, done]);
  useLayoutEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem('anung-intro') === 'seen'; } catch { /* Storage is optional. */ }
    if (reduced || seen || motionStatus === 'unavailable') { reveal(); done(); return; }
    if (motionStatus === 'loading') return;
    const safety = setTimeout(skip, 2000);
    const ctx = gsap.context(() => {
      gsap.timeline({ onComplete: done })
        .from('.splash-word span', { yPercent: 115, duration: 0.38, stagger: 0.03, ease: 'expo.out' })
        .from('.splash-caption', { opacity: 0, y: 10, duration: 0.18 }, '-=0.18')
        .to('.splash-star', { rotation: 180, duration: 0.5, ease: 'power2.inOut' }, 0)
        .to('.splash-content', { y: -38, opacity: 0, duration: 0.18 }, '+=0.02')
        .to(ref.current, { yPercent: -100, duration: 0.46, ease: 'power4.inOut' }, '-=0.06')
        // The page starts moving while the intro is still lifting, so the hero is
        // never painted settled and then re-animated.
        .call(reveal, null, '<0.12');
    }, ref);
    return () => { clearTimeout(safety); ctx.revert(); };
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

function Title({ lines, className = '' }) {
  return <h1 className={className}>{lines.map((line, i) => <span className="title-line" key={line}><span className={i === lines.length - 1 ? 'last-line' : ''}>{line}</span></span>)}</h1>;
}

function Portrait({ compact = false }) {
  const ref = useRef(null);
  const tilt = (event) => {
    if (!canMove()) return;
    const r = event.currentTarget.getBoundingClientRect();
    gsap.to(ref.current, { rotateY: ((event.clientX - r.left) / r.width - 0.5) * 6, rotateX: -((event.clientY - r.top) / r.height - 0.5) * 6, duration: 0.6, overwrite: true });
  };
  return <div className={`portrait-scene ${compact ? 'compact' : ''}`} onPointerMove={tilt} onPointerLeave={() => gsap?.to(ref.current, { rotateX: 0, rotateY: 0, duration: 0.6, overwrite: true })}>
    <div className="portrait-backplate" aria-hidden="true" />
    <div className="portrait-frame" ref={ref}><img src="/images/anung-profile.webp" alt="Anung Hanindhita Ramadhan di kantor AnyMind Group" width="900" height="1200" fetchPriority={compact ? 'auto' : 'high'} /></div>
    <Asterisk className="portrait-asterisk" weight="bold" aria-hidden="true" />
    <div className="portrait-caption"><span>Anung Hanindhita Ramadhan</span><span>Lulusan Bisnis, IPB University</span></div>
  </div>;
}

function ContactCallout() {
  return <section className="contact-callout wrap" data-reveal="zoom">
    <Asterisk className="callout-star" weight="bold" aria-hidden="true" data-spin />
    <h2>Membutuhkan anggota<br />tim pemasaran?</h2>
    <Magnet><Link to="/kontak" className="button">Hubungi saya <ArrowUpRight size={20} /></Link></Magnet>
  </section>;
}

function Home() {
  return <>
    <section className="hero wrap page-opening">
      <div className="hero-copy">
        <p className="availability hero-enter"><span className="pulse" aria-hidden="true" />Terbuka untuk kerja sama</p>
        <p className="eyebrow hero-enter">AFILIASI & PEMASARAN DIGITAL</p>
        <Title lines={['Halo, saya', 'Anung.']} />
        <p className="hero-description hero-enter">Saya membantu tim pemasaran mengelola mitra afiliasi dan kerja sama dengan kreator, mulai dari menghubungi mereka hingga memantau konten yang terbit.</p>
        <div className="hero-actions hero-enter"><Magnet><Link to="/pengalaman" className="button">Lihat pengalaman <ArrowUpRight size={20} /></Link></Magnet><Link to="/tentang" className="text-link">Tentang saya <ArrowRight size={18} /></Link></div>
      </div>
      <div className="hero-portrait hero-enter"><Portrait /></div>
      <p className="scroll-cue hero-enter" aria-hidden="true"><ArrowDown size={16} />Scroll</p>
    </section>
    <section className="impact-section wrap" aria-label="Sorotan pengalaman">
      <div className="impact-intro" data-reveal="left"><span>Selama magang,</span><strong>saya ikut menangani:</strong></div>
      <div className="impact-stat" data-reveal="up"><strong><span data-count="200">200</span></strong><p>Kerja sama KOL yang<br />saya bantu kelola</p><small>PT Sutan Vet Medika</small></div>
      <div className="impact-stat" data-reveal="up" data-reveal-delay="0.1"><strong><span data-count="150">150</span><span className="stat-unit">/hari</span></strong><p>Mitra afiliasi baru<br />dihubungi</p><small>AnyMind Group</small></div>
      <div className="impact-stat" data-reveal="up" data-reveal-delay="0.2"><strong><span data-count="40">40</span></strong><p>Mitra afiliasi yang saya koordinasikan<br />untuk acara Pantene</p><small>AnyMind Group</small></div>
    </section>
    <section className="selected-section wrap">
      <div className="section-heading" data-reveal="left"><h2>Yang saya kerjakan<br />selama magang.</h2><p>Saya pernah magang di tim pemasaran AnyMind Group dan PT Sutan Vet Medika. Berikut beberapa pekerjaan saya selama magang.</p></div>
      <div className="selected-grid">
        <Link to="/pengalaman" className="feature-story" data-reveal="left" aria-label="Lihat pengalaman pemasaran afiliasi di AnyMind Group">
          <div className="feature-photo" data-mask><img src="/images/anung-profile.webp" width="900" height="1200" loading="lazy" alt="Anung saat magang di AnyMind Group" data-parallax /></div>
          <div className="story-meta"><span>AnyMind Group</span><ArrowUpRight size={26} /></div><h3>Mengelola mitra<br />afiliasi Unicharm.</h3><p>Pemasaran afiliasi / 2026</p>
        </Link>
        <Link to="/pengalaman" className="feature-story secondary-story" data-reveal="right" aria-label="Lihat pengalaman kolaborasi KOL di PT Sutan Vet Medika">
          <div className="feature-art" data-mask><img src="/images/connections.webp" width="1200" height="800" loading="lazy" alt="Ilustrasi dua bentuk saling terhubung dalam warna bordo dan hijau" data-parallax /></div>
          <div className="story-meta"><span>PT Sutan Vet Medika</span><ArrowUpRight size={26} /></div><h3>Konten dan KOL<br />Anima Companion.</h3><p>KOL & pemasaran digital / 2025 - 2026</p>
        </Link>
      </div>
    </section>
    <div className="marquee"><p className="sr-only">Bidang: pemasaran afiliasi, kerja sama KOL, perencanaan konten.</p><div className="marquee-track" aria-hidden="true">{[0, 1].map(i => <div className="marquee-group" key={i}><span>Pemasaran afiliasi</span><Asterisk weight="bold" /><span>Kerja sama KOL</span><Asterisk weight="bold" /><span>Perencanaan konten</span><Asterisk weight="bold" /></div>)}</div></div>
    <section className="intro-section wrap" data-reveal-group="up"><span className="section-kicker">SEDIKIT TENTANG SAYA</span><div><h2>Lulusan Bisnis<br />IPB University.</h2><p>Selama magang, saya menangani pengiriman sampel, memantau penyelesaian konten kreator, dan menyusun laporan. Pengalaman ini membantu saya memahami pekerjaan tim pemasaran secara langsung.</p><Link to="/tentang" className="text-link">Tentang saya <ArrowUpRight size={20} /></Link></div></section>
    <ContactCallout />
  </>;
}

function Experience() {
  const [filter, setFilter] = useState('Semua');
  const [expanded, setExpanded] = useState(() => new Set());
  const toggleDetail = (id) => setExpanded(previous => {
    const next = new Set(previous);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const list = filter === 'Semua' ? experience : experience.filter(item => item.category === filter);
  return <>
    <section className="page-heading wrap"><p className="eyebrow hero-enter">PENGALAMAN KERJA</p><Title lines={['Pengalaman', 'magang saya.']} /><p className="page-description hero-enter">Saya pernah mengelola mitra afiliasi, membantu kerja sama KOL, dan membuat konten. Berikut tanggung jawab saya di setiap tempat magang.</p></section>
    <section className="experience-section wrap" aria-label="Pengalaman kerja">
      <div className="filter-list hero-enter" role="group" aria-label="Filter pengalaman">{['Semua', 'Pemasaran afiliasi', 'Kerja sama KOL', 'Pemasaran digital'].map(item => <button key={item} aria-pressed={filter === item} onClick={() => { setFilter(item); setExpanded(new Set()); }} className={filter === item ? 'filter active' : 'filter'}>{item}</button>)}</div>
      <p className="sr-only" role="status">{list.length} pengalaman ditampilkan</p>
      <div className="experience-list" data-reveal-group="up">{list.map((item) => <article className="experience-card" key={item.id}>
        <div className="experience-side"><span className="experience-period">{item.period}</span><h2>{item.company}</h2><p>{item.role}</p><span className="experience-location">{item.location}</span></div>
        <div className="experience-main"><span className="category-label">{item.category}</span><h3>{item.title}</h3><p>{item.summary}</p><div className="experience-stats">{item.stats.map(stat => <div key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div>
          <button className="detail-button" aria-expanded={expanded.has(item.id)} aria-controls={`details-${item.id}`} onClick={() => toggleDetail(item.id)}>{expanded.has(item.id) ? 'Tutup detail' : 'Lihat detail'}{expanded.has(item.id) ? <Minus size={20} /> : <Plus size={20} />}</button>
          <div className="experience-details" id={`details-${item.id}`} aria-hidden={!expanded.has(item.id)} inert={!expanded.has(item.id) ? true : undefined}><div><ul>{item.details.map(detail => <li key={detail}>{detail}</li>)}</ul></div></div>
        </div>
      </article>)}</div>
      <p className="source-note">Untuk riwayat lengkap, klik Download CV di bagian atas halaman.</p>
    </section>
    <section className="organizations wrap" data-reveal="up"><h2>Kegiatan selama kuliah.</h2><p className="section-description">Selama kuliah, saya mengelola keuangan organisasi, memimpin tim logistik, dan membantu pelaksanaan acara.</p><div className="organization-grid" data-reveal-group="up">{organizations.map(org => <article key={org.name}><span>{org.period}</span><h3>{org.name}</h3><strong>{org.role}</strong><p>{org.detail}</p></article>)}</div></section>
    <ContactCallout />
  </>;
}

function About() {
  return <>
    <section className="about-hero wrap page-opening"><div><p className="eyebrow hero-enter">TENTANG SAYA</p><Title lines={['Perkenalkan,', 'saya Anung.']} /><p className="about-lead hero-enter">Lulusan Bisnis IPB.<br />Menekuni pemasaran afiliasi dan digital.</p><p className="hero-enter">Nama lengkap saya Anung Hanindhita Ramadhan. Saya tinggal di Bekasi dan lulus dari IPB University pada 2026. Selama magang di AnyMind Group dan PT Sutan Vet Medika, saya terlibat dalam pengelolaan mitra afiliasi, kerja sama KOL, dan pembuatan konten.</p><a className="text-link hero-enter" href={profile.cv} download>Download CV <DownloadSimple size={20} /></a></div><div className="hero-enter"><Portrait compact /></div></section>
    <section className="about-statement wrap" data-reveal="right"><h2>Tanggung jawab saya<br /><span>selama magang.</span></h2><p>Saya memastikan mitra menerima sampel produk, menindaklanjuti pembuatan konten sesuai arahan, serta memantau penyelesaiannya. Saya juga menyusun laporan penjualan dan kinerja konten untuk tim.</p></section>
    <section className="education-section wrap" data-reveal-group="up"><div><span className="section-kicker">PENDIDIKAN</span><h2>Pendidikan bisnis<br />di IPB University.</h2></div><div className="education-card"><span>Agu 2022 - Agu 2026</span><h3>IPB University</h3><p>Sarjana Bisnis</p><div className="gpa"><strong>3.74<span>/4.00</span></strong><span>IPK</span></div><p>Saya mengikuti dua bazar bisnis untuk menjual produk, mengumpulkan masukan pembeli, dan menilai peluang pasar.</p><span className="education-note">30+ transaksi produk · Nilai A untuk pelaksanaan bisnis</span></div></section>
    <section className="skills-section wrap" data-reveal="left"><h2>Keahlian dan<br />aplikasi yang saya gunakan.</h2><div className="skills-grid" data-reveal-group="up">{skills.map(group => <article key={group.title}><h3>{group.title}</h3><ul>{group.items.map(skill => <li key={skill}>{skill}</li>)}</ul></article>)}</div><div className="language-row" data-reveal-group="up"><span>Bahasa Indonesia <strong>Bahasa ibu</strong></span><span>Bahasa Inggris <strong>Komunikasi profesional</strong></span><span>TOEFL ITP <strong>583</strong></span></div></section>
    <ContactCallout />
  </>;
}

function Contact() {
  const [copyState, setCopyState] = useState('idle');
  const [sent, setSent] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(profile.email); setCopyState('copied'); }
    catch { setCopyState('failed'); }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopyState('idle'), 4000);
  };
  const send = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = `${data.get('topic')} — dari ${data.get('name')}`;
    const body = `Halo Anung,\n\n${data.get('message')}\n\nSalam,\n${data.get('name')}\n${data.get('email')}`;
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };
  return <>
    <section className="page-heading contact-heading wrap"><p className="eyebrow hero-enter">KONTAK</p><Title lines={['Ada peluang', 'kerja sama?']} /><p className="page-description hero-enter">Saya terbuka untuk peluang kerja di bidang pemasaran dan kerja sama promosi. Silakan hubungi saya melalui email atau LinkedIn untuk membahas posisi atau proyek yang ditawarkan.</p></section>
    <section className="contact-grid wrap"><div className="contact-info hero-enter"><Asterisk className="contact-star" weight="bold" aria-hidden="true" data-spin /><h2>Hubungi saya di sini.</h2><div className="email-line"><a href={`mailto:${profile.email}`}>{profile.email}</a><button className="icon-button" onClick={copyEmail} aria-label="Copy email">{copyState === 'copied' ? <Check /> : <Copy />}</button></div><p className="copy-status" role="status">{copyState === 'copied' ? 'Email berhasil disalin.' : copyState === 'failed' ? 'Email belum bisa disalin. Silakan salin alamat di atas secara manual.' : '\u00a0'}</p><a href={profile.linkedin} className="contact-social" target="_blank" rel="noreferrer"><LinkedinLogo size={22} />LinkedIn <ArrowUpRight size={20} /></a><a href={`tel:${profile.phone}`} className="contact-social">+62 813 8811 6739 <ArrowUpRight size={20} /></a><p className="contact-location">Bekasi, Jawa Barat, Indonesia</p></div>
      <form className="contact-form hero-enter" onSubmit={send}><div className="form-row"><label>Nama<input name="name" autoComplete="name" required maxLength={100} placeholder="Nama lengkap" /></label><label>Email<input name="email" type="email" autoComplete="email" required maxLength={200} placeholder="nama@email.com" /></label></div><label>Topik pesan<select name="topic" defaultValue="Peluang kerja"><option>Peluang kerja</option><option>Kerja sama promosi</option><option>Bertukar ide</option></select></label><label>Pesan<textarea name="message" required minLength={10} maxLength={3000} rows={4} placeholder="Halo Anung, saya ingin membahas..." /></label><div className="form-footer"><p>Tombol ini membuka draf di aplikasi email.<br />Untuk mengirim pesan, tekan tombol kirim di aplikasi email.</p><button className="button" type="submit">Buka draf email <ArrowUpRight size={20} /></button></div><p className="form-status" role="status">{sent ? `Draf email siap dibuka. Jika aplikasi email tidak terbuka, kirim pesan langsung ke ${profile.email}.` : ''}</p></form></section>
    <div className="contact-signoff wrap" data-reveal="up"><span>Terima kasih telah mengunjungi portofolio saya.</span><span className="signature">Anung.</span></div>
  </>;
}

function Footer() {
  return <footer className="site-footer wrap"><Link to="/" className="wordmark" aria-label="Anung, beranda">anung<span>.</span></Link><span>© {new Date().getFullYear()} Anung Ramadhan</span><div><a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={15} /></a><a href={`mailto:${profile.email}`}>Email <ArrowUpRight size={15} /></a><button onClick={() => window.dispatchEvent(new Event('portfolio:top'))} aria-label="Kembali ke atas"><ArrowDown className="up-arrow" size={18} /></button></div></footer>;
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
  const root = useRef(null);
  const curtain = useRef(null);
  const lenis = useRef(null);
  const routeRef = useRef(route);
  const transition = useRef(null);
  const focusedRoute = useRef(route);
  useSmoothScroll(lenis, reduced);
  usePageMotion(root, route, revealed, reduced, initialRoute.current !== '/' && route === initialRoute.current);
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
        // Back can arrive before the outgoing curtain has committed its target.
        if (transition.current?.isActive()) {
          transition.current.kill();
          parkCurtain();
          setTransitioning(false);
          setRevealed(true);
        }
        return;
      }
      transition.current?.kill();
      const commit = () => {
        routeRef.current = next;
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
      const timeline = gsap.timeline({ onComplete: () => setTransitioning(false) })
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
      transition.current?.kill();
      document.removeEventListener('keydown', noteKey);
      document.removeEventListener('pointerdown', notePointer);
      window.removeEventListener('hashchange', change);
      window.removeEventListener('portfolio:top', top);
    };
  }, [reduced, parkCurtain, revealPage]);
  useEffect(() => {
    // A live OS preference change must never leave the page inert mid-transition.
    if (reduced && transitioning) {
      transition.current?.kill();
      parkCurtain();
      routeRef.current = getRoute();
      setRoute(routeRef.current);
      setTransitioning(false);
      setRevealed(true);
    }
  }, [reduced, transitioning, parkCurtain]);
  return <>
    {booting && <Splash reveal={revealPage} done={finishIntro} reduced={userReduced} motionStatus={motionStatus} />}
    <div className="page-curtain" ref={curtain} aria-hidden="true"><Asterisk weight="bold" /><span /></div>
    <div className="app" ref={root} inert={booting || transitioning ? true : undefined}>
      <div className="scroll-progress" aria-hidden="true"><span /></div>
      <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); root.current.querySelector('main')?.focus(); }}>Lewati ke konten</a>
      <Header route={route} theme={theme} setTheme={setTheme} reduced={reduced} />
      <main id="main-content" tabIndex={-1} key={route}>{route === '/' ? <Home /> : route === '/pengalaman' ? <Experience /> : route === '/tentang' ? <About /> : route === '/kontak' ? <Contact /> : <section className="not-found wrap"><p>404</p><h1>Sepertinya salah jalan.</h1><Link to="/" className="button">Kembali ke beranda <ArrowRight /></Link></section>}</main>
      <Footer />
    </div>
  </>;
}
