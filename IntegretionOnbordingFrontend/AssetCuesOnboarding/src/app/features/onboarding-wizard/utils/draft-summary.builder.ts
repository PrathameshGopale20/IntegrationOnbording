import { OnboardingModel } from '../models/onboarding-model';
import {
  DraftSummaryField,
  DraftSummarySection,
} from '../components/draft-summary-dialog/draft-summary-dialog.model';
import {
  APPLICATION_OPTIONS_BY_INTEGRATION_TYPE,
  INTEGRATION_TYPE_OPTIONS,
} from '../steps/basic-details/basic-details-options.constant';
import { isFtpApplication } from '../steps/credentials/credentials-options.constant';
import { CredentialsFormModel } from '../steps/credentials/credentials.model';
import { WIZARD_STEPS } from '../constants/wizard-steps.constant';
import { WizardStepName } from '../constants/wizard-step-names.constant';

function displayValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '—';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  const text = String(value).trim();
  return text.length > 0 ? text : '—';
}

function field(label: string, value: unknown): DraftSummaryField {
  return { label, value: displayValue(value) };
}

function buildBasicDetailsSection(model: OnboardingModel): DraftSummarySection {
  const basic = model.basicDetails;
  if (!basic) {
    return { title: 'Basic Details', fields: [] };
  }

  const integrationType =
    INTEGRATION_TYPE_OPTIONS.find((option) => option.value === basic.integrationTypeId)?.label ??
    basic.integrationTypeId;

  const applicationOptions =
    basic.integrationTypeId !== null
      ? (APPLICATION_OPTIONS_BY_INTEGRATION_TYPE[basic.integrationTypeId] ?? [])
      : [];

  const application =
    applicationOptions.find((option) => option.value === basic.applicationId)?.label ??
    basic.applicationId;

  return {
    title: 'Basic Details',
    fields: [
      field('Customer ID', basic.customerId),
      field('Customer Name', basic.customerName),
      field('Tenant ID', basic.tenantId),
      field('Integration Type', integrationType),
      field('Application', application),
      field('Access Approach', basic.accessApproach),
      field('Enable Integration', basic.isEnabled),
    ],
  };
}

function buildCompaniesSection(model: OnboardingModel): DraftSummarySection {
  const companies = model.companies?.companies ?? [];
  if (companies.length === 0) {
    return { title: 'Companies', fields: [] };
  }

  const fields: DraftSummaryField[] = [];
  companies.forEach((company, index) => {
    fields.push(
      field(`Company ${index + 1} — ID`, company.companyId),
      field(`Company ${index + 1} — Name`, company.companyName),
      field(`Company ${index + 1} — Code`, company.companyCode),
      field(`Company ${index + 1} — Active`, company.isActive)
    );
  });

  return { title: 'Companies', fields };
}

function buildCredentialsSection(model: OnboardingModel): DraftSummarySection {
  const credentials = model.credentials as CredentialsFormModel | null;
  if (!credentials) {
    return { title: 'Credentials', fields: [] };
  }

  const isFtp = isFtpApplication(model.basicDetails?.applicationId ?? null);
  const fields: DraftSummaryField[] = [
    field('Client API Key', credentials.clientApiKey),
    field('Client Secret', credentials.clientSecret ? '••••••••' : ''),
    field('Client Endpoint URL', credentials.clientEndpoint),
    field('Client Payload', credentials.clientPayload),
    field('Mode', credentials.mode),
    field('Fiscal Year', credentials.fiscalYear),
    field('WDV Year', credentials.wdvYear),
    field('WDV Period', credentials.wdvPeriod),
  ];

  if (isFtp) {
    fields.push(
      field('FTP Host', credentials.ftpSftpHost),
      field('FTP Port', credentials.ftpSftpPort),
      field('Protocol', credentials.ftpSftpProtocol),
      field('FTP Username', credentials.ftpUsername),
      field('FTP Password', credentials.ftpEncryptedPassword ? '••••••••' : ''),
      field('Private Key', credentials.ftpPrivateKey ? '(provided)' : ''),
      field('Passphrase', credentials.ftpPassphrase ? '••••••••' : '')
    );
  } else {
    fields.push(
      field('Authentication Type', credentials.authenticationType),
      field('ERP Client ID', credentials.erpClientId),
      field('ERP Client Secret', credentials.erpClientSecret ? '••••••••' : ''),
      field('ERP Token URL', credentials.erpTokenUrl)
    );
  }

  return { title: 'Credentials', fields };
}

export function buildDraftSummarySections(model: OnboardingModel): DraftSummarySection[] {
  return [
    buildBasicDetailsSection(model),
    buildCompaniesSection(model),
    buildCredentialsSection(model),
    {
      title: 'Transactions',
      fields: [
        field(
          'Enabled',
          (model.transactions?.transactions ?? []).filter((item) => item.enabled).length
        ),
        field('Total', model.transactions?.transactions?.length ?? 0),
      ],
    },
    {
      title: 'Endpoints',
      fields: [field('Generated', model.endpoints?.endpoints?.length ?? 0)],
    },
    {
      title: 'Fields',
      fields: [field('Count', model.customerFields?.fields?.length ?? 0)],
    },
    {
      title: 'Field Mapping',
      fields: [field('Count', model.fieldMapping?.mappings?.length ?? 0)],
    },
    {
      title: 'Scheduler',
      fields: [
        field('Frequency', model.scheduler?.frequency),
        field('Start Time', model.scheduler?.startTime),
        field('End Time', model.scheduler?.endTime),
      ],
    },
  ];
}

export function resolveStepTitle(step: WizardStepName): string {
  return WIZARD_STEPS.find((item) => item.id === step)?.title ?? step;
}
