import { Injectable, inject } from '@angular/core';
import { WIZARD_STEPS, WIZARD_TOTAL_STEPS } from '../../onboarding-wizard/constants/wizard-steps.constant';
import { WizardStepName } from '../../onboarding-wizard/constants/wizard-step-names.constant';
import { OnboardingLocalDraftSession } from '../../onboarding-wizard/models/onboarding-local-draft.model';
import { LocalStorageService } from '../../onboarding-wizard/services/local-storage.service';
import {
  APPLICATION_OPTIONS_BY_INTEGRATION_TYPE,
  INTEGRATION_TYPE_OPTIONS,
} from '../../onboarding-wizard/steps/basic-details/basic-details-options.constant';
import {
  DASHBOARD_STEP_LABELS,
  DashboardFilterState,
  DashboardSessionRow,
  DashboardSessionStatus,
  DashboardSummaryCard,
} from '../models/dashboard-session.model';

/**
 * Reads onboarding sessions from localStorage and maps them for the dashboard UI.
 * Ready to swap to GET /sessions later without changing the page component.
 */
@Injectable({ providedIn: 'root' })
export class DashboardSessionService {
  private readonly localStorageService = inject(LocalStorageService);

  getSessions(): DashboardSessionRow[] {
    return this.localStorageService
      .getAllDrafts()
      .map((draft) => this.toRow(draft))
      .sort(
        (left, right) =>
          new Date(right.updatedDate).getTime() - new Date(left.updatedDate).getTime()
      );
  }

  filterSessions(
    sessions: readonly DashboardSessionRow[],
    filters: DashboardFilterState
  ): DashboardSessionRow[] {
    const search = filters.search.trim().toLowerCase();

    return sessions.filter((session) => {
      if (search) {
        const haystack = [
          session.customerId,
          session.customerName,
          session.company,
          session.application,
          session.integrationType,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(search)) {
          return false;
        }
      }

      if (
        filters.integrationType !== 'All' &&
        session.integrationType !== filters.integrationType
      ) {
        return false;
      }

      if (filters.application !== 'All' && session.application !== filters.application) {
        return false;
      }

      if (filters.status !== 'All' && session.status !== filters.status) {
        return false;
      }

      if (filters.currentStep !== 'All' && session.currentStep !== filters.currentStep) {
        return false;
      }

      if (filters.createdDate && !this.sameCalendarDay(session.createdDate, filters.createdDate)) {
        return false;
      }

      if (filters.updatedDate && !this.sameCalendarDay(session.updatedDate, filters.updatedDate)) {
        return false;
      }

      return true;
    });
  }

  buildSummary(sessions: readonly DashboardSessionRow[]): readonly DashboardSummaryCard[] {
    const countBy = (status: DashboardSessionStatus): number =>
      sessions.filter((session) => session.status === status).length;

    return [
      {
        key: 'total',
        label: 'Total Customers',
        count: sessions.length,
        subtitle: 'All onboarding sessions',
        icon: 'groups',
        tone: 'primary',
      },
      {
        key: 'Draft',
        label: 'Draft',
        count: countBy('Draft'),
        subtitle: 'In progress drafts',
        icon: 'edit_note',
        tone: 'draft',
      },
      {
        key: 'Completed',
        label: 'Completed',
        count: countBy('Completed'),
        subtitle: 'Fully completed',
        icon: 'task_alt',
        tone: 'success',
      },
      {
        key: 'Generated SQL',
        label: 'Generated SQL',
        count: countBy('Generated SQL'),
        subtitle: 'SQL script produced',
        icon: 'data_object',
        tone: 'purple',
      },
      {
        key: 'Pending Review',
        label: 'Pending Review',
        count: countBy('Pending Review'),
        subtitle: 'Awaiting final review',
        icon: 'hourglass_top',
        tone: 'warning',
      },
    ];
  }

  deleteSession(sessionId: string): void {
    this.localStorageService.deleteDraft(sessionId);
  }

