import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WizardStepName } from '../constants/wizard-step-names.constant';
import {
  OnboardingLocalDraftSession,
  OnboardingWizardData,
  createEmptyWizardData,
} from '../models/onboarding-local-draft.model';
import {
  OnboardingModel,
  OnboardingStepDataMap,
  createEmptyOnboardingModel,
} from '../models/onboarding-model';
import { BasicDetailsFormModel } from '../steps/basic-details/basic-details.model';
import { TransactionsStepModel } from '../steps/transactions/transactions.model';
import { LocalStorageService } from './local-storage.service';
import { TransactionEndpointSyncService } from './transaction-endpoint-sync.service';

@Injectable({ providedIn: 'root' })
export class WizardStateService {
  private readonly localStorageService = inject(LocalStorageService);
  private readonly transactionEndpointSync = inject(TransactionEndpointSyncService);

  private readonly stateSubject = new BehaviorSubject<OnboardingModel>(createEmptyOnboardingModel());
  private sessionId: string | null = null;
  private currentStep: WizardStepName = WizardStepName.BasicDetails;
  private currentStepIndex = 0;
  private createdDate: string | null = null;

  readonly state$: Observable<OnboardingModel> = this.stateSubject.asObservable();

  setBasicDetails(data: BasicDetailsFormModel): void {
    this.updateStep(WizardStepName.BasicDetails, data);
  }

  getBasicDetails(): BasicDetailsFormModel | null {
    return this.stateSubject.getValue().basicDetails;
  }

  updateStep<K extends WizardStepName>(step: K, data: OnboardingStepDataMap[K]): void {
    const current = this.stateSubject.getValue();
    const next: OnboardingModel = { ...current };

    switch (step) {
      case WizardStepName.BasicDetails:
        next.basicDetails = data as BasicDetailsFormModel;
        break;
      case WizardStepName.Companies:
        next.companies = data as OnboardingModel['companies'];
        break;
      case WizardStepName.Credentials:
        next.credentials = data as OnboardingModel['credentials'];
        break;
      case WizardStepName.Transactions: {
        const transactions = data as TransactionsStepModel;
        next.transactions = transactions;
        next.endpoints = this.transactionEndpointSync.synchronizeStep(
          transactions,
          current.endpoints
        );
        break;
      }
      case WizardStepName.Endpoints:
        next.endpoints = data as OnboardingModel['endpoints'];
        break;
      case WizardStepName.CustomerFields:
        next.customerFields = data as OnboardingModel['customerFields'];
        break;
      case WizardStepName.FieldMapping:
        next.fieldMapping = data as OnboardingModel['fieldMapping'];
        break;
      case WizardStepName.MasterMapping:
        next.masterMapping = data as OnboardingModel['masterMapping'];
        break;
      case WizardStepName.Configurations:
        next.configurations = data as OnboardingModel['configurations'];
        break;
      case WizardStepName.Scheduler:
        next.scheduler = data as OnboardingModel['scheduler'];
        break;
      case WizardStepName.ReviewSubmit:
        next.review = data as OnboardingModel['review'];
        break;
      default:
        break;
    }

    this.stateSubject.next(next);
  }

