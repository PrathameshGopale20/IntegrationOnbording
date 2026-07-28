/**
 * Credentials step models aligned to integration.in_customerintegrations.
 */

export type CredentialIntegrationKind = 'API' | 'FTP';

export interface CredentialsFormModel {
  // AssetCues connection (required for both API and FTP)
  clientApiKey: string;
  clientSecret: string;
  clientEndpoint: string;
  clientPayload: string;

  // Mode & fiscal period
  mode: string | null;
  fiscalYear: string;
  wdvYear: string;
  wdvPeriod: string;

  // ERP / third-party auth (API integrations)
  authenticationType: string | null;
  erpClientId: string;
  erpClientSecret: string;
  erpTokenUrl: string;

  // FTP / SFTP connection + credentials
  ftpSftpHost: string;
  ftpSftpPort: number | null;
  ftpSftpProtocol: string | null;
  ftpUsername: string;
  ftpEncryptedPassword: string;
  ftpPrivateKey: string;
  ftpPassphrase: string;
}

export interface CredentialsSelectOption {
  readonly value: string;
  readonly label: string;
}

export function createEmptyCredentialsFormModel(): CredentialsFormModel {
  return {
    clientApiKey: '',
    clientSecret: '',
    clientEndpoint: '',
    clientPayload: '{}',
    mode: null,
    fiscalYear: '',
    wdvYear: '',
    wdvPeriod: '',
    authenticationType: 'None',
    erpClientId: '',
    erpClientSecret: '',
    erpTokenUrl: '',
    ftpSftpHost: '',
    ftpSftpPort: null,
    ftpSftpProtocol: 'SFTP',
    ftpUsername: '',
    ftpEncryptedPassword: '',
    ftpPrivateKey: '',
    ftpPassphrase: '',
  };
}
