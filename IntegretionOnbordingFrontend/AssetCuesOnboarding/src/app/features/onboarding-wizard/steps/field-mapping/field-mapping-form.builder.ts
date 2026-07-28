import { FormBuilder, FormGroup } from '@angular/forms';
import { createEmptyFieldMappingItem } from './field-mapping.model';

export function buildFieldMappingForm(formBuilder: FormBuilder): FormGroup {
  return formBuilder.group({
    mappings: formBuilder.array([buildFieldMappingItemGroup(formBuilder)]),
  });
}

export function buildFieldMappingItemGroup(
  formBuilder: FormBuilder,
  item = createEmptyFieldMappingItem()
): FormGroup {
  return formBuilder.group({
    customerField: [item.customerField],
    standardField: [item.standardField],
    dbColumn: [item.dbColumn],
    sequence: [item.sequence],
  });
}

export function getFieldMappingsArray(group: FormGroup) {
  return group.get('mappings') as import('@angular/forms').FormArray;
}
