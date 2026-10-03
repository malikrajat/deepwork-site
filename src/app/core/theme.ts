import { DOCUMENT, inject, Service, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

/** Where the choice is remembered. The `index.html` boot script reads this key. */
const STORAGE_KEY = 'deepwork-site-theme';

/**
 * The site's theme, held as one signal.
 *
 * `@Service` is the Angular 22 way to declare a singleton that is provided
 * automatically — the same thing `@Injectable({ providedIn: 'root' })` did, with
 * less ceremony.
 *
 * The initial value is read from the `<html>` element rather than from storage,
 * because the inline boot script in `index.html` has already resolved the
 * stored-or-system preference and applied it before the first paint. Reading it
 * back means the toggle's state and the rendered page can never disagree, and
 * the visitor never sees the page flip after it has loaded.
 */
@Service()
export class ThemeStore {
  private readonly document = inject(DOCUMENT);

  readonly theme = signal<Theme>(this.readAppliedTheme());
  /** `true` once the visitor has made an explicit choice on this device. */
  readonly explicit = signal<boolean>(this.hasStoredChoice());

  /** Flips dark and light, and remembers the result. */
  toggle(): void {
    this.apply(this.theme() === 'dark' ? 'light' : 'dark', true);
  }

  apply(theme: Theme, persist: boolean): void {
    this.theme.set(theme);
    this.document.documentElement.dataset['theme'] = theme;

    if (!persist) return;

    this.explicit.set(true);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage can be unavailable in private mode. The theme still applies for
      // this page view, which is the part the visitor asked for.
    }
  }

  private readAppliedTheme(): Theme {
    return this.document.documentElement.dataset['theme'] === 'light' ? 'light' : 'dark';
  }

  private hasStoredChoice(): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'light' || stored === 'dark';
    } catch {
      return false;
    }
  }
}
