import { Component, Input } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { getAssetClassesArray, getConfigurationItemsArray } from './configurations-form.builder';

@Component({
  selector: 'app-configurations-step',
  templateUrl: './configurations-step.component.html',
  styleUrl: './configurations-step.component.scss',
  standalone: false,
})
export class ConfigurationsStepComponent {
  @Input({ required: true }) formGroup!: FormGroup;

  readonly pageTitle = 'Configurations';
  readonly pageSubtitle = 'Enable or set values for Integration configuration parameters.';

  get items(): FormArray {
    return getConfigurationItemsArray(this.formGroup);
  }

  get assetClasses(): FormArray {
    return getAssetClassesArray(this.formGroup);
  }

  itemGroup(index: number): FormGroup {
    return this.items.at(index) as FormGroup;
  }

  assetClassGroup(index: number): FormGroup {
    return this.assetClasses.at(index) as FormGroup;
  }
}
