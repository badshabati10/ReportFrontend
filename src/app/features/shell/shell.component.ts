import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MenuService } from '../../core/services/menu.service';
import { MenuItem } from '../../core/models/menu-item.model';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  private readonly menuService = inject(MenuService);

  readonly username = this.auth.username;
  readonly rolesLabel = computed(() => this.auth.roles().join(', ') || '—');

  readonly menu = computed(() => {
    void this.auth.roles();
    return this.menuService.getMenu();
  });

  readonly openDropdown = signal<string | null>(null);

  toggle(label: string): void {
    this.openDropdown.update((current) => (current === label ? null : label));
  }

  closeDropdown(): void {
    this.openDropdown.set(null);
  }

  isDropdown(item: MenuItem): boolean {
    return !!item.children?.length;
  }

  logout(): void {
    this.auth.logout();
  }
}
