import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';
import { STRENGTHS } from '../core/site';

/**
 * Why DeepWork.
 *
 * A single panel of the things the app is genuinely good at, each traced back
 * to the repository. The list lives in `core/site.ts` so the wording is
 * maintained in one place.
 */
@Component({
  selector: 'dw-why',
  imports: [Reveal],
  templateUrl: './why.html',
})
export class Why {
  readonly strengths = STRENGTHS;
}
