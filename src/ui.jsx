import { useEffect, useRef } from 'react';
import { ArrowUpRight, Asterisk } from '@phosphor-icons/react';
import manifest from './image-manifest.json';
import { PORTRAIT_SRC, SIZES } from './image-sizes.js';
import { gsap } from './motion';

export { SIZES };

const canMove = () => gsap && matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches;

// AVIF first, WebP second, and the canonical WebP still sits in `src` so the
// markup keeps one stable path per image. Every srcset comes from
// `src/image-manifest.json`, which only `scripts/prepare-assets.mjs` writes; a
// path with no entry there renders as a plain <img> instead of advertising
// widths nobody encoded. `picture { display: contents }` keeps the wrapper out
// of the layout, so the existing CSS still sizes the <img> directly.
export function Picture({ src, sizes, ...props }) {
  const set = manifest[src];
  const image = <img src={src} sizes={set ? sizes : undefined} {...props} />;
  if (!set) return image;
  return <picture>
    <source type="image/avif" srcSet={set.avif} sizes={sizes} />
    <source type="image/webp" srcSet={set.webp} sizes={sizes} />
    {image}
  </picture>;
}

export function Link({ to, children, className = '', onNavigate, ...props }) {
  return <a href={`#${to}`} className={className} onClick={onNavigate} {...props}>{children}</a>;
}

export function Magnet({ children, className = '' }) {
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

export function Title({ lines, className = '' }) {
  return <h1 className={className}>{lines.map((line, i) => <span className="title-line" key={line}><span className={i === lines.length - 1 ? 'last-line' : ''}>{line}</span></span>)}</h1>;
}

export function Portrait({ compact = false }) {
  const ref = useRef(null);
  const tilt = (event) => {
    if (!canMove()) return;
    const r = event.currentTarget.getBoundingClientRect();
    gsap.to(ref.current, { rotateY: ((event.clientX - r.left) / r.width - 0.5) * 6, rotateX: -((event.clientY - r.top) / r.height - 0.5) * 6, duration: 0.6, overwrite: true });
  };
  return <div className={`portrait-scene ${compact ? 'compact' : ''}`} onPointerMove={tilt} onPointerLeave={() => gsap?.to(ref.current, { rotateX: 0, rotateY: 0, duration: 0.6, overwrite: true })}>
    <div className="portrait-backplate" aria-hidden="true" />
    <div className="portrait-frame" ref={ref}><Picture src={PORTRAIT_SRC} sizes={SIZES.portrait} alt="Anung Hanindhita Ramadhan di kantor AnyMind Group" width="900" height="1200" fetchPriority={compact ? 'auto' : 'high'} /></div>
    <Asterisk className="portrait-asterisk" weight="bold" aria-hidden="true" />
    <div className="portrait-caption"><span>Anung Hanindhita Ramadhan</span><span>Lulusan Bisnis, IPB University</span></div>
  </div>;
}

export function ContactCallout({ heading, lead, action }) {
  return <section className="contact-callout wrap" data-reveal="zoom" data-reveal-kind="panel">
    <Asterisk className="callout-star" weight="bold" aria-hidden="true" data-spin />
    <h2>{heading}</h2>
    {lead && <p className="callout-lead">{lead}</p>}
    <Magnet><Link to="/kontak" className="button">{action} <ArrowUpRight size={20} /></Link></Magnet>
  </section>;
}
