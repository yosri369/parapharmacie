import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models/models';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { WishlistService } from '../../core/services/api.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="product-card group relative flex flex-col">

      <!-- Badges -->
      <div class="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        @if (product.onSale && product.salePrice) {
          <span class="badge-sale text-xs px-2.5 py-1 font-semibold shadow-sm">-{{ discount() }}%</span>
        }
        @if (product.featured) {
          <span class="badge-primary text-xs px-2.5 py-1 font-semibold shadow-sm">Top</span>
        }
        @if (product.stock === 0) {
          <span class="badge bg-slate-100 text-slate-500 text-xs px-2.5 py-1">Épuisé</span>
        } @else if (product.stock > 0 && product.stock <= 5) {
          <span class="badge-low-stock text-xs px-2.5 py-1">Plus que {{ product.stock }}</span>
        }
      </div>

      <!-- Wishlist btn -->
      <button (click)="toggleWishlist($event)"
              class="wishlist-btn absolute top-3 right-3 z-10 w-9 h-9 bg-white rounded-full shadow-card flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
              [class.opacity-100]="wishlisted"
              [title]="wishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'">
        <svg class="w-4 h-4 transition-colors" [attr.fill]="wishlisted ? '#e11d48' : 'none'" stroke="#e11d48" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
      </button>

      <!-- Image -->
      <a [routerLink]="['/products', product.id]" class="block overflow-hidden bg-slate-50" style="border-radius:1.25rem 1.25rem 0 0">
        <div class="relative overflow-hidden" style="height:220px">
          <img [src]="product.imageUrl"
               [alt]="product.name"
               class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
               loading="lazy"
               onerror="this.src='https://placehold.co/400x300?text=Produit'">
          <!-- Hover overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </a>

      <!-- Content -->
      <div class="flex flex-col flex-1 p-4 gap-2">
        <!-- Category + brand -->
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider" style="color:#16a34a">{{ product.categoryName }}</span>
          <span class="text-xs text-slate-400">{{ product.brand }}</span>
        </div>

        <!-- Name -->
        <a [routerLink]="['/products', product.id]"
           class="font-semibold text-slate-900 hover:text-primary-600 transition-colors line-clamp-2 leading-snug text-sm">
          {{ product.name }}
        </a>

        <!-- Rating -->
        <div class="flex items-center gap-1.5">
          <div class="flex gap-0.5">
            @for (star of stars(product.rating); track $index) {
              <svg class="w-3.5 h-3.5" [attr.fill]="star === 'full' ? '#f59e0b' : '#e2e8f0'" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            }
          </div>
          <span class="text-xs text-slate-400">{{ product.rating }} ({{ product.reviewCount }})</span>
        </div>

        <!-- Price + Add to cart -->
        <div class="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
          <div class="flex items-baseline gap-2">
            @if (product.salePrice) {
              <span class="font-bold text-lg text-slate-900">{{ product.salePrice | number:'1.2-2' }} TND</span>
              <span class="text-sm text-slate-400 line-through">{{ product.price | number:'1.2-2' }}</span>
            } @else {
              <span class="font-bold text-lg text-slate-900">{{ product.price | number:'1.2-2' }} TND</span>
            }
          </div>

          <button (click)="addToCart()"
                  [disabled]="product.stock === 0 || adding"
                  class="add-to-cart-btn w-9 h-9 flex items-center justify-center text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95">
            @if (adding) {
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            } @else {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
              </svg>
            }
          </button>
        </div>
      </div>
    </div>

    <style>
      .product-card {
        background: #ffffff;
        border-radius: 1.25rem;
        border: 1px solid rgba(22, 163, 74, 0.08);
        box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease, border-color 0.4s ease;
        overflow: hidden;
      }
      .product-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 48px rgba(22,163,74,0.12), 0 8px 24px rgba(0,0,0,0.06);
        border-color: rgba(22,163,74,0.2);
      }
      .group-hover\:scale-108:hover { transform: scale(1.08); }
      .add-to-cart-btn {
        background: linear-gradient(135deg, #16a34a 0%, #0891b2 100%);
        box-shadow: 0 4px 12px rgba(22,163,74,0.3);
      }
      .add-to-cart-btn:hover:not(:disabled) {
        box-shadow: 0 6px 20px rgba(22,163,74,0.45);
        transform: scale(1.05);
      }
      .badge-low-stock {
        display:inline-flex; align-items:center; gap:0.25rem;
        padding:0.2rem 0.625rem; border-radius:9999px; font-weight:700;
        background:linear-gradient(135deg,#ea580c,#dc2626);
        color:white; font-size:0.7rem; letter-spacing:0.02em;
        box-shadow:0 2px 8px rgba(234,88,12,0.4);
        animation:pulse-badge 2s ease-in-out infinite;
      }
      @keyframes pulse-badge {
        0%,100% { box-shadow:0 2px 8px rgba(234,88,12,0.4); }
        50% { box-shadow:0 2px 16px rgba(234,88,12,0.7); }
      }
    </style>
  `
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  private cartService  = inject(CartService);
  private authService  = inject(AuthService);
  private toastService = inject(ToastService);
  private wishService  = inject(WishlistService);

  adding     = false;
  wishlisted = false;

  discount(): number {
    if (!this.product.salePrice) return 0;
    return Math.round((1 - this.product.salePrice / this.product.price) * 100);
  }

  addToCart() {
    if (!this.authService.isLoggedIn()) {
      this.toastService.info('Veuillez vous connecter pour ajouter au panier');
      return;
    }
    this.adding = true;
    this.cartService.addToCart(this.product.id).subscribe({
      next: () => { this.adding = false; this.toastService.success(`${this.product.name} ajouté au panier !`); },
      error: () => { this.adding = false; this.toastService.error('Impossible d\'ajouter au panier.'); }
    });
  }

  toggleWishlist(e: Event) {
    e.preventDefault();
    if (!this.authService.isLoggedIn()) {
      this.toastService.info('Connectez-vous pour sauvegarder vos favoris');
      return;
    }
    if (this.wishlisted) {
      this.wishService.remove(this.product.id).subscribe(() => {
        this.wishlisted = false;
        this.toastService.info('Retiré des favoris');
      });
    } else {
      this.wishService.add(this.product.id).subscribe(() => {
        this.wishlisted = true;
        this.toastService.success('Ajouté aux favoris ❤️');
      });
    }
  }

  stars(rating: number): string[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating) ? 'full' : 'empty');
  }
}
