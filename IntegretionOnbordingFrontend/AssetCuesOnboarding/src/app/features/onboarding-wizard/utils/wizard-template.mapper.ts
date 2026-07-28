import { REQUIRED_BASIC_DETAIL_FIELDS } from '../constants/template-import.constant';
import {
  APPLICATION_FIELD_NAME_BY_ID,
  resolveApplicableFor,
  resolveCreationTrigger,
  resolveEndpointTypeLabel,
  resolveTransactionName,
} from '../constants/import-display.constant';
import { ParsedTemplatePayload, ParsedTemplateRecord } from '../models/import-result.model';
import {
  CompaniesStepModel,
  OnboardingModel,
  createEmptyOnboardingModel,
} from '../models/onboarding-model';
import { BasicDetailsFormModel } from '../steps/basic-details/basic-details.model';
import { CompanyFormModel } from '../steps/companies/companies.model';
import {
  CredentialsFormModel,
  createEmptyCredentialsFormModel,
} from '../steps/credentials/credentials.model';
import { TransactionsStepModel } from '../steps/transactions/transactions.model';
import { EndpointsStepModel } from '../steps/endpoints/endpoints.model';
import { CustomerFieldsStepModel } from '../steps/customer-fields/customer-fields.model';
import { FieldMappingStepModel } from '../steps/field-mapping/field-mapping.model';
import { MasterMappingStepModel } from '../steps/master-mapping/master-mapping.model';
import {
  ConfigurationsStepModel,
  createDefaultConfigurationItems,
} from '../steps/configurations/configurations.model';
import {
  SchedulerStepModel,
  createEmptySchedulerModel,
  daysFromBitmask,
} from '../steps/scheduler/scheduler.model';

export interface WizardMapResult {
  readonly model: OnboardingModel;
  readonly importedSections: readonly string[];
}

/**
 * Maps parser-agnostic template records into the wizard OnboardingModel.
 * Wizard UI depends only on this mapper output — not on CSV/JSON/Excel specifics.
 */
export function mapParsedTemplateToOnboardingModel(
  payload: ParsedTemplatePayload
): WizardMapResult {
  const bySection = groupBySection(payload.records);
  const model = createEmptyOnboardingModel();
  const importedSections: string[] = [];

  if (bySection.has('BasicDetails')) {
    model.basicDetails = mapBasicDetails(bySection.get('BasicDetails')!);
    importedSections.push('Basic Details');
  }

  if (bySection.has('Companies')) {
    model.companies = mapCompanies(bySection.get('Companies')!);
    importedSections.push('Companies');
  }

  if (bySection.has('Credentials')) {
    model.credentials = mapCredentials(bySection.get('Credentials')!);
    importedSections.push('Credentials');
  }

  if (bySection.has('Transactions')) {
    model.transactions = mapTransactions(bySection.get('Transactions')!);
    importedSections.push('Transactions');
  }

  if (bySection.has('Endpoints')) {
    model.endpoints = mapEndpoints(bySection.get('Endpoints')!);
    importedSections.push('Endpoints');
  }

  if (bySection.has('CustomerFields')) {
    model.customerFields = mapCustomerFields(bySection.get('CustomerFields')!);
    importedSections.push('Fields');
  }

  if (bySection.has('FieldMapping')) {
    model.fieldMapping = mapFieldMappings(bySection.get('FieldMapping')!);
    importedSections.push('Field Mapping');
  }

  if (bySection.has('MasterMapping')) {
    model.masterMapping = mapMasterMappings(bySection.get('MasterMapping')!);
    importedSections.push('Master Mapping');
  }

  if (bySection.has('Configurations')) {
    model.configurations = mapConfigurations(bySection.get('Configurations')!);
    importedSections.push('Configurations');
  }

  if (bySection.has('Scheduler')) {
    model.scheduler = mapScheduler(bySection.get('Scheduler')!);
    importedSections.push('Scheduler');
  }

  if (bySection.has('Review')) {
    model.review = mapRecordSection(bySection.get('Review')!);
    importedSections.push('Review');
  }

  validateMappedModel(model);

  return { model, importedSections };
}

function groupBySection(
  records: readonly ParsedTemplateRecord[]
): Map<string, ParsedTemplateRecord[]> {
  const map = new Map<string, ParsedTemplateRecord[]>();

  for (const record of records) {
    const list = map.get(record.section) ?? [];
    list.push(record);
    map.set(record.section, list);
  }

  return map;
}

