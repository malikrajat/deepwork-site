import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';

/**
 * Tasks: the board, the quick-add, recurrence, and moving work in and out of
 * the app.
 *
 * The column names and their colours are `STATUS_CONFIG`, the keyboard moves
 * (`1`/`2`/`3`, arrows, `Enter`) are documented in the README and implemented in
 * `task-board`, `Ctrl+N` opens quick add, the repeat rules are the
 * `RecurrenceConfig` shape, and the export is the 24-column CSV written by
 * `task-export.service.ts`.
 */
@Component({
  selector: 'dw-tasks',
  imports: [NgOptimizedImage, Reveal],
  templateUrl: './tasks.html',
})
export class Tasks {
  readonly shot = {
    src: 'screenshots/today-dark.webp',
    width: 1440,
    height: 900,
    alt: 'The DeepWork Today page: the same To Do, In Progress and Done board, showing only the work that belongs to today.',
  };

  readonly columns = [
    { name: 'To Do', color: 'var(--todo)' },
    { name: 'In Progress', color: 'var(--in-progress)' },
    { name: 'Done', color: 'var(--done)' },
  ] as const;

  readonly cards = [
    {
      glyph: '＋',
      title: 'Adding a task takes one field',
      body: 'The round add button floats on every page and Ctrl+N opens the same dialog. Type a title and press Add to Today — priority, deadline, quadrant and repeat are already decided, and Advanced options is there if you disagree.',
    },
    {
      glyph: '↻',
      title: 'Work that comes back',
      body: 'A task can repeat daily, weekly or monthly, on the weekdays you choose, with an end date. Recurring work arrives as its own instance, so finishing today’s does not erase next week’s.',
    },
    {
      glyph: '⇄',
      title: 'Your spreadsheet still works',
      body: 'Import .xlsx, .xlsm or .csv — with a downloadable template that documents every column — and see a validated preview before a single row is written. Repeated titles are labelled, never silently dropped.',
    },
    {
      glyph: '⇩',
      title: 'An export that opens cleanly',
      body: 'Twenty-four columns per task, quick ranges from today to all time, filters by status and priority, and an optional totals block. Written as UTF-8 with a BOM so Excel shows your accents and em dashes correctly.',
    },
  ] as const;

  readonly boardNotes = [
    'Cards are dragged between columns — the colour is the status, everywhere at once.',
    'On Tasks the board is filed by date and the sections fold away, so a long list stays readable.',
    'Today shows only today: an overdue task, one dated today, or one written today.',
    'Unfinished work carries forward by default. Turn it off and yesterday closes itself.',
  ] as const;
}
