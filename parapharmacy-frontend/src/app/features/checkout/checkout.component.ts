import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../core/services/cart.service';
import { OrderService, PromoService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="checkout-page min-h-screen py-12">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <!-- Header -->
        <div class="mb-10">
          <a routerLink="/cart" class="inline-flex items-center gap-2 text-sm font-medium mb-4 back-link">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Retour au panier
          </a>
          <h1 class="checkout-title">Finaliser la commande</h1>
          <!-- Progress steps -->
          <div class="flex items-center gap-3 mt-6">
            <div class="step-dot active">1</div>
            <div class="step-line"></div>
            <div class="step-dot" [class.active]="step() >= 2">2</div>
            <div class="step-line"></div>
            <div class="step-dot" [class.active]="step() >= 3">3</div>
            <span class="ml-3 text-sm font-medium" style="color:#94a3b8">
              {{ step() === 1 ? 'Livraison' : step() === 2 ? 'Paiement' : 'Confirmation' }}
            </span>
          </div>
        </div>

        <div class="grid lg:grid-cols-5 gap-8 items-start">

          <!-- Left: Form -->
          <div class="lg:col-span-3 space-y-6">

            <!-- Step 1: Shipping -->
            @if (step() === 1) {
              <div class="checkout-card animate-fade-in-up">
                <div class="card-header">
                  <div class="card-icon">🚚</div>
                  <div>
                    <h2 class="card-title">Informations de livraison</h2>
                    <p class="card-sub">Où souhaitez-vous recevoir votre commande ?</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="label-field">Prénom *</label>
                    <input [(ngModel)]="form.shippingFirstName" class="input-field" placeholder="Amina">
                  </div>
                  <div>
                    <label class="label-field">Nom *</label>
                    <input [(ngModel)]="form.shippingLastName" class="input-field" placeholder="Trabelsi">
                  </div>
                  <div class="col-span-2">
                    <label class="label-field">Adresse *</label>
                    <input [(ngModel)]="form.shippingAddress" class="input-field" placeholder="12 rue de la Paix, Tunis">
                  </div>
                  <div>
                    <label class="label-field">Ville *</label>
                    <input [(ngModel)]="form.shippingCity" class="input-field" placeholder="Tunis">
                  </div>
                  <div>
                    <label class="label-field">Gouvernorat</label>
                    <select [(ngModel)]="form.shippingCountry" class="input-field">
                      <option value="Tunis">Tunis</option>
                      <option value="Sfax">Sfax</option>
                      <option value="Sousse">Sousse</option>
                      <option value="Nabeul">Nabeul</option>
                      <option value="Bizerte">Bizerte</option>
                      <option value="Ariana">Ariana</option>
                      <option value="Ben Arous">Ben Arous</option>
                      <option value="Monastir">Monastir</option>
                      <option value="Mahdia">Mahdia</option>
                      <option value="Kairouan">Kairouan</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div class="col-span-2">
                    <label class="label-field">Téléphone *</label>
                    <input [(ngModel)]="form.shippingPhone" class="input-field" placeholder="+216 XX XXX XXX" type="tel">
                  </div>
                  <div class="col-span-2">
                    <label class="label-field">Instructions (optionnel)</label>
                    <textarea [(ngModel)]="form.notes" class="input-field h-20 resize-none"
                              placeholder="Instructions de livraison, code d'accès, étage..."></textarea>
                  </div>
                </div>
                <button (click)="goToPayment()" class="btn-primary w-full justify-center mt-6 py-3.5">
                  Continuer vers le paiement →
                </button>
              </div>
            }

            <!-- Step 2: Payment -->
            @if (step() === 2) {
              <div class="checkout-card animate-fade-in-up">
                <div class="card-header">
                  <div class="card-icon">💳</div>
                  <div>
                    <h2 class="card-title">Méthode de paiement</h2>
                    <p class="card-sub">Paiement sécurisé via Konnect</p>
                  </div>
                </div>

                <!-- Konnect payment option -->
                <div class="payment-option selected">
                  <div class="flex items-center gap-4">
                    <div class="payment-radio selected"></div>
                    <div class="flex-1">
                      <div class="flex items-center gap-3">
                        <div class="konnect-logo">
                          <span class="font-black text-white text-lg">K</span>
                        </div>
                        <div>
                          <p class="font-semibold text-slate-900">Konnect</p>
                          <p class="text-xs" style="color:#64748b">Carte Monétique Tunisienne · Visa · Mastercard · e-DINAR · Flouci</p>
                        </div>
                      </div>
                    </div>
                    <div class="flex gap-1.5">
                      <span class="payment-badge">🏦</span>
                      <span class="payment-badge">💳</span>
                      <span class="payment-badge">📱</span>
                    </div>
                  </div>
                  <div class="mt-4 p-3 rounded-xl" style="background:#f0f9ff; border:1px solid #bae6fd">
                    <p class="text-xs" style="color:#0e7490">
                      🔒 Vous serez redirigé vers la page sécurisée Konnect pour compléter le paiement.
                      Votre commande sera confirmée après validation du paiement.
                    </p>
                  </div>
                </div>

                <!-- Promo Code -->
                <div class="mt-4 pt-4" style="border-top:1px solid #f1f5f9">
                  <p class="sidebar-label mb-2">Code promo</p>
                  <div class="flex gap-2">
                    <input type="text" [(ngModel)]="promoCode" placeholder="EX: PHARMA10"
                           class="input-field flex-1 uppercase text-sm"
                           [disabled]="promoApplied()">
                    <button (click)="applyPromo()" [disabled]="promoApplied() || applyingPromo()"
                            class="promo-apply-btn">
                      @if (applyingPromo()) { ⏳ } @else if (promoApplied()) { ✅ } @else { Appliquer }
                    </button>
                  </div>
                  @if (promoMessage()) {
                    <p class="mt-2 text-xs font-medium" [class]="promoApplied() ? 'promo-ok' : 'promo-err'">{{ promoMessage() }}</p>
                  }
                  @if (promoApplied()) {
                    <button (click)="removePromo()" class="text-xs text-slate-400 hover:text-rose-500 mt-1">Retirer le code</button>
                  }
                </div>

                <!-- Security badges -->
                <div class="flex items-center gap-6 mt-5 pt-5" style="border-top:1px solid #f1f5f9">
                  <div class="flex items-center gap-2 text-xs" style="color:#64748b">
                    <span class="text-base">🔒</span> Paiement crypté SSL
                  </div>
                  <div class="flex items-center gap-2 text-xs" style="color:#64748b">
                    <span class="text-base">✅</span> 3D Secure activé
                  </div>
                  <div class="flex items-center gap-2 text-xs" style="color:#64748b">
                    <span class="text-base">🛡️</span> Données protégées
                  </div>
                </div>

                <div class="flex gap-3 mt-6">
                  <button (click)="step.set(1)" class="btn-outline flex-1">← Modifier livraison</button>
                  <button (click)="placeOrder()" [disabled]="placing()" class="btn-konnect flex-1">
                    @if (placing()) {
                      <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Traitement...
                    } @else {
                      <span class="konnect-logo-sm">K</span>
                      Payer {{ grandTotal() | number:'1.2-2' }} TND
                    }
                  </button>
                </div>
              </div>
            }

            <!-- Step 3: Redirecting -->
            @if (step() === 3) {
              <div class="checkout-card text-center py-12 animate-fade-in-up">
                <div class="text-6xl mb-4">✅</div>
                <h2 class="text-2xl font-bold mb-2" style="color:#16a34a">Commande confirmée !</h2>
                <p class="text-slate-500 mb-6">Vous allez être redirigé vers la page de paiement Konnect...</p>
                <div class="flex justify-center">
                  <svg class="w-8 h-8 animate-spin" style="color:#0891b2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                </div>
                <p class="text-xs text-slate-400 mt-4">Si vous n'êtes pas redirigé automatiquement,
                  <a [href]="paymentUrl()" class="underline" style="color:#0891b2">cliquez ici</a>
                </p>
              </div>
            }
          </div>

          <!-- Right: Order Summary -->
          <div class="lg:col-span-2">
            <div class="summary-card sticky top-24">
              <h2 class="summary-title">Récapitulatif</h2>

              <!-- Items -->
              <div class="space-y-3 mb-5">
                @for (item of cart.items(); track item.id) {
                  <div class="flex items-center gap-3">
                    <div class="relative">
                      <img [src]="item.productImage" class="w-14 h-14 rounded-xl object-cover shrink-0"
                           style="background:#f8fafc" onerror="this.src='https://placehold.co/56x56?text=P'">
                      <span class="qty-badge">{{ item.quantity }}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-slate-900 truncate">{{ item.productName }}</p>
                    </div>
                    <p class="text-sm font-bold text-slate-900 shrink-0">{{ item.subtotal | number:'1.2-2' }} TND</p>
                  </div>
                }
              </div>

              <!-- Totals -->
              <div style="border-top:1px solid #f1f5f9" class="pt-4 space-y-2.5 text-sm">
                <div class="flex justify-between text-slate-500">
                  <span>Sous-total</span>
                  <span>{{ cart.total() | number:'1.2-2' }} TND</span>
                </div>
                @if (promoApplied() && discountAmount() > 0) {
                  <div class="flex justify-between font-semibold" style="color:#16a34a">
                    <span>🏷️ Code {{ promoCode.toUpperCase() }}</span>
                    <span>-{{ discountAmount() | number:'1.2-2' }} TND</span>
                  </div>
                }
                <div class="flex justify-between text-slate-500">
                  <span>Frais de livraison</span>
                  <span [class]="cart.total() >= 50 ? 'free-shipping' : 'text-slate-900'">
                    {{ cart.total() >= 50 ? 'Gratuit 🎉' : '7.00 TND' }}
                  </span>
                </div>
                @if (cart.total() < 50) {
                  <div class="free-bar">
                    <div class="free-bar-fill" [style.width.%]="(cart.total() / 50) * 100"></div>
                  </div>
                  <p class="text-xs" style="color:#0891b2">
                    Plus {{ (50 - cart.total()) | number:'1.2-2' }} TND pour la livraison gratuite
                  </p>
                }
                <div class="flex justify-between font-bold text-base text-slate-900 pt-2" style="border-top:1px solid #f1f5f9">
                  <span>Total</span>
                  <span style="color:#0891b2">{{ grandTotal() | number:'1.2-2' }} TND</span>
                </div>
              </div>

              <!-- Trust -->
              <div class="mt-5 p-3 rounded-xl space-y-2" style="background:#f8fafc">
                <div class="flex items-center gap-2 text-xs text-slate-500">
                  <span>↩️</span> Retour gratuit sous 14 jours
                </div>
                <div class="flex items-center gap-2 text-xs text-slate-500">
                  <span>🔒</span> Paiement 100% sécurisé
                </div>
                <div class="flex items-center gap-2 text-xs text-slate-500">
                  <span>🚚</span> Livraison 24–48h en Tunisie
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scoped styles -->
    <style>
      .checkout-page { background: #f8fafc; }
      .back-link { color: #0891b2; transition: gap 0.2s; }
      .back-link:hover { gap: 0.75rem; }
      .checkout-title { font-size: 2rem; font-weight: 800; color: #0f172a; }

      /* Progress */
      .step-dot {
        width: 2rem; height: 2rem; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.8rem; font-weight: 700; flex-shrink: 0;
        background: #e2e8f0; color: #94a3b8;
        transition: all 0.3s;
      }
      .step-dot.active { background: linear-gradient(135deg,#0891b2,#16a34a); color: white; }
      .step-line { height: 2px; width: 3rem; background: #e2e8f0; border-radius: 99px; }

      .promo-apply-btn {
        padding:0.625rem 1rem; border-radius:0.75rem; font-weight:700; font-size:0.875rem;
        background:linear-gradient(135deg,#0891b2,#16a34a); color:white;
        border:none; cursor:pointer; white-space:nowrap; transition:all 0.2s;
        min-width:5.5rem;
      }
      .promo-apply-btn:disabled { opacity:0.6; cursor:not-allowed; }
      .promo-ok { color:#16a34a; }
      .promo-err { color:#dc2626; }
      .sidebar-label { font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#94a3b8; }

      /* Cards */
      .checkout-card {
        background: white; border-radius: 1.25rem; padding: 2rem;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04);
        border: 1px solid #f1f5f9;
      }
      .card-header { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.75rem; }
      .card-icon {
        width: 3rem; height: 3rem; border-radius: 0.875rem;
        display: flex; align-items: center; justify-content: center; font-size: 1.5rem;
        background: #f0f9ff; flex-shrink: 0;
      }
      .card-title { font-size: 1.1rem; font-weight: 700; color: #0f172a; }
      .card-sub { font-size: 0.85rem; color: #94a3b8; margin-top: 2px; }

      /* Payment option */
      .payment-option {
        border: 2px solid #e2e8f0; border-radius: 1rem; padding: 1.25rem;
        transition: all 0.2s;
      }
      .payment-option.selected { border-color: #0891b2; background: #f0f9ff; }
      .payment-radio {
        width: 1.25rem; height: 1.25rem; border-radius: 50%;
        border: 2px solid #cbd5e1; flex-shrink: 0;
      }
      .payment-radio.selected { border-color: #0891b2; background: #0891b2; box-shadow: inset 0 0 0 3px white; }
      .konnect-logo {
        width: 2.75rem; height: 2.75rem; border-radius: 0.75rem;
        background: linear-gradient(135deg,#0891b2,#0e7490);
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 12px rgba(8,145,178,0.35);
      }
      .konnect-logo-sm {
        width: 1.5rem; height: 1.5rem; border-radius: 0.375rem;
        background: rgba(255,255,255,0.3);
        display: inline-flex; align-items: center; justify-content: center;
        font-weight: 900; font-size: 0.85rem;
      }
      .payment-badge {
        padding: 0.25rem 0.5rem; background: #f8fafc;
        border: 1px solid #e2e8f0; border-radius: 0.5rem; font-size: 1rem;
      }

      /* Konnect pay button */
      .btn-konnect {
        display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
        padding: 0.875rem 1.5rem; border-radius: 0.875rem; font-weight: 700; font-size: 1rem;
        color: white; border: none; cursor: pointer;
        background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
        box-shadow: 0 4px 20px rgba(8,145,178,0.4);
        transition: all 0.25s;
      }
      .btn-konnect:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(8,145,178,0.5); }
      .btn-konnect:disabled { opacity: 0.65; cursor: not-allowed; }

      /* Summary card */
      .summary-card {
        background: white; border-radius: 1.25rem; padding: 1.75rem;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04);
        border: 1px solid #f1f5f9;
      }
      .summary-title { font-size: 1.15rem; font-weight: 800; color: #0f172a; margin-bottom: 1.25rem; }
      .qty-badge {
        position: absolute; top: -6px; right: -6px;
        width: 1.25rem; height: 1.25rem; border-radius: 50%;
        background: linear-gradient(135deg,#0891b2,#16a34a);
        color: white; font-size: 0.7rem; font-weight: 700;
        display: flex; align-items: center; justify-content: center;
      }
      .free-shipping { color: #16a34a; font-weight: 700; }
      .free-bar {
        height: 4px; background: #e2e8f0; border-radius: 99px; margin-top: 4px;
      }
      .free-bar-fill {
        height: 100%; background: linear-gradient(90deg,#0891b2,#16a34a);
        border-radius: 99px; transition: width 0.5s ease;
      }
    </style>
  `
})
export class CheckoutComponent {
  cart      = inject(CartService);
  orderSvc  = inject(OrderService);
  toast     = inject(ToastService);
  router    = inject(Router);
  auth      = inject(AuthService);
  http      = inject(HttpClient);
  promoSvc  = inject(PromoService);

  step          = signal(1);
  placing       = signal(false);
  paymentUrl    = signal('');
  promoApplied  = signal(false);
  applyingPromo = signal(false);
  promoMessage  = signal('');
  discountAmount = signal(0);
  promoCode     = '';

  form = {
    shippingFirstName: this.auth.currentUser()?.firstName ?? '',
    shippingLastName:  this.auth.currentUser()?.lastName  ?? '',
    shippingAddress:   '',
    shippingCity:      'Tunis',
    shippingCountry:   'Tunis',
    shippingPhone:     '',
    notes:             ''
  };

  grandTotal = computed(() => {
    const s = this.cart.total();
    const shipping = s < 50 ? 7 : 0;
    return Math.max(0, s - this.discountAmount() + shipping);
  });

  applyPromo() {
    if (!this.promoCode.trim()) return;
    this.applyingPromo.set(true);
    this.promoSvc.validate(this.promoCode.trim(), this.cart.total()).subscribe({
      next: (res) => {
        this.applyingPromo.set(false);
        this.discountAmount.set(res.discountAmount);
        this.promoApplied.set(true);
        this.promoMessage.set(res.message);
      },
      error: (err) => {
        this.applyingPromo.set(false);
        this.promoApplied.set(false);
        this.discountAmount.set(0);
        this.promoMessage.set(err?.error?.message || 'Code invalide.');
      }
    });
  }

  removePromo() {
    this.promoCode = '';
    this.promoApplied.set(false);
    this.discountAmount.set(0);
    this.promoMessage.set('');
  }

  goToPayment() {
    if (!this.form.shippingFirstName || !this.form.shippingLastName ||
        !this.form.shippingAddress  || !this.form.shippingPhone) {
      this.toast.error('Veuillez remplir tous les champs obligatoires (*)');
      return;
    }
    this.step.set(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  placeOrder() {
    this.placing.set(true);
    const payload = {
      ...this.form,
      promoCode: this.promoApplied() ? this.promoCode.trim() : null,
      items: this.cart.items().map(i => ({ productId: i.productId, quantity: i.quantity }))
    };
    this.orderSvc.placeOrder(payload).subscribe({
      next: (order: any) => {
        this.placing.set(false);
        this.cart.clearLocal();
        if (order.paymentLink) {
          this.paymentUrl.set(order.paymentLink);
          this.step.set(3);
          setTimeout(() => { window.location.href = order.paymentLink; }, 2000);
        } else {
          // Fallback: no Konnect key yet — go to orders
          this.toast.success('Commande passée avec succès ! 🎉');
          this.router.navigate(['/profile/orders']);
        }
      },
      error: (err: any) => {
        this.placing.set(false);
        this.toast.error(err?.error?.message || 'Erreur lors de la commande. Veuillez réessayer.');
      }
    });
  }
}
