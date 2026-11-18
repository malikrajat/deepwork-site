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

/**
 * The Google stack, the third-party dependencies the reading pages are allowed
 * to load: the measurement tag, Analytics, and the AdSense advertising on the
 * home page and the guides. They are a deliberate product decision, disclosed in
 * `/privacy/`, `/cookies/` and on every guide. Any other host is still a
 * failure, and none of these are allowed on the four documents.
 */
const TAG_HOSTS = ['googletagmanager.com', 'google-analytics.com'];

/**
 * The advertising and consent hosts. Google decides at run time which of these
 * it requests and from which subdomain, so the audit judges them by suffix and
 * blocks them: a local build must not depend on an ad being sold to pass, and a
 * visitor with a content blocker sees exactly this.
 */
const AD_HOSTS = [
  'googlesyndication.com',
  'doubleclick.net',
  'googleadservices.com',
  'adservice.google.com',
  'adtrafficquality.google',
  'googletagservices.com',
  'fundingchoicesmessages.google.com',
  'gstatic.com',
];

function hostIn(hostname, hosts) {
  return hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

function isTagHost(hostname) {
  return hostIn(hostname, TAG_HOSTS);
}

function isAdHost(hostname) {
  return hostIn(hostname, AD_HOSTS);
}

/**
 * Blocks advertising and consent requests before they leave the machine.
 *
 * The page has to work when those requests are refused — that is the state a
 * content blocker creates, and the state most of this audit should test. What it
 * does not test is whether Google sold an ad, which no local build can answer.
 * The script tags themselves are asserted in the markup instead.
 */
async function blockAds(context) {
  await context.route('**/*', (route) => {
    let hostname;
    try {
      hostname = new URL(route.request().url()).hostname;
    } catch {
      return route.continue();
    }

    if (isAdHost(hostname)) return route.abort('blockedbyclient');
    return route.continue();
  });
}

/** Console noise caused by a request the audit itself blocked. */
function isBlockedAdNoise(text) {
  return AD_HOSTS.some((host) => text.includes(host)) || text.includes('ERR_BLOCKED_BY_CLIENT');
}

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
  'guides',
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

  /* ---------- advertising, and the pages that carry it ----------
     AdSense has two failure modes a build log will not show: an `ads.txt` that
     authorises the wrong seller, and a page that loads the advertising script
     without the content or the consent signal that makes it acceptable. Both are
     checked here, against the one client id in `site.ts`. */
  const head = fs.readFileSync('src/index.html', 'utf8');
  const adsenseClient = /ADSENSE_CLIENT[^=]*=\s*'([^']+)'/.exec(siteSource)?.[1] ?? '';
  const adsensePub = adsenseClient.replace(/^ca-/, '');
  check(
    /^ca-pub-\d+$/.test(adsenseClient),
    `site.ts names the AdSense client (${adsenseClient || 'nothing'})`,
  );

  const adsTxt = fs.existsSync('public/ads.txt') ? fs.readFileSync('public/ads.txt', 'utf8') : '';
  const sellerLines = adsTxt
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
  check(
    sellerLines.length === 1,
    `ads.txt authorises exactly one seller (${sellerLines.length} lines)`,
  );
  check(
    sellerLines[0] === `google.com, ${adsensePub}, DIRECT, f08c47fec0942fa0`,
    'ads.txt names the same publisher id as site.ts, in the spec format',
  );

  check(
    robots.includes('User-agent: Mediapartners-Google') &&
      robots.includes('User-agent: AdsBot-Google'),
    'robots.txt lets the advertising crawlers read the pages',
  );

  /* The local static server does not emulate `_headers`, so the transport policy
     cannot be exercised here. It can at least be read: an ad script the policy
     would block is an empty rectangle on the live site and nothing in a build
     log says so. */
  const headersFile = fs.readFileSync('public/_headers', 'utf8');
  check(
    [
      'pagead2.googlesyndication.com',
      'googleads.g.doubleclick.net',
      'fundingchoicesmessages.google.com',
      '*.adtrafficquality.google',
    ].every((host) => headersFile.includes(host)),
    'the transport policy allows the ad and consent hosts',
  );

  /* The guides are data in `site.ts` and files in `public/`; the audit reads the
     slugs from the one and requires the other, so a guide cannot exist in one
     place only. */
  const guideSlugs = [...siteSource.matchAll(/slug:\s*'([a-z0-9-]+)'/g)].map((match) => match[1]);
  check(guideSlugs.length === 8, `site.ts lists the eight guides (found ${guideSlugs.length})`);

  /* The guides were written together and share one date. A page whose printed
     date drifts from the constant is a page claiming an edit that did not
     happen, so the same check the legal documents get applies here. */
  const guidesUpdated = /GUIDES_UPDATED\s*=\s*'([^']+)'/.exec(siteSource)?.[1] ?? '';
  check(
    /^\d{4}-\d{2}-\d{2}$/.test(guidesUpdated),
    `site.ts dates the guides (${guidesUpdated || 'nothing'})`,
  );

  const contentPages = [
    { path: '/guides/', file: 'public/guides/index.html' },
    ...guideSlugs.map((slug) => ({
      path: `/guides/${slug}/`,
      file: `public/guides/${slug}/index.html`,
    })),
    { path: '/about/', file: 'public/about/index.html' },
    { path: '/cookies/', file: 'public/cookies/index.html' },
  ];

  const metaContent = (html, name) =>
    new RegExp(`<meta[^>]*name="${name}"[^>]*content="([^"]+)"`, 's').exec(html)?.[1] ?? '';
  const pageTitle = (html) => /<title>([^<]+)<\/title>/.exec(html)?.[1]?.trim() ?? '';

  const metaPages = [
    { path: '/', file: path.join(DIST, 'index.html') },
    ...contentPages,
    { path: '/privacy/', file: 'public/privacy/index.html' },
    { path: '/terms/', file: 'public/terms/index.html' },
    { path: '/contact/', file: 'public/contact/index.html' },
  ];

  const titles = new Map();
  const descriptions = new Map();

  for (const page of metaPages) {
    check(fs.existsSync(page.file), `${page.file} is shipped`);

    const html = fs.existsSync(page.file) ? fs.readFileSync(page.file, 'utf8') : '';
    const title = pageTitle(html);
    const description = metaContent(html, 'description');

    check(title.length >= 12, `${page.path} has a real title ("${title.slice(0, 60)}")`);
    check(description.length >= 70, `${page.path} has a real meta description`);
    check((html.match(/<h1[\s>]/g) || []).length === 1, `${page.path} has exactly one h1`);
    check(
      !/"aggregateRating"\s*:/.test(html) && !/"review"\s*:/.test(html),
      `${page.path} claims no invented rating or review`,
    );

    const titleSeen = titles.get(title);
    check(
      !titleSeen,
      `${page.path} has a unique title${titleSeen ? ` (shared with ${titleSeen})` : ''}`,
    );
    titles.set(title, page.path);

    const descriptionSeen = descriptions.get(description);
    check(
      !descriptionSeen,
      `${page.path} has a unique description${descriptionSeen ? ` (shared with ${descriptionSeen})` : ''}`,
    );
    descriptions.set(description, page.path);
  }

  for (const page of contentPages) {
    const html = fs.existsSync(page.file) ? fs.readFileSync(page.file, 'utf8') : '';
    const expectedCanonical = `${siteUrl}${page.path.slice(1)}`;
    const canonical = /<link[^>]*rel="canonical"[^>]*href="([^"]+)"/s.exec(html)?.[1] ?? '';

    check(
      canonical === expectedCanonical,
      `${page.path} declares its canonical URL (${canonical || 'none'})`,
    );
    check(
      sitemap.includes(`<loc>${expectedCanonical}</loc>`),
      `${page.path} is listed in the sitemap`,
    );
    check(html.includes('application/ld+json'), `${page.path} carries structured data`);
    check(
      html.includes('src="/content/consent.js"'),
      `${page.path} sets consent defaults before Google loads`,
    );
    check(html.includes('<a class="skip-link" href="#main">'), `${page.path} keeps the skip link`);
  }

  /* Advertising is on the home page and the guides, and nowhere else. The legal
     documents are the pages a visitor reads when deciding whether to trust the
     site; putting ads beside them would be the wrong trade, and the audit
     enforces the line rather than the intention. */
  for (const slug of guideSlugs) {
    const html = fs.readFileSync(`public/guides/${slug}/index.html`, 'utf8');
    check(
      html.includes(`adsbygoogle.js?client=${adsenseClient}`),
      `the ${slug} guide loads the AdSense script with the same client id`,
    );
    check(html.includes('class="guide-disclosure"'), `the ${slug} guide discloses the advertising`);
    check(
      html.includes(`datetime="${guidesUpdated}"`),
      `the ${slug} guide prints the date in site.ts`,
    );
  }

  for (const page of [
    { path: '/guides/', file: 'public/guides/index.html' },
    ...contentPages.slice(-2),
  ]) {
    const html = fs.readFileSync(page.file, 'utf8');
    check(!html.includes('adsbygoogle.js'), `${page.path} carries no advertising`);
  }

  /* ---------- the publisher policies, as assertions ----------
     The AdSense Program policies prohibit ads on thin content, ads that look like
     navigation, and any request to click one. Those are not things a build log
     notices, so they are measured: a minimum of real text on every page that
     loads the ad script, no iframes, and no incentive language. */
  const builtHome = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');

  const visibleWords = (html) =>
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean).length;

  const INCENTIVE =
    /(click (the|our|these|on an?) ads?|support (us|this site) by clicking|visit these links|help keep this site running)/i;

  check(
    visibleWords(builtHome) >= 3000,
    `the ad-bearing home page carries real content (${visibleWords(builtHome)} words)`,
  );

  for (const slug of guideSlugs) {
    const html = fs.readFileSync(`public/guides/${slug}/index.html`, 'utf8');
    const words = visibleWords(html);
    const adTag =
      /<script[^>]*src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=[^"]+"[^>]*>/s.exec(
        html,
      )?.[0] ?? '';

    check(words >= 600, `the ${slug} guide has enough content for its ad (${words} words)`);
    check(!/<iframe/i.test(html), `the ${slug} guide frames no content and no ads`);
    check(!INCENTIVE.test(html), `the ${slug} guide asks nobody to click an ad`);
    check(
      /async/.test(adTag) && /crossorigin="anonymous"/.test(adTag),
      `the ${slug} guide uses the standard asynchronous ad tag`,
    );
  }

  check(
    !INCENTIVE.test(builtHome),
    'the home page asks nobody to click an ad or to support the site that way',
  );
  check(!/<iframe/i.test(builtHome), 'the home page frames no content and no ads');

  const consentSource = fs.readFileSync('public/content/consent.js', 'utf8');
  check(consentSource.includes("'BR'"), 'consent defaults cover Brazil (LGPD), not only the EEA');

  const cookiesHtml = fs.readFileSync('public/cookies/index.html', 'utf8');
  check(
    cookiesHtml.toLowerCase().includes('lgpd') &&
      cookiesHtml.includes('policies/privacy/partners/'),
    'the cookies page names LGPD and links Google’s explanation of its data use',
  );

  const aboutHtml = fs.readFileSync('public/about/index.html', 'utf8');
  check(
    /do not click the ads/i.test(aboutHtml) && /offered money or a reward/i.test(aboutHtml),
    'the About page states the no-incentive and no-self-click commitments',
  );

  check(
    !fs.readFileSync('public/404.html', 'utf8').includes('adsbygoogle.js'),
    'the error page carries no advertising',
  );

  check(head.includes(`adsbygoogle.js?client=${adsenseClient}`), 'the home page loads AdSense');
  check(
    head.includes(`name="google-adsense-account" content="${adsenseClient}"`),
    'the home page names the AdSense account for verification',
  );
  check(
    head.includes('src="/content/consent.js"'),
    'the home page sets consent defaults before Google loads',
  );

  const privacyHtml = fs.readFileSync('public/privacy/index.html', 'utf8');
  check(
    ['AdSense', 'DoubleClick', 'adssettings.google.com', 'aboutads.info'].every((term) =>
      privacyHtml.includes(term),
    ),
    'the privacy policy names the advertising, its cookies and the opt-outs',
  );
  check(
    /web beacon/i.test(privacyHtml) &&
      privacyHtml.includes('policies/privacy/partners/') &&
      privacyHtml.includes('user-consent-policy'),
    'the privacy disclosures name web beacons and link Google’s data-use and consent policies',
  );
  check(privacyHtml.includes('href="/cookies/"'), 'the privacy policy links the cookies page');

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
    await blockAds(context);
    const page = await context.newPage();
    const errors = [];
    page.on('console', (message) => {
      if (message.type() === 'error' && !isBlockedAdNoise(message.text()))
        errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(String(error)));

    /* Every origin the page talks to. Fonts and screenshots ship with the
       build, and the GoatCounter pageview is a beacon this page sends itself.
       The Google tag stack (`TAG_HOSTS`) is the one disclosed exception; any
       other third-party script or tracker arriving here is a privacy
       regression. The tag is allowed by host rather than by URL so a changed
       container id or a GA4 collection endpoint does not break the audit. */
    const external = [];
    const ownOrigin = new URL(base).origin;
    page.on('request', (request) => {
      let url;
      try {
        url = new URL(request.url());
      } catch {
        return;
      }
      if (url.origin !== ownOrigin && !isTagHost(url.hostname) && !isAdHost(url.hostname)) {
        external.push(request.url());
      }
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
    const unexpectedHosts = [...new Set(external.map((url) => new URL(url).host))];
    check(
      external.length === 0,
      `no unexpected third-party requests (${external.length}${external.length ? `: ${unexpectedHosts.join(', ')}` : ''})`,
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
    await blockAds(context);
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

  /* The lobby is the only place that lists the documents. */
  {
    const page = await documentsContext.newPage();
    await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('.footer__legal', { timeout: 10000 });

    for (const href of ['/privacy/', '/terms/', '/contact/', '/cookies/', '/about/']) {
      const count = await page.locator(`.footer__legal a[href="${href}"]`).count();
      check(count === 1, `the footer lists ${href}`);
    }

    check(
      (await page.locator('.footer__legal .footer__legal-btn').count()) === 1,
      'the footer offers the cookie-settings control',
    );

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

  /* ---------- 6. The guides and the two new documents ----------
     Static files like the legal documents, but with a different job: they are
     the pages that earn search traffic and carry the advertising. So they are
     checked for the things a reader needs (a 200, one h1, working links, a
     theme toggle, no overflow) and for the one thing AdSense requires (a page
     with content and a consent signal, not a bare container). */
  console.log('\n== content pages ==');

  const contentContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await blockAds(contentContext);

  for (const page of contentPages) {
    const tab = await contentContext.newPage();
    const pageErrors = [];

    tab.on('console', (message) => {
      if (message.type() === 'error' && !isBlockedAdNoise(message.text())) {
        pageErrors.push(message.text());
      }
    });
    tab.on('pageerror', (error) => pageErrors.push(String(error)));

    const response = await tab.goto(base + page.path, { waitUntil: 'networkidle', timeout: 30000 });
    const h1Count = await tab.locator('h1').count();
    const h1Text = ((await tab.locator('h1').first().textContent()) ?? '').trim();

    check(
      response !== null && response.status() === 200,
      `${page.path} is served with 200 (${response?.status()})`,
    );
    check(h1Count === 1, `${page.path} renders exactly one h1 (found ${h1Count})`);
    check(h1Text.length > 8, `${page.path} h1 has real text: "${h1Text.slice(0, 44)}"`);
    check(
      pageErrors.length === 0,
      `${page.path} has no console or page errors${pageErrors.length ? `: ${pageErrors[0]}` : ''}`,
    );

    /* Every internal link, followed for real. The guides link to each other and
       to the product page; a renamed slug is exactly the failure a sitemap will
       happily keep advertising. */
    const hrefs = await tab.$$eval('a[href]', (links) =>
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
      const linkResponse = await contentContext.request.get(base + href);
      if (!linkResponse.ok()) broken.push(`${href} (${linkResponse.status()})`);
    }
    check(
      broken.length === 0,
      `${page.path} links all resolve (${hrefs.length} links${broken.length ? `: ${broken.join(', ')}` : ''})`,
    );

    const missingAnchors = await tab.$$eval('a[href^="#"]', (links) =>
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
      `${page.path} in-page anchors resolve${missingAnchors.length ? `: #${missingAnchors[0]}` : ''}`,
    );

    const before = await tab.evaluate(() => document.documentElement.dataset['theme']);
    await tab.locator('[data-theme-toggle]').click();
    await tab.waitForTimeout(150);
    const after = await tab.evaluate(() => ({
      theme: document.documentElement.dataset['theme'],
      stored: localStorage.getItem('deepwork-site-theme'),
    }));
    check(
      after.theme !== before && after.stored === after.theme,
      `${page.path} theme toggle switches and persists (${before} -> ${after.theme})`,
    );

    check(
      (await tab.locator('[data-cookie-settings]').count()) >= 1,
      `${page.path} offers a way to change a cookie choice`,
    );

    await tab.close();
  }

  /* The narrowest width is where a two-column card grid, a table or a long word
     becomes a sideways scrollbar. Every page, at the two widths that matter. */
  for (const width of [360, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    await blockAds(context);
    const tab = await context.newPage();

    for (const page of contentPages) {
      await tab.goto(base + page.path, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await tab.waitForTimeout(200);

      const result = await tab.evaluate(measure);
      const overflow = result.scrollWidth - result.innerWidth;
      check(overflow <= 1, `${page.path} has no horizontal overflow at ${width}px (${overflow}px)`);
    }

    await context.close();
  }

  await contentContext.close();

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
