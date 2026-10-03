import { Directive, ElementRef, inject, input, type OnDestroy } from '@angular/core';

/**
 * Fades and lifts an element into place the first time it is scrolled to.
 *
 * The site's only motion infrastructure, and a directive rather than an
 * animation library because the whole effect is "add a class, let CSS transition
 * two compositor-friendly properties". There is no animation package in
 * `package.json` and there does not need to be one.
 *
 * ## The one rule this is built around
 *
 * **Content is never invisible without JavaScript having proved it is
 * off-screen.** The first version of this directive did the obvious thing — the
 * stylesheet hid every `.reveal` element and an observer or animation frame
 * brought it back — and a built-site audit found 80–90 elements stuck at
 * `opacity: 0` at every viewport width. The page compiled, built and deployed
 * perfectly while being mostly blank.
 *
 * Two separate traps, both now closed:
 *
 * 1. **An event that never arrives.** `IntersectionObserver` reports a change,
 *    so an element that goes from far below the fold to far above it between two
 *    frames is never reported as intersecting, and stays hidden. The passive
 *    `requestAnimationFrame` that replaced it was no better: a frame is not
 *    guaranteed, and if none is produced the pass never runs.
 * 2. **Hiding something before knowing it is safe to hide.** Even the
 *    geometry-only version started from "hidden" and relied on code to fix it.
 *
 * So the default is *visible*, and `reveal--armed` (the hidden state) is applied
 * by script — and only to an element that has been measured as starting below
 * the viewport. Anything on screen at load never arms and never animates, which
 * also keeps the hero's largest paint out of the animation entirely. If the
 * directive runs and then nothing else ever does, only off-screen elements are
 * affected, and an 8-second failsafe un-arms those as well.
 *
 * The pass itself is a plain `scroll` listener doing a few synchronous
 * `getBoundingClientRect` reads over a set that shrinks to empty and then
 * detaches the listener. No frame is required for correctness.
 */
@Directive({
  selector: '[dwReveal]',
  host: {
    class: 'reveal',
    '[style.transition-delay.ms]': 'delay()',
  },
})
export class Reveal implements OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Stagger, in milliseconds. A row of cards reads as a sequence when each one
   * starts slightly after the last, and as one blunt movement when it does not.
   * Capped in the templates at a few hundred milliseconds: a long delay on a
   * page this tall means content arrives after the visitor has scrolled past it.
   */
  readonly delay = input(0, { alias: 'dwRevealDelay' });

  constructor() {
    const element = this.host.nativeElement;

    if (prefersReducedMotion() || !hasLayout(element)) {
      return;
    }

    // Measured before arming: an element that is already within (or above) the
    // viewport is left alone, so nothing on the first screen can be hidden.
    if (element.getBoundingClientRect().top > window.innerHeight) {
      element.classList.add('reveal--armed');
      pending.add(element);
      startListening();
    }
  }

  ngOnDestroy(): void {
    unregister(this.host.nativeElement);
  }
}

/* --------------------------------------------------------------------------
   The shared queue. Module scope rather than a service: there is one window,
   one scroll position and one set of pending elements, and a `@Service()` here
   would be ceremony around three variables.
   ------------------------------------------------------------------------ */

/** How far up the viewport an element's top edge must reach to be revealed. */
const REVEAL_AT = 0.9;

/**
 * Failsafe. Un-arms anything still hidden after this long.
 *
 * It only ever fires in a page where scrolling produced no event at all, which
 * means the visitor was not scrolling — so the only thing it can affect is
 * content they had not reached. It is cleared as soon as a scroll-driven pass
 * proves the mechanism works.
 */
const FAILSAFE_MS = 8000;

const pending = new Set<HTMLElement>();
let listening = false;
let failsafe = 0;

function pass(): void {
  const limit = window.innerHeight * REVEAL_AT;

  for (const element of Array.from(pending)) {
    if (!element.isConnected) {
      pending.delete(element);
      continue;
    }

    if (element.getBoundingClientRect().top < limit) {
      element.classList.remove('reveal--armed');
      element.classList.add('reveal--in');
      pending.delete(element);
    }
  }

  if (pending.size === 0) stopListening();
}

function disarmAll(): void {
  for (const element of pending) {
    element.classList.remove('reveal--armed');
    element.classList.add('reveal--in');
  }
  pending.clear();
  stopListening();
}

function startListening(): void {
  if (listening) return;
  listening = true;

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', pass, { passive: true });

  failsafe = window.setTimeout(disarmAll, FAILSAFE_MS);
}

function onScroll(): void {
  // The mechanism is demonstrably alive, so the failsafe is no longer needed.
  if (failsafe !== 0) {
    clearTimeout(failsafe);
    failsafe = 0;
  }
  pass();
}

function stopListening(): void {
  if (!listening) return;
  listening = false;

  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', pass);

  if (failsafe !== 0) {
    clearTimeout(failsafe);
    failsafe = 0;
  }
}

function unregister(element: HTMLElement): void {
  pending.delete(element);
  if (pending.size === 0) stopListening();
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Guards against measuring before the element has been laid out. */
function hasLayout(element: HTMLElement): boolean {
  return typeof window !== 'undefined' && element.isConnected;
}
