import { OnboardingLocalDraftSession } from '../models/onboarding-local-draft.model';

/**
 * Persistence contract for onboarding drafts.
 * LocalStorageService implements this now; later swap for HTTP API client.
 *
 * POST   /api/onboarding/save
 * GET    /api/onboarding
 * GET    /api/onboarding/{id}
 * PUT    /api/onboarding/{id}
 * DELETE /api/onboarding/{id}
 */
export interface IOnboardingDraftStorage {
  saveDraft(session: OnboardingLocalDraftSession): void;
  getDraft(sessionId: string): OnboardingLocalDraftSession | null;
  getAllDrafts(): OnboardingLocalDraftSession[];
  updateDraft(sessionId: string, session: OnboardingLocalDraftSession): void;
  deleteDraft(sessionId: string): void;
  clearDraft(): void;
}
