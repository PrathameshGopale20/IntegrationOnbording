import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { WIZARD_STEPS } from '../../../onboarding-wizard/constants/wizard-steps.constant';
import { WizardStepName } from '../../../onboarding-wizard/constants/wizard-step-names.constant';
import { TemplateImportService } from '../../../onboarding-wizard/services/template-import.service';
import { WizardStateService } from '../../../onboarding-wizard/services/wizard-state.service';
import {
  APPLICATION_OPTIONS_BY_INTEGRATION_TYPE,
  INTEGRATION_TYPE_OPTIONS,
} from '../../../onboarding-wizard/steps/basic-details/basic-details-options.constant';
import { DashboardConfirmDialogComponent } from '../../components/dashboard-confirm-dialog/dashboard-confirm-dialog.component';
import {
  DASHBOARD_STATUS_CHIP_MAP,
  DASHBOARD_STEP_LABELS,
  DashboardFilterState,
  DashboardSessionRow,
  DashboardSessionStatus,
  DashboardSummaryCard,
} from '../../models/dashboard-session.model';
import { DashboardSessionService } from '../../services/dashboard-session.service';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  standalone: false,
})
export class DashboardPageComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) private readonly paginator?: MatPaginator;
  @ViewChild(MatSort) private readonly sort?: MatSort;
  @ViewChild('importFileInput') private readonly importFileInput?: ElementRef<HTMLInputElement>;

  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dashboardSessions = inject(DashboardSessionService);
  private readonly wizardState = inject(WizardStateService);
  private readonly templateImport = inject(TemplateImportService);

  readonly pageTitle = 'Customer Integration Onboarding';
  readonly pageSubtitle = 'Create, manage and monitor customer onboarding sessions.';

  readonly displayedColumns: readonly string[] = [
    'customerId',
    'customerName',
    'company',
    'integrationType',
    'application',
    'currentStep',
    'status',
    'createdDate',
    'updatedDate',
    'lastModifiedBy',
    'actions',
  ];

  readonly statusChipMap = DASHBOARD_STATUS_CHIP_MAP;
  readonly stepOptions = WIZARD_STEPS.map((step) => ({
    value: step.id,
    label: DASHBOARD_STEP_LABELS[step.id],
  }));
  readonly statusOptions: readonly (DashboardSessionStatus | 'All')[] = [
    'All',
    'Draft',
    'Pending Review',
    'Completed',
    'Generated SQL',
    'Cancelled',
  ];
  readonly integrationTypeOptions = [
    'All',
    ...INTEGRATION_TYPE_OPTIONS.map((option) => option.label),
  ];

  readonly filterForm: FormGroup = this.formBuilder.group({
    search: [''],
    integrationType: ['All'],
    application: ['All'],
    status: ['All'],
    currentStep: ['All'],
    createdDate: [null as Date | null],
    updatedDate: [null as Date | null],
  });

  readonly dataSource = new MatTableDataSource<DashboardSessionRow>([]);

  allSessions: DashboardSessionRow[] = [];
  summaryCards: readonly DashboardSummaryCard[] = [];
  applicationOptions: string[] = ['All'];
  isLoading = false;
  isImporting = false;

  ngOnInit(): void {
    this.dataSource.sortingDataAccessor = (row, column) => {
      const value = row[column as keyof DashboardSessionRow];
      if (column === 'createdDate' || column === 'updatedDate') {
        return new Date(String(value)).getTime();
      }
      if (column === 'currentStep') {
        return row.currentStepIndex;
      }
      return typeof value === 'string' ? value.toLowerCase() : (value as number);
    };

    this.filterForm.get('integrationType')?.valueChanges.subscribe((label: string) => {
      this.refreshApplicationOptions(label);
      this.filterForm.patchValue({ application: 'All' }, { emitEvent: false });
    });

    this.reload();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  get hasSessions(): boolean {
    return this.allSessions.length > 0;
  }

  get hasFilteredRows(): boolean {
    return this.dataSource.filteredData.length > 0 || this.dataSource.data.length > 0;
  }

  customerInitial(name: string): string {
    return (name || '?').trim().charAt(0).toUpperCase();
  }

  formatDate(value: string): string {
    if (!value) {
      return '—';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }
    return date.toISOString().slice(0, 10);
  }

  statusClass(status: DashboardSessionStatus): string {
    return this.statusChipMap[status]?.cssClass ?? 'dash-status';
  }

  onSearch(): void {
    this.applyFilters();
  }

  onClearFilters(): void {
    this.filterForm.reset({
      search: '',
      integrationType: 'All',
      application: 'All',
      status: 'All',
      currentStep: 'All',
      createdDate: null,
      updatedDate: null,
    });
    this.refreshApplicationOptions('All');
    this.applyFilters();
  }

  onRefresh(): void {
    this.reload();
    this.snackBar.open('Dashboard refreshed.', 'OK', {
      duration: 2500,
      panelClass: ['ac-snackbar', 'ac-snackbar--success'],
    });
  }

  onNewCustomer(): void {
    this.wizardState.reset();
    void this.router.navigate(['/onboarding', 'new']);
  }

  onImportExisting(): void {
    this.importFileInput?.nativeElement.click();
  }

  async onImportFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }

    this.isImporting = true;
    const result = await this.templateImport.importFile(file);
    this.isImporting = false;

    if (!result.success) {
      this.snackBar.open(result.errors.join(' '), 'Dismiss', {
        duration: 6000,
        panelClass: ['ac-snackbar', 'ac-snackbar--error'],
      });
      return;
    }

    this.wizardState.applyImportedModel(result.model);
    this.wizardState.persistDraftToLocalStorage();
    const sessionId = this.wizardState.getSessionId();
    this.snackBar.open('Customer imported successfully.', 'OK', {
      duration: 4000,
      panelClass: ['ac-snackbar', 'ac-snackbar--success'],
    });

    if (sessionId) {
      void this.router.navigate(['/onboarding', sessionId, 'basic-details']);
    } else {
      void this.router.navigate(['/onboarding', 'new']);
    }
  }

  onResume(row: DashboardSessionRow): void {
    this.navigateToSession(row.sessionId, row.currentStep);
  }

  onView(row: DashboardSessionRow): void {
    this.navigateToSession(row.sessionId, row.currentStep);
  }

  onEdit(row: DashboardSessionRow): void {
    this.navigateToSession(row.sessionId, WizardStepName.BasicDetails);
  }

  onGenerateSql(row: DashboardSessionRow): void {
    this.dashboardSessions.markSqlGenerated(row.sessionId);
    this.navigateToSession(row.sessionId, WizardStepName.ReviewSubmit);
  }

  onDuplicate(row: DashboardSessionRow): void {
    const clone = this.dashboardSessions.duplicateSession(row.sessionId);
    if (!clone) {
      this.snackBar.open('Unable to duplicate session.', 'Dismiss', {
        duration: 4000,
        panelClass: ['ac-snackbar', 'ac-snackbar--error'],
      });
      return;
    }

    this.reload();
    this.snackBar.open('Session duplicated.', 'OK', {
      duration: 3000,
      panelClass: ['ac-snackbar', 'ac-snackbar--success'],
    });
  }

  onDelete(row: DashboardSessionRow): void {
    const dialogRef = this.dialog.open(DashboardConfirmDialogComponent, {
      width: '440px',
      maxWidth: '94vw',
      data: {
        title: 'Delete onboarding session?',
        message: `This will permanently remove "${row.customerName}" from local drafts. This action cannot be undone.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean | undefined) => {
      if (!confirmed) {
        return;
      }
      this.dashboardSessions.deleteSession(row.sessionId);
      this.reload();
      this.snackBar.open('Session deleted.', 'OK', {
        duration: 3000,
        panelClass: ['ac-snackbar', 'ac-snackbar--success'],
      });
    });
  }

  onSummaryCardClick(card: DashboardSummaryCard): void {
    if (card.key === 'total') {
      this.filterForm.patchValue({ status: 'All' });
    } else {
      this.filterForm.patchValue({ status: card.key });
    }
    this.applyFilters();
  }

  private reload(): void {
    this.isLoading = true;
    this.allSessions = this.dashboardSessions.getSessions();
    this.summaryCards = this.dashboardSessions.buildSummary(this.allSessions);
    this.refreshApplicationOptions(this.filterForm.get('integrationType')?.value ?? 'All');
    this.applyFilters();
    this.isLoading = false;
  }

  private applyFilters(): void {
    const raw = this.filterForm.getRawValue();
    const filters: DashboardFilterState = {
      search: String(raw.search ?? ''),
      integrationType: String(raw.integrationType ?? 'All'),
      application: String(raw.application ?? 'All'),
      status: (raw.status ?? 'All') as DashboardFilterState['status'],
      currentStep: (raw.currentStep ?? 'All') as DashboardFilterState['currentStep'],
      createdDate: raw.createdDate ? new Date(raw.createdDate).toISOString() : null,
      updatedDate: raw.updatedDate ? new Date(raw.updatedDate).toISOString() : null,
    };

    this.dataSource.data = this.dashboardSessions.filterSessions(this.allSessions, filters);
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  private refreshApplicationOptions(integrationLabel: string): void {
    if (!integrationLabel || integrationLabel === 'All') {
      const all = new Set<string>();
      for (const options of Object.values(APPLICATION_OPTIONS_BY_INTEGRATION_TYPE)) {
        for (const option of options) {
          all.add(option.label);
        }
      }
      this.applicationOptions = ['All', ...Array.from(all)];
      return;
    }

    const type = INTEGRATION_TYPE_OPTIONS.find((option) => option.label === integrationLabel);
    const apps = type
      ? (APPLICATION_OPTIONS_BY_INTEGRATION_TYPE[type.value] ?? []).map((option) => option.label)
      : [];
    this.applicationOptions = ['All', ...apps];
  }

  private navigateToSession(sessionId: string, step: WizardStepName): void {
    const draft = this.wizardState.loadDraft(sessionId);
    if (!draft) {
      this.snackBar.open('Session could not be loaded.', 'Dismiss', {
        duration: 4000,
        panelClass: ['ac-snackbar', 'ac-snackbar--error'],
      });
      this.reload();
      return;
    }

    const stepPath =
      WIZARD_STEPS.find((item) => item.id === step)?.routePath ??
      WIZARD_STEPS.find((item) => item.id === draft.CurrentStep)?.routePath ??
      'basic-details';

    void this.router.navigate(['/onboarding', draft.sessionId, stepPath]);
  }
}
