import { Component } from '@angular/core';

import { CONTACT_URL, LICENSE_SPDX, SITE, SOURCE_LABEL, SUPPORT_URL } from '../core/site';

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
  readonly site = SITE;
  readonly sourceLabel = SOURCE_LABEL;
  readonly hasLicense = LICENSE_SPDX !== null;
  readonly year = new Date().getFullYear();

  readonly role = 'Senior Lead Software Engineer at Siemens · Frontend architect';

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
        { label: 'Contact', href: CONTACT_URL },
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
