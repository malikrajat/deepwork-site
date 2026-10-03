import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';

/**
 * The reframe.
 *
 * The single hardest thing to communicate about this product is that the timer
 * is the smallest part of it. So this section does not describe features at
 * all — it lists the surfaces the app actually has, and lets the count make the
 * argument.
 *
 * Every entry below is a page or a system that exists in the repository:
 * `/tasks`, `/today`, `/matrix`, `/calendar`, `/habits`, `/journal`,
 * `/analytics`, `/settings`, plus the water reminder, the import/export
 * services and the SQLite store.
 */
@Component({
  selector: 'dw-beyond',
  imports: [Reveal],
  templateUrl: './beyond.html',
})
export class Beyond {
  readonly modules = [
    { name: 'Focus sessions', note: 'The Pomodoro timer' },
    { name: 'Day planner', note: 'A timeline that schedules your tasks' },
    { name: 'Tasks', note: 'Board, dates and deadlines' },
    { name: 'Eisenhower matrix', note: 'Four quadrants, drag to prioritise' },
    { name: 'Today', note: 'Only the work that belongs to today' },
    { name: 'Habits', note: 'Check in, keep a streak' },
    { name: 'Journal', note: 'A dated entry per day' },
    { name: 'Water reminder', note: 'Asks, counts, and stays quiet outside your hours' },
    { name: 'Insights', note: 'Your own numbers, read back to you' },
    { name: 'Import & export', note: 'Excel and CSV in, CSV out' },
    { name: 'Desktop behaviour', note: 'Tray, mini widget, always on top' },
    { name: 'Local database', note: 'One SQLite file, on your machine' },
  ] as const;
}
