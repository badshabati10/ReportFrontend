import { Component, OnInit, OnDestroy, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { MenuService } from '../../core/services/menu.service';
import { MenuItem } from '../../core/models/menu-item.model';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly menuService = inject(MenuService);
  private readonly router = inject(Router);
  private routerEventsSubscription?: Subscription;
  private closeTimer?: ReturnType<typeof setTimeout>;
  private openDropdownId: string | null = null;

  readonly username = this.auth.username;
  readonly rolesLabel = computed(() => this.auth.roles().join(', ') || '—');

  readonly menu = this.menuService.getMenu();

  ngOnInit(): void {
    this.routerEventsSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.closeAllMenus());
  }

  ngOnDestroy(): void {
    this.routerEventsSubscription?.unsubscribe();
    this.clearTimer();
  }

  toggle(label: string): void {
    this.openDropdownId = this.openDropdownId === label ? null : label;
  }

  openDropdownOnHover(label: string): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = undefined;
    }
    this.openDropdownId = label;
  }

  closeDropdownOnLeave(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
    }
    this.closeTimer = setTimeout(() => {
      this.openDropdownId = null;
    }, 140);
  }

  isDropdownOpen(label: string): boolean {
    return this.openDropdownId === label;
  }

  onMenuLinkClick(): void {
    this.closeAllMenus();
  }

  isDropdown(item: MenuItem): boolean {
    return !!item.children?.length;
  }

  logout(): void {
    this.auth.logout();
  }

  private closeAllMenus(): void {
    this.openDropdownId = null;
    this.clearTimer();
  }

  private clearTimer(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = undefined;
    }
  }
}
