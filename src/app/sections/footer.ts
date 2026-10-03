import { Component } from '@angular/core';

import { LICENSE_SPDX, SITE, SOURCE_LABEL } from '../core/site';

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
 * It carries the two facts that are easy to lose on a long page — that the app
 * is free and where the source is — plus the honest note about licensing, which
 * belongs here rather than buried in a FAQ because it is a fact about the
 * project rather than a question about the product.
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

  readonly columns: readonly FooterColumn[] = [
    {
      heading: 'Product',
      links: [
        { label: 'Focus sessions', href: '#focus' },
        { label: 'Day planner', href: '#planner' },
        { label: 'Tasks & matrix', href: '#tasks' },
        { label: 'Habits & journal', href: '#habits' },
        { label: 'Insights', href: '#insights' },
        { label: 'Desktop app', href: '#desktop' },
        { label: 'What a Pomodoro is', href: '#learn' },
      ],
    },
    {
      heading: 'Get started',
      links: [
        { label: 'Open the web app', href: SITE.webAppUrl, external: true },
        { label: 'Download for desktop', href: SITE.latestReleaseUrl, external: true },
        { label: 'All releases', href: SITE.releasesUrl, external: true },
        { label: 'Common questions', href: '#faq' },
      ],
    },
    {
      heading: 'Project',
      links: [
        { label: 'Source on GitHub', href: SITE.repoUrl, external: true },
        { label: 'Report an issue', href: SITE.issuesUrl, external: true },
        { label: 'Changelog', href: SITE.changelogUrl, external: true },
        { label: `Built by ${SITE.author}`, href: SITE.authorUrl, external: true },
      ],
    },
  ];
}
