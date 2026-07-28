import { Component, Input, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { buildCompanyFormGroup, getCompaniesArray } from './companies-form.builder';
import { SelectOption } from './companies.model';

@Component({
  selector: 'app-companies-step',
  templateUrl: './companies-step.component.html',
  styleUrl: './companies-step.component.scss',
  standalone: false,
})
export class CompaniesStepComponent {
  @Input({ required: true }) formGroup!: FormGroup;

  private readonly formBuilder = inject(FormBuilder);

  readonly pageTitle = 'Company Details';
  readonly pageSubtitle = 'Add one or more companies linked to this customer integration.';

  /**
   * Option lists remain empty until master/config APIs are connected.
   */
  readonly fileExtensionOptions: readonly SelectOption[] = [];
  readonly delimiterOptions: readonly SelectOption[] = [];
  readonly qualifierOptions: readonly SelectOption[] = [];

  get companies(): FormArray {
    return getCompaniesArray(this.formGroup);
  }

  addCompany(): void {
    this.companies.push(buildCompanyFormGroup(this.formBuilder));
  }

  removeCompany(index: number): void {
    if (this.companies.length > 1) {
      this.companies.removeAt(index);
    }
  }

  companyGroup(index: number): FormGroup {
    return this.companies.at(index) as FormGroup;
  }

  showError(group: FormGroup, controlName: string, errorCode: string): boolean {
    const control = group.get(controlName);
    return !!control && control.hasError(errorCode) && (control.dirty || control.touched);
  }

  canRemove(): boolean {
    return this.companies.length > 1;
  }
}
