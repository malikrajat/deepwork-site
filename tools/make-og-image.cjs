/**
 * Renders `tools/og-image.html` to `public/og-image.png` at 1200x630.
 *
 * The social preview is built from the same materials as the site — the real
 * dashboard capture, the real palette, the real typeface — rather than being a
 * picture drawn by hand in an image editor that nobody can regenerate. Run it
 * after `tools/capture-app.cjs` whenever the app's UI changes:
 *
 *   python tools/serve-app.py <built-app-dir> 5199
 *   NODE_PATH=<deepwork-repo>/node_modules node tools/make-og-image.cjs
 *
 * CommonJS on purpose: `NODE_PATH` is honoured by `require` and ignored by ESM
 * imports, which is how Playwright is borrowed from the DeepWork repository
 * instead of being added to this project's dependencies.
 */

const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('@playwright/test');

const source = path.join(__dirname, 'og-image.html');
const destination = path.join(__dirname, '..', 'public', 'og-image.png');

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });

  await page.goto(pathToFileURL(source).href, { waitUntil: 'load' });
  // The screenshot inside the card and the two web fonts both have to be
  // decoded before the capture, or the image ships with a blank frame.
  await page.waitForFunction(
    () => {
      const image = document.querySelector('img');
      return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0;
    },
    null,
    { timeout: 20000 },
  );
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  await page.screenshot({ path: destination, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await browser.close();

  const { size } = fs.statSync(destination);
  console.log(`og-image.png 1200x630  ${Math.round(size / 1024)} kB`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
