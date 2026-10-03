import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';
import { LIMITATIONS, STRENGTHS } from '../core/site';

/**
 * Why DeepWork — and what is wrong with it.
 *
 * The limitations panel is not a legal disclaimer and it is not false modesty:
 * a visitor who reads it and still starts using the app is a visitor who will
 * not be disappointed in a week. Both lists live in `core/site.ts` so the
 * wording is maintained in one place.
 */
@Component({
  selector: 'dw-why',
  imports: [Reveal],
  templateUrl: './why.html',
})
export class Why {
  readonly strengths = STRENGTHS;
  readonly limitations = LIMITATIONS;
}
