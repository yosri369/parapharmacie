import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { GoogleSigninButtonModule, SocialAuthService } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, GoogleSigninButtonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-beige-50 via-white to-sage-50 py-16 px-4">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <a routerLink="/" class="inline-flex items-center gap-2">
            <div class="w-10 h-10 bg-sage-500 rounded-xl flex items-center justify-center">
              <span class="text-white font-display font-bold">P</span>
            </div>
            <span class="font-display font-bold text-2xl">Pharma<span class="text-sage-500">Alyosr</span></span>
          </a>
          <h1 class="font-display text-3xl font-bold text-gray-900 mt-6">Welcome back</h1>
          <p class="text-gray-500 mt-2">Sign in to your wellness account</p>
        </div>

        <div class="card p-8">
          <form (ngSubmit)="onSubmit()">
            <div class="space-y-4">
              <div>
                <label class="label-field">Email address</label>
                <input type="email" [(ngModel)]="email" name="email" required
                       class="input-field" placeholder="you@example.com"
                       [class.border-red-300]="error()">
              </div>
              <div>
                <div class="flex justify-between items-center mb-1.5">
                  <label class="label-field mb-0">Password</label>
                  <a routerLink="/auth/forgot-password" class="text-xs text-sage-600 hover:text-sage-700 font-medium">Forgot password?</a>
                </div>
                <input type="password" [(ngModel)]="password" name="password" required
                       class="input-field" placeholder="••••••••"
                       [class.border-red-300]="error()">
              </div>
              @if (error()) {
                <p class="text-sm text-rose-500 font-medium">{{ error() }}</p>
              }
              <button type="submit" [disabled]="loading()" class="btn-primary w-full justify-center py-4">
                @if (loading()) {
                  <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Signing in...
                } @else {
                  Sign In
                }
              </button>
            </div>
          </form>

          <!-- Divider -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-200"></div></div>
            <div class="relative flex justify-center text-sm"><span class="px-2 bg-white text-gray-500">Or continue with</span></div>
          </div>

          <!-- Google Sign In -->
          <div class="flex justify-center w-full">
            <asl-google-signin-button type="standard" size="large" [width]="300"></asl-google-signin-button>
          </div>

          <!-- Demo credentials hint -->
          <div class="mt-5 p-4 bg-beige-50 rounded-2xl text-xs text-gray-500 space-y-1">
            <p class="font-semibold text-gray-700 mb-1">Demo credentials:</p>
            <p>👤 User: <code class="text-sage-700">sophie&#64;example.com</code> / <code class="text-sage-700">User2024!</code></p>
            <p>🔑 Admin: <code class="text-sage-700">admin&#64;vitanova.com</code> / <code class="text-sage-700">Admin2024!</code></p>
          </div>
        </div>

        <p class="text-center text-sm text-gray-500 mt-5">
          Nouveau sur pharma_alyosr ?
          <a routerLink="/auth/register" class="text-sage-600 font-semibold hover:text-sage-700">Create account</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  auth    = inject(AuthService);
  cart    = inject(CartService);
  toast   = inject(ToastService);
  router  = inject(Router);
  route   = inject(ActivatedRoute);
  socialAuth = inject(SocialAuthService);

  email = ''; password = '';
  loading = signal(false);
  error   = signal('');

  constructor() {
    this.socialAuth.authState.subscribe((user) => {
      if (user && user.idToken) {
        this.loading.set(true);
        this.error.set('');
        this.auth.googleLogin(user.idToken).subscribe({
          next: () => {
            this.loading.set(false);
            this.cart.loadCart().subscribe();
            this.toast.success('Bienvenue avec Google ! 🌿');
            const ret = this.route.snapshot.queryParams['returnUrl'] || '/';
            this.router.navigateByUrl(ret);
          },
          error: () => {
            this.loading.set(false);
            this.error.set('Authentication failed with Google.');
          }
        });
      }
    });
  }

  onSubmit() {
    this.loading.set(true); this.error.set('');
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.cart.loadCart().subscribe();
        this.toast.success('Welcome back! 🌿');
        const ret = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(ret);
      },
      error: () => { this.loading.set(false); this.error.set('Invalid email or password. Please try again.'); }
    });
  }
}
