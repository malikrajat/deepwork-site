/**
 * Captures the real DeepWork application for the website's screenshots.
 *
 * This is authoring tooling, not part of the site: it is run by hand when the
 * app's UI changes, and the PNGs it writes are converted to WebP by
 * `tools/make-webp.py`. Nothing here ships.
 *
 * It screenshots the **built application**, not a mock-up, which is the whole
 * point — every image on the site is the product as it actually renders.
 *
 * Run it with the app served first:
 *   python tools/serve-app.py <built-app-dir> 5199
 *   NODE_PATH=<deepwork-repo>/node_modules node tools/capture-app.cjs
 *
 * Playwright is borrowed from the DeepWork repository (it is already a dev
 * dependency there and its browsers are already installed) rather than added to
 * this project's `package.json`, because a screenshot tool has no business in a
 * marketing site's dependency tree.
 *
 * The theme is not written into storage: the app's default preference is
 * "system", so a `colorScheme` emulation is enough to get a true dark run and a
 * true light run — which means the capture exercises the app's real theme
 * resolution rather than a state the tooling invented.
 */

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const BASE = process.env['APP_URL'] || 'http://127.0.0.1:5199';
const OUT = process.env['OUT_DIR'] || path.join(__dirname, 'shots-raw');

/** Desktop and phone viewports, matching the two device frames on the site. */
const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };

const SHOTS = [
  { name: 'dashboard-dark', route: '/' },
  { name: 'tasks-dark', route: '/tasks' },
  { name: 'today-dark', route: '/today' },
  { name: 'matrix-dark', route: '/matrix' },
  { name: 'calendar-dark', route: '/calendar' },
  { name: 'analytics-dark', route: '/analytics' },
  { name: 'habits-dark', route: '/habits' },
  { name: 'journal-dark', route: '/journal' },
  { name: 'settings-dark', route: '/settings' },
  { name: 'dashboard-light', route: '/', colorScheme: 'light' },
  { name: 'dashboard-phone', route: '/', viewport: PHONE, scale: 3 },
];

/**
 * Details rather than whole windows.
 *
 * These are captured by **element**, not cropped by hand from a full shot: a
 * screenshot of `.water-card` is exactly that card at exactly its own size, and
 * it stays correct the next time the app's layout moves. Cropping by guessed
 * coordinates would not.
 *
 * They are captured in the same desktop window as everything else. A narrower
 * window was tried first and rejected: the app has a minimum comfortable width,
 * so below it the panels are squeezed into columns rather than reflowed, and the
 * result is a squeezed card instead of a readable one. The water card is
 * genuinely a wide bar on a wide screen, so the site gives it a wide frame
 * rather than pretending otherwise.
 */
const DETAILS = [
  { name: 'focus-clock', route: '/', selector: '.timer-card' },
  { name: 'water-card', route: '/', selector: '.water-card' },
];

/**
 * Dialogs and banners the app offers to dismiss. The preferences dialog is
 * modal, so it is closed first; the install banner sits underneath it.
 */
const DISMISSERS = ['.dialog-actions .btn-ghost', '.install-banner .btn-dismiss'];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch();
  const detailsOnly = process.env['DETAILS_ONLY'] === '1';

  for (const shot of detailsOnly ? [] : SHOTS) {
    const context = await browser.newContext({
      viewport: shot.viewport || DESKTOP,
      deviceScaleFactor: shot.scale || 2,
      colorScheme: shot.colorScheme || 'dark',
      // The app animates its pages in; a reduced-motion context means the
      // capture is the resting state instead of a frame of the entrance.
      reducedMotion: 'reduce',
    });

    const page = await context.newPage();
    await page.goto(`${BASE}${shot.route}`, { waitUntil: 'networkidle', timeout: 30000 });

    // Let the data layer settle: the browser build loads its store, then the
    // pages paint their real numbers.
    await page.waitForTimeout(1600);

    for (const selector of DISMISSERS) {
      const button = page.locator(selector);
      if ((await button.count()) > 0) {
        await button
          .first()
          .click({ timeout: 2500 })
          .catch(() => {});
        await page.waitForTimeout(500);
      }
    }

    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT, `${shot.name}.png`) });
    console.log(`captured ${shot.name} (${shot.route}, ${shot.colorScheme || 'dark'})`);

    await context.close();
  }

  // The detail pass: one page load, several element captures.
  if (DETAILS.length > 0) {
    const context = await browser.newContext({
      viewport: DESKTOP,
      deviceScaleFactor: 2,
      colorScheme: 'dark',
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();

    for (const route of [...new Set(DETAILS.map((detail) => detail.route))]) {
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1600);

      for (const selector of DISMISSERS) {
        const button = page.locator(selector);
        if ((await button.count()) > 0) {
          await button
            .first()
            .click({ timeout: 2500 })
            .catch(() => {});
          await page.waitForTimeout(400);
        }
      }

      for (const detail of DETAILS.filter((item) => item.route === route)) {
        const element = page.locator(detail.selector).first();
        await element.waitFor({ state: 'visible', timeout: 10000 });
        await page.waitForTimeout(400);

        // The CSS box is logged next to the capture so the site can reserve the
        // right space for it — a wrong aspect ratio in `NgOptimizedImage` is a
        // layout shift, and this is the only place that number is known.
        const box = await element.boundingBox();
        await element.screenshot({ path: path.join(OUT, `${detail.name}.png`) });
        console.log(
          `captured ${detail.name} (element ${detail.selector}) ` +
            `${Math.round(box?.width ?? 0)}x${Math.round(box?.height ?? 0)} css px`,
        );
      }
    }

    await context.close();
  }

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
