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

**Baseline: Widely available.** No polyfills, no third-party runtime scripts, no
feature-detection branches for browsers older than Baseline.

Two features are used progressively, which means the fallback is "less pretty", not "broken":

- `color-mix()` — when unsupported, the declaration is dropped and a solid or transparent
  background shows through. All text keeps its contrast either way.
- `backdrop-filter` — decoration layered on an already-readable surface; also prefixed with
  `-webkit-` for Safari.

Everything else is Baseline widely available today: custom properties, `clamp()`, grid,
`text-wrap: balance`, `requestAnimationFrame`, `svh` units, `env(safe-area-inset-*)`.

The site must work with **JavaScript disabled**: the `<noscript>` block in `index.html` states the
product's promise and links to the app and the releases.

---

## Architecture decisions, and why

- **No router.** One page, no deep links, so there is no SPA `404.html` problem to solve. The
  Netlify redirect exists only so a future second page behaves.
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
- **Client-rendered, with the content published as plain text beside it.** Prerendering was
  implemented and attempted; it fails in this project with `NG0401` in Angular's route extractor,
  and the `outputMode: "server"` route out of that demands an `ssr.entry` — a real server for a site
  deployed as static files. See the README before trying again. In the meantime the answer is
  `llms.txt` / `llms-full.txt`, which is what the convention is for.
- **Keep every component safe to run without a browser.** Not because the build prerenders today,
  but because the moment someone turns prerendering on, an unguarded `window` or `document` becomes
  a build failure. Guard access, and use `afterNextRender` for anything that must not run during a
  server render.
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

`npm run audit` drives the **built** site in a browser and asserts 60 things — visibility, overflow
at ten widths, console errors, loaded images, crawler files, structured data. It has caught three
bugs that `ng build` could not see. It needs `npm run build` first, and Chromium once
(`npx playwright install chromium`). `npm run llms` after any copy change, or CI will fail on a
stale `llms-full.txt`.

## What CI does, and what it deliberately does not

`.github/workflows/ci.yml` runs format check, lint, the production build, the audit, and an
up-to-date check on `llms-full.txt`. It does **not** run `npm audit` — the owner asked for a
pipeline that does not gate on vulnerability reports, and `.npmrc` records that. Do not quietly add
a security gate back; if you think it should be there, say so rather than sneaking it in.

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
npm run build:github   # production build with the GitHub Pages base href
npm run lint           # Biome lint
npm run format         # Biome (TS/JSON/tools) + Prettier (HTML/CSS)
npm run verify         # format:check + build
npm run serve:dist     # serve the build at http://127.0.0.1:5200
npm run audit          # 60 assertions against the built site (needs Chromium)
npm run llms           # regenerate public/llms-full.txt from the rendered page
```

The audit and the llms generator start their own static server, so neither needs a second terminal.
Screenshot and social-card regeneration is documented in `README.md`; it needs the application
repository built and served first.
