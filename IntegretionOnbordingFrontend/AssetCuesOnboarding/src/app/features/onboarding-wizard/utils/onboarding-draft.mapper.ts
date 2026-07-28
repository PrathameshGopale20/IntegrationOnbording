import { INTEGRATION_TYPE_OPTIONS } from '../steps/basic-details/basic-details-options.constant';
import { APPLICATION_OPTIONS_BY_INTEGRATION_TYPE } from '../steps/basic-details/basic-details-options.constant';
import { BasicDetailsFormModel } from '../steps/basic-details/basic-details.model';
import { DashboardDraftSession } from '../../dashboard/models/dashboard-draft-session.model';

/**
 * Maps Basic Details into a Dashboard draft row.
 * Used when first Basic Details save prepares a Draft session for Dashboard.
 */
export function mapBasicDetailsToDashboardDraft(
  sessionId: string,
  basicDetails: BasicDetailsFormModel,
  createdDate: string,
  lastUpdated: string
): DashboardDraftSession {
  const integrationType =
    INTEGRATION_TYPE_OPTIONS.find((option) => option.value === basicDetails.integrationTypeId)
      ?.label ?? '';

  const applicationOptions =
    basicDetails.integrationTypeId !== null
      ? (APPLICATION_OPTIONS_BY_INTEGRATION_TYPE[basicDetails.integrationTypeId] ?? [])
      : [];

  const application =
    applicationOptions.find((option) => option.value === basicDetails.applicationId)?.label ?? '';

  return {
    sessionId,
    customerName: basicDetails.customerName,
    customerId: basicDetails.customerId,
    integrationType,
    application,
    status: 'Draft',
    createdDate,
    lastUpdated,
  };
}

/**
 * Temporary local draft id until backend returns sessionId.
 * Replace with API sessionId when POST /api/onboarding/save-draft is connected.
 */
export function createLocalDraftSessionId(): string {
  return `local-draft-${Date.now()}`;
}
