import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';
import { ALERT_ACTIONS, QUIET_CONTROLS } from '../core/site';

/**
 * Quiet controls and answerable alerts.
 *
 * Three controls that used to live only in the tray — pause, mute and focus —
 * now open from the sidebar, the phone’s top bar, Settings and Ctrl+Shift+Q,
 * because they are one service behind four surfaces. The completion alert is
 * the other half: the clock can be driven from the notification, and a crossed
 * alert comes back after three minutes.
 *
 * The panel and the alert screenshots are the built app. The control labels and
 * the four alert actions are read from the panel and the toast themselves
 * (`QUIET_CONTROLS`, `ALERT_ACTIONS`).
 */
@Component({
  selector: 'dw-quiet',
  imports: [NgOptimizedImage, Reveal],
  templateUrl: './quiet.html',
})
export class Quiet {
  readonly panelShot = {
    src: 'screenshots/quiet-sheet.webp',
    width: 460,
    height: 508,
    alt: 'The Focus & reminders panel: Focus mode with Enter focus, Pause reminders for 30 minutes, 1 hour, 4 hours or until resume, and a reminder sound mute for 30 minutes, 1 hour or the rest of today.',
  };

  readonly alertShot = {
    src: 'screenshots/completion-dark.webp',
    width: 1440,
    height: 900,
    alt: 'The DeepWork dashboard with a completion alert in the corner: Focus session complete, with Pause, Next, Resume and Hold up as buttons on the alert itself.',
  };

  readonly controls = QUIET_CONTROLS;
  readonly actions = ALERT_ACTIONS;

  readonly alertPoints = [
    'The alert waits on screen instead of sliding away, and every button on it is an answer.',
    'Crossing it is not an answer: a swiped alert comes back after three minutes, and every three minutes after that.',
    'The startup, taskbar and water questions carry Yes and Not now on the notification too.',
    'On Windows, DeepWork asks the shell whether a notification is welcome — Focus Assist, a fullscreen game, presentation mode or a locked screen — and holds the suggestion cards. A session’s own completion alert still arrives.',
  ] as const;
}
