import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { GoogleSigninButtonModule, SocialAuthService } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, GoogleSigninButtonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-beige-50 via-white to-sage-50 py-16 px-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <a routerLink="/" class="inline-flex items-center gap-2">
            <div class="w-10 h-10 bg-sage-500 rounded-xl flex items-center justify-center">
              <span class="text-white font-display font-bold">P</span>
            </div>
            <span class="font-display font-bold text-2xl">Pharma<span class="text-sage-500">Alyosr</span></span>
          </a>
          <h1 class="font-display text-3xl font-bold text-gray-900 mt-6">Create account</h1>
          <p class="text-gray-500 mt-2">Join thousands on their wellness journey</p>
        </div>

        <div class="card p-8">
          <form (ngSubmit)="onSubmit()">
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label-field">First Name</label>
                  <input type="text" [(ngModel)]="form.firstName" name="firstName" required class="input-field" placeholder="Sophie">
                </div>
                <div>
                  <label class="label-field">Last Name</label>
                  <input type="text" [(ngModel)]="form.lastName" name="lastName" required class="input-field" placeholder="Martin">
                </div>
              </div>
              <div>
                <label class="label-field">Email</label>
                <input type="email" [(ngModel)]="form.email" name="email" required class="input-field" placeholder="you@example.com">
              </div>
              <div>
                <label class="label-field">Password</label>
                <input type="password" [(ngModel)]="form.password" name="password" required minlength="6" class="input-field" placeholder="Min. 6 characters">
              </div>
              <div>
                <label class="label-field">Phone (optional)</label>
                <input type="tel" [(ngModel)]="form.phone" name="phone" class="input-field" placeholder="+33 6 12 34 56 78">
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label-field">Age (optional)</label>
                  <input type="number" [(ngModel)]="form.age" name="age" class="input-field" placeholder="30">
                </div>
                <div>
                  <label class="label-field">Gender (optional)</label>
                  <select [(ngModel)]="form.gender" name="gender" class="input-field">
                    <option value="" disabled selected>Select</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              @if (error()) {
                <p class="text-sm text-rose-500 font-medium">{{ error() }}</p>
              }
              <button type="submit" [disabled]="loading()" class="btn-primary w-full justify-center py-4">
                @if (loading()) {
                  <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Creating account...
                } @else {
                  Create Account 🌿
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
        </div>

        <p class="text-center text-sm text-gray-500 mt-5">
          Already have an account?
          <a routerLink="/auth/login" class="text-sage-600 font-semibold hover:text-sage-700">Sign in</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  auth  = inject(AuthService);
  cart  = inject(CartService);
  toast = inject(ToastService);
  router = inject(Router);
  socialAuth = inject(SocialAuthService);

  form = { firstName: '', lastName: '', email: '', password: '', phone: '', age: undefined, gender: '' };
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
            this.router.navigate(['/']);
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
    this.auth.register(this.form).subscribe({
      next: () => {
        this.loading.set(false);
        this.cart.loadCart().subscribe();
        this.toast.success('Compte créé ! Bienvenue sur pharma_alyosr 🌿');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Registration failed. Email may already be in use.');
      }
    });
  }
}
