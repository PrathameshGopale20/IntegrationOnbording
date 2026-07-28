import { Component, inject } from '@angular/core';
import { LayoutShellService } from '../../../core/services/layout-shell.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  standalone: false,
})
export class MainLayoutComponent {
  private readonly layoutShellService = inject(LayoutShellService);

  readonly sidenavMode = this.layoutShellService.sidenavMode;
  readonly sidenavOpened = this.layoutShellService.sidenavOpened;
  readonly isRailCollapsed = this.layoutShellService.isRailCollapsed;
  readonly isCompactViewport = this.layoutShellService.isCompactViewport;

  onToggleSidebar(): void {
    this.layoutShellService.toggleDesktopCollapse();
  }

  onSidenavOpenedChange(opened: boolean): void {
    if (this.isCompactViewport()) {
      this.layoutShellService.setMobileMenuOpen(opened);
    }
  }

  onSidebarNavigate(): void {
    this.layoutShellService.closeMobileMenu();
  }
}
