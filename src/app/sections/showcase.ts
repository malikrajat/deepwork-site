import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';

/**
 * The product tour: the actual application, at size, with the parts named.
 *
 * This is the section that has to do the most work for the smallest amount of
 * copy. A visitor who reads nothing else should still leave knowing what the
 * window looks like and what the three columns of the board are.
 */
@Component({
  selector: 'dw-showcase',
  imports: [NgOptimizedImage, Reveal],
  templateUrl: './showcase.html',
})
export class Showcase {
  readonly shot = {
    src: 'screenshots/tasks-dark.webp',
    width: 1440,
    height: 900,
    alt: 'The DeepWork Tasks page: a three-column board — To Do, In Progress and Done — with task cards coloured by status, and the task list beside it.',
  };

  /**
   * The callouts under the screenshot. Each one names something visible in the
   * image above it, which is the whole point of putting them there.
   */
  readonly callouts = [
    {
      glyph: '◷',
      title: 'The focus clock',
      body: 'Work, short break and long break on one ring that fills as the session runs.',
    },
    {
      glyph: '◫',
      title: 'One board, three columns',
      body: 'Drag a card between To Do, In Progress and Done — its colour is its status.',
    },
    {
      glyph: '⌘',
      title: 'Keyboard first',
      body: 'Focused cards move along the board with 1, 2, 3 and the arrow keys. Ctrl+N adds a task.',
    },
    {
      glyph: '◈',
      title: 'Everything on one page',
      body: 'Today, Matrix, Calendar, Habits, Journal and Insights are one click apart.',
    },
  ];
}
