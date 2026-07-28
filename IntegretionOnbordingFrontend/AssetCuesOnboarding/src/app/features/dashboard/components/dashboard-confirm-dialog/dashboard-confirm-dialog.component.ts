import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DashboardConfirmDialogData } from './dashboard-confirm-dialog.model';

@Component({
  selector: 'app-dashboard-confirm-dialog',
  templateUrl: './dashboard-confirm-dialog.component.html',
  styleUrl: './dashboard-confirm-dialog.component.scss',
  standalone: false,
})
export class DashboardConfirmDialogComponent {
  readonly data = inject<DashboardConfirmDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<DashboardConfirmDialogComponent, boolean>);

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
