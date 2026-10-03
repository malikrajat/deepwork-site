import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';

/**
 * Habits and the journal — the two surfaces that answer "is this working?"
 * rather than "what am I doing?".
 *
 * The habit numbers are real fields (`currentStreak`, `bestStreak`,
 * `completionPercent`, `totalCompletions`, a 30-day strip), and the journal
 * numbers are the ones `journal.component.ts` actually computes: days written,
 * words all-time, average per entry, current and best streak, 30-day
 * consistency. The prompts quoted below are verbatim from that component.
 */
@Component({
  selector: 'dw-habits',
  imports: [NgOptimizedImage, Reveal],
  templateUrl: './habits.html',
})
export class Habits {
  readonly habitsShot = {
    src: 'screenshots/habits-dark.webp',
    width: 1440,
    height: 900,
    alt: 'The DeepWork Habits page: habit cards with a check-in button, a day streak, a best streak, a completion percentage and a 30-day strip of check-ins.',
  };

  readonly journalShot = {
    src: 'screenshots/journal-dark.webp',
    width: 1440,
    height: 900,
    alt: 'The DeepWork Journal page: a dated entry editor beside writing statistics — days written, words all-time, average per entry and streaks.',
  };

  readonly habitPoints = [
    'Add a habit with a name and an icon — nothing else is asked for.',
    'Check in with one press; the streak, the best run and the all-time count follow you.',
    'A 30-day strip shows exactly which days you missed, not just the percentage.',
    'A habit below 40% is marked as slipping, in the app’s own words.',
    'Insights turns the same check-ins into a 30-day consistency chart.',
  ] as const;

  readonly journalPoints = [
    'One entry per day, dated, saved as you type — with Ctrl+S when you want to be sure.',
    'Writing prompts if the blank page is the problem.',
    'Days written, words all-time, average entry and the current and best streak.',
    'Journal-wide consistency for the last 30 days.',
    'The one comparison worth making: how your focus differs on the days you wrote.',
  ] as const;

  readonly prompt = 'What went well today?\nWhat could be improved?\nWhat are you grateful for?';
}
