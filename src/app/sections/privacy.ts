import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';

/**
 * Your data — the local-first argument.
 *
 * This is the section that has to be true rather than persuasive, so it makes
 * the smallest defensible claim: the app keeps everything in a local SQLite
 * file, and the network requests it makes are enumerated rather than waved at.
 * The three that exist are the GitHub release check in `update.service.ts`
 * (which reads a public list and reports nothing back, cached for six hours),
 * the code-signed downloads that only happen when the visitor presses Update,
 * and nothing else.
 *
 * The light-theme screenshot sits here on purpose: it is also how the site
 * shows that the app has two fully-designed themes rather than an inverted one.
 */
@Component({
  selector: 'dw-privacy',
  imports: [NgOptimizedImage, Reveal],
  templateUrl: './privacy.html',
})
export class Privacy {
  readonly shot = {
    src: 'screenshots/dashboard-light.webp',
    width: 1440,
    height: 900,
    alt: 'The DeepWork dashboard in its light theme: the same focus clock, tasks and cards, drawn on light surfaces.',
  };

  readonly promises = [
    {
      glyph: '⛁',
      title: 'One SQLite file',
      body: 'Tasks, sessions, habits, journal entries, water and settings live in a local database. There is no server to sync with, because there is no server.',
    },
    {
      glyph: '⌀',
      title: 'No account, ever',
      body: 'Nothing to sign up for, nothing to sign in to, and no email address collected — there is no mechanism to collect one.',
    },
    {
      glyph: '⇅',
      title: 'One read-only request',
      body: 'The update check reads the public GitHub release list for the app you are running. It sends nothing about you, it is cached for six hours, and it never delays the window.',
    },
    {
      glyph: '⇪',
      title: 'A real exit',
      body: 'Export the whole task list to CSV — 24 columns, your date range, your filters. Your data leaves in a format you can open in Excel, not in a format only this app reads.',
    },
  ] as const;

  readonly logs = [
    'deepwork.log — everything, in order',
    'system.log — app, window, tray and OS events',
    'flow.log — pages, timer, imports and exports',
    'crash.log — panics, unhandled errors and Angular errors',
    'network.log — failed requests, going offline and back',
  ] as const;

  readonly themes = ['Dark, light, or follow the system'] as const;
}