function mapBasicDetails(records: readonly ParsedTemplateRecord[]): BasicDetailsFormModel {
  const values = toFieldMap(records);

  return {
    customerId: readString(values, 'customerId'),
    customerName: readString(values, 'customerName'),
    tenantId: readString(values, 'tenantId'),
    integrationTypeId: readNullableNumber(values, 'integrationTypeId'),
    applicationId: readNullableNumber(values, 'applicationId'),
    accessApproach: readString(values, 'accessApproach'),
    isEnabled: readBoolean(values, 'isEnabled', true),
  };
}

function mapCompanies(records: readonly ParsedTemplateRecord[]): CompaniesStepModel {
  const indexed = new Map<number, Partial<CompanyFormModel>>();
  let fallbackIndex = 0;
  let currentIndex = 0;

  for (const record of records) {
    const indexedMatch = /^(\d+)\.(.+)$/.exec(record.field);
    let companyIndex: number;
    let fieldName: string;

    if (indexedMatch) {
      companyIndex = Number(indexedMatch[1]);
      fieldName = indexedMatch[2];
    } else {
      if (record.field === 'companyId' && indexed.has(currentIndex) && indexed.get(currentIndex)?.companyId) {
        fallbackIndex += 1;
        currentIndex = fallbackIndex;
      }
      companyIndex = currentIndex;
      fieldName = record.field;
    }

    const company = indexed.get(companyIndex) ?? {};
    assignCompanyField(company, fieldName, record.value);
    indexed.set(companyIndex, company);
  }

  const companies = [...indexed.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, partial]) => toCompanyModel(partial));

  if (companies.length === 0) {
    throw new Error('Companies section is present but contains no company rows.');
  }

  return { companies };
}

function mapCredentials(records: readonly ParsedTemplateRecord[]): CredentialsFormModel {
  const values = toFieldMap(records);
  const defaults = createEmptyCredentialsFormModel();

  return {
    clientApiKey: readString(values, 'clientApiKey', defaults.clientApiKey),
    clientSecret: readString(values, 'clientSecret', defaults.clientSecret),
    clientEndpoint: readString(values, 'clientEndpoint', defaults.clientEndpoint),
    clientPayload: readString(values, 'clientPayload', defaults.clientPayload),
    mode: readNullableString(values, 'mode') ?? defaults.mode,
    fiscalYear: readString(values, 'fiscalYear', defaults.fiscalYear),
    wdvYear: readString(values, 'wdvYear', defaults.wdvYear),
    wdvPeriod: readString(values, 'wdvPeriod', defaults.wdvPeriod),
    authenticationType:
      readNullableString(values, 'authenticationType') ?? defaults.authenticationType,
    erpClientId: readString(values, 'erpClientId', defaults.erpClientId),
    erpClientSecret: readString(values, 'erpClientSecret', defaults.erpClientSecret),
    erpTokenUrl: readString(values, 'erpTokenUrl', defaults.erpTokenUrl),
    ftpSftpHost: readString(values, 'ftpSftpHost', defaults.ftpSftpHost),
    ftpSftpPort: readNullableNumber(values, 'ftpSftpPort'),
    ftpSftpProtocol:
      readNullableString(values, 'ftpSftpProtocol') ?? defaults.ftpSftpProtocol,
    ftpUsername: readString(values, 'ftpUsername', defaults.ftpUsername),
    ftpEncryptedPassword: readString(
      values,
      'ftpEncryptedPassword',
      defaults.ftpEncryptedPassword
    ),
    ftpPrivateKey: readString(values, 'ftpPrivateKey', defaults.ftpPrivateKey),
    ftpPassphrase: readString(values, 'ftpPassphrase', defaults.ftpPassphrase),
  };
}

function mapRecordSection(records: readonly ParsedTemplateRecord[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const record of records) {
    result[record.field] = parseFlexibleValue(record.value);
  }

  return result;
}

function validateMappedModel(model: OnboardingModel): void {
  if (!model.basicDetails) {
    throw new Error('CSV must include a BasicDetails section.');
  }

  for (const field of REQUIRED_BASIC_DETAIL_FIELDS) {
    const value = model.basicDetails[field];
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(`BasicDetails.${field} is required in the CSV template.`);
    }
  }
}

