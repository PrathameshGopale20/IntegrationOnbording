import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  APPLICATION_OPTIONS_BY_INTEGRATION_TYPE,
  INTEGRATION_TYPE_OPTIONS,
} from './basic-details-options.constant';
import { ApplicationSelectOption, SelectOption } from './basic-details.model';

@Component({
  selector: 'app-basic-details-step',
  templateUrl: './basic-details-step.component.html',
  styleUrl: './basic-details-step.component.scss',
  standalone: false,
})
export class BasicDetailsStepComponent implements OnInit, OnDestroy {
  @Input({ required: true }) formGroup!: FormGroup;

  readonly pageTitle = 'Basic Details';
  readonly pageSubtitle = 'Enter the core customer and integration information.';

  readonly integrationTypeOptions: readonly SelectOption[] = INTEGRATION_TYPE_OPTIONS;
  filteredApplicationOptions: readonly ApplicationSelectOption[] = [];

  private readonly subscriptions = new Subscription();

  ngOnInit(): void {
    this.applyIntegrationTypeState(this.formGroup.controls['integrationTypeId'].value);
    this.applyApplicationState(this.formGroup.controls['applicationId'].value);

    this.subscriptions.add(
      this.formGroup.controls['integrationTypeId'].valueChanges.subscribe(
        (integrationTypeId: number | null) => {
          this.applyIntegrationTypeState(integrationTypeId);
        }
      )
    );

    this.subscriptions.add(
      this.formGroup.controls['applicationId'].valueChanges.subscribe(
        (applicationId: number | null) => {
          this.applyApplicationState(applicationId);
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  showError(controlName: string, errorCode: string): boolean {
    const control = this.formGroup.get(controlName);
    return !!control && control.hasError(errorCode) && (control.dirty || control.touched);
  }

  private applyIntegrationTypeState(integrationTypeId: number | null): void {
    const applicationControl = this.formGroup.controls['applicationId'];
    const accessApproachControl = this.formGroup.controls['accessApproach'];

    applicationControl.setValue(null, { emitEvent: false });
    accessApproachControl.setValue('', { emitEvent: false });
    accessApproachControl.disable({ emitEvent: false });

    if (integrationTypeId === null || integrationTypeId === undefined) {
      this.filteredApplicationOptions = [];
      applicationControl.disable({ emitEvent: false });
      return;
    }

    this.filteredApplicationOptions =
      APPLICATION_OPTIONS_BY_INTEGRATION_TYPE[integrationTypeId] ?? [];
    applicationControl.enable({ emitEvent: false });
  }

  private applyApplicationState(applicationId: number | null): void {
    const accessApproachControl = this.formGroup.controls['accessApproach'];

    if (applicationId === null || applicationId === undefined) {
      accessApproachControl.setValue('', { emitEvent: false });
      accessApproachControl.disable({ emitEvent: false });
      return;
    }

    const selectedApplication = this.filteredApplicationOptions.find(
      (option) => option.value === applicationId
    );
    accessApproachControl.setValue(selectedApplication?.accessApproach ?? '', {
      emitEvent: false,
    });
    accessApproachControl.enable({ emitEvent: false });
  }
}
