import { ArrowDown, ArrowRight, ArrowUpRight, Asterisk } from '@phosphor-icons/react';
import { ContactCallout, Link, Magnet, Picture, Portrait, SIZES, Title } from '../ui.jsx';

function Home() {
  return <>
    <section className="hero wrap page-opening">
      <div className="hero-copy">
        <p className="availability hero-enter"><span className="pulse" aria-hidden="true" />Terbuka untuk lowongan kerja</p>
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
          <div className="feature-photo" data-mask><Picture src="/images/anymind-pantene-team.webp" sizes={SIZES.feature} width="1200" height="900" loading="lazy" fetchPriority="low" alt="Tim AnyMind Group berfoto bersama di depan layar acara AnyMind x Pantene New Product Launch" data-parallax /></div>
          <div className="story-meta"><span>AnyMind Group</span><ArrowUpRight size={26} /></div><h3>Mengelola mitra<br />afiliasi Unicharm.</h3><p>Pemasaran afiliasi / 2026</p>
        </Link>
        <Link to="/pengalaman#entri-anima-digital" className="feature-story secondary-story" data-reveal="right" data-reveal-kind="media" aria-label="Lihat pengalaman kolaborasi KOL di PT Sutan Vet Medika">
          <div className="feature-art" data-mask><Picture src="/images/connections.webp" sizes={SIZES.featureArt} width="1200" height="800" loading="lazy" fetchPriority="low" alt="Ilustrasi dua bentuk saling terhubung dalam warna bordo dan hijau" data-parallax /></div>
          <div className="story-meta"><span>PT Sutan Vet Medika</span><ArrowUpRight size={26} /></div><h3>Konten dan KOL<br />Anima Companion.</h3><p>KOL & pemasaran digital / 2025 - 2026</p>
        </Link>
      </div>
    </section>
    <div className="marquee"><p className="sr-only">Bidang: pemasaran afiliasi, kerja sama KOL, perencanaan konten.</p><div className="marquee-track" aria-hidden="true">{[0, 1].map(i => <div className="marquee-group" key={i}><span>Pemasaran afiliasi</span><Asterisk weight="bold" /><span>Kerja sama KOL</span><Asterisk weight="bold" /><span>Perencanaan konten</span><Asterisk weight="bold" /></div>)}</div></div>
    <section className="intro-section wrap" data-reveal-group="up" data-reveal-kind="text"><div className="intro-aside"><span className="section-kicker">SEDIKIT TENTANG SAYA</span><dl className="intro-facts"><div><dt>IPK</dt><dd>3.74<span>/4.00</span></dd></div><div><dt>TOEFL ITP</dt><dd>583</dd></div><div><dt>Lulus</dt><dd>Agu 2026</dd></div></dl></div><div><h2>Lulusan Bisnis<br />IPB University.</h2><p>Selama magang, saya menangani pengiriman sampel, memantau penyelesaian konten kreator, dan menyusun laporan. Pengalaman ini membantu saya memahami pekerjaan tim pemasaran secara langsung.</p><Link to="/tentang" className="text-link">Tentang saya <ArrowUpRight size={20} /></Link></div></section>
    <ContactCallout heading={<>Membutuhkan anggota<br />tim pemasaran?</>} action="Hubungi saya" />
  </>;
}

export default Home;
