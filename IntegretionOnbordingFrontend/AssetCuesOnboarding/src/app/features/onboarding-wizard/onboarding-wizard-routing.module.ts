import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OnboardingLandingPageComponent } from './pages/onboarding-landing/onboarding-landing-page.component';
import { WizardShellComponent } from './pages/wizard-shell/wizard-shell.component';

/**
 * Routing architecture:
 * - /onboarding/new
 * - /onboarding/:sessionId
 * - /onboarding/:sessionId/:stepPath  (e.g. basic-details, companies, ...)
 *
 * After backend save-draft returns sessionId, navigate from /new to session routes.
 */
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: OnboardingLandingPageComponent,
  },
  {
    path: 'new',
    component: WizardShellComponent,
  },
  {
    path: ':sessionId/:stepPath',
    component: WizardShellComponent,
  },
  {
    path: ':sessionId',
    component: WizardShellComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OnboardingWizardRoutingModule {}
