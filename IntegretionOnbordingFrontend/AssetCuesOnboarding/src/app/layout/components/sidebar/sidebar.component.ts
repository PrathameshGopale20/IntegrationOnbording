import { Component, inject, output } from '@angular/core';
import { APP_SHELL_NAVIGATION } from '../../../core/constants/navigation.constant';
import { NavGroup } from '../../../core/models/navigation.model';
import { LayoutShellService } from '../../../core/services/layout-shell.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  standalone: false,
})
export class SidebarComponent {
  private readonly layoutShellService = inject(LayoutShellService);

  readonly navigate = output<void>();

  readonly navigationGroups: readonly NavGroup[] = APP_SHELL_NAVIGATION;
  readonly isRailCollapsed = this.layoutShellService.isRailCollapsed;
  readonly isCompactViewport = this.layoutShellService.isCompactViewport;

  onNavigate(): void {
    if (this.isCompactViewport()) {
      this.navigate.emit();
    }
  }
}
