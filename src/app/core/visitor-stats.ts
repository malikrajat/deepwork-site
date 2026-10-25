import { Service, signal } from '@angular/core';

import { GOATCOUNTER } from './analytics';

/** The four numbers across the top of the panel. `null` means "not read yet". */
export interface VisitorTotals {
  pageviews: number | null;
  visitors: number | null;
  today: number | null;
  month: number | null;
}

/** One bar in a breakdown list. `percent` is relative to the busiest row. */
export interface VisitorRow {
  label: string;
  sub: string;
  count: number;
  percent: number;
}

/** The shape `/api/v0/stats/total` answers with, narrowed to what is read. */
interface TotalResponse {
  stats?: { daily?: number }[];
}

/** `toprefs`, `locations` and `browsers` all answer with a `stats` list. */
interface RowsResponse {
  stats?: { name?: string; count?: number; ref_scheme?: string }[];
}

/** `hits` answers with a `hits` list instead. */
interface HitsResponse {
  hits?: { path?: string; title?: string; count?: number }[];
}

interface CounterResponse {
  count?: string;
  count_unique?: string;
}

interface RowLike {
  name?: string;
  count?: number;
  ref_scheme?: string;
}

/* --------------------------------------------------------------------------
 * Rate limiting
 * --------------------------------------------------------------------------
 * GoatCounter allows four API requests a second per visitor IP, and every
 * authenticated call costs a CORS preflight as well as the GET. Firing the five
 * calls at once is what produced the 429s the portfolio had to fix, so they go
 * out one at a time, a second apart. A 429 is retried rather than discarded.
 * ------------------------------------------------------------------------ */
const API_GAP_MS = 1000;
const API_RETRIES = 3;
const CACHE_MS = 60_000;

let queue: Promise<unknown> = Promise.resolve();
let lastCallAt = 0;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryDelay(response: Response): Promise<number> {
  const header = Number(response.headers.get('Retry-After'));
  if (Number.isFinite(header) && header > 0) return Math.min(header * 1000, 5000);

  try {
    const match = /try again in\s+([0-9.]+)\s*ms/i.exec(await response.clone().text());
    return match ? Math.min(Number.parseFloat(match[1]) + 100, 5000) : 500;
  } catch {
    return 500;
  }
}

async function request<T>(url: URL, attempt: number): Promise<T> {
  lastCallAt = Date.now();

  const response = await fetch(url, {
    // No Content-Type: a GET carries no body, and a smaller preflight is cheaper.
    headers: { Authorization: `Bearer ${GOATCOUNTER.token}` },
    cache: 'no-store',
  });

  if (response.status === 429 && attempt < API_RETRIES) {
    // Never retry faster than the normal spacing: the reset window is shared.
    await sleep(Math.max(await retryDelay(response), API_GAP_MS));
    return request<T>(url, attempt + 1);
  }

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as T;
}

/** Queues every call behind the previous one, so a batch stays under the limit. */
function apiGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${GOATCOUNTER.apiBase}/${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  const call = queue.then(async () => {
    const wait = Math.max(0, API_GAP_MS - (Date.now() - lastCallAt));
    if (wait > 0) await sleep(wait);
    return request<T>(url, 0);
  });

  // The queue has to absorb a rejection, or one failure skips every later call.
  queue = call.catch(() => undefined);
  return call;
}

/* --------------------------------------------------------------------------
 * Dates — the site is set to UTC in GoatCounter, so "today" is the UTC day.
 * ------------------------------------------------------------------------ */
function startOfMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

function endOfToday(): string {
  // GoatCounter accepts an RFC3339 instant and rejects a space separator.
  return `${new Date().toISOString().slice(0, 10)}T23:59:59Z`;
}

/* --------------------------------------------------------------------------
 * Rows
 * ------------------------------------------------------------------------ */

