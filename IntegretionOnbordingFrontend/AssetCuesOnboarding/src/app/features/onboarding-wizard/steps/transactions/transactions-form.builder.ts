import { FormBuilder, FormGroup } from '@angular/forms';
import { DEFAULT_TRANSACTION_CATALOG } from '../../constants/default-transactions.constant';
import { createEmptyTransactionItem } from './transactions.model';

export function buildTransactionsForm(formBuilder: FormBuilder): FormGroup {
  const items = DEFAULT_TRANSACTION_CATALOG.map((item) =>
    buildTransactionItemGroup(formBuilder, item)
  );

  return formBuilder.group({
    transactions: formBuilder.array(
      items.length > 0 ? items : [buildTransactionItemGroup(formBuilder)]
    ),
  });
}

export function buildTransactionItemGroup(
  formBuilder: FormBuilder,
  item = createEmptyTransactionItem()
): FormGroup {
  return formBuilder.group({
    transactionTypeId: [item.transactionTypeId],
    transactionName: [item.transactionName],
    tcode: [item.tcode],
    creationTrigger: [item.creationTrigger],
    endpointType: [item.endpointType],
    selected: [item.selected],
    enabled: [item.enabled],
  });
}

export function getTransactionsArray(group: FormGroup) {
  return group.get('transactions') as import('@angular/forms').FormArray;
}
