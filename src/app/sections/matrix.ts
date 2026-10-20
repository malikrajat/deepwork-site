import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';

/**
 * The Eisenhower matrix.
 *
 * The four quadrant names and their descriptions are `QUADRANT_CONFIG` in the
 * application, colours included — Q1 red, Q2 violet, Q3 amber, Q4 grey — and
 * the behaviours described (drag to a quadrant, resizable list, collapsible
 * quadrants, the drag preview showing a full title) are all in
 * `matrix.component.ts`.
 */
@Component({
  selector: 'dw-matrix',
  imports: [NgOptimizedImage, Reveal],
  templateUrl: './matrix.html',
})
export class Matrix {
  readonly shot = {
    src: 'screenshots/matrix-dark.webp',
    width: 1440,
    height: 900,
    alt: 'The DeepWork Eisenhower matrix: four coloured quadrants with task cards inside them, and the task list down the side.',
  };

  readonly collapseShot = {
    src: 'screenshots/matrix-collapsed.webp',
    width: 1440,
    height: 900,
    alt: 'The Eisenhower matrix after Schedule is collapsed: Do First spans the top of the board, Delegate and Eliminate sit side by side underneath, and Schedule is a one-line strip at the bottom.',
  };

  readonly quadrants = [
    {
      key: 'Q1',
      name: 'Do First',
      description: 'Urgent & Important',
      color: '#f87171',
      note: 'The work that has to happen now.',
    },
    {
      key: 'Q2',
      name: 'Schedule',
      description: 'Important, Not Urgent',
      color: '#a78bfa',
      note: 'Where deep work actually lives — and the quadrant this app is named after.',
    },
    {
      key: 'Q3',
      name: 'Delegate',
      description: 'Urgent, Not Important',
      color: '#fbbf24',
      note: 'The interruptions that feel like progress.',
    },
    {
      key: 'Q4',
      name: 'Eliminate',
      description: 'Neither',
      color: '#9ca3af',
      note: 'The honest home for the rest.',
    },
  ] as const;

  readonly points = [
    'Drag a card into a quadrant and its priority stops being a feeling.',
    'The task list beside the board is resizable, and every quadrant scrolls on its own.',
    'Collapse a quadrant, or the whole list, and the board still accepts a drop.',
    'Quadrant order is what the day planner schedules from — Q1 first, Q4 last.',
    'Insights shows completion per quadrant, so you can see where your work actually sits.',
  ] as const;

  readonly reflowPoints = [
    'Three open quadrants put the first across the top and the other two side by side underneath; two sit side by side; one takes the whole board.',
    'Maximise is the same thing as collapsing the other three, so there is one rule to understand rather than two.',
    'Restore the layout hands back exactly what was there before.',
    'The dividers drag by mouse or by arrow keys, with Home and End to even them out; neither side can go below 15%.',
    'The split is stored as a share of the board, not as pixels, so it survives a window resize and comes back when a quadrant is reopened.',
  ] as const;
}
