export interface TransactionItemModel {
  transactionTypeId: number | null;
  transactionName: string;
  tcode: string;
  creationTrigger: string;
  endpointType: 'Inbound' | 'Outbound' | 'Master' | string;
  selected: boolean;
  enabled: boolean;
}

export interface TransactionsStepModel {
  transactions: TransactionItemModel[];
}

export function createEmptyTransactionItem(): TransactionItemModel {
  return {
    transactionTypeId: null,
    transactionName: '',
    tcode: '',
    creationTrigger: 'On Save',
    endpointType: 'Inbound',
    selected: false,
    enabled: false,
  };
}
