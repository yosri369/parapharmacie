import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="font-display text-4xl font-bold text-gray-900 mb-8">My Profile</h1>
      <div class="card p-8">
        <div class="flex items-center gap-5 mb-8 pb-8 border-b border-gray-100">
          <div class="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center text-3xl font-bold text-sage-600">
            {{ auth.currentUser()?.firstName?.charAt(0) }}
          </div>
          <div>
            <h2 class="font-display text-2xl font-bold text-gray-900">{{ auth.currentUser()?.firstName }} {{ auth.currentUser()?.lastName }}</h2>
            <p class="text-gray-500">{{ auth.currentUser()?.email }}</p>
            <span class="badge mt-1" [class.badge-new]="auth.isAdmin()" [class.bg-beige-100]="!auth.isAdmin()" [class.text-beige-700]="!auth.isAdmin()">
              {{ auth.isAdmin() ? '🔑 Admin' : '👤 Member' }}
            </span>
          </div>
        </div>

        @if (form) {
          <div class="grid grid-cols-2 gap-5">
            <div>
              <label class="label-field">First Name</label>
              <input [(ngModel)]="form.firstName" class="input-field">
            </div>
            <div>
              <label class="label-field">Last Name</label>
              <input [(ngModel)]="form.lastName" class="input-field">
            </div>
            <div class="col-span-2">
              <label class="label-field">Phone</label>
              <input [(ngModel)]="form.phone" class="input-field" type="tel">
            </div>
            <div class="col-span-2">
              <label class="label-field">Address</label>
              <input [(ngModel)]="form.address" class="input-field">
            </div>
            <div>
              <label class="label-field">City</label>
              <input [(ngModel)]="form.city" class="input-field">
            </div>
            <div>
              <label class="label-field">Country</label>
              <input [(ngModel)]="form.country" class="input-field">
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button (click)="save()" [disabled]="saving()" class="btn-primary">
              {{ saving() ? 'Saving...' : '✅ Save Changes' }}
            </button>
            <a routerLink="/profile/orders" class="btn-secondary">My Orders →</a>
          </div>
        }
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  auth    = inject(AuthService);
  userSvc = inject(UserService);
  toast   = inject(ToastService);

  form: any = null;
  saving = signal(false);

  ngOnInit() {
    this.userSvc.getProfile().subscribe(p => {
      this.form = { firstName: p.firstName, lastName: p.lastName, phone: p.phone ?? '', address: p.address ?? '', city: p.city ?? '', country: p.country ?? '' };
    });
  }

  save() {
    this.saving.set(true);
    this.userSvc.updateProfile(this.form).subscribe({
      next: () => { this.saving.set(false); this.toast.success('Profile updated successfully!'); },
      error: () => { this.saving.set(false); this.toast.error('Failed to update profile.'); }
    });
  }
}
