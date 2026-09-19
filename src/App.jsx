import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowRight, ArrowDown, Asterisk, DownloadSimple, Sun, Moon, List, X, LinkedinLogo, Copy, Check, Plus, Minus } from '@phosphor-icons/react';
import { profile, experience, organizations, skills, education, english } from './data';
import { gsap, useMotionStatus, useReducedMotion, useSmoothScroll, usePageMotion } from './motion';

const routes = { '/': 'Beranda', '/pengalaman': 'Pengalaman', '/tentang': 'Tentang', '/kontak': 'Kontak' };
// `#/pengalaman#entri-anymind` carries a route and a deep-link anchor in one
// hash. Everything before the second '#' is the route; the rest is the anchor.
const splitHash = () => {
  const raw = window.location.hash.slice(1);
  const at = raw.indexOf('#');
  return at < 0 ? { path: raw || '/', anchor: '' } : { path: raw.slice(0, at) || '/', anchor: raw.slice(at + 1) };
};
const getRoute = () => splitHash().path;
const getAnchor = () => splitHash().anchor;
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

function ContactCallout({ heading, lead, action }) {
  return <section className="contact-callout wrap" data-reveal="zoom" data-reveal-kind="panel">
    <Asterisk className="callout-star" weight="bold" aria-hidden="true" data-spin />
    <h2>{heading}</h2>
    {lead && <p className="callout-lead">{lead}</p>}
    <Magnet><Link to="/kontak" className="button">{action} <ArrowUpRight size={20} /></Link></Magnet>
  </section>;
}

// One slot per claim. A slot whose material is not published yet keeps its
// cover, its honest caption and `data-placeholder`; dropping a real file at the
// same path and removing `placeholder: true` in `data.js` is the whole swap.
function EvidenceGallery({ evidence }) {
  if (!evidence?.items?.length) return null;
  return <div className="evidence-gallery">
    <h3 className="evidence-title">{evidence.title}</h3>
    <ul>{evidence.items.map(item => <li key={item.id}>
      <figure className="evidence-item" data-placeholder={item.placeholder ? 'true' : undefined}>
        {/* The cover is a brand-colour block in CSS, so the slot stays correct
            even when the image file is missing or blocked. */}
        <span className="evidence-cover"><img src={item.src} alt={item.alt} width={item.width} height={item.height} loading="lazy" fetchPriority="low" decoding="async" onError={event => { event.currentTarget.dataset.missing = 'true'; }} /></span>
        <figcaption><span className="evidence-type">{item.type}</span>{item.caption}</figcaption>
      </figure>
    </li>)}</ul>
  </div>;
}

// Every data visual below ships its final value in the DOM: the arc's
// `stroke-dashoffset`, the bar's inline width, the bar's own box. Motion only
// animates towards that value, so reduced motion, a blocked GSAP chunk and a
// stalled ticker all leave the real number on screen. Shape, curve and rhythm
// are VIS-1's job; every part that might change its look carries a class.
function GpaRing({ gpa, max }) {
  const fraction = gpa / max;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  return <div className="gpa" data-viz="ring" data-value={gpa} data-max={max}>
    <svg className="gpa-ring" viewBox="0 0 120 120" width="120" height="120" aria-hidden="true" focusable="false">
      <circle className="gpa-ring-track" cx="60" cy="60" r={radius} />
      <circle className="gpa-ring-value" cx="60" cy="60" r={radius} data-arc={fraction}
        strokeDasharray={circumference.toFixed(3)} strokeDashoffset={(circumference * (1 - fraction)).toFixed(3)} />
    </svg>
    <div className="gpa-figure">
      <strong>{gpa.toFixed(2)}<span>/{max.toFixed(2)}</span></strong>
      <span>IPK</span>
    </div>
  </div>;
}

