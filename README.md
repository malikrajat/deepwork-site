# DeepWork — the website

The product site for **DeepWork**, a free focus timer, task manager and habit tracker that keeps
its data on your own machine.

**This repository contains the website only.** The application lives at
[malikrajat/deepwork](https://github.com/malikrajat/deepwork), and nothing here modifies it: this
project reads that repository, screenshots it and describes it.

- **Site:** https://deepwork-pomodoro.netlify.app/
- **Web app:** https://malikrajat.github.io/deepwork/
- **Downloads:** https://github.com/malikrajat/deepwork/releases/latest

---

## Why this repository exists

The app is genuinely good and almost nobody knows about it. The site has one job: take someone who
has never heard of DeepWork — or of the Pomodoro Technique — and get them to the point where they
understand what it does, believe it, and install it.

Three ideas shaped almost every decision in here:

1. **Say the true, smaller thing.** The app has no AI and no cloud, and the site says exactly that.
   It is MIT-licensed, and the site says that too — the moment the app repository gained a
   `LICENSE`, the copy that claimed there was none was corrected rather than left to flatter the
   project. A claim that survives being checked is worth more than a stronger one that does not.
2. **The product is the artwork.** Every image is a screenshot of the real application, captured
   from a production build. There is not one stock photograph in this repository.
3. **Be readable by machines as well as people.** Googlebot runs JavaScript; most AI crawlers do
   not. This site is client-rendered, so the page is *also* published as plain text — see
   [Crawler and SEO](#crawler-and-seo) — and an audit checks that the plain-text version really
   contains the page rather than a stub.

---

## Quick start

```bash
npm install
npm start                 # dev server on http://localhost:5000
npm run build             # production build -> dist/deepwork-site/browser
npm run build:github      # the same build with the GitHub Pages base href
npm run serve:dist        # serve the build at http://127.0.0.1:5200
npm run verify            # format:check + build
```

Everything else:

```bash
npm run format            # Biome over TS/JSON/scripts, then Prettier over HTML/CSS
npm run format:check      # what CI runs
npm run lint              # Biome lint
npm run audit             # drive the BUILT site in a browser and assert 60 things
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

Twenty sections, in the order they are argued. The `id` is the anchor.

| #   | `id`          | Section                                                   |
| --- | ------------- | --------------------------------------------------------- |
| 1   | —             | Hero — what it is, what it costs, where the data goes      |
| 2   | `product`     | The product — the real window, with the parts named        |
| 3   | `beyond`      | More than a Pomodoro — the twelve surfaces the app has     |
| 4   | `focus`       | Focus sessions — the timer, the alerts, the tones          |
| 5   | `planner`     | Day planner — tasks laid onto focus blocks                 |
| 6   | `tasks`       | Tasks — the board, quick add, recurrence, import and export |
| 7   | `matrix`      | Eisenhower matrix — Q1 to Q4                               |
| 8   | `habits`      | Habits and journal                                         |
| 9   | `hydration`   | The water reminder                                         |
| 10  | `insights`    | Insights — ten real charts, and the readings beside them   |
| 11  | `your-data`   | Your data — local SQLite, no account, five log files       |
| 12  | `desktop`     | The desktop app — tray, always-on-top, the mini widget     |
| 13  | `how`         | How it works — four steps                                  |
| 14  | `learn`       | **Learn the method** — what a Pomodoro is, how to plan a day |
| 15  | `why`         | Why DeepWork — the strengths *and* the limitations         |
| 16  | `source`      | Built in the open — stack, pipeline, licensing position    |
| 17  | `get-started` | Get started — browser, desktop, install as an app          |
| 18  | `faq`         | Common questions                                           |
| 19  | —             | Footer                                                     |

Section 14 is the one that earns traffic rather than describing a product. Everything else answers
"what does DeepWork do?"; `learn` answers "what is the Pomodoro Technique?", which is what somebody
types into a search engine *before* they have heard of this app.

---

## Architecture decisions, and why

Each of these is a decision with a reason, and most of them were made the other way first.

- **One page, no router.** One page needs no routing. Leaving the router out keeps the bundle
  smaller and removes the SPA-fallback problem that GitHub Pages otherwise solves with a
  hand-written `404.html` redirect.
- **One stylesheet, no component `styles`.** Component styles are injected as separate `<style>`
  elements at runtime; a single critical-inlined sheet paints the first screen on the first frame,
  which is the whole Core Web Vitals story for a page this visual.
- **All content in one file.** Every fact the site states about the app is in
  `src/app/core/site.ts` — timer defaults, water ranges, the analytics chart list, the FAQ, the
  limitations. If a number there disagrees with the app, the app is right and that file is the bug.
- **Text is visible by default.** The scroll-reveal effect hides an element *only after* JavaScript
  has measured it as being below the fold, with an eight-second failsafe. The first version did it
  the obvious way — hide everything in CSS, let JavaScript reveal it — and an audit found 80–90
  elements stuck at `opacity: 0` at every width. The page built, deployed, and was blank.
- **No animation library.** One directive, one CSS transition on `transform`/`opacity`, and a
  shared geometry queue rather than `IntersectionObserver` (which silently loses elements on a fast
  scroll). See `src/app/core/reveal.ts`.
- **No fabricated social proof.** No user counts, downloads, star counts, ratings or testimonials,
  because the project publishes none. This is a rule, not an oversight.
- **Zoneless.** No `zone.js` is loaded; all state is signals.

### Prerendering: attempted, documented, not enabled

Angular's prerenderer does not work for this project, and the exact blocker is worth recording so
nobody re-runs the investigation:

1. `outputMode: "static"` with a server entry fails with `NG0401` — the prerenderer boots the
   server bundle and asks its route extractor for the URL list, which an application with no router
   cannot answer.
2. Adding `@angular/router` **on the server only** (so the browser pays nothing) still fails at the
   same place.
3. `outputMode: "server"`, which supplies the `index.server.html` asset the extractor reads, then
   demands `ssr.entry` — a real server file. That is a server process for a site deployed as static
   files, and it was not a trade worth making silently.

`ng add @angular/ssr` plus `outputMode: "server"` and `prerender` is the remaining step, and it is
left for a human to run on purpose. In the meantime the content reaches non-JavaScript crawlers
through `llms-full.txt`, which is what that convention exists for.

---

## Crawler and SEO

**The honest situation.** The page is client-rendered. Googlebot renders JavaScript and will index
it fully. An AI crawler that executes nothing sees the document head and an empty `<app-root>` —
which is why the whole page is also published as plain text.

| File                       | Purpose                                                                                                                                                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `robots.txt`               | Allows everything, and names **each AI crawler explicitly** (GPTBot, OAI-SearchBot, ClaudeBot, Claude-User, PerplexityBot, Google-Extended, Applebot-Extended and more). Several treat a wildcard group more cautiously than a named rule. |
| `sitemap.xml`              | The canonical URL plus image entries for six screenshots, with a real `lastmod`.                                                                                                                                                          |
| `llms.txt`                 | The [llms.txt](https://llmstxt.org) convention: a curated index — what the product is, the verifiable facts, a link to every section.                                                                                                      |
| `llms-full.txt`            | The **whole page** as Markdown, generated from the rendered page by `npm run llms`. This is what a crawler that runs no JavaScript actually reads.                                                                                          |
| `site.webmanifest`         | Install metadata: shortcuts to `#learn` and `#get-started`, and screenshots for a richer install prompt.                                                                                                                                  |
| `404.html`                 | A real, branded 404 with `noindex`, so an error page never ends up in a search result.                                                                                                                                                    |
| `.well-known/security.txt` | RFC 9116, pointing at the issue tracker. No invented email address.                                                                                                                                                                        |

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

- A page that ships 62 kB and renders at ten viewport widths from 320px to 2560px.
- Structured data, a canonical URL, a generated social card and image-sitemap entries.
- Plain-text versions for crawlers and language models, kept honest by a CI check.
- An "informational" section that targets the question people ask *before* they want a product.
- An automated audit, so the page cannot silently rot.

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

- **Prerendering.** See above. It is the largest remaining technical SEO gain.
- **A blog or notes feed.** Recurring content is the only reliable long-term organic engine, and it
  is the one item here that cannot be automated.
- **Directory listings.** AlternativeTo, awesome-lists, Product Hunt, Hacker News, the relevant
  subreddits. Unglamorous, effective, and it needs a person to do it honestly.
- **Privacy-friendly analytics.** Nothing here measures anything. A cookie-less, self-hosted counter
  would show which section people actually read — but adding a third-party tracker to a
  privacy-first product's own website would be a contradiction, so it is a decision to make on
  purpose or not at all.
- **A `LICENSE` file for the app repository — done.** The application is MIT-licensed, and the
  whole site follows one constant: `LICENSE_SPDX` in `src/app/core/site.ts`. Set it to `null` and
  every mention of "open source" downgrades itself to "public source" rather than going stale.

---

## Screenshots

Every image in `public/screenshots` is the real application, captured from a production build.

```bash
# 1. build the app (in the application repository)
npm run build                      # -> dist/deepwork/browser

# 2. capture, with that build being served by any static server
APP_URL=http://127.0.0.1:5199 npm run shots

# 3. convert to WebP and print a brightness/contrast report
python tools/make-webp.py

# 4. regenerate the social card
npm run og
```

Two captures are **element** screenshots (`.timer-card`, `.water-card`) rather than window
screenshots, so they are exactly those panels at their own size and stay correct when the app's
layout moves. `make-webp.py` prints brightness and contrast for every file: a blank page or a theme
that failed to switch fails that check loudly, which is the only automated verification available on
a pipeline whose output is pictures. Set `DETAILS_ONLY=1` to re-capture just the element shots.

---

## Checks

`npm run audit` does not test anything in the abstract — it drives the **built site** in Chromium
and asserts 60 specific things:

- crawler files exist and say the right things, and no invented rating is claimed;
- content is not left hidden waiting for a scroll reveal, at reduced motion and after real input
  scrolling, at ten widths;
- no horizontal overflow at any of those widths, with the offending element named when there is one;
- no console or page errors, exactly one `h1`, twenty section headings, every anchor resolves;
- all thirteen screenshots actually load;
- the theme toggle flips the document and the FAQ opens without scripting;
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

Both hosts serve the same static output and need no server.

**GitHub Pages** — `.github/workflows/deploy.yml` builds with `npm run build:github` (which sets
`--base-href=/deepwork-site/`) and publishes `dist/deepwork-site/browser`. If the repository is
renamed, the base href changes in exactly two places: `package.json` and that workflow.

**Netlify** — `netlify.toml` is committed and needs no dashboard configuration: build
`npm run build`, publish `dist/deepwork-site/browser`, an SPA redirect, and caching plus security
headers. The base href stays `/` there, which is why the Pages base href is a build flag rather than
something written into `index.html`.

Every asset reference is relative, so the site resolves under whatever base href the build was given.

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

The page must also be usable with JavaScript disabled. The `<noscript>` block is one sentence and
one link; it used to be a full duplicate of the page including a second `h1`, which was both
duplicate content and a broken heading hierarchy.

## Licence

The site's own source is © Rajat Malik. The bundled typefaces are **Inter** and **JetBrains Mono**,
both SIL Open Font License 1.1; their licence texts ship in `public/fonts/`.

The DeepWork application is a separate project and is not covered by this repository's licence.
