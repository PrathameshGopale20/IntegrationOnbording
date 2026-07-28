import { Component, inject, output } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { LayoutShellService } from '../../../core/services/layout-shell.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: false,
})
export class HeaderComponent {
  private readonly layoutShellService = inject(LayoutShellService);
  private readonly breadcrumbService = inject(BreadcrumbService);

  readonly menuToggle = output<void>();

  readonly appName = environment.appName;
  readonly companyName = environment.companyName;
  readonly environmentName = environment.environmentName;
  readonly logoSrc = 'assets/icons/assetcues-logo.svg';

  readonly breadcrumbs = this.breadcrumbService.breadcrumbs;
  readonly isCompactViewport = this.layoutShellService.isCompactViewport;
  readonly isRailCollapsed = this.layoutShellService.isRailCollapsed;

  onToggleMenu(): void {
    this.menuToggle.emit();
  }
}
