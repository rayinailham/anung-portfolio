import { DownloadSimple } from '@phosphor-icons/react';
import { cvPreview, education, english, profile, skills } from '../data';
import { ContactCallout, Picture, Portrait, SIZES, Title } from '../ui.jsx';

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

// Page images rendered from the real PDF by `scripts/prepare-assets.mjs`, so a
// recruiter can read the CV without downloading it. The download button stays;
// the same facts also live on this site as real text, which is what a screen
// reader or a text search actually needs.
function CvPreview() {
  return <section className="cv-preview wrap" id="cv" data-reveal="up" data-reveal-kind="panel">
    <div className="cv-preview-intro">
      <span className="section-kicker">CV</span>
      <h2>CV saya, bisa dibaca<br />tanpa mengunduh.</h2>
      <p>Ini {cvPreview.pages.length} halaman dari berkas PDF yang sama, bukan versi yang saya tulis ulang. Isinya juga tersedia sebagai teks di halaman Pengalaman dan Tentang.</p>
      <a className="button" href={cvPreview.file} download>Download CV <DownloadSimple size={20} /></a>
    </div>
    <ol className="cv-pages">
      {cvPreview.pages.map(page => <li key={page.page}>
        <figure>
          <Picture src={page.src} sizes={SIZES.cvPage} alt={page.alt} width={page.width} height={page.height} loading="lazy" decoding="async" />
          <figcaption>Halaman {page.page} dari {cvPreview.pages.length}</figcaption>
        </figure>
      </li>)}
    </ol>
  </section>;
}

function About() {
  return <>
    <section className="about-hero wrap page-opening"><div><p className="eyebrow hero-enter">TENTANG SAYA</p><Title lines={['Perkenalkan,', 'saya Anung.']} /><p className="about-lead hero-enter">Lulusan Bisnis IPB.<br />Menekuni pemasaran afiliasi dan digital.</p><p className="hero-enter">Nama lengkap saya Anung Hanindhita Ramadhan. Saya tinggal di Bekasi dan lulus dari IPB University pada 2026. Selama magang di AnyMind Group dan PT Sutan Vet Medika, saya terlibat dalam pengelolaan mitra afiliasi, kerja sama KOL, dan pembuatan konten.</p><a className="text-link hero-enter" href={profile.cv} download>Download CV <DownloadSimple size={20} /></a></div><div className="hero-enter"><Portrait compact /></div></section>
    <section className="about-statement wrap" data-reveal="right" data-reveal-kind="text"><h2>Tanggung jawab saya<br /><span>selama magang.</span></h2><p>Saya memastikan mitra menerima sampel produk, menindaklanjuti pembuatan konten sesuai arahan, serta memantau penyelesaiannya. Saya juga menyusun laporan penjualan dan kinerja konten untuk tim.</p></section>
    <section className="education-section wrap" data-reveal-group="up" data-reveal-kind="panel"><div><span className="section-kicker">PENDIDIKAN</span><h2>Pendidikan bisnis<br />di IPB University.</h2></div><div className="education-card"><span>{education.period}</span><h3>{education.institution}</h3><p>{education.degree}</p><GpaRing gpa={education.gpa} max={education.gpaMax} /><p>Saya mengikuti dua bazar bisnis untuk menjual produk, mengumpulkan masukan pembeli, dan menilai peluang pasar.</p><span className="education-note">Profit lebih dari Rp100.000 · 30+ transaksi produk · Nilai A untuk inovasi produk, pelaksanaan bisnis, dan evaluasi kinerja pasar</span></div></section>
    <section className="skills-section wrap" data-reveal="left" data-reveal-kind="heading"><h2>Keahlian dan<br />aplikasi yang saya gunakan.</h2><div className="skills-grid" data-reveal-group="up" data-reveal-kind="panel">{skills.map(group => <article key={group.title}><h3>{group.title}</h3><ul>{group.items.map(skill => <li key={skill}>{skill}</li>)}</ul></article>)}</div><div className="language-row" data-reveal-group="up" data-reveal-kind="text"><span>Bahasa Indonesia <strong>Bahasa ibu</strong></span><span>Bahasa Inggris <strong>Komunikasi profesional</strong></span><span>TOEFL ITP <strong>{english.score}</strong></span></div><ScoreScale score={english.score} scaleMin={english.scaleMin} scaleMax={english.scaleMax} level={english.level} /></section>
    <CvPreview />
    <ContactCallout heading={<>Mari berkenalan<br />lebih jauh.</>} lead="Saya sedang aktif mencari lowongan kerja dan siap bergabung di posisi pemasaran afiliasi maupun digital." action="Kirim pesan" />
  </>;
}

export default About;
