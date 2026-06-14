import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MenuItem, UserMenuResponseDto } from '../models/menu-item.model';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly http = inject(HttpClient);

  /**
   * Loads role-based menu from database via API endpoint.
   * Returns hierarchical menu structure filtered by user's role.
   */
  getMenu(): Observable<MenuItem[]> {
    return this.http
      .get<UserMenuResponseDto>(`${environment.apiUrl}/api/v1/menus/my-menus`)
      .pipe(
        map((response) =>
          this.mapMenus(response.menus)
        )
      );
  }

  /**
   * Maps backend menu structure (route -> routerLink)
   */
  private mapMenus(menus: MenuItem[]): MenuItem[] {
    return menus.map((menu) => ({
      ...menu,
      routerLink: menu.route,
      children: menu.children ? this.mapMenus(menu.children) : [],
    }));
  }
}
