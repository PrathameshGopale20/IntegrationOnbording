/**
 * Canonical CSV column headers for customer template import.
 * Format:
 *   Section,Field,Value
 *
 * Example sections: BasicDetails, Companies, Credentials, Transactions, ...
 */
export const TEMPLATE_CSV_HEADERS = ['Section', 'Field', 'Value'] as const;

export const TEMPLATE_SECTION_ALIASES: Readonly<Record<string, string>> = {
  basicdetails: 'BasicDetails',
  basic_details: 'BasicDetails',
  companies: 'Companies',
  company: 'Companies',
  credentials: 'Credentials',
  transactions: 'Transactions',
  transaction: 'Transactions',
  endpoints: 'Endpoints',
  endpoint: 'Endpoints',
  fields: 'CustomerFields',
  customerfields: 'CustomerFields',
  customer_fields: 'CustomerFields',
  fieldmapping: 'FieldMapping',
  field_mapping: 'FieldMapping',
  fieldmappings: 'FieldMapping',
  mastermapping: 'MasterMapping',
  master_mapping: 'MasterMapping',
  mastermappings: 'MasterMapping',
  configurations: 'Configurations',
  configuration: 'Configurations',
  config: 'Configurations',
  scheduler: 'Scheduler',
  review: 'Review',
  reviewsubmit: 'Review',
} as const;

export const REQUIRED_BASIC_DETAIL_FIELDS = [
  'customerId',
  'customerName',
  'tenantId',
] as const;
