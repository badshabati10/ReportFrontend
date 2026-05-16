import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const url = req.url;
  const isAuthCall =
    url.includes('/api/v1/auth/login') ||
    url.includes('/api/v1/auth/refresh');

  let headers = req.headers;
  if (!isAuthCall) {
    const token = auth.getAccessToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return next(req.clone({ headers })).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isAuthCall) {
        auth.logout({ sessionExpired: true });
      }
      return throwError(() => err);
    }),
  );
};
