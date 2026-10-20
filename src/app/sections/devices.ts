import { NgOptimizedImage } from '@angular/common';
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
  imports: [NgOptimizedImage, Reveal],
  templateUrl: './devices.html',
})
export class Devices {
  readonly sizes = DISPLAY_SIZES;

  /** The two halves of the input story, named the way the app names them. */
  readonly touch = INPUT_NOTES.touch;
  readonly keyboard = INPUT_NOTES.keyboard;

  readonly installShot = {
    src: 'screenshots/install-dark.webp',
    width: 1440,
    height: 900,
    alt: 'The Install DeepWork dialog in a browser tab: its own window and icon, offline use, the one install route this browser has, and the line “Nothing leaves this device.”',
  };

  readonly installPoints = [
    'In a browser tab, one bar explains the one install route this browser actually has — Chromium’s address bar, Safari’s File menu, a phone’s Share sheet, or the honest “this browser cannot”.',
    'The system suggestion is offered once a week at most, and only when notifications are already permitted, so it never nags through a permission it cannot use.',
    'Installed, the app asks once whether to open with the computer and shows exactly where that setting lives on Windows, macOS and Linux — because a web app is not allowed to write a login item.',
    'Where the browser supports Document Picture-in-Picture, the installed app offers a small floating timer that stays above other windows.',
  ] as const;
}
