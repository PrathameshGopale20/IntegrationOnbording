import { OnboardingModel } from './onboarding-model';
import { WizardStepName } from '../constants/wizard-step-names.constant';

export type OnboardingDraftStatus = 'Draft' | 'In Progress' | 'Completed';

/**
 * Payload prepared on Save Draft / Next.
 * Ready for future POST /api/onboarding/save-draft.
 */
export interface OnboardingSaveDraftRequest {
  sessionId: string | null;
  currentStep: WizardStepName;
  currentStepIndex: number;
  status: OnboardingDraftStatus;
  data: OnboardingModel;
  savedAt: string;
}

/**
 * Future response from POST /api/onboarding/save-draft.
 */
export interface OnboardingSaveDraftResponse {
  sessionId: string;
  status: OnboardingDraftStatus;
  savedAt: string;
}
