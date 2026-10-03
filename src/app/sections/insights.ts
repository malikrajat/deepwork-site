import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';
import { METRICS } from '../core/site';

/**
 * Insights.
 *
 * The framing here is careful and deliberate, because it is the one place where
 * a competitor would reach for the word "AI". There is no model in DeepWork:
 * `core/utils/insights.util.ts` computes sentences from the user's own rows —
 * streaks, averages, a best and a weakest habit, days journalled against days
 * not — and this section says exactly that. The claim is smaller and true,
 * which is the better trade.
 */
@Component({
  selector: 'dw-insights',
  imports: [NgOptimizedImage, Reveal],
  templateUrl: './insights.html',
})
export class Insights {
  readonly metrics = METRICS;

  readonly shot = {
    src: 'screenshots/analytics-dark.webp',
    width: 1440,
    height: 900,
    alt: 'The DeepWork Analytics page: key figures with trends, a 12-week focus heatmap, focus by hour and by weekday, task flow, habit consistency and journalling charts.',
  };

  /** Real readings of the kind the app writes — phrased as the app phrases them. */
  readonly readings = [
    'You have focused 5 days in a row — the habit is doing the work.',
    'Best habit: Reading at 82% over 30 days (11-day streak).',
    'Focus is longest between 09:00 and 11:00 — 34% of all your focus.',
    'Focus averages 96m on the days you wrote, against 61m on the days you did not.',
  ] as const;
}
