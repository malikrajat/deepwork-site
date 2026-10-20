/**
 * Every fact this site states about DeepWork, in one place.
 *
 * The rule this file exists to enforce: **nothing here is invented**. Each entry
 * was read out of the DeepWork repository at version 3.0.0 — the timer defaults
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
  version: '3.0.0',
  /** The browser build — the same app, with nothing to install. */
  webAppUrl: 'https://malikrajat.github.io/deepwork/',
  repoUrl: 'https://github.com/malikrajat/deepwork',
  releasesUrl: 'https://github.com/malikrajat/deepwork/releases',
  /** Always resolves to the newest release, so no link on this site can go stale. */
  latestReleaseUrl: 'https://github.com/malikrajat/deepwork/releases/latest',
  issuesUrl: 'https://github.com/malikrajat/deepwork/issues/new',
  changelogUrl: 'https://github.com/malikrajat/deepwork/blob/main/CHANGELOG.md',
  /**
   * The two published addresses, and they are not interchangeable: `contact` is
   * for enquiries about the project and this site, `support` is for help
   * installing or using the app. Every `mailto:` on the page is built from these
   * two fields, so an address is corrected in one place.
   */
  contactEmail: 'contact@rajatmalik.dev',
  supportEmail: 'support@rajatmalik.dev',
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

/** General enquiries. Built here so no template hand-writes the address. */
export const CONTACT_URL = `mailto:${SITE.contactEmail}`;

/** Help with installing or using the app. */
export const SUPPORT_URL = `mailto:${SITE.supportEmail}`;

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
  { id: 'whats-new', label: "What's new" },
  { id: 'focus', label: 'Focus' },
  { id: 'planner', label: 'Planner' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'time', label: 'Time by Task' },
  { id: 'reminders', label: 'Reminders' },
  { id: 'get-started', label: 'Get started' },
];

export interface ReleaseNote {
  /** The release the change arrived in, named the way the changelog names it. */
  version: string;
  title: string;
  body: string;
}

/**
 * The changes since the site last described the app (2.0.17).
 *
 * Kept here rather than in the section component because these are claims about
 * the product, and every one of them is a line in the application's
 * `CHANGELOG.md`: 2.0.18 through 2.0.22, the 3.0.0 entry, and the standing
 * reminders that are the newest arrival. The three headline features have their
 * own sections; this is everything else that changed a working day.
 */
