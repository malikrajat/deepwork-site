import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';

/**
 * The water reminder.
 *
 * Presented as the wellness feature it actually is. Every range below is the
 * real fixed list from `water.constants.ts` — the reminder offers choices
 * rather than a number to type — and the defaults are that file's defaults.
 * The quoted line is one of the ten in `WATER_QUOTES`.
 *
 * There are no health claims anywhere in this component on purpose. The app
 * itself says it is "a habit nudge, not medical advice", and this site repeats
 * that rather than improving on it.
 */
@Component({
  selector: 'dw-hydration',
  imports: [NgOptimizedImage, Reveal],
  templateUrl: './hydration.html',
})
export class Hydration {
  readonly shot = {
    src: 'screenshots/water-card.webp',
    width: 1104,
    height: 114,
    alt: 'The DeepWork water card: today’s intake against the daily target, the progress track, how many drinks and when the last one was, and the buttons to log a glass or undo it.',
  };

  readonly settings = [
    {
      label: 'Remind me every',
      value: '15 · 20 · 25 · 30 · 45 · 60 · 90 · 120 · 180 min',
      def: '60',
    },
    {
      label: 'One drink counts as',
      value: '30 · 50 · 70 · 90 · 100 · 150 · 200 · 250 · 300 · 400 · 500 · 750 · 1000 ml',
      def: '500 ml',
    },
    { label: 'Daily target', value: '1.5 · 2 · 2.5 · 3 L', def: '2 L' },
    {
      label: 'Working hours',
      value: 'A from and a to time — reminders fire between them',
      def: '09:00 – 18:00',
    },
  ] as const;

  readonly behaviour = [
    {
      title: 'It asks, it does not announce',
      body: 'A card appears with the glass, the day so far and two answers: “Yes, I drank …” logs it, “Not now” closes it. Nothing else dismisses it — not a timer, not a click elsewhere — so a reminder cannot be lost by standing up for a minute.',
    },
    {
      title: 'It never stacks',
      body: 'An unanswered question holds the cadence, and the next one starts counting from your answer. “Yes” at 14:00 means the next is a full interval later, not one that was already overdue.',
    },
    {
      title: 'Quiet when it should be',
      body: 'Outside your working hours it says nothing, and the dashboard tells you when it resumes. A machine that only slept gets one reminder when it wakes, never a queue of the ones it slept through.',
    },
    {
      title: 'Minimised means busy',
      body: 'Shrinking DeepWork into the mini widget is you saying you are working elsewhere. The reminder rings, counts the glass and leaves your window alone — unless you turn that off.',
    },
    {
      title: 'The clock only runs while the app does',
      body: 'Closing DeepWork pauses the cadence instead of the wall clock charging you for it, so reopening waits a full interval rather than asking the moment the window appears.',
    },
    {
      title: 'Undo, because you will double-tap',
      body: 'Each drink is a row of its own, so today’s total is a sum rather than a counter that only goes up — and the last one can be taken back.',
    },
  ] as const;

  readonly quote = 'Focus is easier when you are not quietly dehydrated.';
}
