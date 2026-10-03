import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';
import { SITE } from '../core/site';

/**
 * The method behind the product.
 *
 * This section exists for a different reason from every other section on the
 * page, and it is worth being explicit about which one. Everything else here
 * answers "what does DeepWork do?". This answers "what is the Pomodoro
 * Technique, and how do I actually run a day of focused work?" — questions
 * people type into a search engine before they have ever heard of this app, and
 * which no product page normally answers.
 *
 * Two rules keep it honest:
 *
 * 1. **The method is described as a method, not as a finding.** There are no
 *    claims about what a study proved, no percentages, and no promises about
 *    productivity. The Pomodoro Technique is a convention that many people find
 *    workable; this page says that and no more.
 * 2. **The app's own numbers are the real ones**, read from `DEFAULT_SETTINGS`:
 *    25 minutes, a 5-minute short break, a 15-minute long break after four
 *    sessions, all four configurable.
 *
 * The technique is attributed to the person who described it. DeepWork is an
 * independent implementation of the idea and says so, because a page that
 * quietly implies an endorsement is a page that has stopped being trustworthy.
 */
@Component({
  selector: 'dw-learn',
  imports: [Reveal],
  templateUrl: './learn.html',
})
export class Learn {
  readonly site = SITE;

  /** The method as it is usually described — five steps, no embellishment. */
  readonly method = [
    {
      title: 'Choose one thing',
      body: 'Not a project and not a list. One thing you could plausibly finish, or make real progress on, in a single sitting.',
    },
    {
      title: 'Set twenty-five minutes',
      body: 'The number is a starting point rather than a rule, and it is the one thing about the technique people most often change.',
    },
    {
      title: 'Work only on that',
      body: 'When something else arrives — a message, a thought, a job for later — write it down and go back to the one thing. The writing-down is what makes going back possible.',
    },
    {
      title: 'Stop when it rings',
      body: 'Take five minutes away from the screen. The break is part of the sitting, not a reward for it, and skipping it is how the third hour becomes worse than the first.',
    },
    {
      title: 'Every fourth one, stop for longer',
      body: 'After four sessions, take a proper break — fifteen to thirty minutes. That is the shape of a morning, not a sprint.',
    },
  ] as const;

  /** What the app actually does, with the real defaults. */
  readonly implementation = [
    { label: 'Focus session', value: '25 minutes' },
    { label: 'Short break', value: '5 minutes' },
    { label: 'Long break', value: '15 minutes, after 4 sessions' },
    { label: 'All four', value: 'configurable in Settings' },
  ] as const;

  readonly practice = [
    {
      title: 'Why the size of the block matters more than the number',
      body: 'A block has to be short enough that starting it is not a decision, and long enough to get somewhere. Twenty-five minutes is a common starting point; what makes the method work is not the number but the three things around it — one task per block, a defined end, and a break you actually take. If twenty-five is wrong for the work in front of you, change it and keep the shape.',
    },
    {
      title: 'Plan the day in blocks, not in hours',
      body: 'An hour is not a unit of work; it is a unit of clock. A block is a unit of attention, which is why DeepWork plans with them. Decide what matters first, let the planner place it into focus blocks with breaks already reserved, and then look at the shape of the day you have made. When it does not fit, that is information rather than failure — Fit day will tell you how much longer the day would have to be.',
    },
  ] as const;
}
