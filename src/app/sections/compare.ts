import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';
import { COMPARISON } from '../core/site';

/**
 * How DeepWork differs from the common shape of a Pomodoro app.
 *
 * Not a comparison against a named competitor: it describes the category's
 * ordinary behaviour and what this app does instead. Every cell on the DeepWork
 * side is implemented in the repository; the sentence under the table says that
 * the other side is a shape, not a product.
 */
@Component({
  selector: 'dw-compare',
  imports: [Reveal],
  templateUrl: './compare.html',
})
export class Compare {
  readonly rows = COMPARISON;
}