function toFieldMap(records: readonly ParsedTemplateRecord[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const record of records) {
    map.set(record.field, record.value);
  }
  return map;
}

function assignCompanyField(
  company: Partial<CompanyFormModel>,
  fieldName: string,
  rawValue: string
): void {
  switch (fieldName) {
    case 'companyId':
      company.companyId = rawValue;
      break;
    case 'companyName':
      company.companyName = rawValue;
      break;
    case 'companyCode':
      company.companyCode = rawValue;
      break;
    case 'fileExtension':
      company.fileExtension = rawValue;
      break;
    case 'delimiter':
      company.delimiter = rawValue;
      break;
    case 'qualifier':
      company.qualifier = rawValue;
      break;
    case 'isActive':
      company.isActive = readBooleanFromRaw(rawValue, true);
      break;
    default:
      break;
  }
}

function toCompanyModel(partial: Partial<CompanyFormModel>): CompanyFormModel {
  return {
    companyId: partial.companyId ?? '',
    companyName: partial.companyName ?? '',
    companyCode: partial.companyCode ?? '',
    fileExtension: partial.fileExtension ?? '',
    delimiter: partial.delimiter ?? '',
    qualifier: partial.qualifier ?? '',
    isActive: partial.isActive ?? true,
  };
}

function readString(
  values: Map<string, string>,
  key: string,
  fallback = ''
): string {
  const value = values.get(key);
  return value === undefined ? fallback : value;
}

function readNullableString(values: Map<string, string>, key: string): string | null {
  const value = values.get(key);
  if (value === undefined || value.trim() === '') {
    return null;
  }
  return value;
}

