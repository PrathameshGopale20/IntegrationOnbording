import { NavGroup } from '../models/navigation.model';

export const APP_SHELL_NAVIGATION: readonly NavGroup[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'dashboard',
        route: '/dashboard',
        exact: true,
      },
      {
        id: 'onboarding',
        label: 'Customer Onboarding',
        icon: 'person_add',
        route: '/onboarding',
      },
    ],
  },
  {
    id: 'future',
    label: 'Future Modules',
    items: [],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      {
        id: 'settings',
        label: 'Settings',
        icon: 'settings',
        disabled: true,
      },
      {
        id: 'help',
        label: 'Help',
        icon: 'help_outline',
        disabled: true,
      },
    ],
  },
] as const;

export const ROUTE_BREADCRUMB_LABELS: Readonly<Record<string, string>> = {
  dashboard: 'Dashboard',
  onboarding: 'Customer Integration Onboarding',
  new: 'New',
};
