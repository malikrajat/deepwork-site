import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';
import { METRICS } from '../core/site';

/**
 * Insights.
 *
 * The analysis is an offline AI layer: it runs on the visitor's own machine,
 * reads the user's sessions, tasks, habits and journal entries, and turns them
 * into plain-language readings. Nothing is uploaded and there is no remote
 * model in the loop, which is why the section leads with "on your machine".
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
