import { afterNextRender, Component, DestroyRef, inject, signal } from '@angular/core';
import { NAV_LINKS, SITE } from '../core/site';
import { ThemeStore } from '../core/theme';

/**
 * The sticky header.
 *
 * Three behaviours, all of them things a visitor would notice if they were
 * missing rather than features in their own right:
 *
 * 1. **It stays out of the way at the top.** The blurred bar and its hairline
 *    only appear once the page has been scrolled, so the hero is a clean
 *    composition instead of a hero underneath a toolbar.
 * 2. **It says where you are.** The current section is highlighted, computed
 *    from scroll position rather than from a route, because this page has no
 *    routes.
 * 3. **It collapses properly on a phone.** Seven section links do not fit on a
 *    360px screen; shrinking them until they do is how a navigation stops being
 *    readable, so below 900px they become a panel.
 */
@Component({
  selector: 'dw-nav',
  templateUrl: './nav.html',
  host: {
    '(keydown.escape)': 'closeMenu()',
  },
})
export class Nav {
  private readonly destroyRef = inject(DestroyRef);
  private readonly themeStore = inject(ThemeStore);

  readonly site = SITE;
  readonly links = NAV_LINKS;
  readonly theme = this.themeStore.theme;

  readonly stuck = signal(false);
  readonly menuOpen = signal(false);
  readonly activeId = signal<string>('');

  constructor() {
    // Scroll listeners are registered after the first render so they exist only
    // in a browser that has actually painted the header they control.
    afterNextRender(() => {
      const onScroll = () => {
        this.stuck.set(window.scrollY > 12);
        this.activeId.set(this.sectionAtViewportTop());
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      // Resizing can move a section under the header without any scrolling, so
      // the highlight is recomputed for that too.
      window.addEventListener('resize', onScroll, { passive: true });

      this.destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      });

      onScroll();
    });
  }

  toggleTheme(): void {
    this.themeStore.toggle();
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  /**
   * The section whose top edge has most recently passed under the header.
   *
   * A plain `getBoundingClientRect` read per link on every scroll event would
   * be a layout thrash; this reads once per link and only touches the `top`
   * property, and the list is seven items long.
   */
  private sectionAtViewportTop(): string {
    let current = '';

    for (const link of NAV_LINKS) {
      const element = document.getElementById(link.id);
      if (!element) continue;

      if (element.getBoundingClientRect().top <= 160) {
        current = link.id;
      }
    }

    return current;
  }
}
