export interface NavItem {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly route?: string;
  readonly exact?: boolean;
  readonly disabled?: boolean;
}

export interface NavGroup {
  readonly id: string;
  readonly label: string;
  readonly items: readonly NavItem[];
}

export interface BreadcrumbItem {
  readonly label: string;
  readonly url: string;
}
