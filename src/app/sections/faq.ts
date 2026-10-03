import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';
import { FAQ, SITE } from '../core/site';

/**
 * Common questions.
 *
 * Built on `<details>`/`<summary>`, which means it needs no JavaScript, is
 * reachable by keyboard and is announced correctly by a screen reader — the
 * three things a hand-rolled accordion usually gets wrong. Each answer is a
 * real answer, including the ones about what the app deliberately does not do.
 *
 * The whole set lives in `core/site.ts` so an answer can be corrected without
 * touching markup.
 */
@Component({
  selector: 'dw-faq',
  imports: [Reveal],
  templateUrl: './faq.html',
})
export class Faq {
  readonly items = FAQ;
  readonly site = SITE;
}
