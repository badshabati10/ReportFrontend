import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService, RoleDto } from '../../core/services/admin.service';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.scss',
})
export class UserCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly admin = inject(AdminService);

  readonly loading = signal(false);
  readonly loadingRoles = signal(true);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly roles = signal<RoleDto[]>([]);

  readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    roles: ['', Validators.required],
  });

  private describeError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0 || err.status === 502 || err.status === 503 || err.status === 504) {
        return (
          'Cannot reach the API. Start Spring Boot (db2-spring-api) on port 8080, then run `ng serve`.'
        );
      }
      if (err.status === 400) {
        return 'Invalid input. Check the form values.';
      }
    }
    return 'User creation failed. Check that the API is running.';
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  private loadRoles(): void {
    this.loadingRoles.set(true);
    this.admin.getRoles().subscribe({
      next: (roles) => {
        const options = Array.isArray(roles) && roles.length > 0 ? roles : [{ id: 'ROLE_USER', name: 'User' }, { id: 'ROLE_ADMIN', name: 'Admin' }];
        this.roles.set(options);
        this.form.patchValue({ roles: options[0].id });
        this.loadingRoles.set(false);
      },
      error: (err) => {
        console.error('Error loading roles', err);
        const options = [{ id: 'ROLE_USER', name: 'User' }, { id: 'ROLE_ADMIN', name: 'Admin' }];
        this.roles.set(options);
        this.form.patchValue({ roles: options[0].id });
        this.error.set('Unable to load roles. Using default role values.');
        this.loadingRoles.set(false);
      },
    });
  }

  submit(): void {
    this.error.set(null);
    this.success.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const payload = { username: raw.username, password: raw.password, roles: raw.roles ? [raw.roles] : [] };
    this.loading.set(true);
    this.admin.createUser(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('User created successfully.');
        this.form.reset({ username: '', password: '', roles: this.roles()[0]?.id ?? 'ROLE_USER' });
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set(this.describeError(err));
      },
    });
  }
}