/** Friendly names for the referrers people actually arrive from. */
const SOURCE_LABELS: readonly (readonly [RegExp, string])[] = [
  [/linkedin/i, 'LinkedIn'],
  [/google/i, 'Google'],
  [/bing|duckduckgo|yahoo|yandex|ecosia|search/i, 'Search engines'],
  [/github/i, 'GitHub'],
  [/medium/i, 'Medium'],
  [/dev\.to/i, 'DEV Community'],
  [/twitter|x\.com/i, 'X (Twitter)'],
  [/facebook|meta/i, 'Facebook'],
  [/instagram/i, 'Instagram'],
  [/whatsapp/i, 'WhatsApp'],
  [/telegram/i, 'Telegram'],
  [/reddit/i, 'Reddit'],
];

function describeSource(
  name: string | undefined,
  scheme: string | undefined,
): Omit<VisitorRow, 'count' | 'percent'> {
  const raw = (name ?? '').trim();

  if (scheme === 'c') return { label: raw || 'Campaign link', sub: 'campaign' };
  if (!raw || /^\(direct\)$/i.test(raw) || /^direct$/i.test(raw)) {
    return { label: 'Direct / typed', sub: 'no referrer' };
  }

  for (const [pattern, label] of SOURCE_LABELS) {
    if (!pattern.test(raw)) continue;
    // Do not print the same word twice: "LinkedIn" over "linkedin.com" is noise.
    return {
      label,
      sub: label.toLowerCase() === raw.toLowerCase() ? '' : raw.replace(/^www\./, ''),
    };
  }

  return { label: raw.replace(/^www\./, ''), sub: 'referring site' };
}

function withPercent(
  items: readonly { label: string; sub: string; count: number }[],
): VisitorRow[] {
  const max = items.reduce((highest, item) => Math.max(highest, item.count), 0) || 1;
  return items.map((item) => ({ ...item, percent: Math.round((item.count / max) * 100) }));
}

function toRows(
  rows: readonly RowLike[],
  describe: (row: RowLike) => { label: string; sub: string },
): VisitorRow[] {
  return withPercent(
    rows
      .map((row) => ({ row, count: Number(row.count) || 0 }))
      .filter(({ count }) => count > 0)
      .map(({ row, count }) => ({ ...describe(row), count })),
  );
}

function toPageRows(
  hits: readonly { path?: string; title?: string; count?: number }[],
): VisitorRow[] {
  return withPercent(
    hits
      .map((hit) => ({
        label: hit.path || hit.title || '/',
        sub: hit.title && hit.title !== hit.path ? hit.title : '',
        count: Number(hit.count) || 0,
      }))
      .filter(({ count }) => count > 0),
  );
}

function numberFromCounter(value: string | undefined): number {
  const digits = (value ?? '').replace(/[^0-9]/g, '');
  const number = Number(digits);
  return Number.isFinite(number) ? number : 0;
}

async function publicTotals(): Promise<{ pageviews: number; visitors: number } | null> {
  try {
    const response = await fetch(`${GOATCOUNTER.origin}/counter/TOTAL.json`, { cache: 'no-store' });
    if (!response.ok) return null;

    const data = (await response.json()) as CounterResponse;
    return {
      pageviews: numberFromCounter(data.count),
      visitors: numberFromCounter(data.count_unique),
    };
  } catch {
    return null;
  }
}

/**
 * The numbers behind the footer's Site stats panel.
 *
 * `open()` reads them; closing does not discard them, because re-opening the
 * panel a second later should not cost five API calls. Nothing is fetched on
 * page load: a visitor who never opens the panel never causes a request.
 */
@Service()
export class VisitorStats {
  readonly isOpen = signal(false);
  readonly totals = signal<VisitorTotals | null>(null);
  readonly referrers = signal<VisitorRow[] | null>(null);
  readonly locations = signal<VisitorRow[] | null>(null);
  readonly browsers = signal<VisitorRow[] | null>(null);
  readonly pages = signal<VisitorRow[] | null>(null);
  readonly note = signal('Reading GoatCounter…');
  readonly breakdownsFailed = signal(false);
  readonly dashboardUrl = GOATCOUNTER.origin;

