export interface CustomerFieldItemModel {
  applicationFieldId: string;
  applicationField: string;
  applicableFor: string;
  forEdit: boolean;
  forTagging: boolean;
  forAudit: boolean;
  forTransfer: boolean;
  forAllocation: boolean;
  forSplit: boolean;
  forRetire: boolean;
}

export interface CustomerFieldsStepModel {
  fields: CustomerFieldItemModel[];
}

export function createEmptyCustomerFieldItem(): CustomerFieldItemModel {
  return {
    applicationFieldId: '',
    applicationField: '',
    applicableFor: 'Both',
    forEdit: false,
    forTagging: false,
    forAudit: false,
    forTransfer: false,
    forAllocation: false,
    forSplit: false,
    forRetire: false,
  };
}
