export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

/**
 * Maps to integration.in_customerintcompanies
 * companyName is UI-only (not a DB column on this table).
 */
export interface CompanyFormModel {
  companyId: string;
  companyName: string;
  companyCode: string;
  fileExtension: string;
  delimiter: string;
  qualifier: string;
  isActive: boolean;
}
