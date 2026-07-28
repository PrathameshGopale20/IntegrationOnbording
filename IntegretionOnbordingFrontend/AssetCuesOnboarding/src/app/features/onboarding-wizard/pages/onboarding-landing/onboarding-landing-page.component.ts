import { Component, OnInit, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ONBOARDING_STATUS_CHIP_MAP } from '../../constants/onboarding-status.constant';
import { WIZARD_STEPS } from '../../constants/wizard-steps.constant';
import { OnboardingLocalDraftSession } from '../../models/onboarding-local-draft.model';
import { OnboardingSessionStatus } from '../../models/onboarding-session.model';
import { LocalStorageService } from '../../services/local-storage.service';
import { WizardStateService } from '../../services/wizard-state.service';
import {
  APPLICATION_OPTIONS_BY_INTEGRATION_TYPE,
  INTEGRATION_TYPE_OPTIONS,
} from '../../steps/basic-details/basic-details-options.constant';

export interface OnboardingDraftListItem {
  sessionId: string;
  customerName: string;
  customerId: string;
  integrationType: string;
  application: string;
  currentStep: string;
  status: OnboardingLocalDraftSession['Status'];
  createdDate: string;
  updatedDate: string;
}

@Component({
  selector: 'app-onboarding-landing-page',
  templateUrl: './onboarding-landing-page.component.html',
  styleUrl: './onboarding-landing-page.component.scss',
  standalone: false,
})
export class OnboardingLandingPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly wizardState = inject(WizardStateService);
  private readonly localStorageService = inject(LocalStorageService);

  readonly pageTitle = 'Customer Integration Onboarding';
  readonly pageDescription =
    'Create and manage customer integration onboarding sessions for the AssetCues Integration System.';

  readonly searchControl = new FormControl<string>('', { nonNullable: true });

  readonly displayedColumns: readonly string[] = [
    'customerName',
    'customerId',
    'integrationType',
    'application',
    'currentStep',
    'status',
    'createdDate',
    'updatedDate',
    'actions',
  ];

  sessions: OnboardingDraftListItem[] = [];

  readonly statusChipMap = ONBOARDING_STATUS_CHIP_MAP;

  get hasSessions(): boolean {
    return this.filteredSessions.length > 0;
  }

  get filteredSessions(): OnboardingDraftListItem[] {
    const term = this.searchControl.value.trim().toLowerCase();
    if (!term) {
      return this.sessions;
    }

    return this.sessions.filter(
      (session) =>
        session.customerName.toLowerCase().includes(term) ||
        session.customerId.toLowerCase().includes(term)
    );
  }

  ngOnInit(): void {
    this.loadDrafts();
  }

  getStatusChipClass(status: OnboardingSessionStatus): string {
    return this.statusChipMap[status].cssClass;
  }

  onRefresh(): void {
    this.loadDrafts();
  }

  onStartNewOnboarding(): void {
    this.wizardState.reset();
    void this.router.navigate(['/onboarding', 'new']);
  }

  onResume(session: OnboardingDraftListItem): void {
    const draft = this.wizardState.loadDraft(session.sessionId);
    if (!draft) {
      return;
    }

    const stepPath =
      WIZARD_STEPS.find((step) => step.id === draft.CurrentStep)?.routePath ?? 'basic-details';

    void this.router.navigate(['/onboarding', draft.sessionId, stepPath]);
  }

  onDelete(session: OnboardingDraftListItem): void {
    this.localStorageService.deleteDraft(session.sessionId);
    this.loadDrafts();
  }

  private loadDrafts(): void {
    this.sessions = this.localStorageService.getAllDrafts().map((draft) => this.toListItem(draft));
  }

  private toListItem(draft: OnboardingLocalDraftSession): OnboardingDraftListItem {
    const integrationType =
      INTEGRATION_TYPE_OPTIONS.find((option) => option.value === draft.IntegrationTypeId)?.label ??
      '';

    const applicationOptions =
      draft.IntegrationTypeId !== null
        ? (APPLICATION_OPTIONS_BY_INTEGRATION_TYPE[draft.IntegrationTypeId] ?? [])
        : [];

    const application =
      applicationOptions.find((option) => option.value === draft.ApplicationId)?.label ?? '';

    const currentStep =
      WIZARD_STEPS.find((step) => step.id === draft.CurrentStep)?.title ?? draft.CurrentStep;

    return {
      sessionId: draft.sessionId,
      customerName: draft.CustomerName,
      customerId: draft.CustomerId,
      integrationType,
      application,
      currentStep,
      status: draft.Status,
      createdDate: draft.CreatedDate,
      updatedDate: draft.UpdatedDate,
    };
  }
}
