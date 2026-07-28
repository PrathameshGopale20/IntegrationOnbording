import { WizardStepName } from '../constants/wizard-step-names.constant';
import { BasicDetailsFormModel } from '../steps/basic-details/basic-details.model';
import { CredentialsFormModel } from '../steps/credentials/credentials.model';
import { TransactionsStepModel } from '../steps/transactions/transactions.model';
import { EndpointsStepModel } from '../steps/endpoints/endpoints.model';
import { CustomerFieldsStepModel } from '../steps/customer-fields/customer-fields.model';
import { FieldMappingStepModel } from '../steps/field-mapping/field-mapping.model';
import { MasterMappingStepModel } from '../steps/master-mapping/master-mapping.model';
import { ConfigurationsStepModel } from '../steps/configurations/configurations.model';
import { SchedulerStepModel } from '../steps/scheduler/scheduler.model';
import { CompaniesStepModel } from './onboarding-model';

/**
 * Wizard payload stored inside each local draft session.
 * Field names match the temporary localStorage contract and can map 1:1 to future API DTOs.
 */
export interface OnboardingWizardData {
  BasicDetails: BasicDetailsFormModel | null;
  Companies: CompaniesStepModel | null;
  Credentials: CredentialsFormModel | null;
  Transactions: TransactionsStepModel | null;
  Endpoints: EndpointsStepModel | null;
  Fields: CustomerFieldsStepModel | null;
  FieldMappings: FieldMappingStepModel | null;
  MasterMappings: MasterMappingStepModel | null;
  Configurations: ConfigurationsStepModel | null;
  Scheduler: SchedulerStepModel | null;
  Review: Record<string, unknown> | null;
}

/**
 * Complete onboarding draft session persisted in localStorage.
 * Designed to be replaceable later by REST resources.
 */
export interface OnboardingLocalDraftSession {
  sessionId: string;
  CustomerId: string;
  CustomerName: string;
  TenantId: string;
  IntegrationTypeId: number | null;
  ApplicationId: number | null;
  CurrentStep: WizardStepName;
  CurrentStepIndex: number;
  Status: 'Draft' | 'Completed' | 'SQL Generated' | 'Cancelled';
  CreatedDate: string;
  UpdatedDate: string;
  WizardData: OnboardingWizardData;
}

export function createEmptyWizardData(): OnboardingWizardData {
  return {
    BasicDetails: null,
    Companies: null,
    Credentials: null,
    Transactions: null,
    Endpoints: null,
    Fields: null,
    FieldMappings: null,
    MasterMappings: null,
    Configurations: null,
    Scheduler: null,
    Review: null,
  };
}
