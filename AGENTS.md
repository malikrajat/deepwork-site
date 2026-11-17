# Working in this repository

The product website for **DeepWork**. The application itself is a different repository
(`malikrajat/deepwork`) and is never modified from here — this project reads it, screenshots it and
describes it.

---

## The rules that matter more than style

### 1. Never invent a feature

Before a feature, a number or a range goes on the page, find it in the application repository. The
three outcomes are:

| What the repository shows      | What the site may say                   |
| ------------------------------ | --------------------------------------- |
| Implemented                    | Describe it, with the real values       |
| Partially implemented          | Describe it as partial, or leave it out |
| Documented but not implemented | Nothing. Do not present it as available |
| Not there                      | Nothing                                 |

Every fact lives in `src/app/core/site.ts` so it can be checked in one place.

### 2. No fabricated social proof

No user counts, download figures, GitHub stars, ratings, testimonials, customer logos, revenue or
performance claims. The project publishes none and this site does not start. If a number cannot be
traced to the repository or to a public API response, it does not belong on the page.

### 3. Say the smaller true thing

The app has **no AI**. Its "insights" are rule-based sentences computed from the user's own rows,
and the site says exactly that. The app is **MIT-licensed**, so the site says "open source" — it
said "public source" for as long as no licence file existed, and that copy was corrected the day one
appeared. Both are deliberate: a claim that survives being checked is worth more than a stronger one
that does not.

The switch is `LICENSE_SPDX` in `src/app/core/site.ts`. Never hard-code licence wording anywhere
else; set that constant to `null` and every mention downgrades itself.

### 4. Screenshots are the product

Every image in `public/screenshots` is captured from a production build of the real application.
Never draw a mock-up, never retouch a screen, never show a state the app cannot reach.

### 5. Do not modify the application

No edits, no dependency upgrades and no refactors in the DeepWork application repository. Read
only.

---

## Browser support policy

**Baseline: Widely available.** No polyfills, no feature-detection branches for browsers older than
Baseline, and no third-party runtime script except two disclosed dependencies: the Google tag on the
home page and the hCaptcha widget the contact form requires (both described in the README). The
legal documents load neither.

Two features are used progressively, which means the fallback is "less pretty", not "broken":

- `color-mix()` — when unsupported, the declaration is dropped and a solid or transparent
  background shows through. All text keeps its contrast either way.
- `backdrop-filter` — decoration layered on an already-readable surface; also prefixed with
  `-webkit-` for Safari.

Everything else is Baseline widely available today: custom properties, `clamp()`, grid,
`text-wrap: balance`, `requestAnimationFrame`, `svh` units, `env(safe-area-inset-*)`.

The site must work with **JavaScript disabled**: the build prerenders the whole page into
`index.html`, so there is no `<noscript>` summary to maintain and nothing to fall back to. The one
thing that still needs scripting is the theme — without it the page stays dark.

---

## Architecture decisions, and why

- **No router.** One page, no deep links, so there is no SPA fallback to configure: the host serves
  `public/404.html` for an unknown path, which is a branded page rather than the app. On Cloudflare
  Pages that file is served whatever the missing path was — Pages does not rewrite the address — so
  it must not assume it was reached from a link the site owns.
- **Three documents, and they are static files.** `/privacy/`, `/terms/` and `/contact/` live in
  `public/` as self-contained HTML sharing `public/legal/legal.css` and `legal.js`, with real URLs
  and a 200 status. They are not routes because a legal notice has to read with JavaScript off, and
  because a route would be one more thing that can fail while the page still renders. The theme
  toggle uses the same `deepwork-site-theme` key as the page; the documents send no pageview.
  The contact form is wired to `data-endpoint` on the form and falls back to `mailto:` — never
  invent an endpoint, and if one is set, name the processor in the privacy policy.
- **No lazy loading, no `@defer`.** A visitor scrolls the whole page; a section that pops in late
  is worse than one in the first paint.
