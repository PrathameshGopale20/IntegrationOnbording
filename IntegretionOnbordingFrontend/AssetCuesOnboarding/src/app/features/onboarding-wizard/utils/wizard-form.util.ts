import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DEFAULT_TRANSACTION_CATALOG } from '../constants/default-transactions.constant';
import { WizardStepName } from '../constants/wizard-step-names.constant';
import { CompaniesStepModel, OnboardingModel } from '../models/onboarding-model';
import { BasicDetailsFormModel } from '../steps/basic-details/basic-details.model';
import { buildCompanyFormGroup, getCompaniesArray } from '../steps/companies/companies-form.builder';
import { CredentialsFormModel } from '../steps/credentials/credentials.model';
import { TransactionsStepModel } from '../steps/transactions/transactions.model';
import {
  buildTransactionItemGroup,
  getTransactionsArray,
} from '../steps/transactions/transactions-form.builder';
import { EndpointsStepModel } from '../steps/endpoints/endpoints.model';
import {
  buildEndpointItemGroup,
  getEndpointsArray,
} from '../steps/endpoints/endpoints-form.builder';
import { CustomerFieldsStepModel } from '../steps/customer-fields/customer-fields.model';
import {
  buildCustomerFieldItemGroup,
  getCustomerFieldsArray,
} from '../steps/customer-fields/customer-fields-form.builder';
import { FieldMappingStepModel } from '../steps/field-mapping/field-mapping.model';
import {
  buildFieldMappingItemGroup,
  getFieldMappingsArray,
} from '../steps/field-mapping/field-mapping-form.builder';
import { MasterMappingStepModel } from '../steps/master-mapping/master-mapping.model';
import {
  buildMasterMappingItemGroup,
  getMasterMappingsArray,
} from '../steps/master-mapping/master-mapping-form.builder';
import { ConfigurationsStepModel } from '../steps/configurations/configurations.model';
import {
  buildAssetClassGroup,
  getAssetClassesArray,
  getConfigurationItemsArray,
} from '../steps/configurations/configurations-form.builder';
import { SchedulerStepModel } from '../steps/scheduler/scheduler.model';
import { getSelectedDaysArray } from '../steps/scheduler/scheduler-form.builder';

export function extractStepFormValue(
  wizardForm: FormGroup,
  step: WizardStepName
): unknown {
  const control = wizardForm.get(step);
  if (!control) {
    return null;
  }

  return control.getRawValue();
}

export function patchWizardFormFromModel(
  wizardForm: FormGroup,
  formBuilder: FormBuilder,
  model: OnboardingModel
): void {
  if (model.basicDetails) {
    patchBasicDetails(wizardForm, model.basicDetails);
  }

  if (model.companies) {
    patchCompanies(wizardForm, formBuilder, model.companies);
  }

  if (model.credentials) {
    patchCredentials(wizardForm, model.credentials);
  }

  if (model.transactions) {
    patchTransactions(wizardForm, formBuilder, model.transactions);
  }

  if (model.endpoints) {
    patchEndpoints(wizardForm, formBuilder, model.endpoints);
  }

  if (model.customerFields) {
    patchCustomerFields(wizardForm, formBuilder, model.customerFields);
  }

  if (model.fieldMapping) {
    patchFieldMappings(wizardForm, formBuilder, model.fieldMapping);
  }

  if (model.masterMapping) {
    patchMasterMappings(wizardForm, formBuilder, model.masterMapping);
  }

  if (model.configurations) {
    patchConfigurations(wizardForm, formBuilder, model.configurations);
  }

  if (model.scheduler) {
    patchScheduler(wizardForm, model.scheduler);
  }
}

function patchBasicDetails(wizardForm: FormGroup, data: BasicDetailsFormModel): void {
  const group = wizardForm.get(WizardStepName.BasicDetails) as FormGroup | null;
  if (!group) {
    return;
  }

  group.patchValue(data, { emitEvent: true });

  const applicationControl = group.get('applicationId');
  const accessApproachControl = group.get('accessApproach');

  if (data.integrationTypeId) {
    applicationControl?.enable({ emitEvent: false });
  }

  if (data.applicationId) {
    accessApproachControl?.enable({ emitEvent: false });
  }

  accessApproachControl?.setValue(data.accessApproach ?? '', { emitEvent: false });
}

function patchCompanies(
  wizardForm: FormGroup,
  formBuilder: FormBuilder,
  data: CompaniesStepModel
): void {
  const group = wizardForm.get(WizardStepName.Companies) as FormGroup | null;
  if (!group) {
    return;
  }

  const companiesArray = getCompaniesArray(group);
  clearFormArray(companiesArray);

  const companies = data.companies ?? [];
  if (companies.length === 0) {
    companiesArray.push(buildCompanyFormGroup(formBuilder));
    return;
  }

  for (const company of companies) {
    const companyGroup = buildCompanyFormGroup(formBuilder);
    companyGroup.patchValue(company);
    companiesArray.push(companyGroup);
  }
}

