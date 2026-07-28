export const TRANSACTION_NAME_BY_ID: Readonly<Record<number, string>> = {
  1: 'Asset Creation',
  12: 'Profit Center Master',
  13: 'Asset Class Master',
  14: 'Location Master',
  16: 'Sub Location Master',
  18: 'Cost Center Master',
  27: 'Asset Edit',
  33: 'Asset Split',
  39: 'Asset Tagging',
  45: 'Asset Audit',
  51: 'Asset Audit',
  57: 'Asset Audit',
  63: 'Asset Audit',
  69: 'Asset Audit',
  87: 'Asset Transfer',
  159: 'Asset Retirement',
} as const;

export const APPLICATION_FIELD_NAME_BY_ID: Readonly<Record<number, string>> = {
  4: 'Asset Code',
  5: 'Asset Description',
  6: 'Asset Category',
  7: 'Location',
  8: 'Cost Center',
  9: 'Barcode',
} as const;

export function resolveTransactionName(typeId: number | null, tcode: string): string {
  if (typeId !== null && TRANSACTION_NAME_BY_ID[typeId]) {
    return TRANSACTION_NAME_BY_ID[typeId];
  }
  return tcode || 'Transaction';
}

export function resolveEndpointTypeLabel(code: string, tcode = ''): string {
  const normalized = (code || '').toUpperCase();
  if (normalized === 'I' || normalized === 'INBOUND') return 'Inbound';
  if (normalized === 'O' || normalized === 'OUTBOUND') return 'Outbound';
  if (normalized === 'M' || normalized === 'MASTER') return 'Master';

  const tc = tcode.toUpperCase();
  if (tc.startsWith('MS|')) return 'Master';
  if (tc.startsWith('AC|') || tc.includes('|I')) return 'Inbound';
  return 'Outbound';
}

export function resolveApplicableFor(code: string): string {
  const normalized = (code || '').toUpperCase();
  if (normalized === 'I') return 'Inbound';
  if (normalized === 'O') return 'Outbound';
  if (normalized === 'B' || normalized === 'BOTH') return 'Both';
  return code || 'Both';
}

export function resolveCreationTrigger(triggerId: string | null | undefined): string {
  if (!triggerId) return 'On Save';
  return `Trigger ${triggerId}`;
}
