import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // If token is expired/invalid and the request was authenticated, clear session
      if ((err.status === 401 || err.status === 403) && token) {
        // Only auto-logout on 401 (expired token), not 403 (access denied for valid user)
        if (err.status === 401) {
          auth.logout();
        }
      }
      return throwError(() => err);
    })
  );
};
