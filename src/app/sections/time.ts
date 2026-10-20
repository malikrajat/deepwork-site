import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';
import { TIME_CADENCES, TIME_RANGES } from '../core/site';

/**
 * Time by Task — the page that groups focus sessions by the work they paid for.
 *
 * The grouping key is the work’s title, not the task row: `time-report.util.ts`
 * normalises the title and sums the sessions under it, which is why a daily
 * routine arrives as one line. The ranges, cadences and detail-sheet contents
 * are read from that page’s model; the screenshot is the built app.
 *
 * The one number quoted in the copy (a Code review line) is an example of the
 * shape, not a claim about the visitor’s data — the site’s screenshots use the
 * demo dataset, and every figure on them is computed by the app from it.
 */
@Component({
  selector: 'dw-time',
  imports: [NgOptimizedImage, Reveal],
  templateUrl: './time.html',
})
export class Time {
  readonly shot = {
    src: 'screenshots/time-dark.webp',
    width: 1440,
    height: 900,
    alt: 'The Time by Task page: this month’s focused time, sessions, active days and tasks, a What this says reading, and Code review as one line with 56 hours 46 minutes, 170 sessions and 85 days of history.',
  };

  readonly detailShot = {
    src: 'screenshots/time-detail.webp',
    width: 1440,
    height: 900,
    alt: 'The Time by Task detail sheet for Code review: this period and all-time totals, average session, 71% consistency, a week-by-week breakdown and the recent sessions with their dates and durations.',
  };

  readonly ranges = TIME_RANGES;
  readonly cadences = TIME_CADENCES;

  readonly points = [
    {
      title: 'It groups the work, not the row',
      body: 'Code review on Monday and Code review on Tuesday become one line: one all-time total, one first session, one last, one rhythm.',
    },
    {
      title: 'It answers over months',
      body: 'Active days, sessions, average block and consistency sit beside the total, so a habit and a project do not look the same.',
    },
    {
      title: 'The shape has names',
      body: 'Repeats daily, weekly or monthly, multi-day, one-off or untasked — the rhythm is detected from the days worked, and a configured recurrence wins when there is one.',
    },
    {
      title: 'The sessions are still there',
      body: 'Open a row for the breakdown by week, the averages and the individual sessions behind the number.',
    },
    {
      title: 'Untasked time is shown',
      body: 'Time the timer recorded without a task appears as Untasked focus, with the one sentence that fixes it next time, instead of being quietly dropped.',
    },
  ] as const;

  readonly detailPoints = [
    'This period and all time, side by side.',
    'Average session length, and consistency across the days in the span.',
    'A week-by-week table of time, sessions and days.',
    'The recent sessions themselves, with their start times and durations.',
  ] as const;
}
