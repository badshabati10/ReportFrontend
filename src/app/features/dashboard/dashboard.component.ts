import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <h1>Dashboard</h1>
    <p>
      Signed in as <strong>{{ auth.username() }}</strong> with roles
      <code>{{ auth.roles().join(', ') || 'none' }}</code>.
    </p>
    <p>
      Open <strong>Reports</strong> in the top bar to load data from the secured API. Requests include the JWT via an
      HTTP interceptor; routes use an auth guard and role guard where configured.
    </p>
  `,
})
export class DashboardComponent {
  readonly auth = inject(AuthService);
}
