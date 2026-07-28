import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DashboardConfirmDialogComponent } from './components/dashboard-confirm-dialog/dashboard-confirm-dialog.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';

@NgModule({
  declarations: [DashboardPageComponent, DashboardConfirmDialogComponent],
  imports: [SharedModule, DashboardRoutingModule],
})
export class DashboardModule {}
