import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../core/services/api.service';
import { Product } from '../../core/models/models';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  template: `
    <!-- Header -->
    <div class="wl-header">
      <div class="wl-header__inner">
        <h1 class="wl-title">❤️ Ma Liste de Souhaits</h1>
        <p class="wl-sub">
          @if (!loading() && items().length > 0) {
            {{ items().length }} produit{{ items().length > 1 ? 's' : '' }} sauvegardé{{ items().length > 1 ? 's' : '' }}
          } @else {
            Retrouvez vos produits favoris ici
          }
        </p>
      </div>
    </div>

    <div class="wl-body max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (i of [1,2,3,4]; track i) {
            <div class="skeleton h-96 rounded-2xl"></div>
          }
        </div>
      } @else if (items().length === 0) {
        <div class="wl-empty">
          <div class="wl-empty__icon">💝</div>
          <h2 class="wl-empty__title">Votre liste de souhaits est vide</h2>
          <p class="wl-empty__sub">Ajoutez des produits à votre liste en cliquant sur le cœur ❤️ sur n'importe quel produit.</p>
          <a routerLink="/shop" class="wl-empty__cta">Découvrir les produits →</a>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (p of items(); track p.id) {
            <app-product-card [product]="p" />
          }
        </div>
      }
    </div>

    <style>
      .wl-header {
        background: linear-gradient(135deg, #071a12 0%, #0d2b1a 50%, #14532d 100%);
        padding: 3rem 1rem 4.5rem;
      }
      .wl-header__inner { max-width: 1280px; margin: 0 auto; }
      .wl-title { font-size: 2.25rem; font-weight: 800; color: white; margin: 0; }
      .wl-sub { color: rgba(255,255,255,0.55); margin-top: 0.5rem; font-size: 1rem; }

      .wl-body { margin-top: -2.5rem; position: relative; z-index: 2; }

      .wl-empty {
        text-align: center; background: white; border-radius: 1.5rem;
        padding: 5rem 2rem; box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        border: 1px solid #f1f5f9;
      }
      .wl-empty__icon { font-size: 4.5rem; margin-bottom: 1.25rem; }
      .wl-empty__title { font-size: 1.6rem; font-weight: 800; color: #0f172a; margin-bottom: 0.75rem; }
      .wl-empty__sub { color: #64748b; max-width: 420px; margin: 0 auto 2rem; font-size: 0.95rem; line-height: 1.7; }
      .wl-empty__cta {
        display: inline-flex; align-items: center;
        padding: 0.875rem 2rem; border-radius: 0.875rem;
        background: linear-gradient(135deg, #16a34a, #15803d);
        color: white; font-weight: 700; text-decoration: none;
        transition: all 0.2s;
      }
      .wl-empty__cta:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(22,163,74,0.35); }
    </style>
  `
})
export class WishlistComponent implements OnInit {
  wishSvc = inject(WishlistService);
  items   = signal<Product[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.wishSvc.getWishlist().subscribe({
      next: p => { this.items.set(p); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
