import { CredentialsSelectOption } from './credentials.model';

/** Application IDs that use FTP / SFTP credential fields. */
export const FTP_APPLICATION_IDS: readonly number[] = [4, 6] as const;

export function isFtpApplication(applicationId: number | null | undefined): boolean {
  if (applicationId === null || applicationId === undefined) {
    return false;
  }

  return FTP_APPLICATION_IDS.includes(applicationId);
}

/**
 * Mode options remain empty until master/config APIs are connected.
 */
export const MODE_OPTIONS: readonly CredentialsSelectOption[] = [] as const;

export const AUTHENTICATION_TYPE_OPTIONS: readonly CredentialsSelectOption[] = [
  { value: 'None', label: 'None' },
  { value: 'OAuth2', label: 'OAuth 2.0' },
  { value: 'Basic', label: 'Basic' },
] as const;

export const FTP_PROTOCOL_OPTIONS: readonly CredentialsSelectOption[] = [
  { value: 'SFTP', label: 'SFTP' },
  { value: 'FTP', label: 'FTP' },
  { value: 'FTPS', label: 'FTPS' },
] as const;
