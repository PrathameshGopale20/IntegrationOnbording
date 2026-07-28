import { Component, Input, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { buildMasterMappingItemGroup, getMasterMappingsArray } from './master-mapping-form.builder';

@Component({
  selector: 'app-master-mapping-step',
  templateUrl: './master-mapping-step.component.html',
  styleUrl: './master-mapping-step.component.scss',
  standalone: false,
})
export class MasterMappingStepComponent {
  @Input({ required: true }) formGroup!: FormGroup;
  private readonly formBuilder = inject(FormBuilder);

  readonly pageTitle = 'Master Mapping';
  readonly pageSubtitle = 'Map master data fields between source and target systems.';

  get mappings(): FormArray {
    return getMasterMappingsArray(this.formGroup);
  }

  addRow(): void {
    this.mappings.push(buildMasterMappingItemGroup(this.formBuilder));
  }

  removeRow(index: number): void {
    if (this.mappings.length > 1) {
      this.mappings.removeAt(index);
    }
  }
}
