import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';

/**
 * How it works, in four movements.
 *
 * Deliberately procedural rather than feature-shaped: a visitor who reads only
 * this section should still be able to picture using the app. Every action
 * named here exists — quick add with its `Ctrl+N` shortcut, the matrix drag,
 * the timer, and the Analytics page.
 */
@Component({
  selector: 'dw-how-it-works',
  imports: [Reveal],
  templateUrl: './how-it-works.html',
})
export class HowItWorks {
  readonly steps = [
    {
      num: '01',
      title: 'Write it down',
      body: 'The round add button is on every page and Ctrl+N opens the same dialog. One title is enough — the deadline, priority and quadrant are already filled in with sensible answers.',
    },
    {
      num: '02',
      title: 'Decide what matters',
      body: 'Drag it into a quadrant. That single gesture is what the day planner schedules from, and what Insights measures you against later.',
    },
    {
      num: '03',
      title: 'Work in blocks',
      body: 'Start a session and the ring fills. The planner has already laid your queue onto focus blocks with breaks between them — so the next thing is decided before you sit down.',
    },
    {
      num: '04',
      title: 'Read the week',
      body: 'Analytics turns the sessions, tasks, habits and entries into numbers and sentences — where the time went, which habits held, and what your best hours actually are.',
    },
  ] as const;
}
