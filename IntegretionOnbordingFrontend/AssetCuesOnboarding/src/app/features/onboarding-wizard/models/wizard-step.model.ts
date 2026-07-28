import { WizardStepName } from '../constants/wizard-step-names.constant';

export interface WizardStepDefinition {
  readonly id: WizardStepName;
  readonly index: number;
  readonly title: string;
  readonly description: string;
  readonly routePath: string;
}

export interface WizardNavigationState {
  readonly currentStepIndex: number;
  readonly totalSteps: number;
  readonly currentStep: WizardStepDefinition;
  readonly isFirstStep: boolean;
  readonly isLastStep: boolean;
  readonly progressPercent: number;
}
