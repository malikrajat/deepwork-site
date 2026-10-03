/**
 * Every fact this site states about DeepWork, in one place.
 *
 * The rule this file exists to enforce: **nothing here is invented**. Each entry
 * was read out of the DeepWork repository at version 2.0.17 — the timer defaults
 * from `settings.model.ts`, the water ranges from `water.constants.ts`, the
 * export columns from the README and `task-export.service.ts`, and so on. If a
 * number on this site disagrees with the app, the app is right and this file is
 * the bug.
 *
 * There are deliberately no user counts, download figures, star counts, ratings
 * or testimonials anywhere in this file, because the project publishes none and
 * a marketing site is not the place to start.
 */

/** Where the product actually lives. Everything else on the site links here. */
export const SITE = {
  name: 'DeepWork',
  /** The line the hero is built around. */
  tagline: 'Focus better. Work deeper.',
  /**
   * Kept in step with `APP_VERSION` in the app repository. It appears on the
   * site as a fact about the build being described, and it is also in the
   * `SoftwareApplication` structured data in `index.html`.
   */
  version: '2.0.17',
  /** The browser build — the same app, with nothing to install. */
  webAppUrl: 'https://malikrajat.github.io/deepwork/',
  repoUrl: 'https://github.com/malikrajat/deepwork',
  releasesUrl: 'https://github.com/malikrajat/deepwork/releases',
  /** Always resolves to the newest release, so no link on this site can go stale. */
  latestReleaseUrl: 'https://github.com/malikrajat/deepwork/releases/latest',
  issuesUrl: 'https://github.com/malikrajat/deepwork/issues/new',
  changelogUrl: 'https://github.com/malikrajat/deepwork/blob/main/CHANGELOG.md',
  /**
   * The public address of this site, used for canonical and Open Graph tags.
   *
   * This is the Netlify deployment at the domain root, not the GitHub Pages
   * subpath. Both host the site, so exactly one has to be named here: a canonical
   * tag pointing at a second copy tells a crawler the two URLs are duplicates and
   * splits the ranking between them. `netlify.toml` is the deployment that is
   * actually promoted, and `index.html`, `sitemap.xml`, `robots.txt`, `llms.txt`
   * and `llms-full.txt` all repeat this value deliberately — changing it here
   * alone leaves the catalogues advertising a different home page.
   */
  siteUrl: 'https://deepwork-pomodoro.netlify.app/',
  author: 'Rajat Malik',
  authorUrl: 'https://github.com/malikrajat',
} as const;

/**
 * Whether the repository declares a licence.
 *
 * It does: the application repository ships an **MIT** licence, so the site is
 * allowed to use the words "open source" and does. The wording across the site
 * follows this one constant — set it to `null` again if the licence file is ever
 * removed, and every mention downgrades itself rather than going stale.
 */
export const LICENSE_SPDX: string | null = 'MIT';

/** Where the licence text itself lives, for the structured data and the footer. */
export const LICENSE_URL = `${SITE.repoUrl}/blob/main/LICENSE`;

/** The wording the source section is allowed to use, decided by the line above. */
export const SOURCE_LABEL = LICENSE_SPDX === null ? 'Public source' : `${LICENSE_SPDX} licensed`;

export interface NavLink {
  /** The `id` of the section this link scrolls to. */
  id: string;
  label: string;
}

/**
 * The in-page navigation.
 *
 * Short on purpose: a marketing page with a fifteen-item menu is a page nobody
 * reads. The rest of the sections are reachable by scrolling, which is the
 * medium.
 */
export const NAV_LINKS: readonly NavLink[] = [
  { id: 'focus', label: 'Focus' },
  { id: 'planner', label: 'Planner' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'habits', label: 'Habits' },
  { id: 'insights', label: 'Insights' },
  { id: 'desktop', label: 'Desktop' },
  { id: 'learn', label: 'Learn' },
  { id: 'get-started', label: 'Get started' },
];

