import { OnboardingSessionStatus } from '../models/onboarding-session.model';

export interface OnboardingStatusChipConfig {
  readonly label: OnboardingSessionStatus;
  readonly cssClass: string;
}

export const ONBOARDING_STATUS_CHIP_MAP: Readonly<
  Record<OnboardingSessionStatus, OnboardingStatusChipConfig>
> = {
  Draft: {
    label: 'Draft',
    cssClass: 'status-chip status-chip--draft',
  },
  'In Progress': {
    label: 'In Progress',
    cssClass: 'status-chip status-chip--in-progress',
  },
  Completed: {
    label: 'Completed',
    cssClass: 'status-chip status-chip--completed',
  },
  'SQL Generated': {
    label: 'SQL Generated',
    cssClass: 'status-chip status-chip--sql-generated',
  },
  Cancelled: {
    label: 'Cancelled',
    cssClass: 'status-chip status-chip--cancelled',
  },
};
