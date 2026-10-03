/**
 * Audits the built site the way a person would check it — except it can be run
 * on every change, and it does not get tired at 2560px.
 *
 * It exists because the visual result cannot be reviewed by reading the source,
 * and because the two most damaging failures on a page like this are invisible
 * in a build log:
 *
 * 1. **Scroll-revealed content that never reveals.** Every section carries
 *    `.reveal { opacity: 0 }` until an observer runs. If that observer never
 *    fires, the page compiles, builds, deploys, and is blank. So the audit
 *    asserts that revealed content is actually visible, at reduced motion
 *    (where it must be visible immediately) and at normal motion after
 *    scrolling.
 * 2. **Horizontal overflow at one width only.** A single long word, a fixed
 *    width or a negative margin produces a sideways scrollbar on a 360px phone
 *    and nowhere else. The audit walks ten widths from 320 to 2560 and names the
 *    offending element when it finds one.
 *
 * Plus the ordinary checks: no console errors, one `h1`, every section anchor
 * resolves, every screenshot actually loaded, and the theme toggle flips the
 * document.
 *
 *   python tools/serve-app.py dist/deepwork-site/browser 5200
 *   NODE_PATH=<deepwork-repo>/node_modules node tools/verify-site.cjs
 */

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const { startServer } = require('./static-server.cjs');

const DIST = path.join(__dirname, '..', 'dist', 'deepwork-site', 'browser');
const PORT = Number(process.env['PORT'] || 5200);

/** Set when an already-running server should be used instead of starting one. */
const EXTERNAL_URL = process.env['SITE_URL'];

/** The widths the site is required to work at, small phone to ultrawide. */
const WIDTHS = [320, 360, 390, 430, 768, 1024, 1280, 1440, 1920, 2560];

/** Every section the navigation promises. */
const SECTION_IDS = [
  'focus',
  'planner',
  'tasks',
  'matrix',
  'habits',
  'hydration',
  'insights',
  'your-data',
  'desktop',
  'how',
  'learn',
  'why',
  'source',
  'get-started',
  'faq',
];

const failures = [];
const notes = [];

function check(condition, message) {
  if (condition) {
    notes.push(`  ok   ${message}`);
  } else {
    failures.push(`  FAIL ${message}`);
  }
}

/** Runs in the page: overflow and reveal geometry, measured, not guessed. */
function measure() {
  const inner = window.innerWidth;
  const offenders = [];

  for (const element of Array.from(document.querySelectorAll('body *'))) {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;
    // A deliberate bleed off the edge (the social-card style decorations) is
    // allowed; anything poking out on both sides is not.
    if (rect.right > inner + 1.5 || rect.left < -1.5) {
      const style = getComputedStyle(element);
      if (style.position === 'fixed') continue;
      offenders.push({
        tag: element.tagName.toLowerCase(),
        cls: (element.className || '').toString().slice(0, 60),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
      });
    }
  }

  // `armed` is the unambiguous question: it is the class the directive adds when
  // it hides an element, so zero armed elements means nothing is waiting to be
  // revealed. `hidden` is measured too, but only reported: an element mid-way
  // through its 0.7s fade legitimately has an opacity below 0.9, and asserting on
  // that number would make this test fail whenever it ran fast enough.
  const armed = document.querySelectorAll('.reveal--armed').length;
  const hidden = Array.from(document.querySelectorAll('.reveal')).filter(
    (element) => Number(getComputedStyle(element).opacity) < 0.9,
  );

  const brokenImages = Array.from(document.images)
    .filter((image) => image.complete && image.naturalWidth === 0)
    .map((image) => image.currentSrc || image.src);

  return {
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: inner,
    offenders: offenders.slice(0, 6),
    armed,
    hiddenReveals: hidden.length,
    brokenImages,
    h1: document.querySelectorAll('h1').length,
    h1Text: (document.querySelector('h1')?.textContent || '').trim().replace(/\s+/g, ' '),
    headings: Array.from(document.querySelectorAll('h2')).length,
    images: document.images.length,
    nodes: document.querySelectorAll('*').length,
    bodyFont: getComputedStyle(document.body).fontFamily,
  };
}

