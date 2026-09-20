import Home from './pages/Home.jsx';

// Beranda ships with the shell. It is the landing page and it holds the portrait
// that decides LCP, so making it wait for its own chunk would cost exactly what
// the split is meant to save. The other three routes are fetched on demand and
// remembered here, which is why a second visit never downloads twice.
const loaders = {
  '/': null,
  '/pengalaman': () => import('./pages/Experience.jsx'),
  '/tentang': () => import('./pages/About.jsx'),
  '/kontak': () => import('./pages/Contact.jsx'),
};
const loaded = { '/': Home };
const pending = {};

export const isRoute = (route) => Object.hasOwn(loaders, route);
export const pageFor = (route) => loaded[route] ?? null;

export function loadPage(route) {
  if (!isRoute(route) || loaded[route]) return Promise.resolve(loaded[route] ?? null);
  // A rejected promise must not be remembered as this route's answer, or every
  // later visit would replay the same failure without even asking the network.
  // Dropping it means the next navigation issues a fresh import; a browser that
  // has already cached the failed fetch for this URL will still refuse, which is
  // why `PageUnavailable` asks for a reload rather than offering a retry button.
  pending[route] ||= loaders[route]().then(
    module => (loaded[route] = module.default),
    (error) => { delete pending[route]; throw error; },
  );
  return pending[route];
}

// Called once the first page is on screen and the browser is idle, so a click
// during a curtain never waits for the network.
export function prefetchPages() {
  for (const route of Object.keys(loaders)) loadPage(route).catch(() => { /* Navigating there renders PageUnavailable. */ });
}
