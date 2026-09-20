// The hash router's vocabulary, kept outside the React tree so the header, the
// page registry and the generated llms.txt all read the same four routes.
export const routes = { '/': 'Beranda', '/pengalaman': 'Pengalaman', '/tentang': 'Tentang', '/kontak': 'Kontak' };

// `#/pengalaman#entri-anymind` carries a route and a deep-link anchor in one
// hash. Everything before the second '#' is the route; the rest is the anchor.
export const splitHash = () => {
  const raw = window.location.hash.slice(1);
  const at = raw.indexOf('#');
  return at < 0 ? { path: raw || '/', anchor: '' } : { path: raw.slice(0, at) || '/', anchor: raw.slice(at + 1) };
};
export const getRoute = () => splitHash().path;
export const getAnchor = () => splitHash().anchor;
