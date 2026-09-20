import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/manrope';
import 'lenis/dist/lenis.css';
import './styles.css';
import App from './App.jsx';
import { getRoute } from './routes.js';
import { loadPage } from './pages.js';

// A deep link asks for its own chunk before React renders, so the request is in
// flight during the first render instead of only after it. The rejection is
// swallowed here on purpose: App asks for the same route again and renders its
// own message when the chunk never arrives, while an unhandled rejection at
// module scope would surface as a page error with nothing listening for it.
loadPage(getRoute()).catch(() => { /* App renders PageUnavailable. */ });

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
