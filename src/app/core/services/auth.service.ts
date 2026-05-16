import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { decodeJwtPayload } from '../utils/jwt.util';

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  accessExpiresInSeconds: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly accessToken = signal<string | null>(this.readStored(ACCESS_KEY));

  readonly roles = computed(() => {
    const token = this.accessToken();
    if (!token) {
      return [] as string[];
    }
    const payload = decodeJwtPayload(token);
    const scope = payload?.['scope'];
    if (typeof scope === 'string' && scope.length > 0) {
      return scope.trim().split(/\s+/);
    }
    return [] as string[];
  });

  readonly username = computed(() => {
    const token = this.accessToken();
    if (!token) {
      return '';
    }
    const payload = decodeJwtPayload(token);
    const sub = payload?.['sub'];
    return typeof sub === 'string' ? sub : '';
  });

  readonly isAuthenticated = computed(() => !!this.accessToken());

  login(username: string, password: string) {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/api/v1/auth/login`, { username, password })
      .pipe(tap((res) => this.setSession(res)));
  }

  logout(options?: { sessionExpired?: boolean }): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    this.accessToken.set(null);
    if (options?.sessionExpired) {
      void this.router.navigate(['/login'], { queryParams: { reason: 'session' } });
    } else {
      void this.router.navigate(['/login']);
    }
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }

  hasAnyRole(required: readonly string[]): boolean {
    if (required.length === 0) {
      return true;
    }
    const mine = this.roles();
    return required.some((r) => mine.includes(r));
  }

  private setSession(res: LoginResponse): void {
    localStorage.setItem(ACCESS_KEY, res.accessToken);
    localStorage.setItem(REFRESH_KEY, res.refreshToken);
    this.accessToken.set(res.accessToken);
  }

  private readStored(key: string): string | null {
    return localStorage.getItem(key);
  }
}
