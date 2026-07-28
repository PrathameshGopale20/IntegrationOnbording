import { ApplicationSelectOption, SelectOption } from './basic-details.model';

export const INTEGRATION_TYPE_OPTIONS: readonly SelectOption[] = [
  { value: 1, label: 'ERP' },
  { value: 2, label: 'ITSM' },
  { value: 3, label: 'HRMS' },
] as const;

export const APPLICATION_OPTIONS_BY_INTEGRATION_TYPE: Readonly<
  Record<number, readonly ApplicationSelectOption[]>
> = {
  1: [
    { value: 1, label: 'SAP ERP API', accessApproach: 'API' },
    { value: 4, label: 'FTP', accessApproach: 'FTP' },
  ],
  2: [
    { value: 2, label: 'ServiceNow API', accessApproach: 'API' },
    { value: 4, label: 'FTP', accessApproach: 'FTP' },
  ],
  3: [
    { value: 5, label: 'SuccessFactors', accessApproach: 'API' },
    { value: 6, label: 'HRMS FTP', accessApproach: 'FTP' },
    { value: 7, label: 'Workday', accessApproach: 'API' },
  ],
} as const;
