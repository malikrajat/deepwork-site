# DeepWork — the website

The product site for **DeepWork**, a free focus timer, task manager and habit tracker that keeps
its data on your own machine.

**This repository contains the website only.** The application lives at
[malikrajat/deepwork](https://github.com/malikrajat/deepwork), and nothing here modifies it: this
project reads that repository, screenshots it and describes it.

- **Site:** https://deepwork.rajatmalik.dev/
- **Web app:** https://app.deepwork.rajatmalik.dev/
- **Downloads:** https://github.com/malikrajat/deepwork/releases/latest

---

## Why this repository exists

The app is genuinely good and almost nobody knows about it. The site has one job: take someone who
has never heard of DeepWork — or of the Pomodoro Technique — and get them to the point where they
understand what it does, believe it, and install it.

Three ideas shaped almost every decision in here:

1. **Say the true, smaller thing.** The app keeps its work on your machine and analyses it
   offline, and the site says exactly that. It is MIT-licensed, and the site says that too — the
   moment the app repository gained a `LICENSE`, the copy that claimed there was none was corrected
   rather than left to flatter the project. A claim that survives being checked is worth more than a
   stronger one that does not.
2. **The product is the artwork.** Every image is a screenshot of the real application, captured
   from a production build. There is not one stock photograph in this repository.
3. **Be readable by machines as well as people.** Googlebot runs JavaScript; most AI crawlers do
   not. The build prerenders the whole page into `index.html`, so the text is in the document a
   crawler downloads rather than in a script it has to run — and the page is *also* published as
   Markdown for agents. See [Crawler and SEO](#crawler-and-seo); the audit opens the built page with
   JavaScript disabled and asserts the words are there.

---

## Quick start

```bash
npm install
npm start                 # dev server on http://localhost:5000
npm run build             # production build -> dist/deepwork-site/browser
npm run serve:dist        # serve the build at http://127.0.0.1:5200
npm run verify            # format:check + build
```

Everything else:

```bash
npm run format            # Biome over TS/JSON/scripts, then Prettier over HTML/CSS
npm run format:check      # what CI runs
npm run lint              # Biome lint
npm run audit             # drive the BUILT site in a browser and assert 500 things
npm run llms              # regenerate public/llms-full.txt from the rendered page
npm run shots             # re-capture the app screenshots
npm run og                # regenerate the social preview card
```

`audit`, `llms`, `shots` and `og` need Chromium once:

```bash
npx playwright install chromium
```

---

## What is on the page

Twenty-five sections, in the order they are argued. The `id` is the anchor.

| #   | `id`          | Section                                                      |
| --- | ------------- | ------------------------------------------------------------ |
| 1   | —             | Hero — what it is, what it costs, where the data goes         |
| 2   | `product`     | The product — the real window, with the parts named           |
| 3   | `whats-new`   | New in 3.0 — the headlines, then release by release           |
| 4   | `beyond`      | More than a Pomodoro — the surfaces the app has               |
| 5   | `focus`       | Focus sessions — the timer, the alerts, the tones             |
| 6   | `planner`     | Day planner — tasks laid onto focus blocks                    |
| 7   | `tasks`       | Tasks — the board, quick add, recurrence, import and export   |
| 8   | `matrix`      | Eisenhower matrix — Q1 to Q4, and the space coming back       |
| 9   | `time`        | Time by Task — the work the hours actually went to            |
| 10  | `habits`      | Habits and journal                                            |
| 11  | `hydration`   | The water reminder                                            |
| 12  | `insights`    | Insights — ten real charts, and the readings beside them      |
| 13  | `reminders`   | Standing reminders — the reminder that does not give up       |
| 14  | `your-data`   | Your data — local SQLite, backups, the visit counter          |
| 15  | `desktop`     | The desktop app — tray, always-on-top, the mini widget        |
| 16  | `quiet`       | Quiet controls and answerable alerts                          |
| 17  | `devices`     | Every screen — layouts, touch, keyboard, install modes        |
| 18  | `how`         | How it works — four steps                                     |
| 19  | `learn`       | **Learn the method** — what a Pomodoro is, how to plan a day  |
| 20  | `guides`      | **Guides** — the eight written pages, and the way in          |
| 21  | `about`       | About the maker — the person, the day job, the open source    |
| 22  | `why`         | Why DeepWork — the strengths                                 |
| 23  | `compare`     | How it compares — ten moments, one honest table               |
| 24  | `get-started` | Get started — browser, desktop, install as an app             |
| 25  | `faq`         | Common questions                                              |
| 26  | —             | Footer                                                        |

Section 19 is the one that introduces the method. Section 20 is the bridge to the eight standalone
guides under `/guides/`, which are the pages that earn search traffic rather than describe a
product: everything else answers "what does DeepWork do?", while the guides answer "what is the
Pomodoro Technique?", "how long should a session be?" and "where should my data live?" — questions
somebody types into a search engine *before* they have heard of this app. Sections 3, 9, 13 and 16
are the 3.0 story: what changed, the new report, the new reminder and the new quiet controls.

Section 21 is the only one about a person. The biography is the author's own, read from his
portfolio and checked against his public GitHub and npm profiles, and it carries no availability
badge or "open to work" status — for the same reason the page quotes no figure it cannot show: a
claim that survives being checked is worth more than a stronger one that does not.

## The four documents and the guides

`/privacy/`, `/cookies/`, `/terms/` and `/contact/` are listed in the footer and reachable by
anyone — there is no account to have. They are **static HTML files in `public/`**, not Angular
routes, and that is a consequence of two constraints rather than a preference:

- Cloudflare Pages answers a path it does not know with `public/404.html` **and a 404 status**, so a
  legal notice reached through the client router would be served as "not found";
- a privacy policy has to be readable with JavaScript disabled — true of a static file by
  construction, and now true of the front page as well, because the build prerenders it.

Each is a self-contained document sharing `public/legal/legal.css` and `public/legal/legal.js` —
the theme toggle, the copy-address button, the cookie-settings control and the contact form. They
read the same `deepwork-site-theme` key as the page, so a theme chosen on one applies to the other,
and they send **no** pageview: the visit counter is on the front page and the web app only.
`tools/verify-site.cjs` loads all four, follows every link on them, and asserts that the date
printed on each matches `LEGAL_UPDATED` in `core/site.ts`.

The contact form posts to **Web3Forms**, which forwards the message to
`contact@rajatmalik.dev`. `WEB3FORMS_ACCESS_KEY` lives in the tracked **`.env`**, and
`tools/contact-config.cjs` reads it before every `npm start` and `npm run build` and writes
`public/contact/config.js` — the generated file is gitignored, so the key is assembled at build
time rather than written into the page by hand.

Precedence, highest first: `WEB3FORMS_ACCESS_KEY` in the process environment (CI, and the Cloudflare
Pages project variable), then `.env.local` (a developer's gitignored override), then `.env`. CI still
passes the repository secret when one is set, but a plain `npm ci && npm run build` produces a
working form without it, because `.env` is part of the checkout.

With no key configured at all, `config.js` is still written with an empty one, `legal.js` leaves the
form alone, and the markup's own `action="mailto:…"` takes over — so the page still works, it just
opens the visitor's mail app. Note that a static site cannot keep this key secret from a visitor:
the browser receives it. A Web3Forms access key is designed for that — it can only deliver to the
inbox that owns it — but it should not be treated as a credential, and the privacy policy names
Web3Forms as a processor (that paragraph is in `public/privacy/index.html`).

The form also carries **hCaptcha**, because this Web3Forms form requires a token with every
submission. It is mounted by `legal.js` through Web3Forms' zero-config client script, so a visitor
with JavaScript off loads no third-party script at all — they post through `mailto:`. It is the
contact page's only third-party dependency; the audit allows its hosts on `/contact/` and nowhere
else. The home page separately loads the disclosed Google tag (see Analytics below).
Turning the check off in the Web3Forms dashboard means setting `captcha: false` in
`tools/contact-config.cjs`, or leaving it on: a token sent to a form that no longer checks it is
harmless.

---

## The guides

Eight guides live under `/guides/`, with an index at `/guides/`. They are the part of the site that
is not about the product: what the Pomodoro Technique is, how long a session should be, how to plan
a day, why reminders fail, how to run a weekly review, what local-first software means, and how to
choose a timer. The index names the whole set; `GUIDES` in `core/site.ts` is the one list, and the
home page, the sitemap and the audit all read it.

They are **static HTML files**, like the legal documents, and share `public/legal/legal.css` for the
tokens, masthead, prose and tables, plus `public/content/content.css` for the article cards, byline
and product box. That keeps them readable with JavaScript off, served with a 200, and free of the
Angular bundle. Each page carries a canonical URL, a unique title and description, `Article` and
`BreadcrumbList` structured data, a printed author byline and a real date.

Two rules keep them honest, and both are enforced rather than intended:

- **No invented findings.** The method is described as a convention with mechanics, not as a
  scientific result. Where a claim would need evidence the site does not have, the guide says so.
- **No sponsored content.** There are no affiliate links and no paid placements. Every guide
  discloses the advertising in its footer, and `/about/` states the same policy.

`GUIDES_UPDATED` in `core/site.ts` is the date the set was published or last edited; each guide's
`dateModified` and printed date must agree with it.

---

## Architecture decisions, and why

Each of these is a decision with a reason, and most of them were made the other way first.

- **No router. One Angular page, plus static documents and guides.** The product page needs no
  routing, and leaving the router out keeps the bundle smaller. There is no SPA fallback to need:
  Cloudflare Pages serves the branded `404.html` for a path that does not exist, which is a page
  that says so rather than the app pretending to load. The four documents and the eight guides —
  `/privacy/`, `/cookies/`, `/terms/`, `/contact/`, `/about/` and `/guides/…` — are static files
  for the same reason, and are described above.
- **One stylesheet, no component `styles`.** Component styles are injected as separate `<style>`
  elements at runtime; a single critical-inlined sheet paints the first screen on the first frame,
  which is the whole Core Web Vitals story for a page this visual.
- **All content in one file.** Every fact the site states about the app is in
  `src/app/core/site.ts` — timer defaults, water ranges, the analytics chart list, the FAQ. If a
  number there disagrees with the app, the app is right and that file is the bug.
- **Text is visible by default.** The scroll-reveal effect hides an element *only after* JavaScript
  has measured it as being below the fold, with an eight-second failsafe. The first version did it
  the obvious way — hide everything in CSS, let JavaScript reveal it — and an audit found 80–90
  elements stuck at `opacity: 0` at every width. The page built, deployed, and was blank.
- **No animation library.** One directive, one CSS transition on `transform`/`opacity`, and a
  shared geometry queue rather than `IntersectionObserver` (which silently loses elements on a fast
  scroll). See `src/app/core/reveal.ts`.
- **No fabricated social proof.** No user counts, downloads, star counts, ratings or testimonials,
  because the project publishes none. This is a rule, not an oversight. The Site stats panel is
  the one deliberate exception: it is a dashboard a visitor has to open, not a badge on the page.
- **The stats panel's token is public, and must stay read-only.** A static site cannot keep a
  secret, so the token in `core/analytics.ts` is visible in the bundle — as it already is on the
  portfolio and in the app. It should be made with **Read statistics** only (the committed one
  predates the panel and also carries "Read sites"), and it can be withdrawn at
  <https://deepwork.goatcounter.com/user/api>; the panel then falls back to the public totals.
- **Zoneless.** No `zone.js` is loaded; all state is signals.

### Prerendering

The build prerenders the page, so a crawler that executes no JavaScript receives the finished
document instead of an empty `<app-root>`. It costs two small files and one configuration block:

- **`src/main.server.ts`** is the entry the builder runs the application through once, at build
  time. `outputMode: "static"` keeps the server bundle out of `dist` — nothing serves it, and there
  is still no server anywhere — and the output is `dist/deepwork-site/browser/index.html` with the
  whole page already inside it.
- **`src/app/app.config.server.ts`** adds `provideServerRendering()` and `provideRouter([])`. The
  router is not decoration: the prerenderer boots the app and asks the `Router` which URLs exist,
  and with no `Router` provided at all that query throws `NG0401`. An empty configuration answers
  "just `/`", which is the only page this site has. It is imported by the server entry alone, so the
  browser bundle does not carry the router and does not grow by a byte.

The three packages that make this possible — `@angular/ssr`, `@angular/platform-server` and
`@angular/router` — are **devDependencies**: they exist for the build, and none of them reaches the
browser bundle.

The earlier attempts failed for a reason worth recording: `outputMode: "static"` with a server entry
threw `NG0401`, and installing `@angular/router` for the server alone changed nothing — the extractor
asks the injector for a `Router`, and the package being installed is not the same as `provideRouter`
being called. `outputMode: "server"` would supply one, but it demands an `ssr.entry`: a real server
file for a site deployed as static files. `provideRouter([])` in the server config is the whole fix,
and it is why the browser bundle stays router-free.

**Not hydrated, on purpose.** `provideClientHydration()` was tried and removed: it adds ~41 kB to the
initial bundle, and Angular's first render is synchronous, so adopting the prerendered DOM saves a
repaint no visitor sees. The page re-renders once on load and arrives at the same result; the audit
checks the page both with JavaScript and without it.

`npm run build` also deletes `index.csr.html`, the empty client-side fallback the builder writes
beside the prerendered page. It has no route to serve here, and publishing it would put a second,
thinner copy of the same page at a guessable URL.

---

## Crawler and SEO

**The honest situation.** The build writes the whole page into `index.html`, so a crawler that
executes no JavaScript reads every word — that is the difference between this site and the usual
client-rendered Angular page. The Markdown files are still shipped, because an agent that prefers
plain text should not have to parse HTML, because `/llms.txt` is where an agent looks first, and
because `llms-full.txt` is what a reader quotes.

| File                       | Purpose                                                                                                                                                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `robots.txt`               | Allows everything, and names **each AI crawler explicitly** (GPTBot, OAI-SearchBot, ClaudeBot, Claude-User, PerplexityBot, Google-Extended, Applebot-Extended and more). Several treat a wildcard group more cautiously than a named rule. The advertising crawlers are named for the same reason. |
| `ads.txt`                  | Authorises Google AdSense, and no other seller, for this domain. The audit checks it against `ADSENSE_CLIENT`. |
| `sitemap.xml`              | Every indexable URL — the page, the guides, the four documents — plus image entries for the screenshots, with a real `lastmod`.                                                                                                             |
| `llms.txt`                 | The [llms.txt](https://llmstxt.org) convention: a curated index — what the product is, the verifiable facts, a link to every section and every guide.                                                                                        |
| `llms-full.txt`            | The **whole page** as Markdown, generated from the rendered page by `npm run llms`. This is what a crawler that runs no JavaScript actually reads.                                                                                          |
| `site.webmanifest`         | Install metadata: shortcuts to `#learn` and `#get-started`, and screenshots for a richer install prompt.                                                                                                                                  |
| `404.html`                 | A real, branded 404 with `noindex`, so an error page never ends up in a search result.                                                                                                                                                    |
| `.well-known/security.txt` | RFC 9116, with the project's contact address and the issue tracker.                                                                                                                                        |

**Metadata.** The title leads with what people search for — *"DeepWork — Free Pomodoro Timer, Task
Manager & Habits"*, 53 characters — rather than with the slogan. `max-image-preview:large` and
`max-snippet:-1` are set, so a result shows the full snippet and a large image. Every guide has its
own title and description, a canonical URL, an author byline and `Article` + `BreadcrumbList`
structured data; the audit fails if two pages share a title or a description. The home page's
structured data is one connected `@graph`: `WebSite`, `Person`, `SoftwareApplication` (real
`softwareVersion`, `installUrl`, `downloadUrl`, a 14-item `featureList`) and `FAQPage` whose answers
are the same words a visitor reads.

**What is deliberately not done.** No keyword stuffing, no hidden text, no doorway pages, no fake
reviews, and no `aggregateRating` — there are no ratings to average, and inventing one is dishonest
and against Google's policy. The audit fails if the string ever appears as a property.

---

## Advertising and AdSense

The guides and the front page carry Google AdSense. The DeepWork application carries no
advertising, and neither do `/privacy/`, `/cookies/`, `/terms/` or `/contact/` — the audit enforces
that line rather than the intention.

Everything that can live in this repository does:

| What | Where | Why it is there |
| --- | --- | --- |
| Publisher id | `ADSENSE_CLIENT` in `core/site.ts`, repeated in `src/index.html`, eight guides and `public/ads.txt` | A static site has no includes; the audit reads the constant and fails if any copy disagrees |
| Seller authorisation | `public/ads.txt` | One `google.com` line with the same publisher id and Google's certification authority id |
| Ad script | `src/index.html` and every guide | Loaded with `async` and `crossorigin`; absent from the documents |
| Consent defaults | `public/content/consent.js` | Consent Mode v2: denied in the EEA, UK, Switzerland and Brazil, granted elsewhere, before GTM and AdSense load |
| Opt-out surface | `/cookies/` and the footer's **Cookie settings** control | Names every cookie and web beacon, and opens Google's revocation screen where it is available |
| Disclosure | Every guide's footer, `/about/`, `/privacy/`, `/terms/`, `/llms.txt` | Says what advertising is present and that it has no influence on the writing |
| Crawler access | `robots.txt` | `Mediapartners-Google`, `AdsBot-Google` and `AdsBot-Google-Mobile` allowed explicitly |
| Transport policy | `public/_headers` | The ad, consent and measurement hosts are in the CSP source lists |
| Policy guards | `tools/verify-site.cjs` | Ad pages need real text, no iframes and no incentive language; the error page and legal documents carry no ad script; the About page states the no-self-click commitment |

The rules the site is checked against, and where each one lands:

| AdSense / Publisher policy | What this repository does |
| --- | --- |
| Ads only on content-rich screens | Ad script only on the home page and the eight guides; each guide is measured at 600+ words and the home page at 3,000+ |
| No ads on dead-end, error or legal screens | `/privacy/`, `/cookies/`, `/terms/`, `/contact/` and `404.html` load no ad script; the audit asserts it |
| No replicated or automatically generated content | Eight original guides, a curated index, no syndicated text and no embedded third-party media |
| No request or reward to click | No incentive language anywhere; the audit scans every ad-bearing page for the phrases the policy names |
| Ads must not imitate navigation or content | Auto ads place and label the units; no hand-styled ad containers and no iframes |
| Privacy disclosure | `/privacy/` names cookies, web beacons, IP addresses, the DoubleClick cookie and the opt-outs, and links Google's data-use and consent policies |
| Consent (GDPR / UK / Swiss FADP / LGPD) | Consent Mode v2 defaults deny storage in those regions before either tag loads; the certified messages live in the AdSense dashboard |
| Authorised inventory | `ads.txt` names the same publisher id as `site.ts`; the audit checks the exact seller line |
| No invalid traffic | No paid-to-click, autosurf, pop-up or redirect traffic; no ads in the app; the About page records the no-self-click commitment |

Three things are configured in the AdSense dashboard, not here, and are required before ads serve
properly:

1. **Site verification.** The home page ships both the AdSense script and
   `<meta name="google-adsense-account" content="ca-pub-…">`; either path lets AdSense verify the
   domain. Confirm the site is listed and verified in AdSense → Sites.
2. **Privacy & messaging.** Publish the certified **GDPR** message for the EEA, UK and Switzerland
   **and the LGPD** message for Brazil. `consent.js` sets those defaults to denied; the messages are
   what turn them on when a visitor agrees. Without them, ads are limited in those regions — and a
   hand-built banner is not a substitute, because Google requires a certified CMP.
3. **Auto ads.** No manual ad-slot ids are committed, because a slot id is created in the dashboard
   and would be a guess here. Enable Auto ads for the site (AdSense → Ads → By site) with
   **In-page only**; leave **Anchor** and **Vignette** off. A sticky anchor can overlay navigation,
   and an interstitial-style vignette is exactly what the "ads interfering" and Better Ads Standards
   rules are about. Use page exclusions if the front page should stay ad-free.

**Do not** click your own ads, ask anyone to click them, place ads on error pages, or add fake
reviews or ratings to earn approval. The site publishes no ratings and no testimonials, and the
audit fails if an `aggregateRating` or `review` property appears in any page's structured data.
Unsuitable ads can be reported from `/about/` (mailto with the page and advertiser) and blocked in
AdSense → Brand safety.

`public/ads.txt` must be reachable at the domain root after a deploy:

```bash
curl -s https://deepwork.rajatmalik.dev/ads.txt
curl -sI https://deepwork.rajatmalik.dev/guides/pomodoro-technique/ | grep -i content-security-policy
```

`npm run audit` cannot see `_headers` (the local server does not emulate Cloudflare's matcher), so
the CSP is verified on a deployed response, not by reading the file back.

---

## Reaching more people

Everything above is the part a repository can do. These are the levers that actually move downloads,
split by effort.

### Done

- A prerendered page that renders at ten viewport widths from 320px to 2560px, whose first load is
  about 130 kB of transfer: a 43 kB HTML document and 85 kB of JavaScript and CSS.
- Structured data, a canonical URL, a generated social card and image-sitemap entries.
- Plain-text versions for crawlers and language models, kept honest by a CI check.
- An "informational" section that targets the question people ask *before* they want a product,
  now backed by eight standalone guides under `/guides/`, each with its own URL, byline, date and
  structured data.
- Advertising that is disclosed everywhere it appears: one publisher id in `ADSENSE_CLIENT`,
  `ads.txt`, a consent layer, a cookies page, a privacy policy that names Google, web beacons and
  the DoubleClick cookie, and an audit that fails if the copies disagree.
- An automated audit, so the page cannot silently rot.
- A first-party visitor count. One cookie-less pageview per load, sent by the page itself to
  GoatCounter — no tracker script for that count, no IP address is stored, and Do Not Track or
  Global Privacy Control is honoured. Only the published host is counted, so local builds and
  previews send no GoatCounter pageview. See `src/app/core/analytics.ts`.
- A disclosed Google tag. The home page loads Google Tag Manager, which loads Google Analytics.
  It is the site's one third-party script on that page, and `public/privacy/index.html` names
  Google, what it receives and the cookies it sets. The audit allows only the Google tag hosts,
  and only on the home page, so a second tracker fails rather than shipping quietly. The tag runs
  wherever the page is served, including a local build, so use a content blocker while working on
  it if you do not want the hit in Analytics.
- A footer **Site stats** panel. It reads the totals and the month's referrers, locations, browsers
  and pages back through GoatCounter's JSON API, one request at a time to stay under its rate
  limit. Nothing is fetched until the panel is opened, and the numbers are cached for a minute.

### Good to have — small, high leverage

- **Package managers.** `winget`, Chocolatey and Scoop on Windows, Homebrew cask on macOS, Flatpak
  and Snap on Linux. For a desktop app this is the single biggest discovery win: it puts DeepWork
  where people already look when they want a tool.
- **A changelog on the site.** The app repository has `CHANGELOG.md`; publishing releases as a page
  gives search engines something that changes and gives visitors a reason to return.
- **A comparison page.** "DeepWork vs a plain Pomodoro timer" is a real query. It must be factually
  accurate about the other tools or it does more harm than good.
- **A short screen recording.** Twenty seconds of video converts better than six screenshots, and
  `VideoObject` structured data can earn a video result.
- **Translations.** `hreflang` plus a translated `llms.txt` reaches audiences the English page
  cannot. This is real work, not a config change.

### Better to have — bigger bets

- **A blog or notes feed.** Recurring content is the only reliable long-term organic engine, and it
  is the one item here that cannot be automated.
- **Directory listings.** AlternativeTo, awesome-lists, Product Hunt, Hacker News, the relevant
  subreddits. Unglamorous, effective, and it needs a person to do it honestly.
- **A `LICENSE` file for the app repository — done.** The application is MIT-licensed, and the
  whole site follows one constant: `LICENSE_SPDX` in `src/app/core/site.ts`. Set it to `null` and
  every mention of "open source" downgrades itself to "public source" rather than going stale.

---

## Screenshots

Every image in `public/screenshots` is the real application, captured from a production build.
The pages are seeded through `tools/demo-seed.cjs` before the app starts, so a screenshot shows a
real, reachable working state — every number is still computed by the app from those rows.

```bash
# 1. build the app (in the application repository)
npm run build                      # -> dist/deepwork/browser

# 2. serve that build, then capture
python tools/serve-app.py <app>/dist/deepwork/browser 5199
APP_URL=http://127.0.0.1:5199 npm run shots

# 3. convert to WebP and print a brightness/contrast report
python tools/make-webp.py

# 4. regenerate the social card
npm run og
```

Five captures are **element** screenshots (`.timer-card`, `.water-card`, `.reminder-card`,
`.install-card`, `.quiet-sheet`) rather than window screenshots, so they are exactly those panels
at their own size and stay correct when the app's layout moves. `make-webp.py` prints brightness
and contrast for every file: a blank page or a theme that failed to switch fails that check loudly,
which is the only automated verification available on a pipeline whose output is pictures. Set
`DETAILS_ONLY=1` to re-capture just the element shots, or `ONLY=time-dark,reminders-dark` to
re-capture a subset. The install banner is dismissed through `localStorage` rather than clicked,
because its close button also dismisses a completion toast.

---

## Checks

`npm run audit` does not test anything in the abstract — it drives the **built site** in Chromium
and asserts 500 specific things:

- crawler files exist and say the right things, and no invented rating is claimed;
- the built `index.html` is not an empty shell, and a browser with **JavaScript disabled** renders
  the one `h1`, the 24 sections, the 22 screenshots and the product claims — the check that a
  prerendered page is present in the HTML but hidden by CSS would fail;
- content is not left hidden waiting for a scroll reveal, at reduced motion and after real input
  scrolling, at ten widths;
- no horizontal overflow at any of those widths, with the offending element named when there is one;
- no console or page errors, exactly one `h1`, a heading for every section, every anchor resolves;
- all 21 screenshots actually load;
- the theme toggle flips the document and the FAQ opens without scripting;
- the home page's third-party requests are confined to the disclosed Google tag hosts, so a second
  tracker fails rather than shipping quietly;
- the four documents are served with a 200 rather than the 404 page, render without the
  application bundle, keep the theme choice, and every link and in-page anchor on them resolves;
  none of them requests a third-party origin except the contact page's hCaptcha;
- the eleven content pages (`/guides/`, eight guides, `/about/`, `/cookies/`) are served with a 200,
  render one `h1`, resolve every link and anchor, keep the theme, offer the cookie-settings control
  and have no horizontal overflow at 360px and 1440px;
- every page has a unique title and description; every guide has a canonical URL, structured data,
  the consent defaults and the same AdSense client id as `site.ts`; the guides disclose the
  advertising and the hub, About and Cookies pages carry none;
- `ads.txt` authorises exactly one seller, with the publisher id in `site.ts`; `robots.txt` names
  the advertising crawlers; the privacy policy names the advertising, the DoubleClick cookie and
  both opt-out routes;
- the contact form asks for the fields it says it does, mounts the captcha the service requires,
  and its delivery sentence matches whether a key is configured;
- `llms-full.txt` really contains the page, including card body text.

It found three real bugs before release, all invisible to `ng build`: a reveal implementation that
left 80–90 elements permanently invisible on a fast scroll, a single unbreakable URL that pushed the
page sideways below 430px, and a generator that was silently dropping every card's body text from
the file AI crawlers read. `npm run audit:diagnose` is the narrower tool that separated "the scroll
never happened" from "the event never fired" while fixing the first.

---

## Tooling: why both Biome and Prettier

| Tool         | Owns                                                       | Why                                                                                                                                                                                                    |
| ------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Biome**    | Linting everything; formatting `*.ts`, `*.json`, tooling   | Fast, one binary, and it lints as well as formats — so there is no second linter to configure.                                                                                                         |
| **Prettier** | Formatting `*.html` and `*.css`                            | Biome's HTML parser does not understand Angular's control-flow blocks (`@if`, `@for`, `@switch`). They are not HTML, so running it over a template either fails or rewrites something it has misread. |

`npm run format` runs both, so a contributor never has to remember which is which. The split is
deliberate and documented in `biome.json`.

### What this pipeline does not do

- **No dependency vulnerability gate.** `.npmrc` sets `audit=false` and CI has no `npm audit` step,
  because the repository owner asked for a pipeline that does not block on it. To turn it on, delete
  the two lines in `.npmrc` and add `npm audit --audit-level=high` to `ci.yml`. The capability is one
  command away either way; only the gate is off.
- **No unit tests.** There is no logic to unit test — the site is markup, one theme service, one
  directive and a queue. The audit covers, in a real browser, what a unit test would cover here.
- **No visual regression baseline.** Screenshots are compared by eye, not by pixel diff. Pixel
  diffing a page with a slowly drifting background gradient would fail constantly.

---

## Deployment

Cloudflare Pages is the only host, on the custom domain `https://deepwork.rajatmalik.dev/`. The
repository cannot be published as it stands — the branch is TypeScript and an empty `<app-root>`, not
a page — so what is deployed is the build: `npm run build` prerenders the whole page into
`index.html`, and `dist/deepwork-site/browser` is uploaded as a directory of static files. There is
no server and no Pages Function, which is the condition the next section depends on: Cloudflare only
reads `_headers` for static asset responses.

**Some settings cannot be committed.** The Pages project's build command (`npm run build`), its
output directory (`dist/deepwork-site/browser`), the `WEB3FORMS_ACCESS_KEY` variable and the custom
domain all live in the Cloudflare dashboard rather than in this repository. `public/CNAME` is a
leftover from the GitHub Pages years and is inert here; the domain is bound in Pages.

The base href stays `/`, matching `src/index.html` and the canonical URLs. There is deliberately no
second deployment: Netlify hosted this page until it moved to the custom domain, and `netlify.toml`
was removed with the move, because publishing the same page at two URLs while declaring one
canonical splits the ranking between them. The address is repeated in `src/index.html`,
`public/sitemap.xml`, `public/robots.txt`, `public/llms.txt` and `public/llms-full.txt`; the audit
reads it from `site.ts` and fails if any of them disagrees.

### Response headers

Cloudflare Pages is the first host this site has had that can send response headers, so
`public/_headers` sets them. The assets glob copies it into the build and Pages parses it from there;
it is never served. Four headers are set on every response, and two more because they cost nothing:

| Header | Value | What it is for |
| --- | --- | --- |
| `Strict-Transport-Security` | `max-age=31536000` | Until this header existed, a first visit could be made over plain HTTP and intercepted before the redirect. Deliberately **not** `includeSubDomains`: `app.deepwork.rajatmalik.dev` is hosted separately and never sent this policy, and HSTS subdomain matching is by DNS suffix, so including it would pin a host this file does not govern. |
| `X-Frame-Options` | `DENY` | Clickjacking. `SAMEORIGIN` is the usual recommendation; nothing embeds this page, so the stricter value is also the honest one. |
| `Content-Security-Policy` | see the file | The one header with content. |
| `Permissions-Policy` | every feature empty | Nothing on the page asks for a camera, a microphone or a location. |
| `X-Content-Type-Options` | `nosniff` | |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | GoatCounter still receives the referring origin, never the full path of the page a visitor came from. |

The policy is source-listed, and every host in it was taken from a request the built site actually
made — the Google tag, the GA4 property it configures, the AdSense script and the advertising and
consent hosts Google requests, the GoatCounter origin in `src/app/core/analytics.ts`, and on
`/contact/` alone Web3Forms and hCaptcha. One of them, `https://www.google.com`, was found by
serving the build under the policy and reading the one violation it produced; GA4 posts
`g/collect` there as well as to `www.google-analytics.com`, and no amount of reading the HTML would
have shown that.

Three details in that file are easy to undo by accident:

- **`/contact/` detaches before it sets.** Pages joins a repeated header with a comma, and two
  `Content-Security-Policy` headers are both enforced — the intersection would block hCaptcha. The
  `! Content-Security-Policy` line is what stops that, and it only works because it appears after
  the `/*` block.
- **`'unsafe-inline'` stays in `script-src`.** Tag Manager injects inline script by design and the
  theme is applied before first paint by an inline script in the document, so a nonce would have to
  be threaded through both. The directives that still carry weight are `frame-ancestors`, `base-uri`,
  `form-action`, `object-src` and a closed `connect-src` — not script-src.
- **The legal documents get the general policy, not a stricter one.** They load nothing third-party,
  which `npm run audit` already asserts page by page; a separate policy would only be a second place
  for that to go wrong.

`tools/static-server.cjs` does not emulate `_headers`, because reimplementing Pages' matcher would
test the reimplementation. So `npm run audit` checks the page and not the transport, and after a
deploy the headers are worth one command each:

```bash
curl -sI https://deepwork.rajatmalik.dev/ | grep -i -E 'strict-transport|x-frame|content-security|permissions-policy'
curl -sI https://deepwork.rajatmalik.dev/contact/ | grep -i content-security-policy
```

Two Cloudflare settings must not also be doing this job. The zone's own HSTS toggle adds the header
at the edge as well, and the Transform Rules page can modify response headers — either would leave
two sources for one value, with the file in this repository no longer describing what ships. The
`_headers` file is the source; the edge settings stay off.

Cache headers are deliberately not in the file. The build's JavaScript and stylesheet are
content-hashed and could be cached immutably, but a cache rule that outlives a deploy is a worse
failure than a revalidation request, and the host's default revalidation is correct.

---

## Accessibility

Semantic landmarks; one `h1`; a skip link that appears on focus; `:focus-visible` rings that are
never removed; `<details>` for the FAQ so it works with no JavaScript and announces correctly;
`prefers-reduced-motion: reduce` disables every entrance, drift and float while leaving all content
in place; `forced-colors: active` re-maps the glass surfaces and the gradient text for Windows High
Contrast; touch targets of at least 44px on the controls that matter; and descriptive `alt` text on
every screenshot.

## Browser support

**Baseline: Widely available.** No polyfills. The only third-party runtime scripts are the
disclosed Google tag and AdSense on the home page and the guides, and hCaptcha on the contact page.
The four legal documents load none of them.

Two features degrade rather than being assumed: `color-mix()` (where unsupported, the declaration is
dropped and a solid background shows through) and `backdrop-filter` (decoration over an
already-readable surface, `-webkit-` prefixed for Safari).

The page must also be usable with JavaScript disabled — and now it is: the build prerenders it, so
the whole document is in the HTML. There is no `<noscript>` fallback because there is nothing left
for it to say; the one that used to exist carried a second `h1`, which was both duplicate content
and a broken heading hierarchy. The theme is the one thing that still needs scripting: without it the
page stays dark, because the stored-or-system preference is resolved by the inline boot script.

## Licence

The site's own source is © Rajat Malik. The bundled typefaces are **Inter** and **JetBrains Mono**,
both SIL Open Font License 1.1; their licence texts ship in `public/fonts/`.

The DeepWork application is a separate project and is not covered by this repository's licence.
