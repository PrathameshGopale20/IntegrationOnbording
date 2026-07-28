export interface DraftSummaryField {
  readonly label: string;
  readonly value: string;
}

export interface DraftSummarySection {
  readonly title: string;
  readonly fields: readonly DraftSummaryField[];
}

export interface DraftSummaryDialogData {
  readonly customerName: string;
  readonly customerId: string;
  readonly currentStep: string;
  readonly sections: readonly DraftSummarySection[];
}
