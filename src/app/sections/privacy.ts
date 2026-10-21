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
 * the installer downloads that only happen when the visitor presses Update,
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
      title: 'One SQLite file, copied before it is touched',
      body: 'Tasks, sessions, habits, journal entries, water and settings live in a local database. Every launch copies it and its write-ahead log into a backups folder before migrations run, and a database that is there but unreadable stops startup with its path instead of being replaced by an empty one.',
    },
    {
      glyph: '⌀',
      title: 'No account, ever',
      body: 'Nothing to sign up for, nothing to sign in to, and no email address collected — there is no mechanism to collect one.',
    },
    {
      glyph: '⇅',
      title: 'A short list of calls you can name',
      body: 'The update check reads the public GitHub release list for the app you are running. An installer is downloaded only when you press Update. Links open in your own browser. That is the complete list for the desktop app — and the hosted web app has one more, below.',
    },
    {
      glyph: '⇪',
      title: 'A real exit',
      body: 'One JSON file exports sessions, tasks, habits, journal and water records, and importing it restores them after a confirmation. The task list also exports to a 24-column CSV you can open in Excel — not a format only this app reads.',
    },
  ] as const;

  readonly counter = [
    'It is GoatCounter, on the hosted web app only.',
    'It sends the page — path, title, referrer, screen width, language and time zone — never a task, a journal entry or an identifier.',
    'GoatCounter stores no IP address and sets no cookie of its own for this.',
    'Count my visits is a switch in Settings → Visitor Counter → Details. With it off the script is never fetched at all.',
    'The desktop build is never counted: it has no web address to report, and its Settings row says so.',
  ] as const;

  readonly backup = [
    'The file is checked read-only before anything opens it, so the check cannot itself be the thing that loses the data.',
    'A truncated file, or one whose committed changes are still in its write-ahead log, is treated as data to protect rather than as an empty file to replace.',
    'Backups are kept rather than rotated: a rolling series is the only thing that helps after a bad upgrade.',
    'Every migration this app has shipped adds to the schema; none drops a table, a column or a row.',
  ] as const;

  readonly logs = [
    'deepwork.log — everything, in order',
    'system.log — app, window, tray and OS events',
    'flow.log — pages, timer, imports and exports',
    'crash.log — panics, unhandled errors and app crashes',
    'network.log — failed requests, going offline and back',
  ] as const;

  readonly themes = ['Dark, light, or follow the system'] as const;
}
