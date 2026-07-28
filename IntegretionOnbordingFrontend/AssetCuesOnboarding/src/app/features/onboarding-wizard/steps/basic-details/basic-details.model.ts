export interface SelectOption {
  readonly value: number;
  readonly label: string;
}

export interface ApplicationSelectOption extends SelectOption {
  readonly accessApproach?: string;
}

/**
 * Maps to integration.in_integrationcustomerapplications
 * and related fields on integration.in_customerintegrations.
 */
export interface BasicDetailsFormModel {
  customerId: string;
  customerName: string;
  tenantId: string;
  integrationTypeId: number | null;
  applicationId: number | null;
  accessApproach: string;
  isEnabled: boolean;
}
