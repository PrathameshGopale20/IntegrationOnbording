import { WizardStepName } from '../../onboarding-wizard/constants/wizard-step-names.constant';

/**
 * Display statuses for the Customer Integration dashboard.
 * Derived from persisted draft metadata (localStorage Status + current step).
 */
export type DashboardSessionStatus =
  | 'Draft'
  | 'Completed'
  | 'Generated SQL'
  | 'Pending Review'
  | 'Cancelled';

export interface DashboardSummaryCard {
  readonly key: DashboardSessionStatus | 'total';
  readonly label: string;
  readonly count: number;
  readonly subtitle: string;
  readonly icon: string;
  readonly tone: 'primary' | 'draft' | 'success' | 'purple' | 'warning' | 'danger';
}

export interface DashboardSessionRow {
  readonly sessionId: string;
  readonly customerId: string;
  readonly customerName: string;
  readonly company: string;
  readonly integrationType: string;
  readonly application: string;
  readonly currentStep: WizardStepName;
  readonly currentStepLabel: string;
  readonly currentStepIndex: number;
  readonly totalSteps: number;
  readonly progressPercent: number;
  readonly status: DashboardSessionStatus;
  readonly createdDate: string;
  readonly updatedDate: string;
  readonly lastModifiedBy: string;
}

export interface DashboardFilterState {
  search: string;
  integrationType: string;
  application: string;
  status: DashboardSessionStatus | 'All';
  currentStep: WizardStepName | 'All';
  createdDate: string | null;
  updatedDate: string | null;
}

export const DASHBOARD_STEP_LABELS: Readonly<Record<WizardStepName, string>> = {
  [WizardStepName.BasicDetails]: 'Basic Details',
  [WizardStepName.Companies]: 'Companies',
  [WizardStepName.Credentials]: 'Credentials',
  [WizardStepName.Transactions]: 'Transactions',
  [WizardStepName.Endpoints]: 'Endpoints',
  [WizardStepName.CustomerFields]: 'Fields',
  [WizardStepName.FieldMapping]: 'Field Mapping',
  [WizardStepName.MasterMapping]: 'Master Mapping',
  [WizardStepName.Configurations]: 'Configurations',
  [WizardStepName.Scheduler]: 'Scheduler',
  [WizardStepName.ReviewSubmit]: 'Review & Submit',
};

export interface DashboardStatusChipConfig {
  readonly label: DashboardSessionStatus;
  readonly cssClass: string;
}

export const DASHBOARD_STATUS_CHIP_MAP: Readonly<
  Record<DashboardSessionStatus, DashboardStatusChipConfig>
> = {
  Draft: {
    label: 'Draft',
    cssClass: 'dash-status dash-status--draft',
  },
  Completed: {
    label: 'Completed',
    cssClass: 'dash-status dash-status--completed',
  },
  'Generated SQL': {
    label: 'Generated SQL',
    cssClass: 'dash-status dash-status--sql',
  },
  'Pending Review': {
    label: 'Pending Review',
    cssClass: 'dash-status dash-status--pending',
  },
  Cancelled: {
    label: 'Cancelled',
    cssClass: 'dash-status dash-status--cancelled',
  },
};
