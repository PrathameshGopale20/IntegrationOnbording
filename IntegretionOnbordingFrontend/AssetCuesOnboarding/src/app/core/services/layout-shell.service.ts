import { BreakpointObserver } from '@angular/cdk/layout';
import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

const COMPACT_BREAKPOINT = '(max-width: 1023.98px)';

@Injectable({ providedIn: 'root' })
export class LayoutShellService {
  private readonly breakpointObserver = inject(BreakpointObserver);

  private readonly desktopCollapsed = signal(false);
  private readonly mobileMenuOpen = signal(false);

  readonly isCompactViewport = toSignal(
    this.breakpointObserver.observe(COMPACT_BREAKPOINT).pipe(map((state) => state.matches)),
    { initialValue: false }
  );

  readonly sidenavMode = computed<'side' | 'over'>(() =>
    this.isCompactViewport() ? 'over' : 'side'
  );

  readonly sidenavOpened = computed(() => {
    if (this.isCompactViewport()) {
      return this.mobileMenuOpen();
    }

    return true;
  });

  readonly isRailCollapsed = computed(
    () => !this.isCompactViewport() && this.desktopCollapsed()
  );

  toggleDesktopCollapse(): void {
    if (this.isCompactViewport()) {
      this.mobileMenuOpen.update((open) => !open);
      return;
    }

    this.desktopCollapsed.update((collapsed) => !collapsed);
  }

  openMobileMenu(): void {
    if (this.isCompactViewport()) {
      this.mobileMenuOpen.set(true);
    }
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  setMobileMenuOpen(open: boolean): void {
    this.mobileMenuOpen.set(open);
  }
}
