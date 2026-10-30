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
npm run audit             # drive the BUILT site in a browser and assert 145 things
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

Twenty-four sections, in the order they are argued. The `id` is the anchor.

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
| 20  | `about`       | About the maker — the person, the day job, the open source    |
| 21  | `why`         | Why DeepWork — the strengths                                 |
| 22  | `compare`     | How it compares — ten moments, one honest table               |
| 23  | `get-started` | Get started — browser, desktop, install as an app             |
| 24  | `faq`         | Common questions                                              |
| 25  | —             | Footer                                                        |

Section 19 is the one that earns traffic rather than describing a product. Everything else answers
"what does DeepWork do?"; `learn` answers "what is the Pomodoro Technique?", which is what somebody
types into a search engine *before* they have heard of this app. Sections 3, 9, 13 and 16 are the
3.0 story: what changed, the new report, the new reminder and the new quiet controls.

Section 20 is the only one about a person. The biography is the author's own, read from his
portfolio and checked against his public GitHub and npm profiles, and it carries no availability
badge or "open to work" status — for the same reason the page quotes no figure it cannot show: a
claim that survives being checked is worth more than a stronger one that does not.

## The three documents beside the page

`/privacy/`, `/terms/` and `/contact/` are listed in the footer and reachable by anyone — there is
no account to have. They are **static HTML files in `public/`**, not Angular routes, and that is a
consequence of two constraints rather than a preference:

- GitHub Pages answers a path it does not know with `public/404.html` **and a 404 status**, so a
  legal notice reached through the client router would be served as "not found";
- a privacy policy has to be readable with JavaScript disabled — true of a static file by
  construction, and now true of the front page as well, because the build prerenders it.

Each is a self-contained document sharing `public/legal/legal.css` and `public/legal/legal.js` —
the theme toggle, the copy-address button and the contact form. They read the same
`deepwork-site-theme` key as the page, so a theme chosen on one applies to the other, and they send
**no** pageview: the visit counter is on the front page and the web app only. `tools/verify-site.cjs`
loads all three, follows every link on them, and asserts that the date printed on each matches
`LEGAL_UPDATED` in `core/site.ts`.

The contact form has no backend. `data-endpoint` on the form is empty, so pressing Send composes the
message in the visitor's own mail client (`action="mailto:…"`) and the page says exactly that. Set
that attribute to a form service's endpoint — Formspree, Web3Forms or Basin — and `legal.js` posts
the fields as JSON instead, and rewrites the sentence from the endpoint's own host so the page
cannot claim a mail app it is not using. Web3Forms additionally needs its `access_key` in the
payload. Whichever is set, the privacy policy has to name the processor; that paragraph is in
`public/privacy/index.html`.

---

## Architecture decisions, and why

Each of these is a decision with a reason, and most of them were made the other way first.

