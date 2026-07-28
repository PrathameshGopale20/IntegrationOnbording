import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { DraftSummaryDialogComponent } from './components/draft-summary-dialog/draft-summary-dialog.component';
import { OnboardingWizardRoutingModule } from './onboarding-wizard-routing.module';
import { OnboardingLandingPageComponent } from './pages/onboarding-landing/onboarding-landing-page.component';
import { WizardShellComponent } from './pages/wizard-shell/wizard-shell.component';
import { BasicDetailsStepComponent } from './steps/basic-details/basic-details-step.component';
import { CompaniesStepComponent } from './steps/companies/companies-step.component';
import { CredentialsStepComponent } from './steps/credentials/credentials-step.component';
import { TransactionsStepComponent } from './steps/transactions/transactions-step.component';
import { EndpointsStepComponent } from './steps/endpoints/endpoints-step.component';
import { CustomerFieldsStepComponent } from './steps/customer-fields/customer-fields-step.component';
import { FieldMappingStepComponent } from './steps/field-mapping/field-mapping-step.component';
import { MasterMappingStepComponent } from './steps/master-mapping/master-mapping-step.component';
import { ConfigurationsStepComponent } from './steps/configurations/configurations-step.component';
import { SchedulerStepComponent } from './steps/scheduler/scheduler-step.component';
import { ReviewStepComponent } from './steps/review/review-step.component';

@NgModule({
  declarations: [
    OnboardingLandingPageComponent,
    WizardShellComponent,
    BasicDetailsStepComponent,
    CompaniesStepComponent,
    CredentialsStepComponent,
    TransactionsStepComponent,
    EndpointsStepComponent,
    CustomerFieldsStepComponent,
    FieldMappingStepComponent,
    MasterMappingStepComponent,
    ConfigurationsStepComponent,
    SchedulerStepComponent,
    ReviewStepComponent,
    DraftSummaryDialogComponent,
    ConfirmDialogComponent,
  ],
  imports: [SharedModule, OnboardingWizardRoutingModule],
})
export class OnboardingWizardModule {}
