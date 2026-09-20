import { useState } from 'react';
import { Minus, Plus } from '@phosphor-icons/react';
import { experience, organizations } from '../data';
import { ContactCallout, Picture, SIZES, Title } from '../ui.jsx';

// One slot per claim. A slot whose material is not published yet keeps its
// cover, its honest caption and `data-placeholder`; a real file in
// `assets/source/`, one run of `scripts/prepare-assets.mjs` and removing
// `placeholder: true` in `data.js` is the whole swap.
function EvidenceGallery({ evidence }) {
  if (!evidence?.items?.length) return null;
  // A lone slot is laid out beside its caption and gets twice the box a
  // three-up row does, so it asks the browser for a wider source.
  const sizes = evidence.items.length === 1 ? SIZES.evidenceWide : SIZES.evidence;
  return <div className="evidence-gallery">
    <h3 className="evidence-title">{evidence.title}</h3>
    <ul>{evidence.items.map(item => <li key={item.id}>
      <figure className="evidence-item" data-placeholder={item.placeholder ? 'true' : undefined}>
        {/* The cover is a brand-colour block in CSS, so the slot stays correct
            even when the image file is missing or blocked. */}
        <span className="evidence-cover"><Picture src={item.src} sizes={sizes} alt={item.alt} width={item.width} height={item.height} loading="lazy" fetchPriority="low" decoding="async" onError={event => { event.currentTarget.dataset.missing = 'true'; }} /></span>
        <figcaption><span className="evidence-type">{item.type}</span>{item.caption}</figcaption>
      </figure>
    </li>)}</ul>
  </div>;
}

// The data visual below ships its final value in the DOM: the bar's own box,
// sized from the data. Motion only animates towards that value, so reduced
// motion, a blocked GSAP chunk and a stalled ticker all leave the real number
// on screen. Shape, curve and rhythm are VIS-1's job; every part that might
// change its look carries a class.
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

export default Experience;
