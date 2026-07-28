import { Injectable, computed, signal } from '@angular/core';
import { WIZARD_STEPS, WIZARD_TOTAL_STEPS } from '../constants/wizard-steps.constant';
import { IWizardNavigationService } from '../models/wizard-navigation.interface';
import { WizardNavigationState, WizardStepDefinition } from '../models/wizard-step.model';

@Injectable()
export class WizardNavigationService implements IWizardNavigationService {
  private readonly currentIndex = signal(0);

  readonly steps: readonly WizardStepDefinition[] = WIZARD_STEPS;
  readonly totalSteps = WIZARD_TOTAL_STEPS;

  readonly currentStepIndex = computed(() => this.currentIndex());
  readonly currentStep = computed(() => this.steps[this.currentIndex()] ?? this.steps[0]);
  readonly isFirstStep = computed(() => this.currentIndex() === 0);
  readonly isLastStep = computed(() => this.currentIndex() === this.totalSteps - 1);
  readonly progressPercent = computed(
    () => ((this.currentIndex() + 1) / this.totalSteps) * 100
  );
  readonly stepLabel = computed(
    () => `Step ${this.currentIndex() + 1} of ${this.totalSteps}`
  );

  readonly navigationState = computed<WizardNavigationState>(() => {
    const currentStep = this.currentStep();
    return {
      currentStepIndex: this.currentStepIndex(),
      totalSteps: this.totalSteps,
      currentStep,
      isFirstStep: this.isFirstStep(),
      isLastStep: this.isLastStep(),
      progressPercent: this.progressPercent(),
    };
  });

  goToNextStep(): void {
    if (!this.isLastStep()) {
      this.currentIndex.update((index) => index + 1);
    }
  }

  goToPreviousStep(): void {
    if (!this.isFirstStep()) {
      this.currentIndex.update((index) => index - 1);
    }
  }

  setCurrentStepIndex(index: number): void {
    if (index < 0 || index >= this.totalSteps) {
      return;
    }

    this.currentIndex.set(index);
  }

  reset(): void {
    this.currentIndex.set(0);
  }
}
