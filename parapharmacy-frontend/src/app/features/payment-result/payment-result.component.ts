import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 py-20" style="background:#f8fafc">
      @if (loading()) {
        <div class="text-center">
          <svg class="w-12 h-12 animate-spin mx-auto mb-4" style="color:#0891b2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p class="text-slate-500 font-medium">Vérification du paiement...</p>
        </div>
      } @else {
        <div class="text-center max-w-md">
          @if (success()) {
            <!-- Success -->
            <div class="result-card">
              <div class="result-icon success-icon">✅</div>
              <h1 class="result-title" style="color:#16a34a">Paiement réussi !</h1>
              <p class="result-text">Votre commande <strong>#{{ orderId() }}</strong> a été confirmée et est en cours de préparation.</p>
              <div class="result-detail">
                <span class="text-sm font-semibold" style="color:#0891b2">Numéro de transaction :</span>
                <span class="text-sm text-slate-600 ml-2">{{ paymentRef() }}</span>
              </div>
              <div class="flex flex-col gap-3 mt-8">
                <a routerLink="/profile/orders" class="btn-primary justify-center">Voir mes commandes</a>
                <a routerLink="/shop" class="btn-outline justify-center">Continuer mes achats</a>
              </div>
            </div>
          } @else {
            <!-- Failure -->
            <div class="result-card">
              <div class="result-icon fail-icon">❌</div>
              <h1 class="result-title" style="color:#dc2626">Paiement échoué</h1>
              <p class="result-text">Votre paiement n'a pas pu être traité. Votre commande reste en attente.</p>
              <div class="flex flex-col gap-3 mt-8">
                <a routerLink="/checkout" class="btn-primary justify-center">Réessayer le paiement</a>
                <a routerLink="/" class="btn-outline justify-center">Retour à l'accueil</a>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <style>
      .result-card {
        background: white; border-radius: 1.5rem; padding: 3rem 2.5rem;
        box-shadow: 0 4px 32px rgba(0,0,0,0.08); border: 1px solid #f1f5f9;
      }
      .result-icon { font-size: 4rem; margin-bottom: 1.5rem; }
      .success-icon { animation: bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1); }
      .fail-icon { animation: shake 0.5s ease; }
      .result-title { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.75rem; }
      .result-text { color: #64748b; line-height: 1.6; margin-bottom: 1rem; }
      .result-detail { background: #f0f9ff; border-radius: 0.75rem; padding: 0.75rem 1rem; display: inline-block; }
      @keyframes bounceIn { 0%{transform:scale(0)} 70%{transform:scale(1.1)} 100%{transform:scale(1)} }
      @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 60%{transform:translateX(8px)} }
    </style>
  `
})
export class PaymentResultComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private http   = inject(HttpClient);

  loading    = signal(true);
  success    = signal(false);
  orderId    = signal('');
  paymentRef = signal('');

  ngOnInit() {
    const params = this.route.snapshot.queryParams;
    const ref    = params['payment_ref'] || params['paymentRef'] || '';
    const order  = params['order_id']    || params['orderId']    || '';
    const status = params['status']      || '';

    this.orderId.set(order);
    this.paymentRef.set(ref);

    if (status === 'success' || status === 'completed') {
      this.success.set(true);
      this.loading.set(false);
    } else if (ref) {
      // Verify with backend
      this.http.get<any>(`${environment.apiUrl}/payments/${order}/status`).subscribe({
        next: (r) => { this.success.set(r.status === 'COMPLETED'); this.loading.set(false); },
        error: ()  => { this.success.set(false); this.loading.set(false); }
      });
    } else {
      this.success.set(status !== 'failed' && status !== 'error');
      this.loading.set(false);
    }
  }
}
