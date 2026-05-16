import { inject, Injectable } from '@angular/core';
import { MenuItem } from '../models/menu-item.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly auth = inject(AuthService);

  /**
   * Full menu definition; entries with `roles` require at least one match.
   * Parent dropdowns appear only when at least one child is visible.
   */
  getMenu(): MenuItem[] {
    const items: MenuItem[] = [
      { label: 'Dashboard', routerLink: '/dashboard' },
      {
        label: 'Reports',
        children: [
          {
            label: 'Inventory summary',
            routerLink: '/reports/inventory',
            roles: ['ROLE_ADMIN'],
          },
          {
            label: 'Product catalog',
            routerLink: '/reports/products',
            roles: ['ROLE_ADMIN', 'ROLE_USER'],
          },
        ],
      },
    ];
    return this.filterMenu(items);
  }

  private filterMenu(items: MenuItem[]): MenuItem[] {
    const result: MenuItem[] = [];
    for (const item of items) {
      if (item.children?.length) {
        const children = this.filterMenu(item.children);
        if (children.length > 0) {
          result.push({ ...item, children });
        }
        continue;
      }
      const visible = !item.roles?.length || this.auth.hasAnyRole(item.roles);
      if (visible && item.routerLink) {
        result.push(item);
      }
    }
    return result;
  }
}
