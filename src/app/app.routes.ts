import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'reports/inventory',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN'] },
        loadComponent: () =>
          import('./features/reports/inventory-report.component').then((m) => m.InventoryReportComponent),
      },
      {
        path: 'reports/products',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_USER'] },
        loadComponent: () =>
          import('./features/reports/products-report.component').then((m) => m.ProductsReportComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
