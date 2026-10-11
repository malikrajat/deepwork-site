import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';
import { DISPLAY_SIZES, INPUT_NOTES } from '../core/site';

/**
 * One application on every screen.
 *
 * This section exists because the app is genuinely engineered for the shape of
 * the window rather than merely shrunk into it, and none of that work was
 * visible anywhere on the page. Every breakpoint below is a number the
 * application declares — see `DISPLAY_SIZES` in `core/site.ts` for the file each
 * one came from.
 *
 * Two things this section deliberately does not say. It does not claim anybody
 * has tested it on your device, because that is not knowable from here. And it
 * does not offer a phone app: the mobile experience is the web app in a
 * browser, and the limitations list in the "Why DeepWork" section still says so.
 */
@Component({
  selector: 'dw-devices',
  imports: [Reveal],
  templateUrl: './devices.html',
})
export class Devices {
  readonly sizes = DISPLAY_SIZES;

  /** The two halves of the input story, named the way the app names them. */
  readonly touch = INPUT_NOTES.touch;
  readonly keyboard = INPUT_NOTES.keyboard;
}
