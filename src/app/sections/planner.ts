import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';

/**
 * The day planner.
 *
 * This is the feature most visitors will not expect, so the section leads with
 * what it does rather than what it is called. The behaviour described is the
 * schedule engine in the repository: tasks queued by quadrant, laid onto
 * pomodoro-length focus blocks with breaks reserved after them, manual pinning
 * to a time, tasks that continue across blocks, the `Fit day` action, the
 * 5-minute snap, and the day's own totals.
 */
@Component({
  selector: 'dw-planner',
  imports: [NgOptimizedImage, Reveal],
  templateUrl: './planner.html',
})
export class Planner {
  readonly shot = {
    src: 'screenshots/calendar-dark.webp',
    width: 1440,
    height: 900,
    alt: 'The DeepWork Calendar: a day timeline of focus blocks and breaks, a week strip showing each day’s tasks, and the priority queue grouped by quadrant.',
  };

  readonly points = [
    {
      title: 'It does the arithmetic',
      body: 'Your queued tasks become focus blocks on a real timeline, with breaks already reserved between them. You see the day you have, not the day you hoped for.',
    },
    {
      title: 'Priority decides the order',
      body: 'Work is queued by Eisenhower quadrant, then by the order you put it in. The first thing on the timeline is the thing you said mattered.',
    },
    {
      title: 'Pin it, and the plan bends',
      body: 'Drag a task onto a time and it stays there. A task can span several blocks, and a block can hold more than one task if you put them there yourself.',
    },
    {
      title: 'Fit day',
      body: 'When the queue does not fit the window, one button extends the day until everything has a place — or tells you honestly that it still does not.',
    },
    {
      title: 'A day that ends',
      body: 'The day window is yours to set. Outside it, DeepWork is not pretending you are working.',
    },
    {
      title: 'Totals for the day',
      body: 'Focus minutes, break minutes, pomodoros, breaks and tasks — the shape of the day, before you have to remember it.',
    },
  ] as const;

  readonly totals = [
    { label: 'Focus minutes', value: '115' },
    { label: 'Break minutes', value: '25' },
    { label: 'Pomodoros', value: '5' },
    { label: 'Tasks placed', value: '6' },
  ] as const;
}
