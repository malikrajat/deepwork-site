import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';
import { PLATFORMS } from '../core/site';

/**
 * The desktop application.
 *
 * What a browser cannot do, and what the Tauri build does instead. The three
 * switches, the tray behaviour, the mini widget's dimensions and its alert
 * palette are all `desktop-prefs.service.ts` / `README.md` facts, and the
 * updater behaviour is `update.service.ts` plus `src-tauri/src/updates.rs`.
 *
 * The signing caveat is stated here rather than hidden, because a visitor will
 * meet it within thirty seconds of running the installer and a site that did
 * not mention it would have spent its credibility by then.
 */
@Component({
  selector: 'dw-desktop',
  imports: [NgOptimizedImage, Reveal],
  templateUrl: './desktop.html',
})
export class Desktop {
  readonly shot = {
    src: 'screenshots/settings-dark.webp',
    width: 1440,
    height: 900,
    alt: 'DeepWork Settings: focus session lengths, notification sound and repeat interval, water reminder options, desktop behaviour switches, theme and log tools.',
  };

  readonly switches = [
    {
      name: 'Start with system',
      state: 'Off by default',
      body: 'Launches when you sign in and opens normally without stealing focus from whatever you were doing. No installer writes a startup entry — you ask for it, in the app.',
    },
    {
      name: 'Always on top',
      state: 'Off by default',
      body: 'Keeps the window above everything else, so the timer stays visible while you work in another application.',
    },
    {
      name: 'Keep running in the tray',
      state: 'On by default',
      body: 'The window’s close button puts DeepWork next to the clock instead of ending it, so a session can finish and ring while the window is hidden. Exit in the tray menu is how you really quit.',
    },
  ] as const;

  readonly widget = [
    'A 136×76 floating widget with genuinely transparent, rounded corners — the desktop shows through them.',
    'Draggable anywhere, always above other windows, with play, skip and stop that work without expanding it.',
    'The same countdown ring as the full window, filling in the same direction at the same speed.',
    'When a session ends it becomes a bell: one press answers the alert and leaves the timer where it was.',
    'On a repeat it shakes — for a length you choose, from 0.7 s to 4 s — and moves to the next of twelve colours.',
    'Esc, or the arrow, restores the full window at its original size, fitted to the screen it lands on.',
  ] as const;

  readonly platforms = PLATFORMS;
}
