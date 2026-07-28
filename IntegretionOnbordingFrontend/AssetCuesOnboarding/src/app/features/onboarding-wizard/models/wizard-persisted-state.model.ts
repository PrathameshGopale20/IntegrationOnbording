import { OnboardingModel } from './onboarding-model';
import { OnboardingSaveDraftRequest } from './onboarding-draft.dto';
import { WizardStepName } from '../constants/wizard-step-names.constant';

/**
 * Local persistence shape for refresh restore.
 * Backend persistence will replace this later.
 */
export interface WizardPersistedState {
  sessionId: string | null;
  currentStepIndex: number;
  currentStep: WizardStepName;
  data: OnboardingModel;
  lastDraftPayload: OnboardingSaveDraftRequest | null;
  updatedAt: string;
}