- **One global stylesheet, no component `styles`.** Component styles are injected at runtime;
  a single critical-inlined sheet paints the first screen on the first frame.
- **Zoneless.** No `zone.js` is loaded. All state is signals.
- **No animation library.** Scroll reveals are one directive plus a CSS transition on
  `transform`/`opacity`, driven by a shared geometry queue — **not** `IntersectionObserver`, which
  silently loses elements on a fast scroll and leaves them at `opacity: 0` forever. See
  `src/app/core/reveal.ts`.
- **Nineteen section components, no shared UI kit.** A component library for a single page would be
  abstraction without a second caller.
- **Prerendered, and it is a build step, not a server.** `outputMode: "static"` plus
  `src/main.server.ts` writes the whole page into `index.html`, so a crawler that executes no
  JavaScript — GPTBot, ClaudeBot, PerplexityBot — reads every word. `src/app/app.config.server.ts`
  provides `provideServerRendering()` and, crucially, `provideRouter([])`: the prerenderer asks the
  `Router` for its URLs and throws `NG0401` when there is none, and the router is imported by the
  server entry alone so the browser bundle never carries it. Nothing is served from `dist` but
  static files. `llms.txt` / `llms-full.txt` still ship for agents that prefer Markdown.
- **Keep every component safe to run without a browser.** This is now load-bearing: the build runs
  the whole app in a DOM that has no `window`, no `localStorage` and no `dataset`, so an unguarded
  access fails the build rather than a future experiment. Use `DOCUMENT` and `getAttribute`, guard
  with `typeof window`, and put anything that must not run during a server render in
  `afterNextRender`.
- **The visitor count is first-party.** A pageview is a beacon this page sends to GoatCounter
  (`src/app/core/analytics.ts`), not `count.js` and not anybody else's script. It counts only
  `https://deepwork.rajatmalik.dev`: local builds and previews send no GoatCounter pageview.
  The front page separately loads the disclosed Google tag (Tag Manager, which loads Analytics), and
  the contact page loads hCaptcha. The audit allows those hosts on those pages only; do not widen
  that allowlist without updating `/privacy/`, the README and this file.
  The footer's Site stats panel reads the numbers back with a token that is public by construction
  (`src/app/core/visitor-stats.ts`); it must stay a read-only "Read statistics" token, because
  anybody can read it out of the bundle. Nothing is fetched unless the panel is opened.
- **Response headers are a file in `public/`, not a setting.** `public/_headers` is parsed by
  Cloudflare Pages out of the build output; the assets glob copies it and Pages never serves it. It
  is the only place a header is set. A new third-party host means a new source in the matching
  policy, and `/contact/`'s block must keep its `! Content-Security-Policy` line — Pages joins a
  repeated header with a comma and both policies are enforced, so the intersection silently blocks
  the captcha. The local static server does not emulate `_headers`, so `npm run audit` cannot see a
  broken policy: verify a deployed response with `curl -sI`, not by reading the file back.
- **The crawler files are part of the deliverable.** `robots.txt` names each AI crawler explicitly,
  `sitemap.xml` lists the images, `llms.txt` is a curated index, and `llms-full.txt` is generated
  from the **rendered** page by `npm run llms` (which needs the site served — see the README) —
  never hand-write the last one, because it would drift from the page.

---

## SEO rules

- **Never** add `aggregateRating`, `review`, `ratingCount` or testimonials. There are none, and
  inventing them is dishonest and against Google's structured-data policy.
- **Never** keyword-stuff, hide text, or add a `lastmod` to `sitemap.xml` that changes without the
  content changing.
- Exactly one `h1` in the shipped HTML, and headings in order. `npm run audit` asserts it — the
  `<noscript>` block previously held a second `h1`, which prerendering turned into a real bug.
- Structured data must match the visible words. If an FAQ answer in `core/site.ts` changes, the
  matching answer in the `FAQPage` graph in `src/index.html` changes with it.
