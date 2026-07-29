import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-beige-50 via-white to-sage-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <div class="text-center">
          <h2 class="mt-2 text-3xl font-extrabold text-gray-900 font-display">Forgot your password?</h2>
          <p class="mt-2 text-sm text-gray-600">Enter your email address and we'll send you a link to reset your password.</p>
        </div>
        
        @if (success()) {
          <div class="bg-green-50 text-green-800 border border-green-200 p-4 rounded-xl text-center">
            <p class="font-medium">Reset link sent!</p>
            <p class="text-sm mt-1">Please check your email inbox for further instructions.</p>
          </div>
          <div class="text-center mt-6">
            <a routerLink="/auth/login" class="text-sage-600 hover:text-sage-700 font-semibold text-sm">&larr; Back to login</a>
          </div>
        } @else {
          <form class="mt-8 space-y-6" (ngSubmit)="onSubmit()">
            <div>
              <label for="email-address" class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input id="email-address" name="email" type="email" autocomplete="email" required
                     [(ngModel)]="email"
                     class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none transition-all"
                     placeholder="you@example.com">
            </div>

            @if (error()) {
              <div class="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg">{{ error() }}</div>
            }

            <div>
              <button type="submit" [disabled]="loading()"
                      class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-sage-600 hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-500 disabled:opacity-70 transition-all duration-200">
                @if (loading()) {
                  <span class="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                  Sending...
                } @else {
                  Send Reset Link
                }
              </button>
            </div>
            <div class="text-center mt-4">
              <a routerLink="/auth/login" class="text-sage-600 hover:text-sage-700 font-medium text-sm">&larr; Back to login</a>
            </div>
          </form>
        }
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  auth = inject(AuthService);
  
  email = '';
  loading = signal(false);
  success = signal(false);
  error = signal('');

  onSubmit() {
    if (!this.email) return;
    this.loading.set(true);
    this.error.set('');
    
    this.auth.forgotPassword(this.email).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: () => {
        this.loading.set(false);
        // We pretend it succeeds to avoid email enumeration, but you can display a generic error if the network fails.
        this.success.set(true); 
      }
    });
  }
}
