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
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="font-display text-4xl font-bold text-gray-900 mb-8">My Wishlist</h1>
      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (i of [1,2,3,4]; track i) { <div class="skeleton h-96 rounded-2xl"></div> }
        </div>
      } @else if (items().length === 0) {
        <div class="card text-center py-28">
          <span class="text-7xl">💝</span>
          <h2 class="font-display text-2xl font-bold text-gray-800 mt-6">Your wishlist is empty</h2>
          <p class="text-gray-500 mt-2 mb-8">Save your favourite products here</p>
          <a routerLink="/shop" class="btn-primary">Discover Products</a>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (p of items(); track p.id) { <app-product-card [product]="p" /> }
        </div>
      }
    </div>
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
