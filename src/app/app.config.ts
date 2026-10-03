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
 * Change detection is zoneless — no `zone.js` is loaded at all — which is the
 * Angular 22 default for a new application and is what keeps the bundle this
 * small. Every piece of state on the page is a signal.
 *
 * ## On prerendering
 *
 * `outputMode: "static"` was tried here and does not work in this project:
 * Angular's prerenderer boots the server bundle and asks its route extractor for
 * the URL list, and that fails with `NG0401` for an application with no router;
 * switching to `outputMode: "server"` to give the extractor what it wants then
 * demands an `ssr.entry` — a real server file for a site that is deployed as
 * static files and must never run one. Rather than ship a server that exists to
 * satisfy a build step, the site stays client-rendered and the crawler problem
 * is solved the way the `/llms.txt` convention intends: `public/llms.txt` and
 * `public/llms-full.txt` are plain text, generated from the real page, and every
 * crawler that does not execute JavaScript can read them without one.
 *
 * See the README for what would be required to turn prerendering on later.
 */
export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideZonelessChangeDetection()],
};
