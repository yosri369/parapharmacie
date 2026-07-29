import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthResponse, User } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'vita_token';
  private readonly USER_KEY  = 'vita_user';

  currentUser = signal<User | null>(this.loadUser());
  isLoggedIn  = computed(() => !!this.currentUser() && !this.isTokenExpired());
  isAdmin     = computed(() => this.currentUser()?.role === 'ROLE_ADMIN');

  constructor(private http: HttpClient, private router: Router) {}

  register(data: { firstName: string; lastName: string; email: string; password: string; phone?: string; age?: number; gender?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap(res => this.storeAuth(res))
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => this.storeAuth(res))
    );
  }

  googleLogin(idToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/google`, { idToken }).pipe(
      tap(res => this.storeAuth(res))
    );
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/reset-password`, { token, newPassword });
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /** Returns true if the stored JWT has expired (client-side check) */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? Date.now() / 1000 > payload.exp : false;
    } catch {
      return true;
    }
  }

  private storeAuth(res: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, res.accessToken);
    const user: User = {
      id: res.userId,
      email: res.email,
      firstName: res.firstName,
      lastName: res.lastName,
      role: res.role,
      age: res.age,
      gender: res.gender,
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private loadUser(): User | null {
    try {
      const u = localStorage.getItem(this.USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  }
}