- Every claim in `llms.txt` must be verifiable against the application repository.

---

## Conventions

- **Suffixless files, intent-based names** (Angular v20+ style): `hero.ts` exports `Hero`,
  `theme.ts` exports `ThemeStore`. Models keep `.model.ts`.
- `@Service()` for singletons — not `@Injectable({ providedIn: 'root' })`.
- Do **not** write `standalone: true` or `changeDetection: OnPush`: both are the default in Angular
  22 and writing them is noise.
- Signals, `input()`, `computed()`. Host bindings go in the `host` object, never `@HostBinding` /
  `@HostListener`.
- Native control flow (`@if`, `@for`, `@switch`) — never `*ngIf` / `*ngFor`.
- `NgOptimizedImage` for every static image, with the real intrinsic dimensions.
- Class naming is namespaced by section: `hero__title`, `matrix__cell`, `route__shot`.
- **Biome formats and lints the TypeScript, the JSON and the tooling scripts. Prettier formats
  `*.html` and `*.css`.** That split is not a preference: Biome's HTML parser does not understand
  Angular's `@if` / `@for` / `@switch` blocks, which are not HTML. Run `npm run format` (which runs
  both) rather than either tool on its own. Config is `biome.json`; the reasoning is in the README.

## Checks before you call something done

`npm run audit` drives the **built** site in a browser and asserts 145 things — the page with
JavaScript disabled, visibility, overflow at ten widths, console errors, loaded images, crawler files,
structured data, and the three documents. It has caught four bugs that `ng build` could not see. It
needs `npm run build` first, and Chromium once (`npx playwright install chromium`). `npm run llms`
after any copy change, or CI will fail on a stale `llms-full.txt`.

## What CI does, and what it deliberately does not

`.github/workflows/ci.yml` runs format check, lint, the production build, the audit, and an
up-to-date check on `llms-full.txt`. It does **not** run `npm audit` — the owner asked for a
pipeline that does not gate on vulnerability reports, and `.npmrc` records that. Do not quietly add
a security gate back; if you think it should be there, say so rather than sneaking it in.

Cloudflare Pages publishes `main` through its own Git integration, configured in the Cloudflare
dashboard: build command `npm run build`, output directory `dist/deepwork-site/browser`, and
`WEB3FORMS_ACCESS_KEY` as a project variable. There is no deploy workflow in this repository, and
re-adding one would publish the same build twice. Cloudflare builds from `main` as it is pushed, so
nothing here gates the deploy but CI: a push that fails CI may already be live, and the remedy is a
fix or a revert, not a retry. `public/CNAME` is a leftover from the GitHub Pages years — Pages reads
the domain from the project settings, not from a file — and is kept only because deleting it would
change a working deployment for no benefit.

## Skills in this workspace

`.agents/skills/` carries two vendored skills, and they are meant to be used rather than
decorative:

- **`angular-developer`** — Angular 22 patterns, reactivity, routing, styling, testing, tooling.
- **`modern-web-guidance`** — searchable best-practice guides for web platform features. Run it
  before building any new UI or client-side behaviour.

The Angular MCP server is configured in `.vscode/mcp.json`. `get_best_practices` is the authority
on framework style for this version; where it disagrees with older habits, it wins.

---

## Commands

```bash
npm start              # dev server, http://localhost:5000
npm run build          # production build
npm run lint           # Biome lint
npm run format         # Biome (TS/JSON/tools) + Prettier (HTML/CSS)
npm run verify         # format:check + build
npm run serve:dist     # serve the build at http://127.0.0.1:5200
npm run audit          # 132 assertions against the built site (needs Chromium)
npm run llms           # regenerate public/llms-full.txt from the rendered page
```

The audit and the llms generator start their own static server, so neither needs a second terminal.
Screenshot and social-card regeneration is documented in `README.md`; it needs the application
repository built and served first.
