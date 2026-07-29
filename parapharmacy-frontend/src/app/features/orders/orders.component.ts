import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/api.service';
import { Order } from '../../core/models/models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="orders-page">

      <!-- Header -->
      <div class="orders-header">
        <div class="orders-header__inner">
          <a routerLink="/profile" class="orders-back">← Mon Profil</a>
          <h1 class="orders-title">📦 Mes Commandes</h1>
          <p class="orders-sub">Retrouvez l'historique de tous vos achats</p>
        </div>
      </div>

      <div class="orders-body">

        @if (loading()) {
          <div class="orders-loading">
            @for (i of [1,2,3]; track i) {
              <div class="order-skeleton"></div>
            }
          </div>
        } @else if (orders().length === 0) {
          <div class="orders-empty">
            <div class="orders-empty__icon">📭</div>
            <h2 class="orders-empty__title">Aucune commande pour le moment</h2>
            <p class="orders-empty__sub">Votre historique d'achats apparaîtra ici une fois que vous aurez passé votre première commande.</p>
            <a routerLink="/shop" class="orders-empty__cta">Découvrir la boutique →</a>
          </div>
        } @else {
          <div class="orders-list">
            @for (order of orders(); track order.id) {
              <div class="order-card">
                <div class="order-card__header">
                  <div>
                    <p class="order-card__id">Commande #{{ order.id }}</p>
                    <p class="order-card__date">{{ order.createdAt | date:'d MMMM yyyy, HH:mm' }}</p>
                  </div>
                  <div class="order-card__meta">
                    <span class="order-status" [class]="statusClass(order.status)">
                      {{ statusLabel(order.status) }}
                    </span>
                    <span class="order-total">{{ order.totalAmount | number:'1.2-2' }} TND</span>
                    <a [routerLink]="['/profile/orders', order.id]" class="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline ml-2">Détails →</a>
                  </div>
                </div>
                <div class="order-card__items">
                  @for (item of order.items; track item.productId) {
                    <div class="order-item">
                      <img [src]="item.productImage" class="order-item__img"
                           onerror="this.src='https://placehold.co/48x48?text=P'">
                      <div class="order-item__info">
                        <p class="order-item__name">{{ item.productName }}</p>
                        <p class="order-item__qty">x{{ item.quantity }} · {{ item.subtotal | number:'1.2-2' }} TND</p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>

    <style>
      .orders-page { min-height: 100vh; background: #f8fafc; }

      /* Header */
      .orders-header {
        background: linear-gradient(135deg, #071a12 0%, #0d2b1a 50%, #14532d 100%);
        padding: 2.5rem 1rem 4rem;
      }
      .orders-header__inner { max-width: 860px; margin: 0 auto; }
      .orders-back {
        display: inline-block; color: rgba(255,255,255,0.6); font-size: 0.875rem;
        text-decoration: none; margin-bottom: 1rem; transition: color 0.2s;
      }
      .orders-back:hover { color: #4ade80; }
      .orders-title { font-size: 2rem; font-weight: 800; color: white; margin: 0; }
      .orders-sub { color: rgba(255,255,255,0.5); font-size: 0.95rem; margin-top: 0.35rem; }

      .orders-body { max-width: 860px; margin: -2.5rem auto 4rem; padding: 0 1rem; position: relative; z-index: 2; }

      /* Skeleton */
      .orders-loading { display: flex; flex-direction: column; gap: 1rem; }
      .order-skeleton {
        height: 9rem; border-radius: 1.25rem;
        background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
        background-size: 200% 100%; animation: shimmer 1.4s infinite;
      }
      @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

      /* Empty */
      .orders-empty {
        text-align: center; background: white; border-radius: 1.5rem;
        padding: 4rem 2rem; box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        border: 1px solid #f1f5f9;
      }
      .orders-empty__icon { font-size: 4rem; margin-bottom: 1.25rem; }
      .orders-empty__title { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem; }
      .orders-empty__sub { color: #64748b; max-width: 400px; margin: 0 auto 2rem; font-size: 0.95rem; line-height: 1.6; }
      .orders-empty__cta {
        display: inline-flex; align-items: center; gap: 0.5rem;
        padding: 0.875rem 2rem; border-radius: 0.875rem;
        background: linear-gradient(135deg, #16a34a, #15803d);
        color: white; font-weight: 700; text-decoration: none;
        transition: all 0.2s;
      }
      .orders-empty__cta:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(22,163,74,0.35); }

      /* List */
      .orders-list { display: flex; flex-direction: column; gap: 1rem; }
      .order-card {
        background: white; border-radius: 1.25rem; padding: 1.5rem;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03);
        border: 1px solid #f1f5f9; transition: box-shadow 0.2s;
      }
      .order-card:hover { box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
      .order-card__header {
        display: flex; justify-content: space-between; align-items: flex-start;
        gap: 1rem; flex-wrap: wrap; margin-bottom: 1.25rem;
        padding-bottom: 1.25rem; border-bottom: 1px solid #f1f5f9;
      }
      .order-card__id { font-weight: 700; color: #0f172a; font-size: 1rem; }
      .order-card__date { font-size: 0.8rem; color: #94a3b8; margin-top: 0.2rem; }
      .order-card__meta { display: flex; align-items: center; gap: 1rem; }
      .order-total { font-size: 1.15rem; font-weight: 800; color: #0f172a; }
      .order-status {
        padding: 0.3rem 0.875rem; border-radius: 99px;
        font-size: 0.75rem; font-weight: 700; white-space: nowrap;
      }

      /* Items */
      .order-card__items { display: flex; gap: 0.75rem; flex-wrap: wrap; }
      .order-item {
        display: flex; align-items: center; gap: 0.75rem;
        background: #f8fafc; border-radius: 0.75rem; padding: 0.625rem 0.875rem;
        border: 1px solid #f1f5f9;
      }
      .order-item__img { width: 3rem; height: 3rem; border-radius: 0.5rem; object-fit: cover; }
      .order-item__name { font-size: 0.8rem; font-weight: 600; color: #0f172a; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .order-item__qty { font-size: 0.75rem; color: #94a3b8; margin-top: 2px; }
    </style>
  `
})
export class OrdersComponent implements OnInit {
  orderSvc = inject(OrderService);
  orders   = signal<Order[]>([]);
  loading  = signal(true);

  ngOnInit() {
    this.orderSvc.getMyOrders().subscribe({
      next: o => { this.orders.set(o); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
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