- **One page, no router.** One page needs no routing. Leaving the router out keeps the bundle
  smaller, and there is no SPA fallback to configure: GitHub Pages serves the branded `404.html` for
  a path that does not exist, which is a page that says so rather than the app pretending to load.
  The three documents beside the page — `/privacy/`, `/terms/` and `/contact/` — are static files
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
| `robots.txt`               | Allows everything, and names **each AI crawler explicitly** (GPTBot, OAI-SearchBot, ClaudeBot, Claude-User, PerplexityBot, Google-Extended, Applebot-Extended and more). Several treat a wildcard group more cautiously than a named rule. |
| `sitemap.xml`              | The canonical URL plus image entries for six screenshots, with a real `lastmod`.                                                                                                                                                          |
| `llms.txt`                 | The [llms.txt](https://llmstxt.org) convention: a curated index — what the product is, the verifiable facts, a link to every section.                                                                                                      |
| `llms-full.txt`            | The **whole page** as Markdown, generated from the rendered page by `npm run llms`. This is what a crawler that runs no JavaScript actually reads.                                                                                          |
| `site.webmanifest`         | Install metadata: shortcuts to `#learn` and `#get-started`, and screenshots for a richer install prompt.                                                                                                                                  |
| `404.html`                 | A real, branded 404 with `noindex`, so an error page never ends up in a search result.                                                                                                                                                    |
| `.well-known/security.txt` | RFC 9116, with the project's contact address and the issue tracker.                                                                                                                                        |

**Metadata.** The title leads with what people search for — *"DeepWork — Free Pomodoro Timer, Task
Manager & Habits"*, 53 characters — rather than with the slogan. `max-image-preview:large` and
`max-snippet:-1` are set, so a result shows the full snippet and a large image. Structured data is
one connected `@graph`: `WebSite`, `Person`, `SoftwareApplication` (real `softwareVersion`,
`installUrl`, `downloadUrl`, a 14-item `featureList`) and `FAQPage` whose answers are the same words
a visitor reads.

**What is deliberately not done.** No keyword stuffing, no hidden text, no doorway pages, no fake
reviews, and no `aggregateRating` — there are no ratings to average, and inventing one is dishonest
and against Google's policy. The audit fails if the string ever appears as a property.

---

## Reaching more people

Everything above is the part a repository can do. These are the levers that actually move downloads,
split by effort.

### Done

- A prerendered page that renders at ten viewport widths from 320px to 2560px, whose first load is
  about 130 kB of transfer: a 43 kB HTML document and 85 kB of JavaScript and CSS.
- Structured data, a canonical URL, a generated social card and image-sitemap entries.
- Plain-text versions for crawlers and language models, kept honest by a CI check.
- An "informational" section that targets the question people ask *before* they want a product.
- An automated audit, so the page cannot silently rot.
- A first-party visitor count. One cookie-less pageview per load, sent by the page itself to
  GoatCounter — no third-party script is executed, no IP address is stored, and Do Not Track or
  Global Privacy Control is honoured. Only the published host is counted, so local builds,
  previews and the audit send nothing. See `src/app/core/analytics.ts`.
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
and asserts 145 specific things:

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
- the three documents are served with a 200 rather than the 404 page, render without the
  application bundle, keep the theme choice, make no third-party request, and every link and
  in-page anchor on them resolves;
- the contact form asks for the fields it says it does, and its delivery sentence matches whether
  an endpoint is configured;
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

GitHub Pages is the only host, on the custom domain `https://deepwork.rajatmalik.dev/`; `public/CNAME`
ships the domain with the build so the address survives a change of deployment source. Pages cannot
publish this repository as it stands — the branch is TypeScript and an empty `<app-root>`, not a
page — so `.github/workflows/deploy-pages.yml` runs the production build, audits the result in
Chromium, and publishes `dist/deepwork-site/browser` as the Pages artefact. It runs on every push to
`main` and on demand.

**One setting cannot be committed.** In the repository, Settings → Pages → Build and deployment →
Source must be **GitHub Actions**. Left on “Deploy from a branch”, Pages runs Jekyll over the
repository and serves this README at the domain — which is exactly what it did before the workflow
existed — and a deployment from the workflow is rejected.

The base href stays `/`, matching `src/index.html` and the canonical URLs. There is deliberately no
second deployment: Netlify hosted this page until it moved to the custom domain, and `netlify.toml`
was removed with the move, because publishing the same page at two URLs while declaring one
canonical splits the ranking between them. The address is repeated in `src/index.html`,
`public/sitemap.xml`, `public/robots.txt`, `public/llms.txt` and `public/llms-full.txt`; the audit
reads it from `site.ts` and fails if any of them disagrees.

Pages does not accept custom response headers, so the security and cache headers `netlify.toml` used
to set are gone. Nothing on the page depends on them, and Pages' own ten-minute cache is consistent
with the shell: it names the hashed files, so a new build is picked up together.

---

## Accessibility

Semantic landmarks; one `h1`; a skip link that appears on focus; `:focus-visible` rings that are
never removed; `<details>` for the FAQ so it works with no JavaScript and announces correctly;
`prefers-reduced-motion: reduce` disables every entrance, drift and float while leaving all content
in place; `forced-colors: active` re-maps the glass surfaces and the gradient text for Windows High
Contrast; touch targets of at least 44px on the controls that matter; and descriptive `alt` text on
every screenshot.

## Browser support

**Baseline: Widely available.** No polyfills and no third-party runtime scripts.

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
