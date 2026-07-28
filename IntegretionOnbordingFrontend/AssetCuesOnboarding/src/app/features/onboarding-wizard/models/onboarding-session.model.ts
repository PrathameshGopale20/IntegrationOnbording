export type OnboardingSessionStatus =
  | 'Draft'
  | 'In Progress'
  | 'Completed'
  | 'SQL Generated'
  | 'Cancelled';

export interface OnboardingSessionListItem {
  readonly id: string;
  readonly customerName: string;
  readonly customerCode: string;
  readonly integrationType: string;
  readonly status: OnboardingSessionStatus;
  readonly createdBy: string;
  readonly createdDate: string;
  readonly lastUpdated: string;
}