export const RELEASE_NOTES: readonly ReleaseNote[] = [
  {
    version: '3.0',
    title: 'A tray menu for the work',
    body: 'New task opens quick-add from wherever the app is, Settings brings the full window up on the right page, Pause offers 5, 10, 15 or 30 minutes, and the mute moved into a submenu of its own lengths.',
  },
  {
    version: '3.0',
    title: 'A first launch that asks once',
    body: 'One dialog offers to start DeepWork with the computer. Not now is an answer: it starts four or five quiet nudges a day, each with a Stop asking button, instead of asking the same question every launch.',
  },
  {
    version: '3.0',
    title: 'A taskbar reminder that tells the truth',
    body: 'Windows will not let an ordinary app pin itself. DeepWork asks the shell first; where the request would be refused, the button becomes Yes, show me and opens the app list where you can pin it.',
  },
  {
    version: '3.0',
    title: 'A matrix that gives its space back',
    body: 'A folded quadrant becomes a one-line strip and the open quadrants reflow into the room. The dividers drag by mouse or arrow keys, and the split is remembered as a share of the board.',
  },
  {
    version: '3.0',
    title: 'Settings that fill the screen',
    body: 'Settings and About now pack as many 380–600 px cards as the window fits, with the reading measure kept inside each card, instead of a 560 px strip in the middle of a 1920 px monitor.',
  },
  {
    version: '3.0',
    title: 'An app that knows how it is running',
    body: 'The desktop app, an installed web app and a browser tab are three different surfaces. The install dialog explains the one route this browser actually has, and an installed web app is told what it cannot do.',
  },
  {
    version: '3.0',
    title: 'Every question answerable where it is asked',
    body: 'The startup, taskbar and water questions carry Yes and Not now on their desktop notification, and the completion alert carries Pause, Next, Resume and Hold up — so answering does not mean finding the window.',
  },
  {
    version: '2.0.22',
    title: 'A timeline that says what is running',
    body: 'The session in progress is drawn inside the span it was booked for, and its own start and end times sit on the card instead of in a hover tooltip.',
  },
  {
    version: '2.0.22',
    title: 'Today stays today',
    body: 'Add to Today now carries the day it was set on. Yesterday’s starred work no longer follows you into this morning’s board, and a session started without a task is no longer filed against last week’s task.',
  },
  {
    version: '2.0.21',
    title: 'The database is protected like the only copy it is',
    body: 'The file is checked read-only before it is opened; a database that is there and unreadable stops startup instead of being replaced by an empty one; and every launch copies it into a backups folder before migrations touch it.',
  },
  {
    version: '2.0.20',
    title: 'Edit a task where you read it',
    body: 'A pencil on every board and matrix card, an edit control in the calendar, and Edit task on the dashboard’s current-focus card all open the one task form with the task already in its fields.',
  },
  {
    version: '2.0.20',
    title: 'Add to the day you are looking at',
    body: 'Today carries Add task, each date section has its own +, and every matrix quadrant has one that opens the form already in that quadrant.',
  },
  {
    version: '2.0.20',
    title: 'An update you can turn down for good',
    body: 'The update card gained Skip this version — that release is never offered again — while closing it and Remind me later are a twelve-hour snooze, not a silent goodbye.',
  },
  {
    version: '2.0.19',
    title: 'Always on top now stays on top',
    body: 'The flag is written straight to the window and read back from it, and a watcher re-asserts it when another application, a display change or a fullscreen window takes the spot away.',
  },
  {
    version: '2.0.18',
    title: 'A drink is 30 ml, and the reminder is on',
    body: 'The water nudge is on by default and counts the smallest thing anyone would call a drink, so a day of sipping adds up honestly instead of a handful of guesses at half a litre each.',
  },
  {
    version: '2.0.18',
    title: 'A visitor count, said out loud',
    body: 'The hosted web app counts visits with GoatCounter. It is off with one switch, never runs in the desktop build, and sends the page — never a task, a journal entry or an identifier.',
  },
];

export interface TimeRange {
  label: string;
  note: string;
}

/** The Time by Task range switch, in the order the page offers it. */
export const TIME_RANGES: readonly TimeRange[] = [
  { label: 'Today', note: 'the hours since midnight' },
  { label: 'This week', note: 'since Monday' },
  { label: 'This month', note: 'the default view' },
  { label: 'This year', note: 'month by month' },
  { label: 'All time', note: 'everything recorded' },
  { label: 'Custom', note: 'any two dates, or one day twice' },
];

export interface TimeCadence {
  name: string;
  meaning: string;
  colour: string;
}

/**
 * What a bar’s colour means on Time by Task. The app uses one solid colour per
 * cadence and marks the current day/week/month with a ring rather than a second
 * fill, and the legend above the list names both.
 */
export const TIME_CADENCES: readonly TimeCadence[] = [
  { name: 'Repeating work', meaning: 'daily, weekly or monthly', colour: 'var(--focus)' },
  { name: 'One-off', meaning: 'a single piece of work', colour: 'var(--warning)' },
  { name: 'Multi-day', meaning: 'one task across several days', colour: 'var(--break-short)' },
  { name: 'Untasked', meaning: 'time recorded without a task', colour: 'var(--todo)' },
];

export interface ReminderRhythm {
  name: string;
  ladder: string;
  note: string;
}

/**
 * The three ladders, from `RHYTHM_LADDERS` in `reminder.constants.ts`.
 *
 * The last gap repeats for as long as the reminder stands; none of the rhythms
 * ever gives up, and the ladder is measured from the last actual ring so a
 * snooze cannot shorten it.
 */
export const REMINDER_RHYTHMS: readonly ReminderRhythm[] = [
  {
    name: 'Insistent',
    ladder: '3 · 5 · 10 · 15 · 20 · then every 30 min',
    note: 'A presentation, a class, a dose or a train.',
  },
  {
    name: 'Steady',
    ladder: '10 · 20 · 30 · 45 · 60 · then every 60 min',
    note: 'An ordinary appointment.',
  },
  {
    name: 'Gentle',
    ladder: '30 · 45 · 60 · 90 · 120 · then every 120 min',
    note: 'Something that can wait.',
  },
];

