import {
  Component,
  computed,
  DOCUMENT,
  type ElementRef,
  effect,
  inject,
  viewChild,
} from '@angular/core';

import {
  CONTACT_PAGE_URL,
  LICENSE_SPDX,
  PRIVACY_URL,
  SITE,
  SOURCE_LABEL,
  SUPPORT_URL,
  TERMS_URL,
} from '../core/site';
import { VisitorStats } from '../core/visitor-stats';

interface FooterLink {
  label: string;
  href: string;
  /** External links open in a new tab and carry `rel="noopener"`. */
  external?: boolean;
}

interface FooterColumn {
  heading: string;
  links: readonly FooterLink[];
}

/**
 * The footer.
 *
 * The product links are the ones a visitor uses to get back into the page. The
 * author card sends people to the portfolio and the newsletter rather than to
 * the source tree: the app is the thing being described, and the person behind
 * it is the thing a visitor may want next.
 *
 * It carries no availability badge. The card points at the About section, where
 * the work is described — which is the argument, and does not go stale the way a
 * status does.
 */
@Component({
  selector: 'dw-footer',
  templateUrl: './footer.html',
})
export class Footer {
  private readonly document = inject(DOCUMENT);
  private readonly statsToggle = viewChild<ElementRef<HTMLButtonElement>>('statsToggle');
  private readonly statsClose = viewChild<ElementRef<HTMLButtonElement>>('statsClose');
  private readonly counts = new Intl.NumberFormat();

  /** The panel's data, and whether it is open. Shared with the trigger below. */
  readonly stats = inject(VisitorStats);

  readonly site = SITE;
  readonly sourceLabel = SOURCE_LABEL;
  readonly hasLicense = LICENSE_SPDX !== null;
  readonly year = new Date().getFullYear();

  /**
   * The four breakdown lists, in the order the panel draws them.
   *
   * Built as one list rather than four copies of the same markup: the blocks
   * differ only in title, source signal and the sentence shown when empty.
   */
  readonly blocks = computed(() => [
    {
      title: 'Where visitors come from',
      rows: this.stats.referrers(),
      empty: 'No referrers this month.',
      note: 'Search engines, other sites, campaigns and links typed in — as GoatCounter records them.',
    },
    {
      title: 'Visitor locations',
      rows: this.stats.locations(),
      empty: 'No locations this month.',
      note: '',
    },
    {
      title: 'Browsers',
      rows: this.stats.browsers(),
      empty: 'No browsers this month.',
      note: '',
    },
    {
      title: 'Top pages',
      rows: this.stats.pages(),
      empty: 'No page views this month.',
      note: '',
    },
  ]);

  private lastFocused: HTMLElement | null = null;

  constructor() {
    /*
     * The dialog owns the viewport while it is open: the page behind it does not
     * scroll and the close button takes focus, so a keyboard visitor is inside
     * the thing that just appeared. Focus goes back to the trigger on close.
     */
    effect((onCleanup) => {
      const open = this.stats.isOpen();
      this.document.body.classList.toggle('stats-open', open);
      onCleanup(() => this.document.body.classList.remove('stats-open'));

      if (open) this.statsClose()?.nativeElement.focus();
    });
  }

  openStats(): void {
    this.lastFocused = this.document.activeElement as HTMLElement | null;
    this.stats.open();
  }

  closeStats(): void {
    if (!this.stats.isOpen()) return;

    this.stats.close();
    (this.lastFocused ?? this.statsToggle()?.nativeElement)?.focus();
  }

  /** Numbers in the visitor's own grouping, or an em dash before they arrive. */
  formatCount(value: number | null | undefined): string {
    return value == null ? '—' : this.counts.format(value);
  }

  readonly role = 'Senior Lead Software Engineer at Siemens · Frontend architect';

  /**
   * The three documents.
   *
   * They are static files beside the page rather than sections inside it — the
   * reasoning is in `core/site.ts` — so these are real URLs and every link is a
   * page load, not an anchor jump. The footer is the one place that lists them:
   * the navigation already runs to nine section links and adding three more
   * would shorten the labels it has.
   */
  readonly legal: readonly FooterLink[] = [
    { label: 'Privacy', href: PRIVACY_URL },
    { label: 'Terms', href: TERMS_URL },
    { label: 'Contact', href: CONTACT_PAGE_URL },
  ];

  readonly newsletter = {
    name: 'The Angular Insider',
    url: SITE.newsletterUrl,
    blurb: 'Angular, performance and the craft of shipping — in your inbox.',
  } as const;

  readonly columns: readonly FooterColumn[] = [
    {
      heading: 'Product',
      links: [
        { label: "What's new in 3.0", href: '#whats-new' },
        { label: 'Focus sessions', href: '#focus' },
        { label: 'Day planner', href: '#planner' },
        { label: 'Tasks & matrix', href: '#tasks' },
        { label: 'Time by Task', href: '#time' },
        { label: 'Standing reminders', href: '#reminders' },
        { label: 'Quiet controls', href: '#quiet' },
        { label: 'Habits & journal', href: '#habits' },
        { label: 'Insights', href: '#insights' },
        { label: 'How it compares', href: '#compare' },
        { label: 'Desktop app', href: '#desktop' },
        { label: 'What a Pomodoro is', href: '#learn' },
      ],
    },
    {
      heading: 'Get started',
      links: [
        { label: 'Open the web app', href: SITE.webAppUrl, external: true },
        { label: 'Download for desktop', href: SITE.latestReleaseUrl, external: true },
        { label: 'Common questions', href: '#faq' },
        { label: 'Report an issue', href: SITE.issuesUrl, external: true },
        { label: 'Support', href: SUPPORT_URL },
        { label: 'Contact', href: CONTACT_PAGE_URL },
      ],
    },
    {
      heading: 'Elsewhere',
      links: [
        { label: 'Portfolio — rajatmalik.dev', href: SITE.authorUrl, external: true },
        { label: 'npm libraries', href: SITE.npmUrl, external: true },
        { label: 'JsSandbox', href: SITE.jsSandboxUrl, external: true },
        { label: 'Medium articles', href: SITE.mediumUrl, external: true },
        { label: 'DEV articles', href: SITE.devToUrl, external: true },
        { label: 'LinkedIn', href: SITE.linkedinUrl, external: true },
      ],
    },
  ];
}
