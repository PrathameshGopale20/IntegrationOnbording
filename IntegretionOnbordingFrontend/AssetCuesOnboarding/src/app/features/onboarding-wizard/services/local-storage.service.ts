import { Injectable } from '@angular/core';
import { IOnboardingDraftStorage } from '../models/onboarding-draft-storage.interface';
import { OnboardingLocalDraftSession } from '../models/onboarding-local-draft.model';

const DRAFTS_STORAGE_KEY = 'assetcues.onboarding.drafts';
const ACTIVE_SESSION_KEY = 'assetcues.onboarding.activeSessionId';

/**
 * Temporary frontend persistence.
 * Later replace method bodies with HttpClient calls to:
 * POST/GET/PUT/DELETE /api/onboarding
 */
@Injectable({ providedIn: 'root' })
export class LocalStorageService implements IOnboardingDraftStorage {
  saveDraft(session: OnboardingLocalDraftSession): void {
    const drafts = this.getAllDrafts().filter((item) => item.sessionId !== session.sessionId);
    drafts.unshift(session);
    this.writeAll(drafts);
    this.setActiveSessionId(session.sessionId);
  }

  getDraft(sessionId: string): OnboardingLocalDraftSession | null {
    return this.getAllDrafts().find((item) => item.sessionId === sessionId) ?? null;
  }

  getAllDrafts(): OnboardingLocalDraftSession[] {
    const raw = localStorage.getItem(DRAFTS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as OnboardingLocalDraftSession[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  updateDraft(sessionId: string, session: OnboardingLocalDraftSession): void {
    const drafts = this.getAllDrafts();
    const index = drafts.findIndex((item) => item.sessionId === sessionId);

    if (index < 0) {
      this.saveDraft(session);
      return;
    }

    drafts[index] = { ...session, sessionId };
    this.writeAll(drafts);
    this.setActiveSessionId(sessionId);
  }

  deleteDraft(sessionId: string): void {
    const drafts = this.getAllDrafts().filter((item) => item.sessionId !== sessionId);
    this.writeAll(drafts);

    if (this.getActiveSessionId() === sessionId) {
      this.clearActiveSessionId();
    }
  }

  clearDraft(): void {
    localStorage.removeItem(DRAFTS_STORAGE_KEY);
    this.clearActiveSessionId();
  }

  getActiveSessionId(): string | null {
    return localStorage.getItem(ACTIVE_SESSION_KEY);
  }

  setActiveSessionId(sessionId: string): void {
    localStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
  }

  clearActiveSessionId(): void {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  }

  private writeAll(drafts: OnboardingLocalDraftSession[]): void {
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
  }
}
