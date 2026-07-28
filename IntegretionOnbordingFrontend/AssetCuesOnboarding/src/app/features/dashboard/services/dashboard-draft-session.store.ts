import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DashboardDraftSession } from '../models/dashboard-draft-session.model';

/**
 * Architecture store for Dashboard draft rows.
 * Will be hydrated from API later; currently updated from wizard state flow.
 */
@Injectable({ providedIn: 'root' })
export class DashboardDraftSessionStore {
  private readonly sessionsSubject = new BehaviorSubject<readonly DashboardDraftSession[]>([]);

  readonly sessions$: Observable<readonly DashboardDraftSession[]> =
    this.sessionsSubject.asObservable();

  getSessions(): readonly DashboardDraftSession[] {
    return this.sessionsSubject.getValue();
  }

  upsert(session: DashboardDraftSession): void {
    const current = [...this.sessionsSubject.getValue()];
    const index = current.findIndex((item) => item.sessionId === session.sessionId);

    if (index >= 0) {
      current[index] = session;
    } else {
      current.unshift(session);
    }

    this.sessionsSubject.next(current);
  }

  clear(): void {
    this.sessionsSubject.next([]);
  }
}
