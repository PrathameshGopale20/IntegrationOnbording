import { FormBuilder, FormGroup } from '@angular/forms';
import { createEmptyMasterMappingItem } from './master-mapping.model';

export function buildMasterMappingForm(formBuilder: FormBuilder): FormGroup {
  return formBuilder.group({
    mappings: formBuilder.array([buildMasterMappingItemGroup(formBuilder)]),
  });
}

export function buildMasterMappingItemGroup(
  formBuilder: FormBuilder,
  item = createEmptyMasterMappingItem()
): FormGroup {
  return formBuilder.group({
    masterName: [item.masterName],
    sourceField: [item.sourceField],
    targetField: [item.targetField],
  });
}

export function getMasterMappingsArray(group: FormGroup) {
  return group.get('mappings') as import('@angular/forms').FormArray;
}
