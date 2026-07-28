/**
 * Dashboard draft row prepared for future API-backed listing.
 * After first Basic Details save, a Draft session can appear here.
 */
export interface DashboardDraftSession {
  sessionId: string;
  customerName: string;
  customerId: string;
  integrationType: string;
  application: string;
  status: 'Draft';
  createdDate: string;
  lastUpdated: string;
}
