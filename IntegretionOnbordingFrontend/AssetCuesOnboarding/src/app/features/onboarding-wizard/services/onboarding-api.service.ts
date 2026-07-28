import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  OnboardingSaveDraftRequest,
  OnboardingSaveDraftResponse,
} from '../models/onboarding-draft.dto';

/**
 * Future HTTP integration point.
 * Do not call until backend is available.
 */
@Injectable({ providedIn: 'root' })
export class OnboardingApiService {
  /**
   * Future: POST /api/onboarding/save-draft
   */
  saveDraft(_request: OnboardingSaveDraftRequest): Observable<OnboardingSaveDraftResponse> {
    throw new Error(
      'OnboardingApiService.saveDraft is not connected. Wire HttpClient when backend is ready.'
    );
  }
}
