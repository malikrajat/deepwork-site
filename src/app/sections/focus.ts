import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';

/**
 * Focus sessions — the Pomodoro experience itself.
 *
 * Everything stated here is the application's default behaviour: the 25/5/15
 * minute sessions and four-sessions-before-a-long-break come from
 * `DEFAULT_SETTINGS`, the tone names from the `NotificationSound` type, the
 * twelve-colour alert cycle from `ALERT_COLOURS`, and the two quoted lines are
 * verbatim entries from `FOCUS_QUOTES` and `BREAK_QUOTES`.
 */
@Component({
  selector: 'dw-focus',
  imports: [NgOptimizedImage, Reveal],
  templateUrl: './focus.html',
})
export class Focus {
  readonly shot = {
    src: 'screenshots/focus-clock.webp',
    width: 762,
    height: 560,
    alt: 'The DeepWork focus clock: a circular ring around the session timer, with the session type and its controls.',
  };

  readonly sessionTypes = [
    { name: 'Focus session', length: '25 min', color: 'var(--focus)' },
    { name: 'Short break', length: '5 min', color: 'var(--break-short)' },
    { name: 'Long break', length: '15 min', color: 'var(--break-long)' },
  ] as const;

  readonly facts = [
    {
      title: 'Four sessions, then a long break',
      body: 'The cycle you would expect from Pomodoro, and every part of it is a setting: the three lengths and how many sessions come before the long one.',
    },
    {
      title: 'An alert that will not be missed',
      body: 'A finished session rings, raises a system notification, and moves both the widget and the card to the next of twelve colours — repeating until you answer it. Start, skip or stop answers it too.',
    },
    {
      title: 'Tones generated, not downloaded',
      body: 'Four choices — bell, chime, ding or none — synthesised with the Web Audio API, with the volume under your system controls and a tray mute.',
    },
    {
      title: 'A sentence, not a beep',
      body: 'Every finished session draws a different line from twenty-four written for focus and twenty-four for breaks, walked in order so the same one does not come back twice.',
    },
  ] as const;
}
