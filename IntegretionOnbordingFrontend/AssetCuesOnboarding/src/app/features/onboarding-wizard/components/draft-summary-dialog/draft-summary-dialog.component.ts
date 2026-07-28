import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DraftSummaryDialogData } from './draft-summary-dialog.model';

@Component({
  selector: 'app-draft-summary-dialog',
  templateUrl: './draft-summary-dialog.component.html',
  styleUrl: './draft-summary-dialog.component.scss',
  standalone: false,
})
export class DraftSummaryDialogComponent {
  readonly data = inject<DraftSummaryDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<DraftSummaryDialogComponent, 'dashboard' | 'continue'>);

  onContinueEditing(): void {
    this.dialogRef.close('continue');
  }

  onGoToDashboard(): void {
    this.dialogRef.close('dashboard');
  }
}
