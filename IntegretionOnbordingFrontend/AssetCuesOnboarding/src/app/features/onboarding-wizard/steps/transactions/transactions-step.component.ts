import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { WizardStepName } from '../../constants/wizard-step-names.constant';
import {
  buildEndpointItemGroup,
  getEndpointsArray,
} from '../endpoints/endpoints-form.builder';
import { WizardStateService } from '../../services/wizard-state.service';
import { getTransactionsArray } from './transactions-form.builder';
import { TransactionItemModel, TransactionsStepModel } from './transactions.model';

@Component({
  selector: 'app-transactions-step',
  templateUrl: './transactions-step.component.html',
  styleUrl: './transactions-step.component.scss',
  standalone: false,
})
export class TransactionsStepComponent implements OnInit, OnDestroy {
  @Input({ required: true }) formGroup!: FormGroup;
  /** Sibling Endpoints form group — kept in sync when enable toggles change. */
  @Input({ required: true }) endpointsFormGroup!: FormGroup;

  private readonly dialog = inject(MatDialog);
  private readonly formBuilder = inject(FormBuilder);
  private readonly wizardState = inject(WizardStateService);

  private readonly subscriptions = new Subscription();

  readonly pageTitle = 'Transactions';
  readonly pageSubtitle =
    'Enable the transactions required for this integration. Endpoints are generated automatically.';
  readonly displayedColumns = [
    'enabled',
    'transactionName',
    'tcode',
    'creationTrigger',
    'endpointType',
    'status',
    'actions',
  ] as const;

  readonly dataSource = new MatTableDataSource<FormGroup>([]);
  isSyncing = false;

  ngOnInit(): void {
    this.refreshDataSource();
    this.subscriptions.add(
      this.transactions.valueChanges.subscribe(() => this.refreshDataSource())
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get transactions(): FormArray {
    return getTransactionsArray(this.formGroup);
  }

  rowGroup(index: number): FormGroup {
    return this.transactions.at(index) as FormGroup;
  }

  statusLabel(enabled: boolean): string {
    return enabled ? 'Enabled' : 'Disabled';
  }

  async onEnableToggle(index: number, checked: boolean): Promise<void> {
    const group = this.rowGroup(index);

    if (!checked && group.get('enabled')?.value === true) {
      const confirmed = await this.confirmDisable(group.get('transactionName')?.value);
      if (!confirmed) {
        group.get('enabled')?.setValue(true, { emitEvent: false });
        group.get('selected')?.setValue(true, { emitEvent: false });
        this.refreshDataSource();
        return;
      }
    }

    group.patchValue(
      {
        enabled: checked,
        selected: checked,
      },
      { emitEvent: false }
    );

    this.applySync();
  }

  async onDisableAction(index: number): Promise<void> {
    const group = this.rowGroup(index);
    if (!group.get('enabled')?.value) {
      return;
    }

    const confirmed = await this.confirmDisable(group.get('transactionName')?.value);
    if (!confirmed) {
      return;
    }

    group.patchValue({ enabled: false, selected: false }, { emitEvent: false });
    this.applySync();
  }

  onEditAction(): void {
    // Reserved for a future edit dialog — intentionally no-op.
  }

  private applySync(): void {
    this.isSyncing = true;

    try {
      const transactionsModel = this.formGroup.getRawValue() as TransactionsStepModel;
      const normalized: TransactionsStepModel = {
        transactions: (transactionsModel.transactions ?? []).map((item) => ({
          ...item,
          selected: item.enabled,
        })),
      };

      this.formGroup.patchValue(normalized, { emitEvent: false });

      // Persist current endpoint edits first so sync can preserve them.
      this.wizardState.updateStep(
        WizardStepName.Endpoints,
        this.endpointsFormGroup.getRawValue()
      );
      this.wizardState.updateStep(WizardStepName.Transactions, normalized);

      const synced = this.wizardState.getCurrentData().endpoints?.endpoints ?? [];
      this.replaceEndpointsForm(synced);
      this.wizardState.persistDraftToLocalStorage();
      this.refreshDataSource();
    } finally {
      this.isSyncing = false;
    }
  }

  private replaceEndpointsForm(
    endpoints: import('../endpoints/endpoints.model').EndpointItemModel[]
  ): void {
    const array = getEndpointsArray(this.endpointsFormGroup);
    while (array.length > 0) {
      array.removeAt(0);
    }

    for (const endpoint of endpoints) {
      array.push(buildEndpointItemGroup(this.formBuilder, endpoint));
    }
  }

  private refreshDataSource(): void {
    this.dataSource.data = this.transactions.controls as FormGroup[];
  }

  private confirmDisable(transactionName: string): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '440px',
      maxWidth: '94vw',
      data: {
        title: 'Disable transaction?',
        message: `Disabling "${transactionName || 'this transaction'}" will remove its Endpoint. You can re-enable it later to recreate the Endpoint with default values.`,
        confirmLabel: 'Disable',
        cancelLabel: 'Keep enabled',
        tone: 'warning' as const,
      },
    });

    return new Promise((resolve) => {
      dialogRef.afterClosed().subscribe((result: boolean | undefined) => {
        resolve(Boolean(result));
      });
    });
  }

  /** Expose typed row value for template chips. */
  asTransaction(group: FormGroup): TransactionItemModel {
    return group.getRawValue() as TransactionItemModel;
  }
}
