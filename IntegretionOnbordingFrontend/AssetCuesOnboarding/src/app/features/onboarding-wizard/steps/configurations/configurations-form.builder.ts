import { FormBuilder, FormGroup } from '@angular/forms';
import { createDefaultConfigurationItems } from './configurations.model';

export function buildConfigurationsForm(formBuilder: FormBuilder): FormGroup {
  const items = createDefaultConfigurationItems().map((item) =>
    formBuilder.group({
      key: [item.key],
      label: [item.label],
      description: [item.description],
      enabled: [item.enabled],
      value: [item.value],
      hasValue: [item.hasValue],
    })
  );

  return formBuilder.group({
    items: formBuilder.array(items),
    assetClasses: formBuilder.array([]),
  });
}

export function buildAssetClassGroup(
  formBuilder: FormBuilder,
  item: { assetClassCode: string; assetClass: string; assetClassMode: string }
): FormGroup {
  return formBuilder.group({
    assetClassCode: [item.assetClassCode],
    assetClass: [item.assetClass],
    assetClassMode: [item.assetClassMode],
  });
}

export function getConfigurationItemsArray(group: FormGroup) {
  return group.get('items') as import('@angular/forms').FormArray;
}

export function getAssetClassesArray(group: FormGroup) {
  return group.get('assetClasses') as import('@angular/forms').FormArray;
}
