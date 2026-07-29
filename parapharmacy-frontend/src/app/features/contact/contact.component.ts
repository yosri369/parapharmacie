import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Header -->
    <div class="contact-hero">
      <div class="contact-hero__inner">
        <span class="contact-hero__eyebrow">📬 Contactez-nous</span>
        <h1 class="contact-hero__title">Nous sommes là pour vous aider</h1>
        <p class="contact-hero__sub">Notre équipe répond sous 24h, du lundi au samedi.</p>
      </div>
    </div>

    <div class="contact-body">
      <!-- Info cards -->
      <div class="contact-info-grid">
        @for (info of contactInfo; track info.label) {
          <div class="contact-info-card">
            <div class="contact-info-icon">{{ info.icon }}</div>
            <div>
              <p class="contact-info-label">{{ info.label }}</p>
              <p class="contact-info-value">{{ info.value }}</p>
            </div>
          </div>
        }
      </div>

      <!-- Form -->
      <div class="contact-form-card">
        <h2 class="contact-form-title">Envoyer un message</h2>

        @if (!sent()) {
          <div class="contact-form-fields">
            <div class="contact-form-row">
              <div>
                <label class="label-field">Votre nom *</label>
                <input [(ngModel)]="form.name" class="input-field" placeholder="Ex: Amina Trabelsi">
              </div>
              <div>
                <label class="label-field">Adresse e-mail *</label>
                <input [(ngModel)]="form.email" type="email" class="input-field" placeholder="vous@exemple.com">
              </div>
            </div>
            <div>
              <label class="label-field">Téléphone (optionnel)</label>
              <input [(ngModel)]="form.phone" type="tel" class="input-field" placeholder="+216 XX XXX XXX">
            </div>
            <div>
              <label class="label-field">Objet *</label>
              <select [(ngModel)]="form.subject" class="input-field">
                <option value="">-- Choisir un objet --</option>
                <option value="commande">Question sur une commande</option>
                <option value="produit">Renseignement produit</option>
                <option value="livraison">Problème de livraison</option>
                <option value="remboursement">Remboursement / Retour</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label class="label-field">Message *</label>
              <textarea [(ngModel)]="form.message" class="input-field h-36 resize-none"
                        placeholder="Décrivez votre demande en détail..."></textarea>
            </div>
            <button (click)="send()" [disabled]="sending()" class="contact-submit-btn">
              @if (sending()) {
                <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Envoi en cours...
              } @else {
                ✉️ Envoyer le message
              }
            </button>
          </div>
        } @else {
          <div class="contact-success">
            <div class="contact-success__icon">🎉</div>
            <h3 class="contact-success__title">Message envoyé !</h3>
            <p class="contact-success__sub">Nous avons bien reçu votre message et vous répondrons dans les 24 heures.</p>
            <button (click)="reset()" class="contact-reset-btn">Envoyer un autre message</button>
          </div>
        }
      </div>
    </div>

    <style>
      /* Hero */
      .contact-hero {
        background: linear-gradient(135deg, #071a12 0%, #0d2b1a 50%, #14532d 100%);
        padding: 4rem 1rem 5.5rem;
        position: relative; overflow: hidden;
      }
      .contact-hero::before {
        content: ''; position: absolute; inset: 0;
        background: radial-gradient(ellipse at 30% 60%, rgba(74,222,128,0.08), transparent 60%);
      }
      .contact-hero__inner { max-width: 680px; margin: 0 auto; text-align: center; position: relative; z-index: 1; }
      .contact-hero__eyebrow {
        display: inline-block; font-size: 0.85rem; font-weight: 700;
        color: #4ade80; background: rgba(74,222,128,0.12);
        border: 1px solid rgba(74,222,128,0.25); border-radius: 99px;
        padding: 0.35rem 1rem; margin-bottom: 1.25rem; letter-spacing: 0.04em;
      }
      .contact-hero__title { font-size: 2.5rem; font-weight: 800; color: white; margin: 0; line-height: 1.15; }
      .contact-hero__sub { color: rgba(255,255,255,0.55); margin-top: 0.75rem; font-size: 1.05rem; }

      /* Body */
      .contact-body {
        max-width: 900px; margin: -3rem auto 5rem;
        padding: 0 1rem; position: relative; z-index: 2;
        display: flex; flex-direction: column; gap: 1.25rem;
      }

      /* Info cards */
      .contact-info-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }
      .contact-info-card {
        display: flex; align-items: center; gap: 1rem;
        background: white; border-radius: 1.1rem; padding: 1.1rem 1.25rem;
        box-shadow: 0 1px 4px rgba(0,0,0,0.06); border: 1px solid #f1f5f9;
      }
      .contact-info-icon {
        width: 2.75rem; height: 2.75rem; border-radius: 0.75rem;
        background: #f0fdf4; display: flex; align-items: center; justify-content: center;
        font-size: 1.35rem; flex-shrink: 0;
      }
      .contact-info-label { font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; }
      .contact-info-value { font-size: 0.875rem; font-weight: 600; color: #0f172a; margin-top: 2px; }

      /* Form card */
      .contact-form-card {
        background: white; border-radius: 1.5rem; padding: 2.25rem;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05), 0 4px 24px rgba(0,0,0,0.04);
        border: 1px solid #f1f5f9;
      }
      .contact-form-title { font-size: 1.2rem; font-weight: 800; color: #0f172a; margin-bottom: 1.75rem; }
      .contact-form-fields { display: flex; flex-direction: column; gap: 1rem; }
      .contact-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
      .contact-submit-btn {
        display: flex; align-items: center; justify-content: center; gap: 0.5rem;
        width: 100%; padding: 0.9rem; border-radius: 0.875rem;
        background: linear-gradient(135deg, #16a34a, #15803d);
        color: white; font-weight: 700; font-size: 1rem;
        border: none; cursor: pointer; transition: all 0.2s;
      }
      .contact-submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(22,163,74,0.4); }
      .contact-submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

      /* Success */
      .contact-success { text-align: center; padding: 3rem 1rem; }
      .contact-success__icon { font-size: 4rem; margin-bottom: 1rem; }
      .contact-success__title { font-size: 1.75rem; font-weight: 800; color: #16a34a; }
      .contact-success__sub { color: #64748b; margin-top: 0.5rem; max-width: 380px; margin-inline: auto; line-height: 1.6; }
      .contact-reset-btn {
        margin-top: 1.75rem; padding: 0.75rem 1.75rem; border-radius: 0.875rem;
        background: #f0fdf4; color: #16a34a; font-weight: 700;
        border: 1px solid #bbf7d0; cursor: pointer; transition: all 0.2s;
      }
      .contact-reset-btn:hover { background: #dcfce7; }

      @media (max-width: 600px) {
        .contact-form-row { grid-template-columns: 1fr; }
        .contact-hero__title { font-size: 1.875rem; }
      }
    </style>
  `
})
export class ContactComponent {
  form   = { name: '', email: '', phone: '', subject: '', message: '' };
  sent   = signal(false);
  sending = signal(false);

  contactInfo = [
    { icon: '📧', label: 'Email', value: 'contact@pharmaalyosr.tn' },
    { icon: '📞', label: 'Téléphone', value: '+216 71 XXX XXX' },
    { icon: '📍', label: 'Adresse', value: 'Tunis, Tunisie' },
    { icon: '⏰', label: 'Horaires', value: 'Lun–Sam, 9h–18h' },
  ];

  send() {
    if (!this.form.name || !this.form.email || !this.form.message || !this.form.subject) return;
    this.sending.set(true);
    // Simulate sending (no backend endpoint yet)
    setTimeout(() => {
      this.sending.set(false);
      this.sent.set(true);
    }, 1200);
  }

  reset() {
    this.form = { name: '', email: '', phone: '', subject: '', message: '' };
    this.sent.set(false);
  }
}
