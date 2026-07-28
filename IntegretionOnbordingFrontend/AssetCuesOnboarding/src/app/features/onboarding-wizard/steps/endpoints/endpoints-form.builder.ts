import { FormBuilder, FormGroup } from '@angular/forms';
import { createEmptyEndpointItem } from './endpoints.model';

export function buildEndpointsForm(formBuilder: FormBuilder): FormGroup {
  return formBuilder.group({
    endpoints: formBuilder.array([]),
  });
}

export function buildEndpointItemGroup(
  formBuilder: FormBuilder,
  item = createEmptyEndpointItem()
): FormGroup {
  const value = { ...createEmptyEndpointItem(), ...item };

  return formBuilder.group({
    transactionLabel: [{ value: value.transactionLabel, disabled: true }],
    selectedTransactionId: [value.selectedTransactionId],
    transactionCode: [{ value: value.transactionCode, disabled: true }],
    endpointType: [{ value: value.endpointType, disabled: true }],
    endpointUrl: [value.endpointUrl],
    assetcuesEndpoint: [value.assetcuesEndpoint],
    authentication: [value.authentication],
    payload: [value.payload],
    status: [{ value: value.status, disabled: true }],
    timeout: [value.timeout],
    retryCount: [value.retryCount],
    headers: [value.headers],
    createdDate: [{ value: value.createdDate, disabled: true }],
    updatedDate: [{ value: value.updatedDate, disabled: true }],
  });
}

export function getEndpointsArray(group: FormGroup) {
  return group.get('endpoints') as import('@angular/forms').FormArray;
}
