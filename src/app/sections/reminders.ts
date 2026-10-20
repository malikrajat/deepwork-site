import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';
import { REMINDER_RHYTHMS } from '../core/site';

/**
 * Standing Reminders — the newest feature in the 3.0 line.
 *
 * A reminder is a stored record, not a scheduled timer: `reminder.service.ts`
 * compares `dueAt` with the wall clock on launch, which is why a closed laptop
 * is not an answer. The ladders are `RHYTHM_LADDERS`; the three exits are the
 * only buttons on the card, and the card has no close cross. The screenshot and
 * the card are the built app.
 */
@Component({
  selector: 'dw-reminders',
  imports: [NgOptimizedImage, Reveal],
  templateUrl: './reminders.html',
})
export class Reminders {
  readonly shot = {
    src: 'screenshots/reminders-dark.webp',
    width: 1440,
    height: 900,
    alt: 'The Reminders page: two standing reminders, the Presentation — Room 4 card on its third ask with Done, Snooze 10 min and Stop, and one more waiting behind it.',
  };

  readonly cardShot = {
    src: 'screenshots/reminder-card.webp',
    width: 440,
    height: 257,
    alt: 'A standing reminder card: Standing reminder · third ask, Presentation — Room 4, still standing — reminder 3, with Done, Snooze 10 min and Stop and no close cross.',
  };

  readonly rhythms = REMINDER_RHYTHMS;

  readonly points = [
    {
      title: 'It escalates, not repeats',
      body: 'A quick first nudge, then longer gaps — three, five, ten, fifteen, twenty minutes, then every thirty for Insistent. The gap is measured from the last actual ring, so a snooze cannot shorten it.',
    },
    {
      title: 'It is stored, not scheduled',
      body: 'A closed laptop is not an answer. Open the app after lunch and the morning’s reminder is still waiting, with the time it was due and the line “We kept it for you.”',
    },
    {
      title: 'One at a time',
      body: 'Two things due together are a queue, not a stack of cards to dismiss. The card says how many are waiting behind it, and answering the first brings the next forward.',
    },
    {
      title: 'Crossing is not answering',
      body: 'A notification swiped away in the middle of a call comes back after three minutes — because you were busy, not because you meant no.',
    },
    {
      title: 'It never steals the stage',
      body: 'No window jumps in front of the room. The question waits on the sticky desktop notification and in the app, which is exactly where it can be answered without interrupting the presentation it is about.',
    },
    {
      title: 'Three exits, no cross',
      body: 'Done keeps the promise. Snooze 10 min moves it on. Stop ends it honestly. Done and Stop are kept apart in the history, because one is an achievement and the other is a decision.',
    },
  ] as const;
}