export interface Platform {
  id: string;
  name: string;
  /** What you actually get, in the release, named the way the release names it. */
  artifact: string;
  note: string;
  /** The glyph drawn beside the row. Text, not an image, so it costs nothing. */
  glyph: string;
}

/**
 * Where DeepWork runs.
 *
 * The desktop bundles are exactly the ones `ci.yml` produces — `.msi`/`.exe` on
 * Windows, `.dmg`/`.app` on macOS (Intel and Apple Silicon), `.deb`/`.rpm`/
 * `.AppImage` on Linux — and they are published as GitHub release assets, which
 * is why every row points at the releases page rather than at a file path that
 * would rot.
 *
 * There is no iOS or Android app, and this site does not imply one. What mobile
 * gets is the second row: the web app, in any modern browser.
 */
export const PLATFORMS: readonly Platform[] = [
  {
    id: 'web',
    name: 'Web app',
    artifact: 'Nothing to install',
    note: 'The same app in any modern browser — desktop or mobile.',
    glyph: '◎',
  },
  {
    id: 'windows',
    name: 'Windows',
    artifact: '.exe installer · .msi',
    note: '64-bit Windows 10 and later.',
    glyph: '⊞',
  },
  {
    id: 'macos',
    name: 'macOS',
    artifact: '.dmg · .app',
    note: 'Intel and Apple Silicon builds.',
    glyph: '',
  },
  {
    id: 'linux',
    name: 'Linux',
    artifact: '.AppImage · .deb · .rpm',
    note: 'Most distributions, built on Ubuntu.',
    glyph: '🐧',
  },
];

export interface TechItem {
  name: string;
  /** What it actually does in the app, not a marketing gloss. */
  role: string;
}

/** Read from `package.json`, `src-tauri/Cargo.toml` and `tauri.conf.json`. */
export const TECH_STACK: readonly TechItem[] = [
  { name: 'Angular 22', role: 'Standalone components, signals, and zoneless change detection' },
  { name: 'TypeScript', role: 'Strict mode across the whole front end' },
  { name: 'Tauri 2', role: 'The desktop shell — a native window around the same web app' },
  { name: 'Rust', role: 'Tray, window control, native toasts, updater, file writes' },
  { name: 'SQLite', role: 'Local storage, through the Tauri SQL plugin' },
  { name: 'Tailwind CSS 4', role: 'Preflight only — the design system is the app’s own tokens' },
  { name: 'Web Audio API', role: 'The alert tones, generated rather than downloaded' },
  { name: 'Inter · JetBrains Mono', role: 'Shipped with the app; no font CDN, works offline' },
];

export interface Metric {
  label: string;
  /** The real chart or number the Analytics page renders under this heading. */
  detail: string;
}

/**
 * The Analytics page, chart by chart — read from
 * `pages/analytics/analytics.component.ts`.
 *
 * Every one of these is computed locally from the user's own sessions, tasks,
 * habits and journal. Nothing is uploaded, and nothing is inferred by a model:
 * the written readings under "What the numbers say" are rule-based sentences
 * generated by `core/utils/insights.util.ts`, which is why the site calls them
 * readings rather than analysis.
 */
