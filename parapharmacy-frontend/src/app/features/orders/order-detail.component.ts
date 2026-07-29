import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../core/services/api.service';
import { Order } from '../../../core/models/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="order-detail-page min-h-screen bg-slate-50 py-12">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="mb-8 flex items-center justify-between">
          <a routerLink="/profile/orders" class="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800">
            ← Retour à mes commandes
          </a>
          @if (order()) {
            <span class="px-3 py-1 rounded-full text-xs font-bold" [class]="statusClass(order()!.status)">
              {{ statusLabel(order()!.status) }}
            </span>
          }
        </div>

        @if (loading()) {
          <div class="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 animate-pulse space-y-6">
            <div class="h-6 bg-slate-200 rounded w-1/3"></div>
            <div class="h-24 bg-slate-100 rounded-xl"></div>
            <div class="h-40 bg-slate-100 rounded-xl"></div>
          </div>
        } @else if (!order()) {
          <div class="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
            <span class="text-5xl">⚠️</span>
            <h2 class="text-xl font-bold text-slate-800 mt-4">Commande introuvable</h2>
            <p class="text-slate-500 mt-2 mb-6">La commande demandée n'existe pas ou ne vous appartient pas.</p>
            <a routerLink="/profile/orders" class="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm">Voir mes commandes</a>
          </div>
        } @else {
          <div class="space-y-6">
            
            <!-- Order Header Card -->
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div class="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <h1 class="text-2xl font-extrabold text-slate-900">Commande #{{ order()!.id }}</h1>
                  <p class="text-sm text-slate-400 mt-1">Passée le {{ order()!.createdAt | date:'dd MMMM yyyy à HH:mm' }}</p>
                </div>
                <div class="text-right">
                  <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Montant total</p>
                  <p class="text-2xl font-black text-emerald-600">{{ order()!.totalAmount | number:'1.2-2' }} TND</p>
                </div>
              </div>

              <!-- Shipping Info -->
              <div class="grid md:grid-cols-2 gap-6 pt-6">
                <div>
                  <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Adresse de livraison</h3>
                  <p class="font-bold text-slate-800">{{ order()!.shippingFirstName }} {{ order()!.shippingLastName }}</p>
                  <p class="text-sm text-slate-600 mt-1">{{ order()!.shippingAddress }}</p>
                  <p class="text-sm text-slate-600">{{ order()!.shippingCity }}, {{ order()!.shippingCountry }}</p>
                  <p class="text-sm text-slate-500 mt-2">📞 {{ order()!.shippingPhone }}</p>
                </div>

                <div>
                  <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Paiement & Notes</h3>
                  <p class="text-sm text-slate-700 font-medium">Paiement via Konnect / Monétique</p>
                  @if (order()!.notes) {
                    <div class="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200/60">
                      <strong>Note:</strong> {{ order()!.notes }}
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Order Items Card -->
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 class="text-lg font-bold text-slate-900 mb-4">Articles commandés ({{ order()!.items.length }})</h2>
              
              <div class="divide-y divide-slate-100">
                @for (item of order()!.items; track item.productId) {
                  <div class="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div class="flex items-center gap-4">
                      <img [src]="item.productImage" class="w-14 h-14 rounded-xl object-cover bg-slate-50 border border-slate-100"
                           onerror="this.src='https://placehold.co/56x56?text=P'">
                      <div>
                        <p class="font-bold text-slate-800 text-sm">{{ item.productName }}</p>
                        <p class="text-xs text-slate-400 mt-1">Quantité : {{ item.quantity }}</p>
                      </div>
                    </div>
                    <p class="font-bold text-slate-900 text-sm">{{ item.subtotal | number:'1.2-2' }} TND</p>
                  </div>
                }
              </div>
            </div>

          </div>
        }
      </div>
    </div>
  `
})
export class OrderDetailComponent implements OnInit {
  private orderSvc = inject(OrderService);
  private route    = inject(ActivatedRoute);

  order   = signal<Order | null>(null);
  loading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.orderSvc.getOrder(+id).subscribe({
        next: (res) => { this.order.set(res); this.loading.set(false); },
        error: () => { this.loading.set(false); }
      });
    } else {
      this.loading.set(false);
    }
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING:    '⏳ En attente',
      CONFIRMED:  '✅ Confirmée',
      PROCESSING: '🔧 En traitement',
      SHIPPED:    '🚚 Expédiée',
      DELIVERED:  '📦 Livrée',
      CANCELLED:  '❌ Annulée',
      REFUNDED:   '↩️ Remboursée',
    };
    return map[status] ?? status;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING:    'bg-amber-100 text-amber-700',
      CONFIRMED:  'bg-blue-100 text-blue-700',
      PROCESSING: 'bg-purple-100 text-purple-700',
      SHIPPED:    'bg-indigo-100 text-indigo-700',
      DELIVERED:  'bg-green-100 text-green-700',
      CANCELLED:  'bg-red-100 text-red-700',
      REFUNDED:   'bg-gray-100 text-gray-600',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }
}
