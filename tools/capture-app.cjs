/**
 * Captures the real DeepWork application for the website's screenshots.
 *
 * This is authoring tooling, not part of the site: it is run by hand when the
 * app's UI changes, and the PNGs it writes are converted to WebP by
 * `tools/make-webp.py`. Nothing here ships.
 *
 * It screenshots the **built application**, not a mock-up, which is the whole
 * point — every image on the site is the product as it actually renders. The
 * rows are seeded through `localStorage` before the app starts (`demo-seed.cjs`)
 * so a page shows a real, reachable working state rather than an empty first
 * run; every number on screen is still computed by the app itself.
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
const { buildDemo } = require('./demo-seed.cjs');

const BASE = process.env['APP_URL'] || 'http://127.0.0.1:5199';
const OUT = process.env['OUT_DIR'] || path.join(__dirname, 'shots-raw');

/** `ONLY=dashboard-dark,time-dark` captures a subset while iterating. */
const ONLY = (process.env['ONLY'] || '')
  .split(',')
  .map((name) => name.trim())
  .filter(Boolean);

/** Desktop and phone viewports, matching the two device frames on the site. */
const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };

/** The one thing the app times for the completion-alert capture. */
const SOON = {
  remainingSeconds: 8,
  startedAt: new Date().toISOString(),
  isRunning: true,
};

/** A task selected on the dashboard, so the hero has a session with context. */
async function linkTask(page) {
  const select = page.locator('select').first();
  if ((await select.count()) === 0) return;
  await select.selectOption({ label: 'Write the launch note' }).catch(() => {});
  await page.waitForTimeout(300);
}

/** Fold Schedule, so the board shows the space coming back. */
async function foldSchedule(page) {
  const chevron = page.locator('.quadrant.important .collapse-btn').nth(2);
  if ((await chevron.count()) === 0) return;
  await chevron.click();
  await page.waitForTimeout(900);
  await page.mouse.move(4, 4);
}

/** Open the detail sheet behind Code review. */
async function openTimeDetail(page) {
  const row = page.locator('.time-card-head').first();
  if ((await row.count()) === 0) return;
  await row.click();
  await page.waitForTimeout(1000);
}

/** Open the Focus & reminders panel. */
async function openQuietPanel(page) {
  const button = page.locator('.quiet-btn:visible').first();
  if ((await button.count()) === 0) return;
  await button.click();
  await page.waitForTimeout(700);
}

/** Start the four-second session that raises the completion alert. */
async function completeSession(page) {
  const resume = page.getByRole('button', { name: /^Resume$/ }).first();
  if ((await resume.count()) > 0) {
    await resume.click();
    // The alert is on screen for a few seconds; capture it while it is up
    // rather than after it has been auto-dismissed.
    // The alert slides in about six seconds after the four-second session is
    // started, and stays up; wait past the slide rather than for a selector,
    // because the host element exists before the toast is drawn.
    await page.waitForTimeout(9000);
  }
}

/** Open the browser's install dialog. */
async function openInstallDialog(page) {
  const how = page.locator('button.btn-install').first();
  if ((await how.count()) === 0) return;
  await how.click();
  await page.waitForTimeout(700);
}

const SHOTS = [
  { name: 'dashboard-dark', route: '/', prepare: linkTask },
  { name: 'tasks-dark', route: '/tasks' },
  { name: 'today-dark', route: '/today' },
  { name: 'matrix-dark', route: '/matrix' },
  { name: 'matrix-collapsed', route: '/matrix', prepare: foldSchedule },
  { name: 'calendar-dark', route: '/calendar' },
  { name: 'time-dark', route: '/time' },
  { name: 'time-detail', route: '/time', prepare: openTimeDetail },
  { name: 'analytics-dark', route: '/analytics' },
  { name: 'habits-dark', route: '/habits' },
  { name: 'journal-dark', route: '/journal' },
  { name: 'reminders-dark', route: '/reminders', standing: true },
  { name: 'completion-dark', route: '/', timer: SOON, prepare: completeSession },
  { name: 'settings-dark', route: '/settings' },
  { name: 'install-dark', route: '/', keepBanner: true, prepare: openInstallDialog },
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
  { name: 'reminder-card', route: '/reminders', selector: '.reminder-card', standing: true },
  { name: 'quiet-sheet', route: '/matrix', selector: '.quiet-sheet', prepare: openQuietPanel },
];

