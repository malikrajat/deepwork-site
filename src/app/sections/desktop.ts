import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';
import { PLATFORMS } from '../core/site';

/**
 * The desktop application.
 *
 * What a browser cannot do, and what the desktop build adds: the three
 * switches, the tray behaviour, the mini widget's dimensions and its alert
 * palette are all `desktop-prefs.service.ts` / `README.md` facts, and the
 * updater behaviour is `update.service.ts` plus the native update layer.
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
      state: 'Asked once',
      body: 'A full dialog on first launch offers to start DeepWork when you sign in, leading with what that is worth. No installer writes a startup entry — you ask for it, in the app — and an install whose entry already exists never sees the question.',
    },
    {
      name: 'Always on top',
      state: 'Off by default',
      body: 'Keeps the window above everything else, so the timer stays visible while you work in another application. The flag is read back from the window and re-asserted when another application, a display change or a fullscreen window takes the spot away.',
    },
    {
      name: 'Keep running in the tray',
      state: 'On by default',
      body: 'The window’s close button puts DeepWork next to the clock instead of ending it, so a session can finish and ring while the window is hidden. Exit in the tray menu is how you really quit.',
    },
  ] as const;

  readonly tray = [
    'New task opens quick-add from wherever the app is — expanding the widget first, because a 136×76 frame cannot hold a form.',
    'Settings brings the full window up on the right page.',
    'Pause offers 5, 10, 15 or 30 minutes, and Resume restarts only a timer the pause itself had stopped.',
    'The mute moved into a submenu of its own lengths: 30 minutes, an hour, four hours or the rest of today.',
    'Start with system and Always on top stay beside Exit, where they always were.',
  ] as const;

  readonly launch = [
    'The taskbar reminder asks the shell whether programmatic pinning is allowed before it offers anything.',
    'Where the request would be accepted, Yes raises Windows’ own confirmation.',
    'Where it would not — the usual unpackaged case — the button becomes Yes, show me and opens the installed-app list, where right-clicking DeepWork offers Pin to taskbar.',
    'The taskbar is re-read before every reminder and after every answer, so “already pinned” silences the feature instead of nagging through it.',
    'It is Windows-only and reports itself as unsupported elsewhere, because a reminder whose answer can never be observed should not exist.',
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
