import { FormBuilder, FormGroup } from '@angular/forms';
import { createEmptyCustomerFieldItem } from './customer-fields.model';

export function buildCustomerFieldsForm(formBuilder: FormBuilder): FormGroup {
  return formBuilder.group({
    fields: formBuilder.array([buildCustomerFieldItemGroup(formBuilder)]),
  });
}

export function buildCustomerFieldItemGroup(
  formBuilder: FormBuilder,
  item = createEmptyCustomerFieldItem()
): FormGroup {
  return formBuilder.group({
    applicationFieldId: [item.applicationFieldId],
    applicationField: [item.applicationField],
    applicableFor: [item.applicableFor],
    forEdit: [item.forEdit],
    forTagging: [item.forTagging],
    forAudit: [item.forAudit],
    forTransfer: [item.forTransfer],
    forAllocation: [item.forAllocation],
    forSplit: [item.forSplit],
    forRetire: [item.forRetire],
  });
}

export function getCustomerFieldsArray(group: FormGroup) {
  return group.get('fields') as import('@angular/forms').FormArray;
}
