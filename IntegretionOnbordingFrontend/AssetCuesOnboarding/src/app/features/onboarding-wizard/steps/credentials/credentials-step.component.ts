import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  AUTHENTICATION_TYPE_OPTIONS,
  FTP_PROTOCOL_OPTIONS,
  MODE_OPTIONS,
  isFtpApplication,
} from './credentials-options.constant';
import { CredentialsSelectOption } from './credentials.model';

@Component({
  selector: 'app-credentials-step',
  templateUrl: './credentials-step.component.html',
  styleUrl: './credentials-step.component.scss',
  standalone: false,
})
export class CredentialsStepComponent {
  @Input({ required: true }) formGroup!: FormGroup;
  @Input() applicationId: number | null = null;

  readonly pageTitle = 'Integration Credentials';
  readonly pageSubtitle = 'Configure connection and authentication details for this integration.';

  readonly modeOptions: readonly CredentialsSelectOption[] = MODE_OPTIONS;
  readonly authenticationTypeOptions: readonly CredentialsSelectOption[] =
    AUTHENTICATION_TYPE_OPTIONS;
  readonly protocolOptions: readonly CredentialsSelectOption[] = FTP_PROTOCOL_OPTIONS;

  get isFtpIntegration(): boolean {
    return isFtpApplication(this.applicationId);
  }

  get isApiIntegration(): boolean {
    return !this.isFtpIntegration;
  }

  get integrationBadgeLabel(): string {
    return this.isFtpIntegration ? 'FTP / SFTP INTEGRATION' : 'API INTEGRATION';
  }

  showError(controlName: string, errorCode: string): boolean {
    const control = this.formGroup.get(controlName);
    return !!control && control.hasError(errorCode) && (control.dirty || control.touched);
  }
}