export const METRICS: readonly Metric[] = [
  {
    label: 'Key figures with a trend',
    detail: 'Focus time, sessions and tasks, each with its change and a sparkline',
  },
  { label: 'What the numbers say', detail: 'Plain-language readings written from your own data' },
  {
    label: 'Focus consistency',
    detail: 'A 12-week heatmap — one square per day, darker for more focus',
  },
  { label: 'When you focus', detail: 'Focus by hour of day, with your peak window called out' },
  { label: 'Average focus by weekday', detail: 'Where the week actually goes' },
  { label: 'Task flow', detail: 'Created against closed, week by week, for 8 weeks' },
  { label: 'Where your work sits', detail: 'Completion by Eisenhower quadrant' },
  {
    label: 'Habit consistency',
    detail: '30 days of check-ins with completion rate, current and best streak',
  },
  {
    label: 'Journalling',
    detail: 'Days written, words, average entry, and how focus differs on days you wrote',
  },
  {
    label: 'Recent sessions',
    detail: 'Average session length and the share of sessions you interrupted',
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

/** Questions a visitor actually asks before trying something. */
export const FAQ: readonly FaqItem[] = [
  {
    question: 'Is DeepWork really free?',
    answer:
      'Yes. There is no paid tier, no subscription and no account to create. The web app and the desktop installers are free to download and use.',
  },
  {
    question: 'Where is my data kept?',
    answer:
      'On your machine. The desktop app writes to a local SQLite database and the browser build keeps its data in your own browser storage. There is no DeepWork server, no sync and no telemetry — the only network request the app makes on its own is a check of the public GitHub release list, and that can only ever read.',
  },
  {
    question: 'Does it work offline?',
    answer:
      'The desktop app works entirely offline: its fonts, sounds and database are all local. The browser build registers a service worker, so it keeps working after the first visit and can be installed to your home screen or desktop.',
  },
  {
    question: 'Do I need an account?',
    answer:
      'No. There is nothing to sign up for and nothing to sign in to. Open the app and start working.',
  },
  {
    question: 'Does it sync across my devices?',
    answer:
      'No, and by design. Each installation keeps its own database, so nothing leaves the machine it was written on. Tasks can be exported to CSV and imported back, which is the supported way to move work between them.',
  },
  {
    question: 'Which platforms can I use it on?',
    answer:
      'Windows, macOS and Linux as a desktop app, and any modern browser — including on a phone or tablet — as the web app. There is no native iOS or Android app.',
  },
  {
    question: 'Can I use it for a team?',
    answer:
      'Not currently. DeepWork is a single-person tool: it has no shared boards, no accounts and no collaboration features.',
  },
  {
    question: 'Is the source available?',
    answer:
      'The source is public on GitHub under the MIT licence, so you are free to read it, run it, change it and ship your own version — including commercially. The licence text is in the repository, and contributions and bug reports are welcome.',
  },
  {
    question: 'Why does Windows warn me about the installer?',
    answer:
      'The installers are not code-signed yet, so Windows shows "Unknown publisher" and SmartScreen may interrupt the first run. The app is honest about this and the repository documents it. The browser build avoids the question entirely, because there is nothing to install.',
  },
];

export interface Strength {
  title: string;
  body: string;
}

/** What DeepWork is genuinely good at — every claim traceable to the repository. */
export const STRENGTHS: readonly Strength[] = [
  {
    title: 'Free, with nothing held back',
    body: 'No tiers, no trial, no feature kept for a plan that does not exist.',
  },
  {
    title: 'Open source under MIT',
    body: 'The whole app is on GitHub under a permissive licence — read it, change it, ship your own version.',
  },
  {
    title: 'Local-first by construction',
    body: 'A SQLite file on your machine. No account, no cloud, no sync server to trust.',
  },
  {
    title: 'More than a timer',
    body: 'Focus sessions, a day planner, tasks, matrix, habits, journal, hydration and analytics in one app.',
  },
  {
    title: 'Runs everywhere you work',
    body: 'Native installers for Windows, macOS and Linux, plus a web app for everything else.',
  },
  {
    title: 'Honest about its behaviour',
    body: 'Reminders that wait for an answer, alerts that repeat until you deal with them, and logs you can actually read.',
  },
  {
    title: 'No dark patterns',
    body: 'No streak guilt, no artificial urgency, no upsell. Habit reminders are off until you ask for them.',
  },
];

/** The real limitations, stated before a visitor discovers them. */
export const LIMITATIONS: readonly string[] = [
  'No cloud sync or multi-device sync — each install keeps its own local database.',
  'No team, sharing or collaboration features; it is a single-person tool.',
  'No native iOS or Android app — mobile means the web app in a browser.',
  'Windows and macOS installers are unsigned, so SmartScreen and Gatekeeper will warn on first run.',
  'The test suite covers the logic layer well and the pages lightly; the end-to-end browser suite is still reported as advisory in CI.',
];
