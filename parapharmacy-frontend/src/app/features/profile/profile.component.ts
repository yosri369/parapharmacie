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
    <!-- Header Banner -->
    <div class="profile-hero">
      <div class="profile-hero__inner">
        <div class="profile-hero__avatar">
          {{ auth.currentUser()?.firstName?.charAt(0) }}{{ auth.currentUser()?.lastName?.charAt(0) }}
        </div>
        <div class="profile-hero__info">
          <h1 class="profile-hero__name">{{ auth.currentUser()?.firstName }} {{ auth.currentUser()?.lastName }}</h1>
          <p class="profile-hero__email">{{ auth.currentUser()?.email }}</p>
          <span class="profile-hero__badge">{{ auth.isAdmin() ? '🔑 Administrateur' : '👤 Membre' }}</span>
        </div>
      </div>
    </div>

    <div class="profile-body">

      <!-- Quick links -->
      <div class="profile-links">
        <a routerLink="/profile/orders" class="profile-link-card">
          <span class="profile-link-icon">📦</span>
          <div>
            <p class="profile-link-title">Mes Commandes</p>
            <p class="profile-link-sub">Suivre et gérer vos achats</p>
          </div>
          <span class="profile-link-arrow">→</span>
        </a>
        <a routerLink="/wishlist" class="profile-link-card">
          <span class="profile-link-icon">❤️</span>
          <div>
            <p class="profile-link-title">Ma Liste de Souhaits</p>
            <p class="profile-link-sub">Vos produits favoris</p>
          </div>
          <span class="profile-link-arrow">→</span>
        </a>
        @if (auth.isAdmin()) {
          <a routerLink="/admin" class="profile-link-card profile-link-card--admin">
            <span class="profile-link-icon">⚙️</span>
            <div>
              <p class="profile-link-title">Tableau de Bord Admin</p>
              <p class="profile-link-sub">Gérer la boutique</p>
            </div>
            <span class="profile-link-arrow">→</span>
          </a>
        }
      </div>

      <!-- Edit Form -->
      <div class="profile-card">
        <h2 class="profile-section-title">✏️ Modifier mes informations</h2>
        @if (form) {
          <div class="profile-form-grid">
            <div>
              <label class="label-field">Prénom</label>
              <input [(ngModel)]="form.firstName" class="input-field" placeholder="Ex: Amina">
            </div>
            <div>
              <label class="label-field">Nom</label>
              <input [(ngModel)]="form.lastName" class="input-field" placeholder="Ex: Trabelsi">
            </div>
            <div class="col-span-2">
              <label class="label-field">Téléphone</label>
              <input [(ngModel)]="form.phone" class="input-field" type="tel" placeholder="+216 XX XXX XXX">
            </div>
            <div class="col-span-2">
              <label class="label-field">Adresse</label>
              <input [(ngModel)]="form.address" class="input-field" placeholder="Ex: 12 rue de la République">
            </div>
            <div>
              <label class="label-field">Ville</label>
              <input [(ngModel)]="form.city" class="input-field" placeholder="Ex: Tunis">
            </div>
            <div>
              <label class="label-field">Pays</label>
              <input [(ngModel)]="form.country" class="input-field" placeholder="Tunisie">
            </div>
          </div>
          <div class="profile-form-actions">
            <button (click)="save()" [disabled]="saving()" class="profile-save-btn">
              @if (saving()) { ⏳ Enregistrement... } @else { ✅ Sauvegarder }
            </button>
            <button (click)="auth.logout()" class="profile-logout-btn">
              🚪 Se déconnecter
            </button>
          </div>
        } @else {
          <div class="flex justify-center py-10">
            <svg class="w-8 h-8 animate-spin text-green-500" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        }
      </div>

    </div>

    <style>
      .profile-hero {
        background: linear-gradient(135deg, #071a12 0%, #0d2b1a 50%, #14532d 100%);
        padding: 3.5rem 1rem 5rem;
        position: relative;
        overflow: hidden;
      }
      .profile-hero::before {
        content: '';
        position: absolute; inset: 0;
        background: radial-gradient(ellipse at 70% 50%, rgba(74,222,128,0.1) 0%, transparent 60%);
      }
      .profile-hero__inner {
        max-width: 800px; margin: 0 auto;
        display: flex; align-items: center; gap: 1.75rem;
        position: relative; z-index: 1;
      }
      .profile-hero__avatar {
        width: 5rem; height: 5rem; border-radius: 50%;
        background: linear-gradient(135deg, #16a34a, #4ade80);
        display: flex; align-items: center; justify-content: center;
        font-size: 1.75rem; font-weight: 800; color: white;
        box-shadow: 0 0 0 4px rgba(74,222,128,0.25);
        flex-shrink: 0; text-transform: uppercase;
      }
      .profile-hero__name {
        font-size: 1.75rem; font-weight: 800; color: white; margin: 0;
      }
      .profile-hero__email { color: rgba(255,255,255,0.6); font-size: 0.95rem; margin-top: 0.25rem; }
      .profile-hero__badge {
        display: inline-block; margin-top: 0.5rem;
        padding: 0.25rem 0.875rem; border-radius: 99px;
        background: rgba(74,222,128,0.15); border: 1px solid rgba(74,222,128,0.3);
        color: #4ade80; font-size: 0.75rem; font-weight: 700;
      }

      .profile-body {
        max-width: 800px; margin: -2.5rem auto 4rem;
        padding: 0 1rem; position: relative; z-index: 2;
        display: flex; flex-direction: column; gap: 1.25rem;
      }

      /* Quick links */
      .profile-links { display: flex; flex-direction: column; gap: 0.75rem; }
      .profile-link-card {
        display: flex; align-items: center; gap: 1rem;
        background: white; border-radius: 1rem; padding: 1.1rem 1.25rem;
        box-shadow: 0 1px 4px rgba(0,0,0,0.06); border: 1px solid #f1f5f9;
        text-decoration: none; transition: all 0.2s; cursor: pointer;
      }
      .profile-link-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); transform: translateX(4px); }
      .profile-link-card--admin { border-color: rgba(22,163,74,0.2); background: #f0fdf4; }
      .profile-link-icon { font-size: 1.75rem; flex-shrink: 0; }
      .profile-link-title { font-weight: 700; color: #0f172a; font-size: 0.95rem; }
      .profile-link-sub { font-size: 0.8rem; color: #94a3b8; margin-top: 1px; }
      .profile-link-arrow { margin-left: auto; color: #94a3b8; font-size: 1.2rem; transition: transform 0.2s; }
      .profile-link-card:hover .profile-link-arrow { transform: translateX(4px); color: #16a34a; }

      /* Form card */
      .profile-card {
        background: white; border-radius: 1.25rem; padding: 2rem;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04);
        border: 1px solid #f1f5f9;
      }
      .profile-section-title { font-size: 1.05rem; font-weight: 700; color: #0f172a; margin-bottom: 1.5rem; }
      .profile-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
      .col-span-2 { grid-column: span 2; }
      .profile-form-actions {
        display: flex; gap: 0.75rem; margin-top: 1.5rem;
        flex-wrap: wrap;
      }
      .profile-save-btn {
        flex: 1; min-width: 160px;
        padding: 0.75rem 1.5rem; border-radius: 0.875rem;
        background: linear-gradient(135deg, #16a34a, #15803d);
        color: white; font-weight: 700; font-size: 0.95rem;
        border: none; cursor: pointer; transition: all 0.2s;
      }
      .profile-save-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(22,163,74,0.4); }
      .profile-save-btn:disabled { opacity: 0.65; cursor: not-allowed; }
      .profile-logout-btn {
        padding: 0.75rem 1.25rem; border-radius: 0.875rem;
        background: #fff0f0; color: #dc2626; font-weight: 600; font-size: 0.9rem;
        border: 1px solid #fecaca; cursor: pointer; transition: all 0.2s;
      }
      .profile-logout-btn:hover { background: #fee2e2; }

      @media (max-width: 600px) {
        .profile-form-grid { grid-template-columns: 1fr; }
        .col-span-2 { grid-column: span 1; }
      }
    </style>
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
      this.form = {
        firstName: p.firstName, lastName: p.lastName,
        phone: p.phone ?? '', address: p.address ?? '',
        city: p.city ?? '', country: p.country ?? 'Tunisie'
      };
    });
  }

  save() {
    this.saving.set(true);
    this.userSvc.updateProfile(this.form).subscribe({
      next: () => { this.saving.set(false); this.toast.success('Profil mis à jour avec succès !'); },
      error: () => { this.saving.set(false); this.toast.error('Erreur lors de la mise à jour.'); }
    });
  }
}
