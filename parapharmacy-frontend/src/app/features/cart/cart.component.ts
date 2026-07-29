import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="font-display text-4xl font-bold text-gray-900 mb-8">My Cart</h1>

      @if (cart.items().length === 0) {
        <div class="text-center py-28 card">
          <span class="text-7xl">🛒</span>
          <h2 class="font-display text-2xl font-bold text-gray-800 mt-6">Your cart is empty</h2>
          <p class="text-gray-500 mt-2 mb-8">Discover our premium wellness collection</p>
          <a routerLink="/shop" class="btn-primary">Shop Now</a>
        </div>
      } @else {
        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Items list -->
          <div class="lg:col-span-2 space-y-4">
            @for (item of cart.items(); track item.id) {
              <div class="card p-5 flex gap-5 items-center">
                <img [src]="item.productImage" [alt]="item.productName"
                     class="w-20 h-20 object-cover rounded-2xl bg-beige-50 shrink-0"
                     onerror="this.src='https://placehold.co/80x80?text=P'">
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-gray-900 truncate">{{ item.productName }}</p>
                  <p class="text-sm text-gray-400 mt-0.5">Unit price: {{ effectivePrice(item) | number:'1.2-2' }} €</p>
                  <div class="flex items-center gap-3 mt-3">
                    <div class="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button (click)="updateQty(item, item.quantity - 1)" class="w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors">−</button>
                      <span class="w-8 text-center text-sm font-semibold">{{ item.quantity }}</span>
                      <button (click)="updateQty(item, item.quantity + 1)" [disabled]="item.quantity >= item.stock"
                              class="w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-30">+</button>
                    </div>
                    <button (click)="remove(item.id)" class="text-rose-400 hover:text-rose-600 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <p class="font-bold text-lg text-gray-900">{{ item.subtotal | number:'1.2-2' }} €</p>
                </div>
              </div>
            }
            <button (click)="clearCart()" class="btn-ghost text-rose-500 hover:text-rose-600 text-sm">
              🗑️ Clear entire cart
            </button>
          </div>

          <!-- Order Summary -->
          <div>
            <div class="card p-6 sticky top-24">
              <h2 class="font-display text-xl font-bold text-gray-900 mb-5">Order Summary</h2>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between text-gray-600">
                  <span>Subtotal ({{ cart.itemCount() }} items)</span>
                  <span>{{ cart.total() | number:'1.2-2' }} €</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span class="text-sage-600 font-semibold">{{ cart.total() >= 50 ? 'Free' : '4.90 €' }}</span>
                </div>
                <div class="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span>
                  <span>{{ totalWithShipping() | number:'1.2-2' }} €</span>
                </div>
              </div>
              @if (cart.total() < 50) {
                <div class="mt-4 p-3 bg-sage-50 rounded-xl text-xs text-sage-700 text-center">
                  Add {{ (50 - cart.total()) | number:'1.2-2' }} € more for free shipping! 🚚
                </div>
              }
              <a routerLink="/checkout" class="btn-primary w-full justify-center mt-5 py-4">
                Proceed to Checkout →
              </a>
              <a routerLink="/shop" class="btn-ghost w-full justify-center mt-2 text-sm">Continue Shopping</a>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CartComponent {
  cart  = inject(CartService);
  toast = inject(ToastService);

  effectivePrice(item: any) { return item.productSalePrice ?? item.productPrice; }

  totalWithShipping() {
    const sub = this.cart.total();
    return sub + (sub < 50 ? 4.90 : 0);
  }

  updateQty(item: any, qty: number) {
    if (qty <= 0) { this.remove(item.id); return; }
    this.cart.updateQuantity(item.id, qty).subscribe();
  }

  remove(id: number) {
    this.cart.removeItem(id).subscribe(() => this.toast.success('Item removed from cart'));
  }

  clearCart() {
    this.cart.clearCart().subscribe(() => this.toast.info('Cart cleared'));
  }
}
