import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { DraftSummaryDialogComponent } from '../../components/draft-summary-dialog/draft-summary-dialog.component';
import { WizardStepName } from '../../constants/wizard-step-names.constant';
import { WIZARD_STEPS } from '../../constants/wizard-steps.constant';
import { CompaniesStepModel, OnboardingModel } from '../../models/onboarding-model';
import { LocalStorageService } from '../../services/local-storage.service';
import { SqlGenerationService } from '../../services/sql-generation.service';
import { TemplateImportService } from '../../services/template-import.service';
import { TransactionEndpointSyncService } from '../../services/transaction-endpoint-sync.service';
import { WizardNavigationService } from '../../services/wizard-navigation.service';
import { WizardStateService } from '../../services/wizard-state.service';import { buildBasicDetailsForm } from '../../steps/basic-details/basic-details-form.builder';
import { BasicDetailsFormModel } from '../../steps/basic-details/basic-details.model';
import { buildCompaniesForm } from '../../steps/companies/companies-form.builder';
import { buildCredentialsForm } from '../../steps/credentials/credentials-form.builder';
import { CredentialsFormModel } from '../../steps/credentials/credentials.model';
import { buildTransactionsForm } from '../../steps/transactions/transactions-form.builder';
import { TransactionsStepModel } from '../../steps/transactions/transactions.model';
import { buildEndpointsForm } from '../../steps/endpoints/endpoints-form.builder';
import { EndpointsStepModel } from '../../steps/endpoints/endpoints.model';
import { buildCustomerFieldsForm } from '../../steps/customer-fields/customer-fields-form.builder';
import { CustomerFieldsStepModel } from '../../steps/customer-fields/customer-fields.model';
import { buildFieldMappingForm } from '../../steps/field-mapping/field-mapping-form.builder';
import { FieldMappingStepModel } from '../../steps/field-mapping/field-mapping.model';
import { buildMasterMappingForm } from '../../steps/master-mapping/master-mapping-form.builder';
import { MasterMappingStepModel } from '../../steps/master-mapping/master-mapping.model';
import { buildConfigurationsForm } from '../../steps/configurations/configurations-form.builder';
import { ConfigurationsStepModel } from '../../steps/configurations/configurations.model';
import { buildSchedulerForm } from '../../steps/scheduler/scheduler-form.builder';
import { SchedulerStepModel } from '../../steps/scheduler/scheduler.model';
import {
  buildDraftSummarySections,
  resolveStepTitle,
} from '../../utils/draft-summary.builder';
import {
  extractStepFormValue,
  patchWizardFormFromModel,
} from '../../utils/wizard-form.util';

