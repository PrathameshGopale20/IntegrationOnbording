import { Component, Input } from '@angular/core';
import { OnboardingModel } from '../../models/onboarding-model';

@Component({
  selector: 'app-review-step',
  templateUrl: './review-step.component.html',
  styleUrl: './review-step.component.scss',
  standalone: false,
})
export class ReviewStepComponent {
  @Input({ required: true }) model: OnboardingModel | null = null;

  readonly pageTitle = 'Review & Submit';
  readonly pageSubtitle = 'Review all imported and edited onboarding details before generating SQL.';

  get basic() {
    return this.model?.basicDetails;
  }

  get companiesCount(): number {
    return this.model?.companies?.companies?.length ?? 0;
  }

  get transactionsCount(): number {
    return this.model?.transactions?.transactions?.length ?? 0;
  }

  get endpointsCount(): number {
    return this.model?.endpoints?.endpoints?.length ?? 0;
  }

  get fieldsCount(): number {
    return this.model?.customerFields?.fields?.length ?? 0;
  }

  get mappingsCount(): number {
    return this.model?.fieldMapping?.mappings?.length ?? 0;
  }
}
