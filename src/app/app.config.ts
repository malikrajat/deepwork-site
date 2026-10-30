import {
  type ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';

/**
 * The whole application configuration.
 *
 * The site is a single page with no router on purpose: one page needs no
 * routing, and leaving it out keeps the bundle smaller and removes the
 * SPA-fallback problem that a host like GitHub Pages otherwise has to solve with
 * a hand-written `404.html`.
 *
 * The three documents beside it — `/privacy/`, `/terms/` and `/contact/` — are
 * static HTML in `public/`, not routes, for the same reason: GitHub Pages answers
 * an unknown path with a 404 status, so a client route would serve a legal notice
 * as "not found", and a policy has to be readable with JavaScript disabled.
 *
 * Change detection is zoneless — no `zone.js` is loaded at all — which is the
 * Angular 22 default for a new application and is what keeps the bundle this
 * small. Every piece of state on the page is a signal.
 *
 * ## On prerendering
 *
 * The build prerenders the whole page into `dist/.../index.html` (`outputMode:
 * "static"` plus the `src/main.server.ts` entry), so a crawler that executes no
 * JavaScript — GPTBot, ClaudeBot, PerplexityBot and the rest — reads every word
 * without running the app. There is still no server anywhere: the server bundle
 * is a build-time artefact that is never written to `dist`.
 *
 * The one thing the prerenderer needs from an app with no router is *a* router:
 * its route extractor boots the application and asks the `Router` which URLs
 * exist. `provideRouter([])` in `app.config.server.ts` answers that with the
 * root URL, which is the only page this site has. It is imported by the server
 * entry alone, so it costs the browser bundle nothing.
 *
 * The page is not hydrated: `provideClientHydration()` adds ~41 kB to the
 * initial bundle, and Angular's first render is synchronous, so adopting the
 * prerendered DOM saves a repaint a visitor would not have seen. What it buys
 * is a crawler that reads the page; that is already in the HTML.
 */
export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideZonelessChangeDetection()],
};
