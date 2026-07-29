import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-beige-50 via-white to-sage-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <div class="text-center">
          <h2 class="mt-2 text-3xl font-extrabold text-gray-900 font-display">Create new password</h2>
          <p class="mt-2 text-sm text-gray-600">Your new password must be different from previous used passwords.</p>
        </div>
        
        <form class="mt-8 space-y-6" (ngSubmit)="onSubmit()">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input id="password" name="password" type="password" required
                   [(ngModel)]="newPassword"
                   class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none transition-all"
                   placeholder="••••••••">
          </div>
          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input id="confirm-password" name="confirmPassword" type="password" required
                   [(ngModel)]="confirmPassword"
                   class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none transition-all"
                   placeholder="••••••••">
          </div>

          @if (error()) {
            <div class="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg">{{ error() }}</div>
          }

          <div>
            <button type="submit" [disabled]="loading() || !isFormValid()"
                    class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-sage-600 hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-sage-500 disabled:opacity-70 transition-all duration-200">
              @if (loading()) {
                <span class="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                Resetting...
              } @else {
                Reset Password
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  auth = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  toast = inject(ToastService);
  
  token = '';
  newPassword = '';
  confirmPassword = '';
  
  loading = signal(false);
  error = signal('');

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.error.set('Invalid or missing reset token.');
      }
    });
  }

  isFormValid(): boolean {
    return this.newPassword.length >= 6 && this.newPassword === this.confirmPassword && !!this.token;
  }

  onSubmit() {
    if (!this.isFormValid()) {
      if (this.newPassword !== this.confirmPassword) {
        this.error.set('Passwords do not match');
      } else {
        this.error.set('Password must be at least 6 characters');
      }
      return;
    }

    this.loading.set(true);
    this.error.set('');
    
    this.auth.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Password reset successfully! You can now log in.');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to reset password. The token may be invalid or expired.');
      }
    });
  }
}
