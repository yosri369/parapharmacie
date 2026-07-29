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
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex items-center gap-4 mb-8">
        <a routerLink="/profile" class="btn-ghost">← Profile</a>
        <h1 class="font-display text-4xl font-bold text-gray-900">My Orders</h1>
      </div>

      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3]; track i) { <div class="skeleton h-32 rounded-2xl"></div> }
        </div>
      } @else if (orders().length === 0) {
        <div class="card text-center py-24">
          <span class="text-6xl">📦</span>
          <h2 class="font-display text-2xl font-bold text-gray-800 mt-6">No orders yet</h2>
          <p class="text-gray-500 mt-2 mb-8">Your wellness journey awaits</p>
          <a routerLink="/shop" class="btn-primary">Start Shopping</a>
        </div>
      } @else {
        <div class="space-y-4">
          @for (order of orders(); track order.id) {
            <div class="card p-6">
              <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <p class="font-semibold text-gray-900">Order #{{ order.id }}</p>
                  <p class="text-sm text-gray-400">{{ order.createdAt | date:'medium' }}</p>
                </div>
                <div class="flex items-center gap-3">
                  <span class="badge px-3 py-1 text-sm" [class]="statusClass(order.status)">{{ order.status }}</span>
                  <span class="font-bold text-gray-900 text-lg">{{ order.totalAmount | number:'1.2-2' }} €</span>
                </div>
              </div>
              <div class="flex gap-3 overflow-x-auto pb-1">
                @for (item of order.items; track item.productId) {
                  <div class="flex items-center gap-2 shrink-0 bg-gray-50 rounded-xl px-3 py-2">
                    <img [src]="item.productImage" class="w-10 h-10 rounded-lg object-cover bg-beige-50" onerror="this.src='https://placehold.co/40x40?text=P'">
                    <div>
                      <p class="text-xs font-medium text-gray-800">{{ item.productName }}</p>
                      <p class="text-xs text-gray-400">x{{ item.quantity }} · {{ item.subtotal | number:'1.2-2' }} €</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
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

  statusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING:    'bg-amber-100 text-amber-700',
      CONFIRMED:  'bg-blue-100 text-blue-700',
      PROCESSING: 'bg-purple-100 text-purple-700',
      SHIPPED:    'bg-indigo-100 text-indigo-700',
      DELIVERED:  'bg-sage-100 text-sage-700',
      CANCELLED:  'bg-red-100 text-red-700',
      REFUNDED:   'bg-gray-100 text-gray-600',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }
}