  private loading: Promise<void> | null = null;
  private loadedAt = 0;
  private totalsFailed = false;

  open(): void {
    this.isOpen.set(true);
    void this.refresh();
  }

  close(): void {
    this.isOpen.set(false);
  }

  private refresh(): Promise<void> {
    if (this.loading) return this.loading;
    if (this.loadedAt > 0 && Date.now() - this.loadedAt < CACHE_MS) return Promise.resolve();

    this.note.set('Reading GoatCounter…');
    this.loading = this.load()
      .catch(() => {
        // Only reachable if something above throws rather than failing softly.
        // Without this the panel would sit on "Reading…" with no way to tell.
        this.totalsFailed = true;
        this.note.set('GoatCounter did not answer — open the dashboard for the numbers.');
      })
      .finally(() => {
        this.loading = null;
        this.loadedAt = Date.now();
      });

    return this.loading;
  }

  private async load(): Promise<void> {
    await this.loadTotals();
    // The totals take one call; the breakdowns take four more, one a second.
    // Say the totals are in rather than leaving "Reading…" over visible numbers.
    if (!this.totalsFailed) this.note.set('Totals are live — reading the breakdowns…');

    await this.loadBreakdowns();

    if (this.totalsFailed) {
      this.note.set('GoatCounter did not answer — open the dashboard for the numbers.');
    } else if (this.breakdownsFailed()) {
      this.note.set('Totals are live; the breakdowns could not be read.');
    } else {
      this.note.set('Live from GoatCounter — this site’s own numbers for the current month.');
    }
  }

  private async loadTotals(): Promise<void> {
    const [counter, month] = await Promise.all([
      publicTotals(),
      apiGet<TotalResponse>('stats/total', { start: startOfMonth(), end: endOfToday() }).catch(
        () => null,
      ),
    ]);

    const days = month?.stats ?? [];
    const monthTotal = days.length
      ? days.reduce((sum, day) => sum + (Number(day.daily) || 0), 0)
      : null;

    this.totalsFailed = counter === null && month === null;
    this.totals.set({
      pageviews: counter?.pageviews ?? null,
      visitors: counter?.visitors ?? null,
      today: days.length ? Number(days[days.length - 1]?.daily) || 0 : null,
      month: monthTotal,
    });
  }

  private async loadBreakdowns(): Promise<void> {
    const range = { start: startOfMonth(), end: endOfToday() };
    let failures = 0;

    const apply = <T>(promise: Promise<T>, set: (data: T) => void, clear: () => void) =>
      promise.then(set).catch(() => {
        failures += 1;
        clear();
      });

    await Promise.all([
      apply(
        apiGet<RowsResponse>('stats/toprefs', { ...range, limit: '8' }),
        (data) =>
          this.referrers.set(
            toRows(data.stats ?? [], (row) => describeSource(row.name, row.ref_scheme)),
          ),
        () => this.referrers.set([]),
      ),
      apply(
        apiGet<RowsResponse>('stats/locations', { ...range, limit: '8' }),
        (data) =>
          this.locations.set(
            toRows(data.stats ?? [], (row) => ({ label: row.name || 'Unknown', sub: '' })),
          ),
        () => this.locations.set([]),
      ),
      apply(
        apiGet<RowsResponse>('stats/browsers', { ...range, limit: '8' }),
        (data) =>
          this.browsers.set(
            toRows(data.stats ?? [], (row) => ({ label: row.name || 'Unknown', sub: '' })),
          ),
        () => this.browsers.set([]),
      ),
      apply(
        apiGet<HitsResponse>('stats/hits', { ...range, limit: '5' }),
        (data) => this.pages.set(toPageRows(data.hits ?? [])),
        () => this.pages.set([]),
      ),
    ]);

    this.breakdownsFailed.set(failures > 0);
  }
}
