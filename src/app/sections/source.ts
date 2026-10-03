import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';
import { LICENSE_SPDX, SITE, SOURCE_LABEL, TECH_STACK } from '../core/site';

/**
 * Built in the open.
 *
 * This is the section a developer reads and a normal visitor skims, so it is
 * kept secondary: a short argument, the real stack, and the two commands that
 * actually run the app. Both commands are from `package.json` — `npm run start`
 * serves on port 4999 and `npm run tauri:dev` starts the desktop shell.
 *
 * The licence is stated from `LICENSE_SPDX` rather than typed here: the app
 * repository gained an MIT licence, the eyebrow label became "MIT licensed", and
 * the cautionary paragraph that used to sit in the template stopped rendering
 * because it is behind the same constant. Nothing in this component hard-codes
 * what the licence is.
 */
@Component({
  selector: 'dw-source',
  imports: [Reveal],
  templateUrl: './source.html',
})
export class Source {
  readonly site = SITE;
  readonly stack = TECH_STACK;
  readonly sourceLabel = SOURCE_LABEL;
  readonly hasLicense = LICENSE_SPDX !== null;

  readonly commands = [
    { comment: '# the web app — Angular dev server on :4999', command: 'npm run start' },
    { comment: '# the desktop app — native window, hot reload', command: 'npm run tauri:dev' },
  ] as const;

  /** Straight out of `ci.yml`: what a change has to survive before it ships. */
  readonly pipeline = [
    'ESLint across the TypeScript and the templates',
    'Prettier on every changed file',
    'Unit tests with a coverage gate that cannot go backwards',
    'A production `ng build`',
    'An advisory end-to-end Playwright run',
    'Installers for Windows, Linux and macOS on every push to main',
  ] as const;
}
