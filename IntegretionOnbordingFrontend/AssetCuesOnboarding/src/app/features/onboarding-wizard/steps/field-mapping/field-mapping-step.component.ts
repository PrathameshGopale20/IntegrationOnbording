import { Component, Input, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { buildFieldMappingItemGroup, getFieldMappingsArray } from './field-mapping-form.builder';

@Component({
  selector: 'app-field-mapping-step',
  templateUrl: './field-mapping-step.component.html',
  styleUrl: './field-mapping-step.component.scss',
  standalone: false,
})
export class FieldMappingStepComponent {
  @Input({ required: true }) formGroup!: FormGroup;
  private readonly formBuilder = inject(FormBuilder);

  readonly pageTitle = 'Field Mapping';
  readonly pageSubtitle = 'Map customer fields to standard AssetCues fields.';

  get mappings(): FormArray {
    return getFieldMappingsArray(this.formGroup);
  }

  addRow(): void {
    this.mappings.push(
      buildFieldMappingItemGroup(this.formBuilder, {
        customerField: '',
        standardField: '',
        dbColumn: '',
        sequence: this.mappings.length + 1,
      })
    );
  }

  removeRow(index: number): void {
    if (this.mappings.length > 1) {
      this.mappings.removeAt(index);
    }
  }
}
