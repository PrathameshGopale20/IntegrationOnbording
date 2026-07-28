import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { noWhitespaceValidator } from '../../validators/no-whitespace.validator';
import { createEmptyCredentialsFormModel } from './credentials.model';

/**
 * Form controls aligned to integration.in_customerintegrations credential columns.
 */
export function buildCredentialsForm(formBuilder: FormBuilder): FormGroup {
  const defaults = createEmptyCredentialsFormModel();

  return formBuilder.group({
    clientApiKey: [
      defaults.clientApiKey,
      [Validators.required, Validators.maxLength(225), noWhitespaceValidator()],
    ],
    clientSecret: [
      defaults.clientSecret,
      [Validators.required, Validators.maxLength(225), noWhitespaceValidator()],
    ],
    clientEndpoint: [
      defaults.clientEndpoint,
      [Validators.required, Validators.maxLength(500), noWhitespaceValidator()],
    ],
    clientPayload: [defaults.clientPayload, [Validators.required]],

    mode: [defaults.mode],
    fiscalYear: [defaults.fiscalYear, [Validators.maxLength(10)]],
    wdvYear: [defaults.wdvYear, [Validators.maxLength(10)]],
    wdvPeriod: [defaults.wdvPeriod, [Validators.maxLength(10)]],

    authenticationType: [defaults.authenticationType],
    erpClientId: [defaults.erpClientId, [Validators.maxLength(225)]],
    erpClientSecret: [defaults.erpClientSecret, [Validators.maxLength(225)]],
    erpTokenUrl: [defaults.erpTokenUrl, [Validators.maxLength(500)]],

    ftpSftpHost: [defaults.ftpSftpHost, [Validators.maxLength(255)]],
    ftpSftpPort: [defaults.ftpSftpPort],
    ftpSftpProtocol: [defaults.ftpSftpProtocol],
    ftpUsername: [defaults.ftpUsername, [Validators.maxLength(255)]],
    ftpEncryptedPassword: [defaults.ftpEncryptedPassword, [Validators.maxLength(512)]],
    ftpPrivateKey: [defaults.ftpPrivateKey],
    ftpPassphrase: [defaults.ftpPassphrase, [Validators.maxLength(512)]],
  });
}