async function main() {
  /* ---------- 0. What a crawler that runs no JavaScript receives ----------
     The most important checks in this file, and the ones a browser test cannot
     make. The page is client-rendered, so a crawler that executes nothing sees
     a shell — which is exactly why `llms.txt` and `llms-full.txt` exist, and
     why they are asserted here rather than trusted. */
  console.log('== crawler and SEO assets ==');

  const robots = fs.existsSync('public/robots.txt')
    ? fs.readFileSync('public/robots.txt', 'utf8')
    : '';
  check(robots.includes('Sitemap:'), 'robots.txt points at the sitemap');
  check(
    ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'OAI-SearchBot'].every((agent) =>
      robots.includes(agent),
    ),
    'robots.txt names the AI crawlers explicitly',
  );
  check(robots.includes('llms.txt'), 'robots.txt points at llms.txt');

  const sitemap = fs.existsSync('public/sitemap.xml')
    ? fs.readFileSync('public/sitemap.xml', 'utf8')
    : '';
  check(sitemap.includes('malikrajat.github.io/deepwork-site/'), 'sitemap has the canonical URL');
  check(sitemap.includes('image:image'), 'sitemap carries image entries');
  check(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/.test(sitemap), 'sitemap has a real lastmod');

  const llms = fs.existsSync('public/llms.txt') ? fs.readFileSync('public/llms.txt', 'utf8') : '';
  check(llms.length > 2000, `llms.txt is a real index (${llms.length} bytes)`);
  check(
    ['Pomodoro', 'free', 'SQLite', 'no account'].every((fact) => llms.includes(fact)),
    'llms.txt states the key facts in plain text',
  );
  // The application repository gained an MIT licence and the crawler index
  // claims it. If the licence ever changes, this fails rather than going
  // quietly stale — the same failure the copy had when the file first appeared.
  check(llms.includes('MIT'), 'llms.txt states the real licence (MIT)');

  const llmsFull = fs.existsSync('public/llms-full.txt')
    ? fs.readFileSync('public/llms-full.txt', 'utf8')
    : '';
  check(llmsFull.length > 12000, `llms-full.txt has the whole page (${llmsFull.length} bytes)`);
  check(
    llmsFull.includes('Focus better') && llmsFull.includes('Eisenhower'),
    'llms-full.txt contains the page content, not a stub',
  );
  // A length check alone passed on a first version that had silently dropped
  // every card's body text, so the audit asserts on real sentences instead.
  check(
    llmsFull.includes('its colour is its status') &&
      llmsFull.includes('Your queued tasks become focus blocks'),
    'llms-full.txt carries card body text, not just headings',
  );
  check(
    !/Focus sessionsThe Pomodoro/.test(llmsFull),
    'adjacent labels are separated, not run together',
  );
  check(
    !/countdown\.DeepWork/.test(llmsFull),
    'a <br> in a headline becomes a space, not a glued-together sentence',
  );

  for (const file of ['og-image.png', 'site.webmanifest', 'robots.txt', 'sitemap.xml']) {
    check(fs.existsSync(path.join('public', file)), `public/${file} exists`);
  }

  /* The files that make the site installable, and the one that stops a broken
     link from becoming a search result. */
  check(fs.existsSync('public/404.html'), 'a branded 404 page is shipped');
  check(fs.existsSync('public/.well-known/security.txt'), 'a security.txt is published (RFC 9116)');

  if (fs.existsSync('public/site.webmanifest')) {
    const manifest = JSON.parse(fs.readFileSync('public/site.webmanifest', 'utf8'));
    check(
      Array.isArray(manifest.screenshots) && manifest.screenshots.length >= 2,
      'the manifest carries install screenshots',
    );
    check(
      Array.isArray(manifest.shortcuts) && manifest.shortcuts.length >= 2,
      'the manifest offers shortcuts into the page',
    );
    check(manifest.start_url === '.' || !!manifest.start_url, 'the manifest has a start_url');
  }

  /* The document head, read from source: this is what every crawler sees first.
     The patterns tolerate whitespace around the JSON colons, because Prettier
     owns the formatting of this file and a test that breaks when a formatter
     runs is a test that gets deleted rather than fixed. */
  const head = fs.readFileSync('src/index.html', 'utf8');
  const hasType = (type) => new RegExp(`"@type"\\s*:\\s*"${type}"`).test(head);

  check(head.includes('rel="canonical"'), 'a canonical URL is declared');
  check(head.includes('max-image-preview:large'), 'large image previews are allowed');
  check(
    head.includes('og:image') && head.includes('summary_large_image'),
    'OG and Twitter cards are declared',
  );
  check(hasType('FAQPage'), 'FAQ structured data is present');
  check(hasType('SoftwareApplication'), 'SoftwareApplication structured data is present');
  check(hasType('WebSite'), 'WebSite structured data is present');
  check(/"featureList"\s*:/.test(head), 'the application declares its feature list');
  check(
    !/"aggregateRating"\s*:/.test(head),
    'no invented rating is claimed (the word may only appear in a comment)',
  );
  check(
    !/<noscript>[\s\S]*?<h1/i.test(head),
    'the noscript block holds no second h1 (heading hierarchy)',
  );

  // Start the build's own server unless one was pointed at explicitly, so that
  // `npm run audit` is one command with nothing to remember first.
  let base = EXTERNAL_URL;
  let server = null;
  if (!base) {
    server = await startServer({ root: DIST, port: PORT });
    base = server.url;
  }

  const browser = await chromium.launch();

  /* ---------- 1. Reduced motion: nothing may be hidden ---------- */
  {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const errors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(String(error)));

    await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(900);

    const result = await page.evaluate(measure);

    console.log('== reduced motion, 1280x900 ==');
    check(result.h1 === 1, `exactly one h1 (found ${result.h1})`);
    check(result.h1Text.length > 10, `h1 has real text: "${result.h1Text}"`);
    check(result.headings >= 12, `at least 12 section headings (found ${result.headings})`);
    check(
      result.armed === 0,
      `nothing left waiting to be revealed (armed ${result.armed}, fading ${result.hiddenReveals})`,
    );
    check(result.brokenImages.length === 0, `all ${result.images} images loaded`);
    check(errors.length === 0, `no console or page errors`);
    check(
      result.bodyFont.toLowerCase().includes('inter'),
      `Inter is the body typeface (${result.bodyFont.split(',')[0]})`,
    );
    check(
      result.scrollWidth <= result.innerWidth + 1,
      `no horizontal overflow (${result.scrollWidth} vs ${result.innerWidth})`,
    );

    // Anchors the navigation and footer promise.
    for (const id of SECTION_IDS) {
      const exists = await page.locator(`#${id}`).count();
      check(exists === 1, `section #${id} exists`);
    }

    // The theme toggle has to actually change the document.
    const before = await page.evaluate(() => document.documentElement.dataset['theme']);
    await page.locator('.nav__icon-btn').first().click();
    await page.waitForTimeout(250);
    const after = await page.evaluate(() => document.documentElement.dataset['theme']);
    check(before !== after, `theme toggle switches ${before} -> ${after}`);

    // The FAQ is a details element; it must open without scripting.
    await page.locator('.faq__question').first().click();
    await page.waitForTimeout(200);
    const open = await page.locator('.faq__item[open]').count();
    check(open >= 1, 'FAQ opens on click');

    if (errors.length) notes.push(`  errors: ${errors.slice(0, 4).join(' | ')}`);

    await context.close();
  }

  /* ---------- 2. Every width, for overflow ---------- */
  console.log('\n== horizontal overflow by width ==');
  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: width < 700 ? 844 : 900 },
    });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(700);

    // Scroll the whole page the way a person does — real wheel input, then the
    // End key — rather than by calling `window.scrollTo`. Programmatic scrolling
    // asks a different question ("did the layout move?") than input scrolling
    // asks ("does this respond to a user?"), and the reveal has to survive the
    // second one. The final wait outlasts the longest staggered transition (a
    // 210ms delay plus a 700ms fade) so any opacity figure reported alongside is
    // the resting state and not a mid-fade frame.
    await page.mouse.move(60, Math.round((width < 700 ? 844 : 900) / 2));
    for (let i = 0; i < 18; i += 1) {
      await page.mouse.wheel(0, 900);
      await page.waitForTimeout(70);
    }
    await page.keyboard.press('End');
    await page.waitForTimeout(900);
    await page.keyboard.press('Home');
    await page.waitForTimeout(900);

    const result = await page.evaluate(measure);
    const overflow = result.scrollWidth - result.innerWidth;

    if (overflow > 1 || result.armed > 0) {
      failures.push(
        `  FAIL ${width}px: overflow ${overflow}px, armed ${result.armed}, fading ${result.hiddenReveals}` +
          (overflow > 1 && result.offenders.length
            ? `\n        widest: ${result.offenders.map((o) => `${o.tag}.${o.cls}[${o.left}..${o.right}]`).join(' ')}`
            : ''),
      );
    } else {
      notes.push(`  ok   ${width}px — no overflow, nothing armed, content visible`);
    }

    await context.close();
  }

  await browser.close();
  if (server) await server.close();

  console.log('\n== result ==');
  for (const note of notes) console.log(note);
  if (failures.length) {
    console.log('\n== failures ==');
    for (const failure of failures) console.log(failure);
    process.exit(1);
  }

  console.log(`\nAll ${notes.length} checks passed at ${WIDTHS.length} widths.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