  duplicateSession(sessionId: string): OnboardingLocalDraftSession | null {
    const source = this.localStorageService.getDraft(sessionId);
    if (!source) {
      return null;
    }

    const now = new Date().toISOString();
    const clone: OnboardingLocalDraftSession = {
      ...structuredClone(source),
      sessionId: crypto.randomUUID(),
      CustomerName: source.CustomerName
        ? `${source.CustomerName} (Copy)`
        : source.CustomerName,
      Status: 'Draft',
      CreatedDate: now,
      UpdatedDate: now,
    };

    this.localStorageService.saveDraft(clone);
    return clone;
  }

  markSqlGenerated(sessionId: string): void {
    const draft = this.localStorageService.getDraft(sessionId);
    if (!draft) {
      return;
    }

    this.localStorageService.updateDraft(sessionId, {
      ...draft,
      Status: 'SQL Generated',
      UpdatedDate: new Date().toISOString(),
    });
  }

  private toRow(draft: OnboardingLocalDraftSession): DashboardSessionRow {
    const integrationType =
      INTEGRATION_TYPE_OPTIONS.find((option) => option.value === draft.IntegrationTypeId)?.label ??
      '—';

    const applicationOptions =
      draft.IntegrationTypeId !== null
        ? (APPLICATION_OPTIONS_BY_INTEGRATION_TYPE[draft.IntegrationTypeId] ?? [])
        : [];

    const application =
      applicationOptions.find((option) => option.value === draft.ApplicationId)?.label ?? '—';

    const stepIndex = Math.min(
      Math.max(draft.CurrentStepIndex ?? 0, 0),
      WIZARD_TOTAL_STEPS - 1
    );
    const stepDef = WIZARD_STEPS[stepIndex];
    const currentStep = draft.CurrentStep || stepDef?.id || WizardStepName.BasicDetails;
    const company =
      draft.WizardData?.Companies?.companies?.[0]?.companyName ||
      draft.WizardData?.Companies?.companies?.[0]?.companyCode ||
      '—';

    return {
      sessionId: draft.sessionId,
      customerId: draft.CustomerId || '—',
      customerName: draft.CustomerName || 'Untitled customer',
      company,
      integrationType,
      application,
      currentStep,
      currentStepLabel: DASHBOARD_STEP_LABELS[currentStep] ?? stepDef?.title ?? 'Basic Details',
      currentStepIndex: stepIndex,
      totalSteps: WIZARD_TOTAL_STEPS,
      progressPercent: Math.round(((stepIndex + 1) / WIZARD_TOTAL_STEPS) * 100),
      status: this.resolveStatus(draft),
      createdDate: draft.CreatedDate,
      updatedDate: draft.UpdatedDate,
      lastModifiedBy: 'Implementation Team',
    };
  }

  private resolveStatus(draft: OnboardingLocalDraftSession): DashboardSessionStatus {
    const raw = String(draft.Status || 'Draft');

    if (raw === 'Cancelled') {
      return 'Cancelled';
    }
    if (raw === 'SQL Generated' || raw === 'Generated SQL') {
      return 'Generated SQL';
    }
    if (raw === 'Completed') {
      return 'Completed';
    }
    if (
      draft.CurrentStep === WizardStepName.ReviewSubmit ||
      draft.CurrentStepIndex >= WIZARD_TOTAL_STEPS - 1
    ) {
      return 'Pending Review';
    }

    return 'Draft';
  }

  private sameCalendarDay(isoDate: string, filterDate: string): boolean {
    const left = new Date(isoDate);
    const right = new Date(filterDate);
    if (Number.isNaN(left.getTime()) || Number.isNaN(right.getTime())) {
      return false;
    }

    return (
      left.getFullYear() === right.getFullYear() &&
      left.getMonth() === right.getMonth() &&
      left.getDate() === right.getDate()
    );
  }
}
