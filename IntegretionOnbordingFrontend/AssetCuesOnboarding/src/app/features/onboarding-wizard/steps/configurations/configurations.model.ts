export interface ConfigurationItemModel {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  value: string;
  hasValue: boolean;
}

export interface AssetClassItemModel {
  assetClassCode: string;
  assetClass: string;
  assetClassMode: string;
}

export interface ConfigurationsStepModel {
  items: ConfigurationItemModel[];
  assetClasses: AssetClassItemModel[];
}

export function createDefaultConfigurationItems(): ConfigurationItemModel[] {
  return [
    {
      key: 'duplicateCheck',
      label: 'Enable Duplicate Check',
      description: 'Check for duplicate assets during sync.',
      enabled: true,
      value: '',
      hasValue: false,
    },
    {
      key: 'autoApprove',
      label: 'Auto Approve Assets',
      description: 'Automatically approve inbound records.',
      enabled: false,
      value: '',
      hasValue: false,
    },
    {
      key: 'batchSize',
      label: 'Batch Size',
      description: 'Number of records per API batch call.',
      enabled: true,
      value: '100',
      hasValue: true,
    },
    {
      key: 'retryOnFailure',
      label: 'Retry On Failure',
      description: 'Retry failed transactions automatically.',
      enabled: true,
      value: '3',
      hasValue: true,
    },
    {
      key: 'emailNotifications',
      label: 'Email Notifications',
      description: 'Send email alerts on sync errors.',
      enabled: false,
      value: '',
      hasValue: false,
    },
    {
      key: 'logLevel',
      label: 'Log Level',
      description: 'Set logging verbosity level.',
      enabled: true,
      value: 'Info',
      hasValue: true,
    },
  ];
}
