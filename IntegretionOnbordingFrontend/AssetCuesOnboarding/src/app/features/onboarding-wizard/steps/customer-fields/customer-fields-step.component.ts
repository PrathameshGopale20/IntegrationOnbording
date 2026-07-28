import { Component, Input } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { getCustomerFieldsArray } from './customer-fields-form.builder';

@Component({
  selector: 'app-customer-fields-step',
  templateUrl: './customer-fields-step.component.html',
  styleUrl: './customer-fields-step.component.scss',
  standalone: false,
})
export class CustomerFieldsStepComponent {
  @Input({ required: true }) formGroup!: FormGroup;

  readonly pageTitle = 'Customer Fields';
  readonly pageSubtitle = 'Configure field level permissions per module activity.';

  get fields(): FormArray {
    return getCustomerFieldsArray(this.formGroup);
  }

  rowGroup(index: number): FormGroup {
    return this.fields.at(index) as FormGroup;
  }

  applicableClass(value: string): string {
    const normalized = (value || '').toLowerCase();
    if (normalized === 'inbound') return 'type-chip type-chip--inbound';
    if (normalized === 'outbound') return 'type-chip type-chip--outbound';
    return 'type-chip type-chip--both';
  }
}