function readNullableNumber(values: Map<string, string>, key: string): number | null {
  const value = values.get(key);
  if (value === undefined || value.trim() === '') {
    return null;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid number for field "${key}": ${value}`);
  }

  return parsed;
}

function readBoolean(values: Map<string, string>, key: string, fallback: boolean): boolean {
  const value = values.get(key);
  if (value === undefined || value.trim() === '') {
    return fallback;
  }
  return readBooleanFromRaw(value, fallback);
}

function readBooleanFromRaw(raw: string, fallback: boolean): boolean {
  const normalized = raw.trim().toLowerCase();
  if (['true', '1', 'yes', 'y'].includes(normalized)) {
    return true;
  }
  if (['false', '0', 'no', 'n'].includes(normalized)) {
    return false;
  }
  return fallback;
}

function parseFlexibleValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return '';
  }

  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      return JSON.parse(trimmed) as unknown;
    } catch {
      return raw;
    }
  }

  if (['true', 'false'].includes(trimmed.toLowerCase())) {
    return trimmed.toLowerCase() === 'true';
  }

  const asNumber = Number(trimmed);
  if (!Number.isNaN(asNumber) && trimmed !== '') {
    return asNumber;
  }

  return raw;
}

function readJsonRows(records: readonly ParsedTemplateRecord[], field = 'rows'): Record<string, string>[] {
  const values = toFieldMap(records);
  const raw = values.get(field);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Record<string, string>[]) : [];
  } catch {
    return [];
  }
}

function mapTransactions(records: readonly ParsedTemplateRecord[]): TransactionsStepModel {
  const rows = readJsonRows(records, 'rows');
  return {
    transactions: rows.map((row) => {
      const typeId = row['transactiontypeid'] ? Number(row['transactiontypeid']) : null;
      const tcode = row['tcode'] || '';
      return {
        transactionTypeId: Number.isNaN(typeId as number) ? null : typeId,
        transactionName: resolveTransactionName(typeId, tcode),
        tcode,
        creationTrigger: resolveCreationTrigger(row['creationtriggerid']),
        endpointType: resolveEndpointTypeLabel('', tcode),
        selected: true,
        enabled: String(row['isenabled'] || 'true').toLowerCase() !== 'false',
      };
    }),
  };
}

function mapEndpoints(records: readonly ParsedTemplateRecord[]): EndpointsStepModel {
  const rows = readJsonRows(records, 'rows');
  const now = new Date().toISOString();
  return {
    endpoints: rows.map((row) => ({
      transactionLabel: row['endpointcode'] || '',
      selectedTransactionId: row['selectedtransactionid'] || '',
      transactionCode: row['tcode'] || row['endpointcode'] || '',
      endpointType: resolveEndpointTypeLabel(row['endpointtype'] || ''),
      endpointUrl: row['endpoint'] || '',
      assetcuesEndpoint: row['assetcuesendpoint'] || '',
      authentication: row['authenticationtype'] || 'None',
      payload: row['payload'] || '{}',
      status: 'Enabled' as const,
      timeout: row['timeout'] ? Number(row['timeout']) : 30,
      retryCount: row['retrycount'] ? Number(row['retrycount']) : 3,
      headers: row['headers'] || '{}',
      createdDate: now,
      updatedDate: now,
    })),
  };
}

function mapCustomerFields(records: readonly ParsedTemplateRecord[]): CustomerFieldsStepModel {
  const rows = readJsonRows(records, 'rows');
  return {
    fields: rows.map((row) => {
      const fieldId = Number(row['applicationfieldid'] || 0);
      return {
        applicationFieldId: row['applicationfieldid'] || '',
        applicationField:
          APPLICATION_FIELD_NAME_BY_ID[fieldId] || `Field ${row['applicationfieldid'] || ''}`.trim(),
        applicableFor: resolveApplicableFor(row['applicablefor'] || ''),
        forEdit: toFlag(row['foredit']),
        forTagging: toFlag(row['fortagging']),
        forAudit: toFlag(row['foraudit']),
        forTransfer: toFlag(row['fortransfer']),
        forAllocation: toFlag(row['forallocation']),
        forSplit: toFlag(row['forsplit']),
        forRetire: toFlag(row['forretire']),
      };
    }),
  };
}

function mapFieldMappings(records: readonly ParsedTemplateRecord[]): FieldMappingStepModel {
  const rows = readJsonRows(records, 'rows');
  return {
    mappings: rows.map((row, index) => ({
      customerField: row['fieldcode'] || '',
      standardField: row['standardfieldid'] || row['dbcolumn'] || '',
      dbColumn: row['dbcolumn'] || '',
      sequence: Number(row['sequence'] || index + 1),
    })),
  };
}

function mapMasterMappings(records: readonly ParsedTemplateRecord[]): MasterMappingStepModel {
  const rows = readJsonRows(records, 'rows');
  if (rows.length === 0) {
    return { mappings: [{ masterName: '', sourceField: '', targetField: '' }] };
  }

  return {
    mappings: rows.map((row) => ({
      masterName: row['pathcode'] || row['mastername'] || row['endpointcode'] || '',
      sourceField: row['sourcefield'] || row['ftppath'] || '',
      targetField: row['targetfield'] || row['localpath'] || '',
    })),
  };
}

function mapConfigurations(records: readonly ParsedTemplateRecord[]): ConfigurationsStepModel {
  const values = toFieldMap(records);
  const assetClassRaw = values.get('assetClasses');
  let assetClasses: ConfigurationsStepModel['assetClasses'] = [];

  if (assetClassRaw) {
    try {
      const parsed = JSON.parse(assetClassRaw) as Record<string, string>[];
      assetClasses = parsed.map((row) => ({
        assetClassCode: row['assetclasscode'] || '',
        assetClass: row['assetclass'] || '',
        assetClassMode: row['assetclassmode'] || '',
      }));
    } catch {
      assetClasses = [];
    }
  }

  return {
    items: createDefaultConfigurationItems(),
    assetClasses,
  };
}

function mapScheduler(records: readonly ParsedTemplateRecord[]): SchedulerStepModel {
  const values = toFieldMap(records);
  const defaults = createEmptySchedulerModel();
  let frequencyRow: Record<string, string> | null = null;

  const frequenciesRaw = values.get('frequencies');
  if (frequenciesRaw) {
    try {
      const parsed = JSON.parse(frequenciesRaw) as Record<string, string>[];
      frequencyRow = parsed[0] ?? null;
    } catch {
      frequencyRow = null;
    }
  }

  if (!frequencyRow) {
    return defaults;
  }

  const selectedDaysMask = Number(frequencyRow['selecteddays'] || 0);

  return {
    frequency: frequencyRow['frequency'] || '',
    startTime: frequencyRow['starttime'] || '',
    endTime: frequencyRow['endtime'] || '',
    selectedDays: daysFromBitmask(Number.isNaN(selectedDaysMask) ? 0 : selectedDaysMask),
    parameters: frequencyRow['param'] || '{}',
  };
}

function toFlag(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  const normalized = value.toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'y' || normalized === 'yes';
}