/**
 * Dialogs and banners the app offers to dismiss. The preferences dialog is
 * modal, so it is closed first; the install banner sits underneath it.
 */
const DISMISSERS = ['.dialog-actions .btn-ghost', '.install-banner .btn-dismiss'];

async function capture(browser, job, { detail = false } = {}) {
  const context = await browser.newContext({
    viewport: job.viewport || DESKTOP,
    deviceScaleFactor: job.scale || 2,
    colorScheme: job.colorScheme || 'dark',
    // The app animates its pages in; a reduced-motion context means the
    // capture is the resting state instead of a frame of the entrance.
    reducedMotion: 'reduce',
  });

  await context.addInitScript(
    ({ seed, hideBanner }) => {
      for (const [key, value] of Object.entries(seed)) {
        localStorage.setItem(key, JSON.stringify(value));
      }
      // The install bar is dismissed by the app itself in every capture except
      // the one that is about installing. Clicking its close button during a
      // completion capture also dismisses the toast, so it is set here instead.
      if (hideBanner) localStorage.setItem('deepwork_install_dismissed', '1');
    },
    {
      seed: buildDemo({ standing: job.standing === true, timer: job.timer ?? null }),
      hideBanner: !job.keepBanner,
    },
  );

  const page = await context.newPage();
  await page.goto(`${BASE}${job.route}`, { waitUntil: 'networkidle', timeout: 30000 });

  // Let the data layer settle: the browser build loads its store, then the
  // pages paint their real numbers.
  await page.waitForTimeout(1600);

  for (const selector of DISMISSERS) {
    if (job.keepBanner && selector.includes('install-banner')) continue;
    const button = page.locator(selector);
    if ((await button.count()) > 0) {
      await button
        .first()
        .click({ timeout: 2500 })
        .catch(() => {});
      await page.waitForTimeout(500);
    }
  }

  if (job.prepare) await job.prepare(page);

  await page.waitForTimeout(600);

  if (detail) {
    const element = page.locator(job.selector).first();
    let box = null;
    for (let attempt = 0; attempt < 40; attempt++) {
      box = await element.boundingBox();
      if (box && box.width > 0 && box.height > 0) break;
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(400);

    // The CSS box is logged next to the capture so the site can reserve the
    // right space for it — a wrong aspect ratio in `NgOptimizedImage` is a
    // layout shift, and this is the only place that number is known.
    await element.screenshot({ path: path.join(OUT, `${job.name}.png`) });
    console.log(
      `captured ${job.name} (element ${job.selector}) ` +
        `${Math.round(box?.width ?? 0)}x${Math.round(box?.height ?? 0)} css px`,
    );
  } else {
    await page.screenshot({ path: path.join(OUT, `${job.name}.png`) });
    console.log(`captured ${job.name} (${job.route}, ${job.colorScheme || 'dark'})`);
  }

  await context.close();
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch();
  const detailsOnly = process.env['DETAILS_ONLY'] === '1';
  const shotsOnly = process.env['SHOTS_ONLY'] === '1';

  if (!detailsOnly) {
    for (const shot of SHOTS) {
      if (ONLY.length > 0 && !ONLY.includes(shot.name)) continue;
      await capture(browser, shot);
    }
  }

  if (!shotsOnly) {
    for (const detail of DETAILS) {
      if (ONLY.length > 0 && !ONLY.includes(detail.name)) continue;
      await capture(browser, detail, { detail: true });
    }
  }

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
