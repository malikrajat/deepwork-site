import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

import { Reveal } from '../core/reveal';
import { AUTHOR_FACTS, AUTHOR_STACK, CONTACT_URL, PRACTICES, SHELF, SITE } from '../core/site';

/**
 * About the maker.
 *
 * The page spends twenty sections describing the app and never says who built
 * it, which is a strange omission on a project whose whole argument is that the
 * small, careful version is worth choosing. So this section does the two things
 * the rest of the page cannot: it names the person, and it puts the app in the
 * context of the work he does for a living.
 *
 * Written in the first person, deliberately. Every other section is a
 * third-person description of a product; this one is the author talking, and a
 * voice is the point of it.
 *
 * What is *not* here matters as much as what is: no availability badge, no
 * "open to work", no percentage lifted from a résumé. The page's rule — a claim
 * that survives being checked beats a stronger one that does not — applies to a
 * person as much as to a Pomodoro timer. The reasoning is in `core/site.ts`.
 */
@Component({
  selector: 'dw-about',
  imports: [NgOptimizedImage, Reveal],
  templateUrl: './about.html',
})
export class About {
  readonly site = SITE;
  readonly contactUrl = CONTACT_URL;
  readonly facts = AUTHOR_FACTS;
  readonly stack = AUTHOR_STACK;
  readonly practices = PRACTICES;
  readonly shelf = SHELF;

  /**
   * The portrait, cropped square from the same photograph the portfolio uses.
   * Lazy, because it is far below the fold, and never the largest paint.
   */
  readonly portrait = {
    src: 'img/rajat-malik.webp',
    width: 640,
    height: 640,
    alt: 'Portrait of Rajat Malik',
  };
}
