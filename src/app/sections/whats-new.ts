import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';
import { RELEASE_NOTES } from '../core/site';

/**
 * What's new since the site last described the app.
 *
 * The page used to be written against 2.0.17. This section is the honest bridge
 * between that version and 3.0.0: the three features that earned their own
 * sections link to those sections, and everything else is a release-by-release
 * list of the changes that alter a working day. Every line is from the
 * application's CHANGELOG; the list is in `RELEASE_NOTES` so it can be checked
 * in one place.
 */
@Component({
  selector: 'dw-whats-new',
  imports: [Reveal],
  templateUrl: './whats-new.html',
})
export class WhatsNew {
  readonly notes = RELEASE_NOTES;

  readonly headlines = [
    {
      href: '#time',
      chip: 'New page',
      title: 'Time by Task',
      body: 'Every focus session grouped by the work it paid for. A daily Code review becomes one line with one total, one rhythm and one consistency figure — not thirty rows to add up.',
    },
    {
      href: '#reminders',
      chip: 'New feature',
      title: 'Standing Reminders',
      body: 'A reminder for the presentation, the class or the dose that keeps asking — on the desktop, in the app, and after a restart — until you press Done, Snooze or Stop.',
    },
    {
      href: '#quiet',
      chip: 'New controls',
      title: 'A pause that pauses everything',
      body: 'Pause, mute and focus in one panel on every surface, a mute that ends by itself, and a completion alert that can be answered without opening the window.',
    },
  ] as const;
}
