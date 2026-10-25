import { SITE } from './site';

/**
 * The one measurement this site makes: a pageview in GoatCounter.
 *
 * It is deliberately **not** `count.js`. The README left analytics out because a
 * third-party tracker on a privacy-first product's own website is a
 * contradiction, and loading somebody else's script into the page is most of
 * that contradiction. This sends the request `count.js` would have sent, from
 * our own bundle instead: one beacon to the count endpoint, with the pageview in
 * the query string, and an opaque cross-origin response that nobody reads.
 *
 * The protocol is documented at <https://www.goatcounter.com/help/js>, and the
 * fields below are the subset `count.js` fills in.
 */

/** This site's own GoatCounter site, `deepwork.goatcounter.com`. */
const SITE_CODE = 'deepwork';
const ORIGIN = `https://${SITE_CODE}.goatcounter.com`;

/**
 * Everything that talks to GoatCounter, in one place.
 *
 * The app reports to the author's main site under a `/deepwork` path because
 * GoatCounter records a path and not a hostname. This site does not need a
 * prefix: it has a site of its own, so `/` here can never collide with `/` there.
 */
export const GOATCOUNTER = {
  siteCode: SITE_CODE,
  /** The dashboard, the counter endpoints and the API all share this origin. */
  origin: ORIGIN,
  /** Where a pageview is posted. */
  countEndpoint: `${ORIGIN}/count`,
  /** The documented JSON API, read by the footer's stats panel. */
  apiBase: `${ORIGIN}/api/v0`,
  /**
   * The read-only token the stats panel reads with.
   *
   * **PUBLIC BY CONSTRUCTION.** This is a static site: anything here is in the
   * published JavaScript, exactly as it is on the portfolio and in the web app.
   * A static page cannot keep a secret, so the token must be one whose holder
   * can only read. Make it from <https://deepwork.goatcounter.com/user/api>
   * with **Read statistics** ticked and nothing else, and it can be withdrawn
   * from the same screen; the panel then falls back to the public totals.
   *
   * This is a deliberate exception to "no third-party requests" rather than an
   * oversight: see the README before making it broader.
   *
   * The value committed here predates the panel and also carries "Read sites",
   * which is more than the panel needs. Replace it with a token that has only
   * Read statistics, and delete the old one from the same screen.
   */
  token: '1c695hmitnua1tky3tyuqkvf41m5zmxfxrgx26x4hca0oy546a',
} as const;

/**
 * The only host that is counted, taken from the canonical address.
 *
 * A local build, a preview deployment and `npm run audit` all have a different
 * origin, so none of them can add a pageview that is not a real visitor. The
 * stats panel is *not* gated by this: reading the numbers back is harmless from
 * anywhere, and it is how the panel is checked before it ships.
 */
const COUNTED_HOST = new URL(SITE.siteUrl).hostname;

/** The opt-out signals browsers expose outside the standard DOM typings. */
interface PrivacySignals {
  globalPrivacyControl?: boolean;
  doNotTrack?: string | null;
}

/**
 * Whether this page load should be counted at all.
 *
 * Do Not Track and Global Privacy Control are honoured on top of GoatCounter's
 * own promises (no cookie, no stored IP address): a visitor who has asked not
 * to be measured is not measured here either.
 */
function shouldCount(): boolean {
  if (typeof window === 'undefined') return false;
  if (location.protocol !== 'https:' || location.hostname !== COUNTED_HOST) return false;

  const navigatorWithSignals = navigator as Navigator & PrivacySignals;
  const windowWithSignals = window as Window & PrivacySignals;

  return !(
    navigatorWithSignals.globalPrivacyControl === true ||
    navigatorWithSignals.doNotTrack === '1' ||
    windowWithSignals.doNotTrack === '1'
  );
}

/**
 * Sends one pageview.
 *
 * What leaves the browser: the path, the title, the referring page, the screen
 * width, the query string and a headless-browser flag. Nothing else — no cookie
 * is written, no identifier is read, and GoatCounter stores no IP address for
 * it. `rnd` exists because browsers do not always honour `Cache-Control` on a
 * beacon.
 */
export function countPageview(): void {
  if (!shouldCount()) return;

  const params = new URLSearchParams({
    p: location.pathname || '/',
    t: document.title,
    s: String(window.screen.width),
    b: navigator.webdriver ? '153' : '0',
    rnd: Math.random().toString(36).slice(2, 7),
  });

  if (document.referrer) params.set('r', document.referrer);
  if (location.search) params.set('q', location.search);

  navigator.sendBeacon(`${GOATCOUNTER.countEndpoint}?${params}`);
}
