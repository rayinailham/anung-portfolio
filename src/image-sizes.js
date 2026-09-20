// `sizes` has to describe the CSS box, not the file. Each entry below is read
// off the layout in `src/styles.css`, so the browser can pick a width instead
// of assuming the viewport. Wrong values here cost bytes silently, which is why
// they sit together rather than inline in four page files. `vite.config.js`
// reads `portrait` too, so the <link rel=preload> and the <img> ask for exactly
// the same source and the portrait is never downloaded twice.
export const SIZES = {
  portrait: '(max-width: 767px) 80vw, (max-width: 1100px) 34vw, 420px',
  feature: '(max-width: 767px) calc(100vw - 40px), (max-width: 1440px) 48vw, 665px',
  featureArt: '(max-width: 767px) calc(100vw - 40px), (max-width: 1440px) 44vw, 594px',
  evidence: '(max-width: 370px) calc(100vw - 40px), (max-width: 767px) calc(50vw - 27px), (max-width: 1440px) 30vw, 420px',
  evidenceWide: '(max-width: 767px) calc(100vw - 40px), (max-width: 1440px) 46vw, 620px',
  cvPage: '(max-width: 767px) calc(100vw - 40px), (max-width: 1440px) 50vw, 660px',
};

export const PORTRAIT_SRC = '/images/anung-profile.webp';
