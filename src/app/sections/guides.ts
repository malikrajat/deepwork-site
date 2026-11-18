import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';
import { GUIDES, GUIDES_URL } from '../core/site';

/**
 * The guides.
 *
 * The one section on this page that is not about DeepWork. It exists because a
 * product page answers "what does this do?" and most people arrive with a
 * different question — what a Pomodoro actually is, how long a session should
 * be, where the data ought to live. Those are answered in full on their own
 * pages, and this is the way into them from here.
 *
 * The cards are a list of links rather than a second copy of the guides: the
 * page should not compete with the pages it is pointing at, and a crawler
 * should find eight internal links, not eight summaries of the same text.
 */
@Component({
  selector: 'dw-guides',
  imports: [Reveal],
  templateUrl: './guides.html',
})
export class Guides {
  readonly guides = GUIDES;
  readonly guidesUrl = GUIDES_URL;
}
