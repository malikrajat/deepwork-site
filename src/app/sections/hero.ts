import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

import { SITE, SOURCE_LABEL } from '../core/site';

/**
 * The first screen.
 *
 * The job of this component is to answer four questions before a visitor
 * scrolls: what it is, what it is not, what it costs, and where the data goes.
 * Everything else on the page is detail.
 *
 * The mockup is a real screenshot of the real application inside a browser
 * frame — not a redrawn illustration — and it is the only image on the page
 * that is loaded eagerly. It is also deliberately never animated from zero
 * opacity: it is the largest paint on the page, so animating it in would delay
 * the one measurement the site is trying to protect.
 */
@Component({
  selector: 'dw-hero',
  imports: [NgOptimizedImage],
  templateUrl: './hero.html',
})
export class Hero {
  readonly site = SITE;
  readonly sourceLabel = SOURCE_LABEL;

  /** The dashboard capture is 1440x900; the frame keeps that ratio. */
  readonly shot = {
    src: 'screenshots/dashboard-dark.webp',
    width: 1440,
    height: 900,
    alt: 'The DeepWork dashboard: a focus clock mid-session, today’s tasks, and cards for the current cycle, the day’s plan and today’s water intake.',
  };

  readonly facts = [
    'Windows · macOS · Linux · any browser',
    'No account, no cloud',
    'Works offline',
  ] as const;
}
