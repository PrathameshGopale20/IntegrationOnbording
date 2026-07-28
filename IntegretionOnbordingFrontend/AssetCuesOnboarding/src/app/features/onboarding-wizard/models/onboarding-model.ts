import { BasicDetailsFormModel } from '../steps/basic-details/basic-details.model';
import { CompanyFormModel } from '../steps/companies/companies.model';
import { CredentialsFormModel } from '../steps/credentials/credentials.model';
import { TransactionsStepModel } from '../steps/transactions/transactions.model';
import { EndpointsStepModel } from '../steps/endpoints/endpoints.model';
import { CustomerFieldsStepModel } from '../steps/customer-fields/customer-fields.model';
import { FieldMappingStepModel } from '../steps/field-mapping/field-mapping.model';
import { MasterMappingStepModel } from '../steps/master-mapping/master-mapping.model';
import { ConfigurationsStepModel } from '../steps/configurations/configurations.model';
import { SchedulerStepModel } from '../steps/scheduler/scheduler.model';
import { WizardStepName } from '../constants/wizard-step-names.constant';

export type { CredentialsFormModel } from '../steps/credentials/credentials.model';
export type ReviewFormModel = Record<string, unknown>;

export interface CompaniesStepModel {
  companies: CompanyFormModel[];
}

/**
 * Complete Customer Integration Onboarding wizard aggregate.
 * Single source model for all step data.
 */
export interface OnboardingModel {
  basicDetails: BasicDetailsFormModel | null;
  companies: CompaniesStepModel | null;
  credentials: CredentialsFormModel | null;
  transactions: TransactionsStepModel | null;
  endpoints: EndpointsStepModel | null;
  customerFields: CustomerFieldsStepModel | null;
  fieldMapping: FieldMappingStepModel | null;
  masterMapping: MasterMappingStepModel | null;
  configurations: ConfigurationsStepModel | null;
  scheduler: SchedulerStepModel | null;
  review: ReviewFormModel | null;
}

export type OnboardingStepDataMap = {
  [WizardStepName.BasicDetails]: BasicDetailsFormModel;
  [WizardStepName.Companies]: CompaniesStepModel;
  [WizardStepName.Credentials]: CredentialsFormModel;
  [WizardStepName.Transactions]: TransactionsStepModel;
  [WizardStepName.Endpoints]: EndpointsStepModel;
  [WizardStepName.CustomerFields]: CustomerFieldsStepModel;
  [WizardStepName.FieldMapping]: FieldMappingStepModel;
  [WizardStepName.MasterMapping]: MasterMappingStepModel;
  [WizardStepName.Configurations]: ConfigurationsStepModel;
  [WizardStepName.Scheduler]: SchedulerStepModel;
  [WizardStepName.ReviewSubmit]: ReviewFormModel;
};

export function createEmptyOnboardingModel(): OnboardingModel {
  return {
    basicDetails: null,
    companies: null,
    credentials: null,
    transactions: null,
    endpoints: null,
    customerFields: null,
    fieldMapping: null,
    masterMapping: null,
    configurations: null,
    scheduler: null,
    review: null,
  };
}
