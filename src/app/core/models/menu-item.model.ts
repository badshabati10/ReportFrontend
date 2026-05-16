export interface MenuItem {
  label: string;
  routerLink?: string;
  children?: MenuItem[];
  /** Spring Security roles, e.g. ROLE_ADMIN */
  roles?: string[];
}