@Component({
  selector: 'app-wizard-shell',
  templateUrl: './wizard-shell.component.html',
  styleUrl: './wizard-shell.component.scss',
  standalone: false,
  providers: [WizardNavigationService],
})
export class WizardShellComponent implements OnInit, AfterViewInit {
  @ViewChild('wizardStepper') private readonly wizardStepper?: MatStepper;
  @ViewChild('csvFileInput') private readonly csvFileInput?: ElementRef<HTMLInputElement>;

  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly wizardState = inject(WizardStateService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly templateImport = inject(TemplateImportService);
  private readonly sqlGeneration = inject(SqlGenerationService);
  private readonly transactionEndpointSync = inject(TransactionEndpointSyncService);
  readonly navigation = inject(WizardNavigationService);

  readonly pageTitle = 'Customer Integration Onboarding';
  readonly pageSubtitle = 'Complete all steps to configure a new customer integration.';
  isSubmitting = false;
  readonly basicDetailsStepId = WizardStepName.BasicDetails;
  readonly companiesStepId = WizardStepName.Companies;
  readonly credentialsStepId = WizardStepName.Credentials;
  readonly transactionsStepId = WizardStepName.Transactions;
  readonly endpointsStepId = WizardStepName.Endpoints;
  readonly customerFieldsStepId = WizardStepName.CustomerFields;
  readonly fieldMappingStepId = WizardStepName.FieldMapping;
  readonly masterMappingStepId = WizardStepName.MasterMapping;
  readonly configurationsStepId = WizardStepName.Configurations;
  readonly schedulerStepId = WizardStepName.Scheduler;
  readonly reviewStepId = WizardStepName.ReviewSubmit;

  readonly wizardForm: FormGroup = this.createWizardFormStructure();
  isImporting = false;
  reviewModel: OnboardingModel | null = null;

  ngOnInit(): void {
    this.restoreWizardState();
  }

  ngAfterViewInit(): void {
    this.syncStepperIndex();
  }

  asFormGroup(control: AbstractControl | null): FormGroup {
    return control as FormGroup;
  }

  get selectedApplicationId(): number | null {
    return this.wizardState.getBasicDetails()?.applicationId ?? null;
  }

  isStepCompleted(index: number): boolean {
    return index < this.navigation.currentStepIndex();
  }

  onStepSelectionChange(event: StepperSelectionEvent): void {
    if (event.selectedIndex === event.previouslySelectedIndex) {
      return;
    }

    this.saveCurrentStepValues(false);
    this.navigation.setCurrentStepIndex(event.selectedIndex);
    this.syncNavigationContext();
    this.loadCurrentStepFormFromState();
    this.refreshReviewModel();
    this.wizardState.persistDraftToLocalStorage();
    this.syncSessionRoute();
  }

  onImportExistingCustomer(): void {
    this.csvFileInput?.nativeElement.click();
  }

  async onCsvFileSelected(event: Event): Promise<void> {
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
    this.navigation.reset();
    this.syncStepperIndex();
    this.syncNavigationContext();
    this.loadCurrentStepFormFromState();
    this.refreshReviewModel();
    this.wizardState.persistDraftToLocalStorage();
    this.syncSessionRoute();

    this.snackBar.open('Template imported successfully.', 'OK', {
      duration: 4000,
      panelClass: ['ac-snackbar', 'ac-snackbar--success'],
    });
  }

  onPrevious(): void {
    this.saveCurrentStepValues(false);
    this.navigation.goToPreviousStep();
    this.syncStepperIndex();
    this.syncNavigationContext();
    this.loadCurrentStepFormFromState();
    this.refreshReviewModel();
    this.syncSessionRoute();
  }

  onNext(): void {
    if (!this.saveCurrentStepValues(true)) {
      return;
    }

    this.navigation.goToNextStep();
    this.syncStepperIndex();
    this.syncNavigationContext();
    this.wizardState.persistDraftToLocalStorage();
    this.loadCurrentStepFormFromState();
    this.refreshReviewModel();
    this.syncSessionRoute();
  }

  onSaveDraft(): void {
    this.saveCurrentStepValues(false);
    this.syncNavigationContext();
    this.wizardState.persistDraftToLocalStorage();

    const model = this.wizardState.getCurrentData();
    const dialogRef = this.dialog.open(DraftSummaryDialogComponent, {
      width: '640px',
      maxWidth: '94vw',
      data: {
        customerName: model.basicDetails?.customerName ?? '',
        customerId: model.basicDetails?.customerId ?? '',
        currentStep: resolveStepTitle(this.wizardState.getCurrentStep()),
        sections: buildDraftSummarySections(model),
      },
    });

    dialogRef.afterClosed().subscribe((result: 'dashboard' | 'continue' | undefined) => {
      if (result === 'dashboard') {
        void this.router.navigate(['/onboarding']);
      }
    });
  }

  onBackToDashboard(): void {
    this.saveCurrentStepValues(false);
    this.syncNavigationContext();
    this.wizardState.persistDraftToLocalStorage();
    void this.router.navigate(['/onboarding']);
  }

  onSubmit(): void {
    this.saveCurrentStepValues(false);
    this.refreshReviewModel();

    try {
      this.isSubmitting = true;
      const model = this.wizardState.getCurrentData();
      const script = this.sqlGeneration.generate(model);
      this.sqlGeneration.download(script);
      this.wizardState.persistDraftToLocalStorage();

      this.snackBar.open(`SQL script downloaded: ${script.fileName}`, 'OK', {
        duration: 5000,
        panelClass: ['ac-snackbar', 'ac-snackbar--success'],
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to generate SQL script.';
      this.snackBar.open(message, 'Dismiss', {
        duration: 6000,
        panelClass: ['ac-snackbar', 'ac-snackbar--error'],
      });
    } finally {
      this.isSubmitting = false;
    }
  }

  onCancel(): void {
    void this.router.navigate(['/onboarding']);
  }

  private saveCurrentStepValues(requireValid: boolean): boolean {
    const step = this.navigation.currentStep();
    const stepForm = this.wizardForm.get(step.id) as FormGroup | null;

    if (!stepForm) {
      return false;
    }

    if (requireValid && step.id === WizardStepName.Transactions) {
      const transactions = (stepForm.getRawValue() as TransactionsStepModel).transactions ?? [];
      if (!this.transactionEndpointSync.hasEnabledTransaction(transactions)) {
        this.snackBar.open('Please select at least one Transaction.', 'Dismiss', {
          duration: 5000,
          panelClass: ['ac-snackbar', 'ac-snackbar--error'],
        });
        return false;
      }
    }

    if (requireValid && step.id !== WizardStepName.ReviewSubmit) {
      stepForm.markAllAsTouched();
      stepForm.updateValueAndValidity({ emitEvent: false });

      if (stepForm.invalid) {
        return false;
      }
    }

    const rawValue = extractStepFormValue(this.wizardForm, step.id);

    switch (step.id) {
      case WizardStepName.BasicDetails:
        this.wizardState.setBasicDetails(rawValue as BasicDetailsFormModel);
        break;
      case WizardStepName.Companies:
        this.wizardState.updateStep(WizardStepName.Companies, rawValue as CompaniesStepModel);
        break;
      case WizardStepName.Credentials:
        this.wizardState.updateStep(WizardStepName.Credentials, rawValue as CredentialsFormModel);
        break;
      case WizardStepName.Transactions:
        this.wizardState.updateStep(
          WizardStepName.Transactions,
          rawValue as TransactionsStepModel
        );
        // Keep endpoints form aligned after sync.
        patchWizardFormFromModel(this.wizardForm, this.formBuilder, this.wizardState.getCurrentData());
        break;
      case WizardStepName.Endpoints:
        this.wizardState.updateStep(WizardStepName.Endpoints, rawValue as EndpointsStepModel);
        break;
      case WizardStepName.CustomerFields:
        this.wizardState.updateStep(
          WizardStepName.CustomerFields,
          rawValue as CustomerFieldsStepModel
        );
        break;
      case WizardStepName.FieldMapping:
        this.wizardState.updateStep(WizardStepName.FieldMapping, rawValue as FieldMappingStepModel);
        break;
      case WizardStepName.MasterMapping:
        this.wizardState.updateStep(
          WizardStepName.MasterMapping,
          rawValue as MasterMappingStepModel
        );
        break;
      case WizardStepName.Configurations:
        this.wizardState.updateStep(
          WizardStepName.Configurations,
          rawValue as ConfigurationsStepModel
        );
        break;
      case WizardStepName.Scheduler:
        this.wizardState.updateStep(WizardStepName.Scheduler, rawValue as SchedulerStepModel);
        break;
      default:
        break;
    }

    this.syncNavigationContext();
    return true;
  }

  private restoreWizardState(): void {
    const routeSessionId = this.route.snapshot.paramMap.get('sessionId');
    const routeStepPath = this.route.snapshot.paramMap.get('stepPath');
    const isNewRoute = this.route.snapshot.routeConfig?.path === 'new';

    if (isNewRoute) {
      // Fresh session; landing page already called reset().
    } else if (routeSessionId) {
      const draft = this.wizardState.loadDraft(routeSessionId);
      if (draft) {
        this.navigation.setCurrentStepIndex(draft.CurrentStepIndex);
      }
    } else {
      const active = this.localStorageService.getActiveSessionId();
      if (active) {
        const draft = this.wizardState.loadDraft(active);
        if (draft) {
          this.navigation.setCurrentStepIndex(draft.CurrentStepIndex);
        }
      }
    }

    if (routeStepPath) {
      const stepIndex = WIZARD_STEPS.findIndex((step) => step.routePath === routeStepPath);
      if (stepIndex >= 0) {
        this.navigation.setCurrentStepIndex(stepIndex);
        this.wizardState.setNavigationContext(WIZARD_STEPS[stepIndex].id, stepIndex);
      }
    }

    this.syncStepperIndex();
    this.loadCurrentStepFormFromState();
    this.refreshReviewModel();
    this.syncNavigationContext();
  }

  private loadCurrentStepFormFromState(): void {
    const model = this.wizardState.getCurrentData();
    patchWizardFormFromModel(this.wizardForm, this.formBuilder, model);
  }

  private refreshReviewModel(): void {
    this.reviewModel = this.wizardState.getCurrentData();
  }

  private syncNavigationContext(): void {
    const step = this.navigation.currentStep();
    this.wizardState.setNavigationContext(step.id, this.navigation.currentStepIndex());
  }

  private syncStepperIndex(): void {
    if (this.wizardStepper) {
      this.wizardStepper.selectedIndex = this.navigation.currentStepIndex();
    }
  }

  private syncSessionRoute(): void {
    const sessionId = this.wizardState.ensureSessionId();
    const stepPath = this.navigation.currentStep().routePath;
    void this.router.navigate(['/onboarding', sessionId, stepPath], { replaceUrl: true });
  }

  private createWizardFormStructure(): FormGroup {
    return this.formBuilder.group({
      [WizardStepName.BasicDetails]: buildBasicDetailsForm(this.formBuilder),
      [WizardStepName.Companies]: buildCompaniesForm(this.formBuilder),
      [WizardStepName.Credentials]: buildCredentialsForm(this.formBuilder),
      [WizardStepName.Transactions]: buildTransactionsForm(this.formBuilder),
      [WizardStepName.Endpoints]: buildEndpointsForm(this.formBuilder),
      [WizardStepName.CustomerFields]: buildCustomerFieldsForm(this.formBuilder),
      [WizardStepName.FieldMapping]: buildFieldMappingForm(this.formBuilder),
      [WizardStepName.MasterMapping]: buildMasterMappingForm(this.formBuilder),
      [WizardStepName.Configurations]: buildConfigurationsForm(this.formBuilder),
      [WizardStepName.Scheduler]: buildSchedulerForm(this.formBuilder),
      [WizardStepName.ReviewSubmit]: this.formBuilder.group({}),
    });
  }
}
