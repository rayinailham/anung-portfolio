# Browser environment

Verified on 2026-09-18, Arch Linux. Node.js 24.16.0; Playwright 1.63.0.

Actual headless launches with the project's installed Playwright succeeded:

- Chromium 153.0.8010.12, revision 1243.
- Firefox 155.0, revision 1543.
- WebKit 26.6, revision 2359.

`arch-playwright-provision` installed user-space libicu74, libxml2.so.2, and libflite libraries into both WebKit 2359 minibrowser bundles. Follow-up `ldd` checks reported zero missing libraries. Existing browser revisions were preserved using `PLAYWRIGHT_SKIP_BROWSER_GC=1`; MCP browser caches were not removed.

The helper's Python verification additionally launched the older cached Chromium 151.0.7922.34, Firefox 153.0, and WebKit 26.5. Portfolio tests use the current Node Playwright engines listed above.

Kirim 1 recheck (2026-09-18): `arch-playwright-provision/scripts/provision_playwright_arch.sh --check` found zero missing libraries in both WPE/GTK bundles for revisions 2336 and 2359. The project's Node Playwright launched Chromium 153.0.8010.12, Firefox 155.0, and WebKit 26.6 successfully. No additional installation or system changes were needed.