/** The three controls in the Focus & reminders panel, with their real options. */
export const QUIET_CONTROLS: readonly Strength[] = [
  {
    title: 'Focus mode',
    body: 'Hides the navigation and puts the timer on its own. Every reminder keeps running, because a focus session is exactly when the completion alert matters.',
  },
  {
    title: 'Pause reminders',
    body: '30 minutes, 1 hour, 4 hours or until you resume. It stops the timer, the cards and the system notifications together, and restarts only a timer it stopped.',
  },
  {
    title: 'Reminder sound',
    body: '30 minutes, 1 hour or the rest of today. It mutes the tone only, so cards still arrive, and it expires by itself — even after a restart.',
  },
];

/** What the completion alert can be answered with, in the app’s words. */
export const ALERT_ACTIONS: readonly Strength[] = [
  {
    title: 'Pause',
    body: 'Pauses whatever is running when it is pressed, even if the alert has been in the notification centre for a while.',
  },
  {
    title: 'Next',
    body: 'Moves to the next session and starts it, so one answer carries on rather than leaving a full clock behind a second press.',
  },
  {
    title: 'Resume',
    body: 'Starts the session that is waiting.',
  },
  {
    title: 'Hold up',
    body: 'Closes the alert and leaves the clock exactly as it was.',
  },
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

export interface DisplaySize {
  /** The width, in CSS pixels, at which the app changes shape. */
  range: string;
  /** The app's own name for that shape. */
  state: string;
  /** What actually changes there. */
  detail: string;
}

/**
 * How DeepWork is laid out at each width, largest to smallest.
 *
 * These are the breakpoints the application actually declares, not round
 * numbers chosen to sound tidy, and they were read from the code:
 *
 * - `1600px` / `1024px` / `640px` — `pages/dashboard/dashboard.component.ts`
 * - `1360px` — `pages/calendar/calendar.component.ts`
 * - `1100px` — `pages/analytics/analytics.component.ts`, `pages/tasks/tasks.component.ts`
 * - `960px` — `shared/components/task-board/task-board.component.ts`
 * - `900px` — the shell. `COMPACT_LAYOUT_QUERY` in `app/app.ts` has to repeat
 *   the same number the stylesheets use, because a custom property cannot be
 *   read inside a media query condition and JavaScript has to agree with the
 *   CSS about when the shell has changed shape.
 * - `560px` — `pages/matrix/matrix.component.ts`
 * - `380px` — `pages/calendar/calendar.component.ts`
 *
 * The sidebar's 240px is `shared/components/sidebar/sidebar.component.ts`, and
 * the 320px floor is the narrowest width the pages carry rules for at all. The
 * desktop window can be dragged to 800×600 — `minWidth`/`minHeight` in
 * `src-tauri/tauri.conf.json` — which lands inside the compact layout by
 * design, because at that size the width is worth more than a permanent menu.
 */
export const DISPLAY_SIZES: readonly DisplaySize[] = [
  {
    range: '1600px and wider',
    state: 'Room to spend',
    detail: 'The dashboard widens the clock card and opens up its spacing.',
  },
  {
    range: '1100px – 1600px',
    state: 'The desktop layout',
    detail: 'The sidebar is a 240px column, and the wide two-column pages stay two columns.',
  },
  {
    range: '900px – 1100px',
    state: 'One column at a time',
    detail: 'A two-column chart page gives up its right-hand column before the navigation moves.',
  },
  {
    range: '760px – 900px',
    state: 'The drawer',
    detail: 'The sidebar slides away and a top bar with a menu button takes its place.',
  },
  {
    range: '640px – 760px',
    state: 'One column',
    detail: 'The board scrolls sideways rather than squeezing three columns into the width.',
  },
  {
    range: '380px – 640px',
    state: 'The phone layout',
    detail:
      'Every multi-column grid stacks into one, controls grow to a thumb-sized target, and the fields stop iOS zooming the page in.',
  },
  {
    range: '320px – 380px',
    state: 'The narrowest',
    detail: 'Titles, subtitles and the calendar toolbar tighten to fit rather than overflow.',
  },
];

/** The two input methods the app is laid out for, and what it does about each. */
export const INPUT_NOTES = {
  touch: [
    'Buttons, select fields, task cards and the drag grip all take a 44px minimum target.',
    'On a coarse pointer — a phone or tablet, including a touchscreen laptop — the scrollbars slim to 8px and stop reserving a desktop track.',
    'Text fields go to 16px below 640px, which is the size below which iOS Safari zooms the whole page in on focus.',
    'The outer padding follows `env(safe-area-inset-*)`, so the navigation and content clear the notch, the rounded corners and the home indicator.',
  ],
  keyboard: [
    'Escape closes the navigation drawer — and is what closes the topmost layer first.',
    'Task cards move along the board with 1, 2, 3 and the arrow keys.',
    'Nothing depends on hover, so no action is unreachable without a pointer.',
  ],
} as const;

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
      'On your machine. The desktop app writes to a local SQLite database and the browser build keeps its data in your own browser storage. There is no DeepWork server and no sync. The desktop makes only the public GitHub release check, an installer download you press, and links you open; the hosted web app also counts visits, and that is the one exception — see “Does the web app count my visit?”.',
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
      'No, and by design. Each installation keeps its own database, so nothing leaves the machine it was written on. A full JSON backup restores everything on another machine, and tasks can also be exported to CSV and imported back.',
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
  {
    question: 'What is Time by Task?',
    answer:
      'A page that groups every focus session by the work’s title rather than by the task row. A daily Code review is a new task every morning, so counting rows would scatter the history; Time by Task shows one line with one all-time total, the sessions and active days, the first and last session, and whether the work repeats daily, weekly, monthly or is a one-off. It is at /time, and Ctrl+7 opens it.',
  },
  {
    question: 'What is a standing reminder?',
    answer:
      'A reminder for the things a normal reminder is worst at — a presentation, a class, a dose, a train — where you may be standing in front of a room and cannot answer. It is stored rather than scheduled, so closing the laptop does not cancel it; it escalates rather than repeating on a stopwatch; and it keeps asking until you press Done, Snooze 10 min or Stop. There is no close cross and no timeout.',
  },
  {
    question: 'Will a standing reminder interrupt a presentation?',
    answer:
      'No. It posts a sticky desktop notification and an in-app card, and it never brings the window forward. The notification carries the same three answers as the card, so the question can be dealt with where it is, without the app covering the thing it is reminding you about.',
  },
  {
    question: 'What is the difference between pause, mute and focus mode?',
    answer:
      'A pause stops the timer, the cards and the system notifications together, and restarts only a timer it stopped. A mute changes the sound only — cards still arrive — and expires by itself, even after a restart. Focus mode hides the navigation and leaves every reminder running, because a focus session is exactly when the completion alert matters.',
  },
  {
    question: 'Does the web app count my visit?',
    answer:
      'The hosted browser build counts visits with GoatCounter, so “is anybody using this?” has an answer without DeepWork running a server. It sends the page — path, title, referrer, screen width, language and time zone — never a task, a journal entry or an identifier, and GoatCounter stores no IP address for it. Count my visits is a switch in Settings, and with it off the script is never fetched. The desktop build is never counted.',
  },
  {
    question: 'What happens if my database is damaged?',
    answer:
      'A database that is present but unreadable stops startup with a card naming the file and the reason, instead of being replaced by an empty one that looks the same. Every launch also copies the database and its write-ahead log into a backups folder beside it before migrations run, and those copies are kept rather than rotated.',
  },
  {
    question: 'Does DeepWork use AI?',
    answer:
      'No. The readings on Analytics and Time by Task are rule-based sentences and totals computed from your own rows. Same records, same reading, every time. There is no model in the loop and nothing is sent anywhere to be analysed.',
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
    body: 'No streak guilt, no artificial urgency, no upsell.',
  },
];

/** The real limitations, stated before a visitor discovers them. */
export const LIMITATIONS: readonly string[] = [
  'No cloud sync or multi-device sync — each install keeps its own local database.',
  'No team, sharing or collaboration features; it is a single-person tool.',
  'No native iOS or Android app — mobile means the web app in a browser.',
  'No external calendar sync — the Calendar is the app’s own plan of your tasks, not a CalDAV client.',
  'Windows and macOS installers are unsigned, so SmartScreen and Gatekeeper will warn on first run.',
];