// The axis is the full TOEFL ITP total range, both ends printed. A bar that
// started at anything other than the scale floor would overstate the score.
function ScoreScale({ score, scaleMin, scaleMax, level }) {
  const fraction = (score - scaleMin) / (scaleMax - scaleMin);
  return <figure className="score-scale" data-viz="scale" data-value={score} data-scale-min={scaleMin} data-scale-max={scaleMax}>
    <figcaption className="score-scale-head">
      <span className="score-scale-label">TOEFL ITP</span>
      <strong>{score}</strong>
      <span className="score-scale-level">{level}, seperti tertulis di CV saya.</span>
    </figcaption>
    <div className="score-scale-track" aria-hidden="true">
      <span className="score-scale-fill" data-bar-fill style={{ width: `${(fraction * 100).toFixed(2)}%` }} />
    </div>
    <p className="score-scale-axis" aria-hidden="true"><span>{scaleMin}</span><span>{scaleMax}</span></p>
    <p className="sr-only">Skor {score} pada skala total TOEFL ITP yang berjalan dari {scaleMin} sampai {scaleMax}.</p>
  </figure>;
}

// A sum shown as its parts. The segments are flex shares of the total, so the
// track starts at zero and 100 always reads twice as wide as 50.
function SplitBar({ split }) {
  return <figure className="split-bar" data-viz="split" data-total={split.total}>
    <div className="split-track" aria-hidden="true">
      {split.parts.map(part => <span key={part.platform} className="split-segment" data-segment={part.platform.toLowerCase()} data-bar style={{ flexGrow: part.value }} />)}
    </div>
    <ul className="split-legend">
      {split.parts.map(part => <li key={part.platform}>
        <span className="split-key" data-segment={part.platform.toLowerCase()} aria-hidden="true" />
        {part.platform} <strong>{part.value}</strong>
      </li>)}
    </ul>
    <figcaption>{split.parts.map(part => `${part.value} ${part.platform}`).join(' + ')} = {split.total}. {split.caption}</figcaption>
  </figure>;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const monthIndex = (value) => { const [year, month] = value.split('-').map(Number); return year * 12 + month - 1; };
const monthLabel = (index) => `${MONTHS[index % 12]} ${Math.floor(index / 12)}`;

// Overlapping internships read like a typo in a vertical list. On one axis they
// read as what they are: two roles carried at the same time. The overlapping
// months are counted from the data, never typed in.
function CareerTimeline() {
  const entries = [...experience].sort((a, b) => monthIndex(a.start) - monthIndex(b.start));
  const first = Math.min(...entries.map(item => monthIndex(item.start)));
  const last = Math.max(...entries.map(item => monthIndex(item.end)));
  const total = last - first + 1;
  const share = (from, to) => ({ '--from': (from - first) / total, '--span': (to - from + 1) / total });
  const bands = [];
  for (let month = first; month <= last; month++) {
    const active = entries.filter(item => monthIndex(item.start) <= month && month <= monthIndex(item.end));
    if (active.length < 2) continue;
    const previous = bands.at(-1);
    if (previous && previous.to === month - 1) previous.to = month;
    else bands.push({ from: month, to: month });
  }
  const companies = [...new Set(entries.map(item => item.company))]
    .map(company => ({ company, periods: entries.filter(item => item.company === company) }))
    .filter(group => group.periods.length > 1);
  return <section className="timeline-section wrap" aria-labelledby="timeline-title" data-reveal="fade" data-reveal-kind="viz">
    <h2 id="timeline-title">Rentang waktu magang.</h2>
    {bands.map(band => <p className="timeline-lead" key={band.from}>
      {monthLabel(band.from)} - {monthLabel(band.to)}: {band.to - band.from + 1} bulan dengan dua magang berjalan bersamaan.
    </p>)}
    <ol className="timeline" data-viz="timeline" data-span={`${monthLabel(first)}/${monthLabel(last)}`}>
      {entries.map(item => <li className="timeline-row" key={item.id} data-entry={item.id}>
        <div className="timeline-label">
          <strong>{item.company}</strong>
          <span>{item.role}</span>
          <span className="timeline-period">{item.period}</span>
        </div>
        <div className="timeline-track">
          <span className="timeline-bar" data-bar aria-hidden="true" style={share(monthIndex(item.start), monthIndex(item.end))} />
        </div>
      </li>)}
      {/* The shared months get a bar of their own, lined up under the two roles
          that produced them, so the overlap is a row and not a reading trick. */}
      {bands.map(band => <li className="timeline-row timeline-overlap" key={`band-${band.from}`} data-band={`${monthLabel(band.from)}/${monthLabel(band.to)}`}>
        <div className="timeline-label">
          <strong>Dua magang bersamaan</strong>
          <span className="timeline-period">{monthLabel(band.from)} - {monthLabel(band.to)}</span>
        </div>
        <div className="timeline-track">
          <span className="timeline-bar" data-bar aria-hidden="true" style={share(band.from, band.to)} />
        </div>
      </li>)}
    </ol>
    <p className="timeline-axis" aria-hidden="true"><span>{monthLabel(first)}</span><span>{monthLabel(last)}</span></p>
    {companies.map(group => <p className="timeline-note" key={group.company}>
      {group.company} muncul {group.periods.length} kali: perusahaan yang sama, {group.periods.length} periode magang, {group.periods.map(item => `${item.role} (${item.period})`).join(' lalu ')}.
    </p>)}
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
        <dl className="hero-meta hero-enter">
          <div><dt>Pendidikan</dt><dd>Sarjana Bisnis, IPB University</dd></div>
          <div><dt>Magang</dt><dd>AnyMind Group · PT Sutan Vet Medika</dd></div>
          <div><dt>Domisili</dt><dd>Bekasi, Jawa Barat</dd></div>
        </dl>
      </div>
      <div className="hero-portrait hero-enter"><Portrait /></div>
      <p className="scroll-cue hero-enter" aria-hidden="true"><ArrowDown size={16} />Scroll</p>
    </section>
    <section className="impact-section wrap" aria-label="Sorotan pengalaman">
      <div className="impact-intro" data-reveal="left" data-reveal-kind="text"><span>Selama magang,</span><strong>saya ikut menangani:</strong></div>
      <div className="impact-stat" data-reveal="up" data-reveal-kind="stat"><strong><span data-count="200">200</span></strong><p>Kerja sama KOL yang<br />saya bantu kelola</p><small>PT Sutan Vet Medika</small></div>
      <div className="impact-stat" data-reveal="up" data-reveal-delay="0.1" data-reveal-kind="stat"><strong><span data-count="150">150</span><span className="stat-unit">/hari</span></strong><p>Mitra afiliasi baru<br />dihubungi</p><small>AnyMind Group</small></div>
      <div className="impact-stat" data-reveal="up" data-reveal-delay="0.2" data-reveal-kind="stat"><strong><span data-count="40">40</span></strong><p>Mitra afiliasi yang saya koordinasikan<br />untuk acara Pantene</p><small>AnyMind Group</small></div>
    </section>
    <section className="selected-section wrap">
      <div className="section-heading" data-reveal="left" data-reveal-kind="heading"><h2>Yang saya kerjakan<br />selama magang.</h2><p>Saya pernah magang di tim pemasaran AnyMind Group dan PT Sutan Vet Medika. Berikut beberapa pekerjaan saya selama magang.</p></div>
      <div className="selected-grid">
        <Link to="/pengalaman#entri-anymind" className="feature-story" data-reveal="left" data-reveal-kind="media" aria-label="Lihat pengalaman pemasaran afiliasi di AnyMind Group">
          <div className="feature-photo" data-mask><img src="/images/anymind-pantene-team.webp" width="1200" height="900" loading="lazy" fetchPriority="low" alt="Tim AnyMind Group berfoto bersama di depan layar acara AnyMind x Pantene New Product Launch" data-parallax /></div>
          <div className="story-meta"><span>AnyMind Group</span><ArrowUpRight size={26} /></div><h3>Mengelola mitra<br />afiliasi Unicharm.</h3><p>Pemasaran afiliasi / 2026</p>
        </Link>
        <Link to="/pengalaman#entri-anima-digital" className="feature-story secondary-story" data-reveal="right" data-reveal-kind="media" aria-label="Lihat pengalaman kolaborasi KOL di PT Sutan Vet Medika">
          <div className="feature-art" data-mask><img src="/images/connections.webp" width="1200" height="800" loading="lazy" fetchPriority="low" alt="Ilustrasi dua bentuk saling terhubung dalam warna bordo dan hijau" data-parallax /></div>
          <div className="story-meta"><span>PT Sutan Vet Medika</span><ArrowUpRight size={26} /></div><h3>Konten dan KOL<br />Anima Companion.</h3><p>KOL & pemasaran digital / 2025 - 2026</p>
        </Link>
      </div>
    </section>
    <div className="marquee"><p className="sr-only">Bidang: pemasaran afiliasi, kerja sama KOL, perencanaan konten.</p><div className="marquee-track" aria-hidden="true">{[0, 1].map(i => <div className="marquee-group" key={i}><span>Pemasaran afiliasi</span><Asterisk weight="bold" /><span>Kerja sama KOL</span><Asterisk weight="bold" /><span>Perencanaan konten</span><Asterisk weight="bold" /></div>)}</div></div>
    <section className="intro-section wrap" data-reveal-group="up" data-reveal-kind="text"><div className="intro-aside"><span className="section-kicker">SEDIKIT TENTANG SAYA</span><dl className="intro-facts"><div><dt>IPK</dt><dd>3.74<span>/4.00</span></dd></div><div><dt>TOEFL ITP</dt><dd>583</dd></div><div><dt>Lulus</dt><dd>Agu 2026</dd></div></dl></div><div><h2>Lulusan Bisnis<br />IPB University.</h2><p>Selama magang, saya menangani pengiriman sampel, memantau penyelesaian konten kreator, dan menyusun laporan. Pengalaman ini membantu saya memahami pekerjaan tim pemasaran secara langsung.</p><Link to="/tentang" className="text-link">Tentang saya <ArrowUpRight size={20} /></Link></div></section>
    <ContactCallout heading={<>Membutuhkan anggota<br />tim pemasaran?</>} action="Hubungi saya" />
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
    <CareerTimeline />
    <section className="experience-section wrap" aria-label="Pengalaman kerja">
      <div className="filter-list hero-enter" role="group" aria-label="Filter pengalaman">{['Semua', 'Pemasaran afiliasi', 'Kerja sama KOL', 'Pemasaran digital'].map(item => <button key={item} aria-pressed={filter === item} onClick={() => { setFilter(item); setExpanded(new Set()); }} className={filter === item ? 'filter active' : 'filter'}>{item}</button>)}</div>
      <p className="sr-only" role="status">{list.length} pengalaman ditampilkan</p>
      <div className="experience-list" data-reveal-group="up" data-reveal-kind="panel">{list.map((item) => <article className="experience-card" key={item.id} id={`entri-${item.id}`}>
        <div className="experience-side"><span className="experience-period">{item.period}</span><h2>{item.company}</h2><p>{item.role}</p><span className="experience-location">{item.location}</span>{item.context && <p className="experience-context">{item.context}</p>}</div>
        <div className="experience-main"><span className="category-label">{item.category}</span><h3>{item.title}</h3><p>{item.summary}</p><div className="experience-stats">{item.stats.map(stat => {
            // "30+" animates as 30 and keeps the "+" beside the counter, so the
            // element's text is only ever the number it declares.
            const [, number, unit] = /^(\d+)(.*)$/.exec(stat.value) || [null, null, null];
            return <div key={stat.label}><strong>{number ? <><span data-count={number}>{number}</span>{unit && <span className="stat-unit">{unit}</span>}</> : stat.value}</strong><span>{stat.label}</span></div>;
          })}</div>
          {item.split && <SplitBar split={item.split} />}
          <button className="detail-button" aria-expanded={expanded.has(item.id)} aria-controls={`details-${item.id}`} onClick={() => toggleDetail(item.id)}>{expanded.has(item.id) ? 'Tutup detail' : 'Lihat detail'}{expanded.has(item.id) ? <Minus size={20} /> : <Plus size={20} />}</button>
          <div className="experience-details" id={`details-${item.id}`} aria-hidden={!expanded.has(item.id)} inert={!expanded.has(item.id) ? true : undefined}><div><ul>{item.details.map(detail => <li key={detail}>{detail}</li>)}</ul></div></div>
        </div>
        <EvidenceGallery evidence={item.evidence} />
      </article>)}</div>
      <p className="source-note">Untuk riwayat lengkap, klik Download CV di bagian atas halaman.</p>
    </section>
    <section className="organizations wrap" data-reveal="up" data-reveal-kind="heading"><h2>Kegiatan selama kuliah.</h2><p className="section-description">Selama kuliah, saya mengelola keuangan organisasi, memimpin tim logistik, dan membantu pelaksanaan acara.</p><div className="organization-grid" data-reveal-group="up" data-reveal-kind="panel">{organizations.map(org => <article key={org.name}><span>{org.period}</span><h3>{org.name}</h3><strong>{org.role}</strong><p>{org.detail}</p></article>)}</div></section>
    <ContactCallout heading={<>Ingin tahu detail<br />pekerjaan saya?</>} lead="Saya bisa menjelaskan tanggung jawab di tiap tempat magang, termasuk yang materinya belum bisa saya tampilkan di sini." action="Ajukan pertanyaan" />
  </>;
}

function About() {
  return <>
    <section className="about-hero wrap page-opening"><div><p className="eyebrow hero-enter">TENTANG SAYA</p><Title lines={['Perkenalkan,', 'saya Anung.']} /><p className="about-lead hero-enter">Lulusan Bisnis IPB.<br />Menekuni pemasaran afiliasi dan digital.</p><p className="hero-enter">Nama lengkap saya Anung Hanindhita Ramadhan. Saya tinggal di Bekasi dan lulus dari IPB University pada 2026. Selama magang di AnyMind Group dan PT Sutan Vet Medika, saya terlibat dalam pengelolaan mitra afiliasi, kerja sama KOL, dan pembuatan konten.</p><a className="text-link hero-enter" href={profile.cv} download>Download CV <DownloadSimple size={20} /></a></div><div className="hero-enter"><Portrait compact /></div></section>
    <section className="about-statement wrap" data-reveal="right" data-reveal-kind="text"><h2>Tanggung jawab saya<br /><span>selama magang.</span></h2><p>Saya memastikan mitra menerima sampel produk, menindaklanjuti pembuatan konten sesuai arahan, serta memantau penyelesaiannya. Saya juga menyusun laporan penjualan dan kinerja konten untuk tim.</p></section>
    <section className="education-section wrap" data-reveal-group="up" data-reveal-kind="panel"><div><span className="section-kicker">PENDIDIKAN</span><h2>Pendidikan bisnis<br />di IPB University.</h2></div><div className="education-card"><span>{education.period}</span><h3>{education.institution}</h3><p>{education.degree}</p><GpaRing gpa={education.gpa} max={education.gpaMax} /><p>Saya mengikuti dua bazar bisnis untuk menjual produk, mengumpulkan masukan pembeli, dan menilai peluang pasar.</p><span className="education-note">Profit lebih dari Rp100.000 · 30+ transaksi produk · Nilai A untuk inovasi produk, pelaksanaan bisnis, dan evaluasi kinerja pasar</span></div></section>
    <section className="skills-section wrap" data-reveal="left" data-reveal-kind="heading"><h2>Keahlian dan<br />aplikasi yang saya gunakan.</h2><div className="skills-grid" data-reveal-group="up" data-reveal-kind="panel">{skills.map(group => <article key={group.title}><h3>{group.title}</h3><ul>{group.items.map(skill => <li key={skill}>{skill}</li>)}</ul></article>)}</div><div className="language-row" data-reveal-group="up" data-reveal-kind="text"><span>Bahasa Indonesia <strong>Bahasa ibu</strong></span><span>Bahasa Inggris <strong>Komunikasi profesional</strong></span><span>TOEFL ITP <strong>{english.score}</strong></span></div><ScoreScale score={english.score} scaleMin={english.scaleMin} scaleMax={english.scaleMax} level={english.level} /></section>
    <ContactCallout heading={<>Mari berkenalan<br />lebih jauh.</>} lead="Saya terbuka untuk peluang magang lanjutan maupun posisi pemasaran tingkat awal." action="Kirim pesan" />
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
    <div className="contact-signoff wrap" data-reveal="up" data-reveal-kind="text"><span>Terima kasih telah mengunjungi portofolio saya.</span><span className="signature">Anung.</span></div>
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
      <main id="main-content" tabIndex={-1} key={route}>{route === '/' ? <Home /> : route === '/pengalaman' ? <Experience /> : route === '/tentang' ? <About /> : route === '/kontak' ? <Contact /> : <section className="not-found wrap"><p>404</p><h1>Sepertinya salah jalan.</h1><Link to="/" className="button">Kembali ke beranda <ArrowRight /></Link></section>}</main>
      <Footer />
    </div>
  </>;
}