function patchCredentials(wizardForm: FormGroup, data: CredentialsFormModel): void {
  const group = wizardForm.get(WizardStepName.Credentials) as FormGroup | null;
  group?.patchValue(data, { emitEvent: false });
}

function patchTransactions(
  wizardForm: FormGroup,
  formBuilder: FormBuilder,
  data: TransactionsStepModel
): void {
  const group = wizardForm.get(WizardStepName.Transactions) as FormGroup | null;
  if (!group) {
    return;
  }

  const array = getTransactionsArray(group);
  clearFormArray(array);
  const items =
    data.transactions?.length > 0
      ? data.transactions
      : [...DEFAULT_TRANSACTION_CATALOG];

  for (const item of items) {
    array.push(buildTransactionItemGroup(formBuilder, item));
  }
}

function patchEndpoints(
  wizardForm: FormGroup,
  formBuilder: FormBuilder,
  data: EndpointsStepModel
): void {
  const group = wizardForm.get(WizardStepName.Endpoints) as FormGroup | null;
  if (!group) {
    return;
  }

  const array = getEndpointsArray(group);
  clearFormArray(array);

  for (const item of data.endpoints ?? []) {
    array.push(buildEndpointItemGroup(formBuilder, item));
  }
}

function patchCustomerFields(
  wizardForm: FormGroup,
  formBuilder: FormBuilder,
  data: CustomerFieldsStepModel
): void {
  const group = wizardForm.get(WizardStepName.CustomerFields) as FormGroup | null;
  if (!group) {
    return;
  }

  const array = getCustomerFieldsArray(group);
  clearFormArray(array);
  const items = data.fields ?? [];
  if (items.length === 0) {
    array.push(buildCustomerFieldItemGroup(formBuilder));
    return;
  }

  for (const item of items) {
    array.push(buildCustomerFieldItemGroup(formBuilder, item));
  }
}

function patchFieldMappings(
  wizardForm: FormGroup,
  formBuilder: FormBuilder,
  data: FieldMappingStepModel
): void {
  const group = wizardForm.get(WizardStepName.FieldMapping) as FormGroup | null;
  if (!group) {
    return;
  }

  const array = getFieldMappingsArray(group);
  clearFormArray(array);
  const items = data.mappings ?? [];
  if (items.length === 0) {
    array.push(buildFieldMappingItemGroup(formBuilder));
    return;
  }

  for (const item of items) {
    array.push(buildFieldMappingItemGroup(formBuilder, item));
  }
}

function patchMasterMappings(
  wizardForm: FormGroup,
  formBuilder: FormBuilder,
  data: MasterMappingStepModel
): void {
  const group = wizardForm.get(WizardStepName.MasterMapping) as FormGroup | null;
  if (!group) {
    return;
  }

  const array = getMasterMappingsArray(group);
  clearFormArray(array);
  const items = data.mappings ?? [];
  if (items.length === 0) {
    array.push(buildMasterMappingItemGroup(formBuilder));
    return;
  }

  for (const item of items) {
    array.push(buildMasterMappingItemGroup(formBuilder, item));
  }
}

function patchConfigurations(
  wizardForm: FormGroup,
  formBuilder: FormBuilder,
  data: ConfigurationsStepModel
): void {
  const group = wizardForm.get(WizardStepName.Configurations) as FormGroup | null;
  if (!group) {
    return;
  }

  const itemsArray = getConfigurationItemsArray(group);
  for (let i = 0; i < itemsArray.length; i++) {
    const itemGroup = itemsArray.at(i) as FormGroup;
    const key = itemGroup.get('key')?.value as string;
    const match = data.items.find((item) => item.key === key);
    if (match) {
      itemGroup.patchValue(match, { emitEvent: false });
    }
  }

  const assetArray = getAssetClassesArray(group);
  clearFormArray(assetArray);
  for (const asset of data.assetClasses ?? []) {
    assetArray.push(buildAssetClassGroup(formBuilder, asset));
  }
}

function patchScheduler(wizardForm: FormGroup, data: SchedulerStepModel): void {
  const group = wizardForm.get(WizardStepName.Scheduler) as FormGroup | null;
  if (!group) {
    return;
  }

  group.patchValue(
    {
      frequency: data.frequency,
      startTime: data.startTime,
      endTime: data.endTime,
      parameters: data.parameters,
    },
    { emitEvent: false }
  );

  const days = getSelectedDaysArray(group);
  data.selectedDays.forEach((value, index) => {
    if (days.at(index)) {
      days.at(index).setValue(value, { emitEvent: false });
    }
  });
}

function clearFormArray(formArray: FormArray): void {
  while (formArray.length > 0) {
    formArray.removeAt(0);
  }
}