  getCurrentData(): OnboardingModel {
    return this.stateSubject.getValue();
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  setSessionId(sessionId: string | null): void {
    this.sessionId = sessionId;
  }

  setNavigationContext(step: WizardStepName, stepIndex: number): void {
    this.currentStep = step;
    this.currentStepIndex = stepIndex;
  }

  getCurrentStep(): WizardStepName {
    return this.currentStep;
  }

  getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  ensureSessionId(): string {
    if (!this.sessionId) {
      this.sessionId = crypto.randomUUID();
      this.createdDate = new Date().toISOString();
    }

    return this.sessionId;
  }

  /**
   * Persists the full draft session into localStorage.
   * Later replace with POST/PUT /api/onboarding.
   */
  persistDraftToLocalStorage(): OnboardingLocalDraftSession {
    const sessionId = this.ensureSessionId();
    const now = new Date().toISOString();
    const existing = this.localStorageService.getDraft(sessionId);
    const basicDetails = this.getBasicDetails();
    const model = this.getCurrentData();

    const session: OnboardingLocalDraftSession = {
      sessionId,
      CustomerId: basicDetails?.customerId ?? existing?.CustomerId ?? '',
      CustomerName: basicDetails?.customerName ?? existing?.CustomerName ?? '',
      TenantId: basicDetails?.tenantId ?? existing?.TenantId ?? '',
      IntegrationTypeId: basicDetails?.integrationTypeId ?? existing?.IntegrationTypeId ?? null,
      ApplicationId: basicDetails?.applicationId ?? existing?.ApplicationId ?? null,
      CurrentStep: this.currentStep,
      CurrentStepIndex: this.currentStepIndex,
      Status: 'Draft',
      CreatedDate: existing?.CreatedDate ?? this.createdDate ?? now,
      UpdatedDate: now,
      WizardData: this.toWizardData(model, existing?.WizardData),
    };

    if (existing) {
      this.localStorageService.updateDraft(sessionId, session);
    } else {
      this.localStorageService.saveDraft(session);
    }

    return session;
  }

  loadDraft(sessionId: string): OnboardingLocalDraftSession | null {
    const draft = this.localStorageService.getDraft(sessionId);
    if (!draft) {
      return null;
    }

    this.sessionId = draft.sessionId;
    this.currentStep = draft.CurrentStep;
    this.currentStepIndex = draft.CurrentStepIndex;
    this.createdDate = draft.CreatedDate;
    this.stateSubject.next(
      this.transactionEndpointSync.ensureConsistent(this.fromWizardData(draft.WizardData))
    );
    this.localStorageService.setActiveSessionId(sessionId);
    return draft;
  }

  /**
   * Reloads WizardData from localStorage without changing navigation position.
   * Used by Previous so forms restore saved values.
   */
  reloadWizardDataFromStorage(): void {
    if (!this.sessionId) {
      return;
    }

    const draft = this.localStorageService.getDraft(this.sessionId);
    if (!draft) {
      return;
    }

    this.stateSubject.next(
      this.transactionEndpointSync.ensureConsistent(this.fromWizardData(draft.WizardData))
    );
  }

  loadActiveDraftIfAny(): OnboardingLocalDraftSession | null {
    const activeSessionId = this.localStorageService.getActiveSessionId();
    if (!activeSessionId) {
      return null;
    }

    return this.loadDraft(activeSessionId);
  }

  reset(): void {
    this.sessionId = null;
    this.currentStep = WizardStepName.BasicDetails;
    this.currentStepIndex = 0;
    this.createdDate = null;
    this.stateSubject.next(createEmptyOnboardingModel());
    this.localStorageService.clearActiveSessionId();
  }

  /**
   * Replaces wizard state with an imported onboarding model.
   * Keeps the current session id when editing an existing draft.
   */
  applyImportedModel(model: OnboardingModel): void {
    this.ensureSessionId();
    this.currentStep = WizardStepName.BasicDetails;
    this.currentStepIndex = 0;
    const merged: OnboardingModel = { ...createEmptyOnboardingModel(), ...model };
    this.stateSubject.next(this.transactionEndpointSync.ensureConsistent(merged));
  }

  private toWizardData(
    model: OnboardingModel,
    previous: OnboardingWizardData | undefined
  ): OnboardingWizardData {
    const empty = createEmptyWizardData();
    return {
      BasicDetails: model.basicDetails ?? previous?.BasicDetails ?? empty.BasicDetails,
      Companies: model.companies ?? previous?.Companies ?? empty.Companies,
      Credentials: model.credentials ?? previous?.Credentials ?? empty.Credentials,
      Transactions: model.transactions ?? previous?.Transactions ?? empty.Transactions,
      Endpoints: model.endpoints ?? previous?.Endpoints ?? empty.Endpoints,
      Fields: model.customerFields ?? previous?.Fields ?? empty.Fields,
      FieldMappings: model.fieldMapping ?? previous?.FieldMappings ?? empty.FieldMappings,
      MasterMappings: model.masterMapping ?? previous?.MasterMappings ?? empty.MasterMappings,
      Configurations: model.configurations ?? previous?.Configurations ?? empty.Configurations,
      Scheduler: model.scheduler ?? previous?.Scheduler ?? empty.Scheduler,
      Review: model.review ?? previous?.Review ?? empty.Review,
    };
  }

  private fromWizardData(data: OnboardingWizardData): OnboardingModel {
    return {
      basicDetails: data.BasicDetails,
      companies: data.Companies,
      credentials: data.Credentials,
      transactions: data.Transactions,
      endpoints: data.Endpoints,
      customerFields: data.Fields,
      fieldMapping: data.FieldMappings,
      masterMapping: data.MasterMappings,
      configurations: data.Configurations,
      scheduler: data.Scheduler,
      review: data.Review,
    };
  }
}
