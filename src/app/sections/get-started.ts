import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';
import { SITE } from '../core/site';

interface Route {
  num: string;
  name: string;
  body: string;
  action: string;
  href: string;
  primary: boolean;
  /** Only the install route shows a device: the other two need no picture. */
  image?: { src: string; width: number; height: number; alt: string };
}

/**
 * Get started.
 *
 * Three routes in, ordered by how little they ask of the visitor: a browser tab
 * needs nothing, an installer needs a download, and installing the web app as a
 * PWA needs a menu item.
 *
 * The PWA instructions describe the browser's own install flow rather than a
 * button this page cannot press. The app does capture `beforeinstallprompt` and
 * offer its own banner — but the browser menu is the thing that always works,
 * so that is what is written down.
 */
@Component({
  selector: 'dw-get-started',
  imports: [NgOptimizedImage, Reveal],
  templateUrl: './get-started.html',
})
export class GetStarted {
  readonly site = SITE;

  readonly routes: readonly Route[] = [
    {
      num: '01',
      name: 'Use it in the browser',
      body: 'Nothing to install and nothing to sign up for. The web app is the same application, with the same features, running in any modern browser.',
      action: 'Open the web app',
      href: SITE.webAppUrl,
      primary: true,
    },
    {
      num: '02',
      name: 'Install it on your desktop',
      body: 'The Windows, macOS and Linux builds add the tray icon, the always-on-top window, the floating mini widget and native notifications. Take the file for your machine from the newest release.',
      action: 'Go to the latest release',
      href: SITE.latestReleaseUrl,
      primary: false,
    },
    {
      num: '03',
      name: 'Keep the web app as an app',
      body: 'In Chrome or Edge, use the install icon in the address bar. On iPhone and iPad, tap Share and then “Add to Home Screen”. It gets its own window, its own icon, and it works offline.',
      action: 'All releases',
      href: SITE.releasesUrl,
      primary: false,
      image: {
        src: 'screenshots/dashboard-phone.webp',
        width: 390,
        height: 844,
        alt: 'DeepWork on a phone screen: the focus clock above today’s task list.',
      },
    },
  ];

  readonly notes = [
    'Free. No account, no trial, no card, no upsell.',
    'Windows 10 or later, recent macOS, or most Linux distributions — or any modern browser.',
    'The desktop installers are unsigned, so Windows SmartScreen and macOS Gatekeeper will ask you to confirm the first run.',
  ] as const;
}
