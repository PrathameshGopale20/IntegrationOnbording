import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { ROUTE_BREADCRUMB_LABELS } from '../constants/navigation.constant';
import { BreadcrumbItem } from '../models/navigation.model';

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private readonly router = inject(Router);

  readonly breadcrumbs = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
      map((url) => this.buildBreadcrumbs(url))
    ),
    { initialValue: [] as BreadcrumbItem[] }
  );

  private buildBreadcrumbs(url: string): BreadcrumbItem[] {
    const path = url.split('?')[0] ?? '';
    const segments = path.split('/').filter((segment) => segment.length > 0);

    if (segments.length === 0 || (segments.length === 1 && segments[0] === 'dashboard')) {
      return [{ label: 'Dashboard', url: '/dashboard' }];
    }

    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Dashboard', url: '/dashboard' }];
    let accumulatedPath = '';

    for (const segment of segments) {
      accumulatedPath += `/${segment}`;
      const label = ROUTE_BREADCRUMB_LABELS[segment] ?? this.formatSegment(segment);
      breadcrumbs.push({ label, url: accumulatedPath });
    }

    return breadcrumbs;
  }

  private formatSegment(segment: string): string {
    return segment
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
