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
 * document. The same is then done to the three documents beside the page —
 * `/privacy/`, `/terms/` and `/contact/` — which are static files and have to be
 * served with a 200, render without the application bundle, and keep the theme
 * choice in the same place the page does.
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
  'whats-new',
  'focus',
  'planner',
  'tasks',
  'matrix',
  'time',
  'habits',
  'hydration',
  'insights',
  'reminders',
  'your-data',
  'desktop',
  'quiet',
  'devices',
  'how',
  'learn',
  'about',
  'why',
  'compare',
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
     make. The build prerenders the page into `index.html`, so a crawler that
     executes nothing reads the whole page; `/llms.txt` and `/llms-full.txt`
     exist beside it for agents that prefer Markdown, and are asserted here
     rather than trusted. */
  console.log('== crawler and SEO assets ==');

  /* The canonical address is published in five files, so it is read once from
     `site.ts` and then asserted against each of them. A literal string here
     would be a sixth copy that can silently disagree with the other five — and
     the failure is invisible: the site builds, deploys, and names two homes. */
  const siteSource = fs.readFileSync('src/app/core/site.ts', 'utf8');
  const siteUrl = /siteUrl:\s*'([^']+)'/.exec(siteSource)?.[1] ?? '';
  check(!!siteUrl, 'site.ts names the canonical site address');

  const robots = fs.existsSync('public/robots.txt')
    ? fs.readFileSync('public/robots.txt', 'utf8')
    : '';
  // A `#`-prefixed line is a comment, and the previous version of this file had
  // the sitemap inside one — the string was present, so the old assertion passed
  // while no crawler ever saw the directive. Match a whole, uncommented line.
  check(
    robots.split(/\r?\n/).some((line) => line.trim() === `Sitemap: ${siteUrl}sitemap.xml`),
    'robots.txt declares the sitemap on the canonical host',
  );
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
  check(!!siteUrl && sitemap.includes(`<loc>${siteUrl}</loc>`), 'sitemap loc is that address');
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
  const canonical = /rel="canonical" href="([^"]+)"/.exec(head)?.[1] ?? '';
  check(canonical === siteUrl, `index.html canonical is ${siteUrl}`);
  check(head.includes(`content="${siteUrl}"`), 'og:url names the canonical address');
  check(llms.includes(`Canonical page: ${siteUrl}`), 'llms.txt names the canonical address');
  check(llmsFull.includes(`> Source: ${siteUrl}`), 'llms-full.txt names the canonical address');
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
  check(
    /rel="alternate"[\s\S]{0,200}?href="llms\.txt"/.test(head) &&
      /rel="alternate"[\s\S]{0,200}?href="llms-full\.txt"/.test(head),
    'the head points at both machine-readable editions, not just robots.txt',
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

  /* ---------- 1. The page with JavaScript switched off ----------
     What GPTBot, ClaudeBot, PerplexityBot and every other crawler that executes
     nothing actually receives. Two independent questions are asked of it: does
     the built file contain the words, and does a browser with scripting disabled
     lay them out as a page. The first catches a build that silently went back to
     shipping an empty `<app-root>`; the second catches a prerendered page that is
     present in the HTML but hidden by CSS. */
  {
    const built = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
    check(
      !/<app-root[^>]*>\s*<\/app-root>/.test(built),
      'the built index.html is not an empty <app-root> shell',
    );
    check((built.match(/<h1[\s>]/g) || []).length === 1, 'the built index.html has exactly one h1');
    check(
      ['Focus better', 'Eisenhower', 'standing reminder', 'SQLite'].every((phrase) =>
        built.includes(phrase),
      ),
      'the built index.html carries the page text, not just the shell',
    );
    check(
      built.indexOf('Focus better') > built.indexOf('<app-root'),
      'the page text is inside <app-root>, where a reader looks for it',
    );
    check(
      !fs.existsSync(path.join(DIST, 'index.csr.html')),
      'no second, empty copy of the page is shipped (index.csr.html)',
    );

    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 1280, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: 'load', timeout: 30000 });

    const noJs = {
      h1: await page.locator('h1').count(),
      h1Text: ((await page.locator('h1').first().textContent()) ?? '').trim(),
      h2: await page.locator('h2').count(),
      sections: await page.locator('main section').count(),
      images: await page.locator('main img').count(),
      text: ((await page.locator('body').innerText()) ?? '').replace(/\s+/g, ' '),
    };

    console.log('== without JavaScript ==');
    check(noJs.h1 === 1, `no-JS: exactly one h1 (found ${noJs.h1})`);
    check(
      noJs.h1Text.replace(/\s+/g, ' ').trim() === 'Focus better. Work deeper.',
      `no-JS: the h1 reads the page title ("${noJs.h1Text.replace(/\s+/g, ' ').trim()}")`,
    );
    check(noJs.h2 >= 12, `no-JS: at least 12 section headings (found ${noJs.h2})`);
    check(noJs.sections >= 20, `no-JS: every section is in the document (found ${noJs.sections})`);
    check(noJs.images >= 10, `no-JS: the screenshots are in the document (found ${noJs.images})`);
    check(noJs.text.length > 12000, `no-JS: the page reads as prose (${noJs.text.length} chars)`);
    check(
      ['Pomodoro', 'Eisenhower', 'Time by Task', 'SQLite'].every((phrase) =>
        noJs.text.includes(phrase),
      ),
      'no-JS: the product claims are in the text, not in a script',
    );

    await context.close();
  }

  /* ---------- 2. Reduced motion: nothing may be hidden ---------- */
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

    /* Every origin the page talks to. There should be none but the site's own:
       fonts and screenshots ship with the build, and the visitor count is a
       beacon this page sends itself. A third-party script or tracker arriving
       here is a privacy regression, and it would also mean a local audit was
       capable of writing to a real analytics account. */
    const external = [];
    const ownOrigin = new URL(base).origin;
    page.on('request', (request) => {
      let origin = '';
      try {
        origin = new URL(request.url()).origin;
      } catch {
        return;
      }
      if (origin !== ownOrigin) external.push(request.url());
    });

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
      external.length === 0,
      `no third-party requests (${external.length}${external.length ? `: ${external[0]}` : ''})`,
    );
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

  /* ---------- 3. Every width, for overflow ---------- */
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

  /* ---------- 4. The three documents ----------
     /privacy/, /terms/ and /contact/ are static files, not routes: they must be
     served with a 200, render with JavaScript disabled, and carry the same theme
     preference as the page. A broken "back to the site" link or a toggle that
     stopped writing the shared key is invisible in a build log, which is why
     these are checked here rather than trusted. */
  console.log('\n== documents: privacy, terms, contact ==');

  const documents = [
    { path: '/privacy/', file: 'public/privacy/index.html', name: 'privacy' },
    { path: '/terms/', file: 'public/terms/index.html', name: 'terms' },
    { path: '/contact/', file: 'public/contact/index.html', name: 'contact' },
  ];

  const siteConfig = fs.readFileSync('src/app/core/site.ts', 'utf8');
  const legalUpdated = /LEGAL_UPDATED\s*=\s*'([^']+)'/.exec(siteConfig)?.[1] ?? '';
  check(
    /^\d{4}-\d{2}-\d{2}$/.test(legalUpdated),
    `site.ts dates the documents (${legalUpdated || 'nothing'})`,
  );

  for (const doc of documents) {
    check(fs.existsSync(doc.file), `${doc.file} is shipped`);

    const html = fs.existsSync(doc.file) ? fs.readFileSync(doc.file, 'utf8') : '';
    check(html.includes(`datetime="${legalUpdated}"`), `${doc.name} prints the date in site.ts`);
    check(
      html.includes(`<link rel="canonical" href="${siteUrl}${doc.path.slice(1)}"`),
      `${doc.name} declares its canonical URL`,
    );
  }

  const documentsContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const ownOrigin = new URL(base).origin;

  for (const doc of documents) {
    const page = await documentsContext.newPage();
    const docErrors = [];
    const docExternal = [];

    page.on('console', (message) => {
      if (message.type() === 'error') docErrors.push(message.text());
    });
    page.on('pageerror', (error) => docErrors.push(String(error)));
    page.on('request', (request) => {
      try {
        const url = new URL(request.url());
        if (url.origin === ownOrigin) return;
        /* hCaptcha is this site's single third-party dependency, and it exists
           only on the contact page: the form service refuses any submission
           without its token. Everywhere else — and every other origin — a request
           leaving the site is still a failure. */
        const captchaHost =
          url.hostname === 'web3forms.com' ||
          url.hostname.endsWith('.hcaptcha.com') ||
          url.hostname.endsWith('.hcaptcha.net');
        if (doc.path === '/contact/' && captchaHost) return;
        docExternal.push(request.url());
      } catch {
        /* A request with no parseable URL is not one this check can judge. */
      }
    });

    const response = await page.goto(base + doc.path, { waitUntil: 'networkidle', timeout: 30000 });
    const h1Count = await page.locator('h1').count();
    const h1Text = ((await page.locator('h1').first().textContent()) ?? '').trim();

    check(
      response !== null && response.status() === 200,
      `${doc.path} is served with 200, not the 404 page (${response?.status()})`,
    );
    check(h1Count === 1, `${doc.path} has exactly one h1 (found ${h1Count})`);
    check(h1Text.length > 5, `${doc.path} h1 has real text: "${h1Text.slice(0, 40)}"`);
    check(docErrors.length === 0, `${doc.path} has no console or page errors`);
    check(
      docExternal.length === 0,
      `${doc.path} makes no third-party request${docExternal.length ? `: ${docExternal[0]}` : ''}`,
    );

    /* Theme: the same key and the same attribute the home page uses, so the two
       can never disagree about which theme the visitor chose. */
    const before = await page.evaluate(() => document.documentElement.dataset['theme']);
    await page.locator('[data-theme-toggle]').click();
    await page.waitForTimeout(150);
    const after = await page.evaluate(() => ({
      theme: document.documentElement.dataset['theme'],
      stored: localStorage.getItem('deepwork-site-theme'),
    }));
    check(
      after.theme !== before && after.stored === after.theme,
      `${doc.path} theme toggle switches and persists (${before} -> ${after.theme})`,
    );

    /* Every link the document promises, followed for real. A 404 behind a
       "Back to the site" button is the kind of thing only a browser finds. */
    const hrefs = await page.$$eval('a[href]', (links) =>
      Array.from(
        new Set(
          links
            .map((link) => link.getAttribute('href') ?? '')
            .filter((href) => href.startsWith('/') && !href.startsWith('//')),
        ),
      ),
    );

    const broken = [];
    for (const href of hrefs) {
      const linkResponse = await documentsContext.request.get(base + href);
      if (!linkResponse.ok()) broken.push(`${href} (${linkResponse.status()})`);
    }
    check(
      broken.length === 0,
      `${doc.path} links all resolve (${hrefs.length} links${broken.length ? `: ${broken.join(', ')}` : ''})`,
    );

    /* The table of contents is the one navigation a legal document has, and a
       link to a heading that was renamed or removed scrolls nowhere — silently. */
    const missingAnchors = await page.$$eval('a[href^="#"]', (links) =>
      Array.from(
        new Set(
          links
            .map((link) => (link.getAttribute('href') ?? '').slice(1))
            .filter((id) => id !== '' && document.getElementById(id) === null),
        ),
      ),
    );
    check(
      missingAnchors.length === 0,
      `${doc.path} in-page anchors resolve${missingAnchors.length ? `: #${missingAnchors[0]}` : ''}`,
    );

    /* A list item that collapses to one character per line overflows nothing and
       errors nowhere — the page built, deployed and passed every other check
       while two sections were unreadable. Height is the tell: a real item in this
       measure is a few lines, and a collapsed one is thousands of pixels. */
    const tallItems = await page.$$eval('.prose li', (items) =>
      items
        .map((item) => ({
          text: (item.textContent ?? '').trim().slice(0, 48),
          height: Math.round(item.getBoundingClientRect().height),
        }))
        .filter((item) => item.height > 400),
    );
    check(
      tallItems.length === 0,
      `${doc.path} list items keep their width${tallItems.length ? `: "${tallItems[0].text}" is ${tallItems[0].height}px tall` : ''}`,
    );

    if (doc.path === '/contact/') {
      const form = await page.$eval('[data-contact-form]', (element) => ({
        action: element.getAttribute('action') ?? '',
        fields: Array.from(element.querySelectorAll('[name]')).map((field) => field.name),
        note: (element.querySelector('[data-note-delivery]')?.textContent ?? '')
          .replace(/\s+/g, ' ')
          .trim(),
        canRewriteNote: element.querySelector('[data-note-delivery]') !== null,
      }));

      /* The delivery configuration is generated at build time from a repository
         secret, so the audit asks the page which path it actually took rather
         than assuming one. Both are legitimate: wired, the form POSTs to the
         service; unwired (no secret in a local build), it opens the mail app. */
      const delivery = await page.evaluate(() => {
        const config = window.DEEPWORK_CONTACT || {};
        return {
          endpoint: (config.endpoint || '').trim(),
          accessKey: (config.accessKey || '').trim(),
          provider: config.provider || '',
        };
      });

      const wired = Boolean(delivery.endpoint && delivery.accessKey);

      const captcha = await page.$eval('[data-captcha-host]', (element) => ({
        hidden: element.hasAttribute('hidden'),
        widget: element.querySelector('.h-captcha') !== null,
      }));

      check(
        ['name', 'email', 'subject', 'message'].every((field) => form.fields.includes(field)),
        'the contact form asks for a name, an email, a topic and a message',
      );
      check(form.fields.includes('botcheck'), 'the contact form keeps a spam trap');
      check(
        !wired || (!captcha.hidden && captcha.widget),
        'the contact form mounts the captcha the service requires',
      );
      check(
        wired ? form.action === delivery.endpoint : form.action.startsWith('mailto:'),
        `the contact form delivers the way its configuration says (${wired ? delivery.provider : 'mail app'})`,
      );
      /* The page must never claim a delivery that is not happening: wired, the
         note names the service; unwired, it says the message opens in a mail
         app. A form that says one thing and does another is the failure this
         sentence prevents. */
      check(
        wired ? form.note.includes(delivery.provider) : /email app/i.test(form.note),
        `the contact form says how it currently sends a message ("${form.note.slice(0, 60)}…")`,
      );
      check(
        form.canRewriteNote,
        'the delivery note is marked so the configured service can rewrite it',
      );
    }

    await page.close();
  }

  /* The lobby is the only place that lists the three documents. */
  {
    const page = await documentsContext.newPage();
    await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('.footer__legal', { timeout: 10000 });

    for (const doc of documents) {
      const count = await page.locator(`.footer__legal a[href="${doc.path}"]`).count();
      check(count === 1, `the footer lists ${doc.path}`);
    }

    await page.close();
  }

  await documentsContext.close();

  /* ---------- 5. The documents at three widths ---------- */
  console.log('\n== documents: horizontal overflow ==');

  const DOCUMENT_WIDTHS = [360, 768, 1440];
  for (const width of DOCUMENT_WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();

    for (const doc of documents) {
      await page.goto(base + doc.path, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(250);

      const result = await page.evaluate(measure);
      const overflow = result.scrollWidth - result.innerWidth;
      check(overflow <= 1, `${doc.path} has no horizontal overflow at ${width}px (${overflow}px)`);
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
