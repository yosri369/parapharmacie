import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { WishlistService } from '../../core/services/api.service';
import { ReviewService } from '../../core/services/review.service';
import { Product, Review } from '../../core/models/models';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProductCardComponent],
  template: `
    @if (loading()) {
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid md:grid-cols-2 gap-12">
          <div class="skeleton h-[480px] rounded-3xl"></div>
          <div class="space-y-4">
            <div class="skeleton h-6 w-32 rounded-xl"></div>
            <div class="skeleton h-10 w-3/4 rounded-xl"></div>
            <div class="skeleton h-24 rounded-xl"></div>
            <div class="skeleton h-14 rounded-xl"></div>
          </div>
        </div>
      </div>
    }

    @if (!loading() && product()) {
      <!-- Breadcrumb -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <nav class="flex items-center gap-2 text-sm" style="color:#94a3b8">
          <a routerLink="/" class="hover:text-primary-600 transition-colors">Accueil</a>
          <span>/</span>
          <a routerLink="/shop" class="hover:text-primary-600 transition-colors">Boutique</a>
          <span>/</span>
          <span class="font-medium" style="color:#0f172a">{{ product()!.name }}</span>
        </nav>
      </div>

      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid md:grid-cols-2 gap-12 items-start">
          <!-- Gallery -->
          <div class="gallery-container">
            <!-- Main image -->
            <div class="main-image-wrap" (click)="lightboxOpen.set(true)">
              <img [src]="selectedImage()" [alt]="product()!.name"
                   class="main-image"
                   onerror="this.src='https://placehold.co/600x600?text=Produit'">
              <!-- Zoom icon -->
              <div class="zoom-hint">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
                </svg>
                Agrandir
              </div>
              <!-- Sale ribbon -->
              @if (product()!.onSale) {
                <div class="sale-ribbon">PROMO</div>
              }
            </div>

            <!-- Thumbnails -->
            @if (allImages().length > 1) {
              <div class="thumb-row">
                @for (img of allImages(); track $index) {
                  <button (click)="selectedImage.set(img)"
                          class="thumb-btn"
                          [class.thumb-active]="selectedImage() === img">
                    <img [src]="img" [alt]="'Image ' + ($index + 1)" class="w-full h-full object-cover"
                         onerror="this.src='https://placehold.co/80x80?text=P'">
                  </button>
                }
              </div>
            }
          </div>

          <!-- Lightbox overlay -->
          @if (lightboxOpen()) {
            <div class="lightbox-overlay" (click)="lightboxOpen.set(false)">
              <div class="lightbox-content" (click)="$event.stopPropagation()">
                <button class="lightbox-close" (click)="lightboxOpen.set(false)">✕</button>
                <button class="lightbox-arrow left" (click)="prevImage()" *ngIf="allImages().length > 1">‹</button>
                <img [src]="selectedImage()" [alt]="product()!.name" class="lightbox-img"
                     onerror="this.src='https://placehold.co/800x800?text=Produit'">
                <button class="lightbox-arrow right" (click)="nextImage()" *ngIf="allImages().length > 1">›</button>
                <div class="lightbox-dots">
                  @for (img of allImages(); track $index) {
                    <button (click)="selectedImage.set(img)"
                            class="lightbox-dot"
                            [class.dot-active]="selectedImage() === img"></button>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Info -->
          <div class="space-y-6">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="text-sm font-semibold uppercase tracking-wide" style="color:#0891b2">{{ product()!.categoryName }}</span>
                @if (product()!.onSale) { <span class="badge-sale">Promotion</span> }
                @if (product()!.featured) { <span class="badge badge-new">⭐ Coup de cœur</span> }
              </div>
              <h1 class="font-display text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{{ product()!.name }}</h1>
              <p class="text-gray-400 font-medium mt-1">{{ product()!.brand }}</p>
            </div>

            <!-- Rating -->
            <div class="flex items-center gap-3">
              <div class="flex">
                @for (star of stars(product()!.rating); track $index) {
                  <svg class="w-5 h-5" [attr.fill]="star === 'full' ? '#f59e0b' : '#e5e7eb'" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                }
              </div>
              <span class="font-semibold text-gray-800">{{ product()!.rating }}</span>
              <a href="#reviews" class="text-gray-400 text-sm hover:text-primary-600 transition-colors">({{ product()!.reviewCount }} avis)</a>
            </div>

            <!-- Price -->
            <div class="flex items-center gap-4">
              @if (product()!.salePrice) {
                <span class="font-display text-4xl font-bold text-gray-900">{{ product()!.salePrice | number:'1.2-2' }} TND</span>
                <span class="text-xl text-gray-400 line-through">{{ product()!.price | number:'1.2-2' }} TND</span>
                <span class="badge-sale text-sm">-{{ discount(product()!.price, product()!.salePrice!) }}%</span>
              } @else {
                <span class="font-display text-4xl font-bold text-gray-900">{{ product()!.price | number:'1.2-2' }} TND</span>
              }
            </div>

            <!-- Stock -->
            <div class="flex items-center gap-2">
              @if (product()!.stock > 0) {
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-sm text-green-600 font-medium">In stock ({{ product()!.stock }} available)</span>
              } @else {
                <div class="w-2 h-2 bg-red-400 rounded-full"></div>
                <span class="text-sm text-red-500 font-medium">Out of stock</span>
              }
            </div>

            <!-- Quantity + Add to cart -->
            <div class="flex gap-3">
              <div class="flex items-center border border-gray-200 rounded-2xl overflow-hidden">
                <button (click)="decreaseQty()" class="w-12 h-14 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-xl">−</button>
                <span class="w-10 text-center font-semibold text-gray-900">{{ qty }}</span>
                <button (click)="increaseQty()" class="w-12 h-14 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-xl">+</button>
              </div>
              <button (click)="addToCart()" [disabled]="product()!.stock === 0 || adding()"
                      class="btn-primary flex-1 py-4 justify-center">
                @if (adding()) {
                  <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Adding...
                } @else {
                  🛒 Add to Cart
                }
              </button>
              <button (click)="toggleWishlist()" class="w-14 h-14 border-2 border-gray-200 rounded-2xl flex items-center justify-center hover:border-rose-300 transition-all">
                <svg class="w-6 h-6" [attr.fill]="wishlisted() ? '#e11d48' : 'none'" stroke="#e11d48" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </button>
            </div>

            <!-- Description -->
            <div class="border-t border-gray-100 pt-6">
              <h3 class="font-semibold text-gray-900 mb-3">About this product</h3>
              <p class="text-gray-600 leading-relaxed">{{ product()!.description }}</p>
            </div>

            <!-- Tags -->
            @if (product()!.tags) {
              <div class="flex flex-wrap gap-2">
                @for (tag of tagList(); track tag) {
                  <span class="badge bg-beige-100 text-beige-700 text-xs px-3 py-1">{{ tag }}</span>
                }
              </div>
            }
          </div>
        </div>
      </section>

      <!-- ── Reviews Section ─────────────────────────────────────────────── -->
      <section id="reviews" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid md:grid-cols-5 gap-10">

          <!-- Left: summary + form -->
          <div class="md:col-span-2 space-y-6">
            <!-- Rating summary -->
            <div class="card p-6">
              <h2 class="font-display text-xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
              <div class="flex items-end gap-3 mb-4">
                <span class="font-display text-5xl font-bold text-gray-900">{{ product()!.rating }}</span>
                <div>
                  <div class="flex mb-1">
                    @for (star of stars(product()!.rating); track $index) {
                      <svg class="w-5 h-5" [attr.fill]="star === 'full' ? '#f59e0b' : '#e5e7eb'" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    }
                  </div>
                  <p class="text-sm text-gray-400">{{ product()!.reviewCount }} reviews</p>
                </div>
              </div>
            </div>

            <!-- Write a review -->
            @if (isLoggedIn()) {
              <div class="card p-6">
                <h3 class="font-semibold text-gray-900 mb-4">
                  {{ hasReviewed() ? '✅ You reviewed this product' : '✍️ Write a Review' }}
                </h3>
                @if (!hasReviewed()) {
                  <!-- Star picker -->
                  <div class="flex gap-1 mb-4">
                    @for (s of [1,2,3,4,5]; track s) {
                      <button (click)="newRating.set(s)" class="text-2xl transition-transform hover:scale-110">
                        {{ s <= newRating() ? '⭐' : '☆' }}
                      </button>
                    }
                  </div>
                  <div class="space-y-3">
                    <div>
                      <label class="label-field">Review Title (optional)</label>
                      <input [(ngModel)]="newTitle" class="input-field" placeholder="Great product!">
                    </div>
                    <div>
                      <label class="label-field">Your Review</label>
                      <textarea [(ngModel)]="newComment" class="input-field h-24 resize-none"
                                placeholder="Share your experience with this product..."></textarea>
                    </div>
                    <button (click)="submitReview()"
                            [disabled]="newRating() === 0 || submittingReview()"
                            class="btn-primary w-full justify-center py-3 disabled:opacity-50">
                      {{ submittingReview() ? 'Submitting...' : 'Submit Review' }}
                    </button>
                  </div>
                }
              </div>
            } @else {
              <div class="card p-6 text-center">
                <p class="text-gray-500 text-sm mb-3">Sign in to leave a review</p>
                <a routerLink="/auth/login" class="btn-primary text-sm py-2 px-5 inline-block">Sign In</a>
              </div>
            }
          </div>

          <!-- Right: review list -->
          <div class="md:col-span-3 space-y-4">
            @if (reviewsLoading()) {
              @for (i of [1,2,3]; track i) {
                <div class="card p-5 animate-pulse space-y-3">
                  <div class="flex gap-3">
                    <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div class="flex-1 space-y-2">
                      <div class="bg-gray-200 h-4 rounded w-1/4"></div>
                      <div class="bg-gray-200 h-3 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div class="bg-gray-200 h-4 rounded w-full"></div>
                  <div class="bg-gray-200 h-4 rounded w-3/4"></div>
                </div>
              }
            } @else if (reviews().length === 0) {
              <div class="card p-10 text-center text-gray-400">
                <p class="text-4xl mb-3">💬</p>
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            } @else {
              @for (r of reviews(); track r.id) {
                <div class="card p-5">
                  <div class="flex items-start gap-3 mb-3">
                    <div class="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center text-sage-700 font-semibold flex-shrink-0">
                      {{ r.userFirstName.charAt(0) }}
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <p class="font-semibold text-gray-900 text-sm">{{ r.userFirstName }} {{ r.userLastName }}</p>
                          <div class="flex items-center gap-2">
                            <div class="flex">
                              @for (star of stars(r.rating); track $index) {
                                <svg class="w-3.5 h-3.5" [attr.fill]="star === 'full' ? '#f59e0b' : '#e5e7eb'" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                </svg>
                              }
                            </div>
                            @if (r.verified) {
                              <span class="text-xs text-green-600 font-medium">✓ Verified purchase</span>
                            }
                          </div>
                        </div>
                        <span class="text-xs text-gray-400">{{ r.createdAt | date:'MMM d, y' }}</span>
                      </div>
                    </div>
                  </div>
                  @if (r.title) {
                    <p class="font-semibold text-gray-800 text-sm mb-1">{{ r.title }}</p>
                  }
                  @if (r.comment) {
                    <p class="text-gray-600 text-sm leading-relaxed">{{ r.comment }}</p>
                  }
                </div>
              }

              <!-- Load more -->
              @if (!reviewsLastPage()) {
                <button (click)="loadMoreReviews()" class="w-full py-3 border border-gray-200 rounded-2xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  Load more reviews
                </button>
              }
            }
          </div>
        </div>
      </section>

      <!-- Related Products -->
      @if (related().length > 0) {
        <section class="py-16 bg-beige-50">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="font-display text-2xl font-bold text-gray-900 mb-8">Vous aimerez aussi</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              @for (p of related(); track p.id) { <app-product-card [product]="p" /> }
            </div>
          </div>
        </section>
      }
    }

    @if (!loading() && !product()) {
      <div class="text-center py-40">
        <span class="text-6xl">😔</span>
        <h2 class="font-display text-3xl font-bold text-gray-800 mt-6">Produit introuvable</h2>
        <a routerLink="/shop" class="btn-primary mt-6">Retour à la boutique</a>
      </div>
    }

    <style>
      /* Gallery */
      .gallery-container { display:flex; flex-direction:column; gap:1rem; }
      .main-image-wrap {
        position:relative; border-radius:1.5rem; overflow:hidden;
        background:#f8fafc; aspect-ratio:1/1; cursor:zoom-in;
        box-shadow:0 4px 24px rgba(0,0,0,0.08);
      }
      .main-image { width:100%; height:100%; object-fit:cover; transition:transform 0.4s ease; }
      .main-image-wrap:hover .main-image { transform:scale(1.04); }
      .zoom-hint {
        position:absolute; bottom:1rem; right:1rem;
        display:flex; align-items:center; gap:0.375rem;
        background:rgba(255,255,255,0.9); backdrop-filter:blur(8px);
        padding:0.375rem 0.75rem; border-radius:9999px;
        font-size:0.75rem; font-weight:600; color:#0891b2;
        opacity:0; transition:opacity 0.2s;
      }
      .main-image-wrap:hover .zoom-hint { opacity:1; }
      .sale-ribbon {
        position:absolute; top:1rem; left:1rem;
        background:linear-gradient(135deg,#dc2626,#b91c1c);
        color:white; font-size:0.75rem; font-weight:800;
        padding:0.25rem 0.75rem; border-radius:9999px;
        letter-spacing:0.05em;
      }
      /* Thumbnails */
      .thumb-row { display:flex; gap:0.625rem; flex-wrap:wrap; }
      .thumb-btn {
        width:5rem; height:5rem; border-radius:0.875rem; overflow:hidden;
        border:2px solid transparent; transition:all 0.2s; cursor:pointer;
        background:#f8fafc;
      }
      .thumb-btn:hover { border-color:#94a3b8; }
      .thumb-active { border-color:#0891b2 !important; box-shadow:0 0 0 3px rgba(8,145,178,0.2); }
      /* Lightbox */
      .lightbox-overlay {
        position:fixed; inset:0; z-index:9999;
        background:rgba(0,0,0,0.92); backdrop-filter:blur(8px);
        display:flex; align-items:center; justify-content:center;
        animation:fadeIn 0.2s ease;
      }
      .lightbox-content { position:relative; max-width:90vw; max-height:90vh; }
      .lightbox-img {
        max-width:80vw; max-height:80vh; object-fit:contain;
        border-radius:1rem; box-shadow:0 24px 64px rgba(0,0,0,0.5);
      }
      .lightbox-close {
        position:absolute; top:-2.5rem; right:0;
        background:rgba(255,255,255,0.15); color:white;
        border:none; cursor:pointer; font-size:1.25rem;
        width:2.5rem; height:2.5rem; border-radius:50%;
        display:flex; align-items:center; justify-content:center;
        transition:background 0.2s;
      }
      .lightbox-close:hover { background:rgba(255,255,255,0.3); }
      .lightbox-arrow {
        position:absolute; top:50%; transform:translateY(-50%);
        background:rgba(255,255,255,0.15); color:white;
        border:none; cursor:pointer; font-size:2rem;
        width:3rem; height:3rem; border-radius:50%;
        display:flex; align-items:center; justify-content:center;
        transition:background 0.2s;
      }
      .lightbox-arrow.left { left:-4rem; }
      .lightbox-arrow.right { right:-4rem; }
      .lightbox-arrow:hover { background:rgba(255,255,255,0.3); }
      .lightbox-dots { display:flex; justify-content:center; gap:0.5rem; margin-top:1.25rem; }
      .lightbox-dot {
        width:0.625rem; height:0.625rem; border-radius:50%;
        background:rgba(255,255,255,0.35); border:none; cursor:pointer; transition:all 0.2s;
      }
      .dot-active { background:white; transform:scale(1.3); }
      @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    </style>
  `
})
export class ProductDetailComponent implements OnInit {
  private route       = inject(ActivatedRoute);
  private productSvc  = inject(ProductService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private toastSvc    = inject(ToastService);
  private wishSvc     = inject(WishlistService);
  private reviewSvc   = inject(ReviewService);

  product       = signal<Product | null>(null);
  related       = signal<Product[]>([]);
  selectedImage = signal<string>('');
  loading       = signal(true);
  adding        = signal(false);
  wishlisted    = signal(false);
  qty           = 1;
  tagList       = signal<string[]>([]);
  lightboxOpen  = signal(false);

  // Reviews
  reviews         = signal<Review[]>([]);
  reviewsLoading  = signal(false);
  reviewsPage     = 0;
  reviewsLastPage = signal(true);
  hasReviewed     = signal(false);
  newRating       = signal(0);
  newTitle        = '';
  newComment      = '';
  submittingReview = signal(false);

  isLoggedIn = () => this.authService.isLoggedIn();

  ngOnInit() {
    this.route.params.subscribe(p => {
      this.loading.set(true);
      this.reviewsPage = 0;
      this.reviews.set([]);
      this.productSvc.getProduct(+p['id']).subscribe({
        next: prod => {
          this.product.set(prod);
          // Build allImages: imageUrl first, then extras (deduped)
          const base = prod.imageUrl ? [prod.imageUrl] : [];
          const extras = (prod.images ?? []).filter((u: string) => u !== prod.imageUrl);
          this.selectedImage.set(base[0] ?? extras[0] ?? '');
          this.tagList.set((prod.tags ?? '').split(',').map((t: string) => t.trim()).filter(Boolean));
          this.loading.set(false);
          this.productSvc.getRelated(prod.id).subscribe(r => this.related.set(r));
          this.loadReviews(prod.id);
          if (this.authService.isLoggedIn()) {
            this.wishSvc.check(prod.id).subscribe(r => this.wishlisted.set(r.inWishlist));
            this.reviewSvc.getReviews(prod.id, 0, 100).subscribe(rv => {
              const me = this.authService.currentUser()?.id;
              this.hasReviewed.set(rv.content.some(r => r.userId === me));
            });
          }
        },
        error: () => this.loading.set(false)
      });
    });
  }

  loadReviews(productId: number) {
    this.reviewsLoading.set(true);
    this.reviewSvc.getReviews(productId, this.reviewsPage, 5).subscribe(page => {
      this.reviews.update(r => [...r, ...page.content]);
      this.reviewsLastPage.set(page.last);
      this.reviewsLoading.set(false);
    });
  }

  loadMoreReviews() {
    this.reviewsPage++;
    this.loadReviews(this.product()!.id);
  }

  submitReview() {
    if (this.newRating() === 0) { this.toastSvc.error('Please select a rating'); return; }
    this.submittingReview.set(true);
    this.reviewSvc.createReview(this.product()!.id, {
      rating: this.newRating(),
      title: this.newTitle || undefined,
      comment: this.newComment || undefined
    }).subscribe({
      next: r => {
        this.reviews.update(list => [r, ...list]);
        this.hasReviewed.set(true);
        this.submittingReview.set(false);
        this.toastSvc.success('Review submitted — thank you!');
        this.product.update(p => p ? { ...p, reviewCount: p.reviewCount + 1 } : p);
      },
      error: (err) => {
        this.submittingReview.set(false);
        this.toastSvc.error(err.error?.message ?? 'Could not submit review');
      }
    });
  }

  decreaseQty() { if (this.qty > 1) this.qty = this.qty - 1; }
  increaseQty() { if (this.qty < (this.product()?.stock ?? 99)) this.qty = this.qty + 1; }

  addToCart() {
    if (!this.authService.isLoggedIn()) { this.toastSvc.info('Please sign in to add to cart'); return; }
    this.adding.set(true);
    this.cartService.addToCart(this.product()!.id, this.qty).subscribe({
      next: () => { this.adding.set(false); this.toastSvc.success(this.product()!.name + ' added to cart!'); },
      error: () => { this.adding.set(false); this.toastSvc.error('Failed to add to cart'); }
    });
  }

  toggleWishlist() {
    if (!this.authService.isLoggedIn()) { this.toastSvc.info('Sign in to save to wishlist'); return; }
    const p = this.product()!;
    if (this.wishlisted()) {
      this.wishSvc.remove(p.id).subscribe(() => { this.wishlisted.set(false); this.toastSvc.info('Removed from wishlist'); });
    } else {
      this.wishSvc.add(p.id).subscribe(() => { this.wishlisted.set(true); this.toastSvc.success('Saved to wishlist'); });
    }
  }

  stars(rating: number) { return Array.from({ length: 5 }, (_, i) => i < Math.round(rating) ? 'full' : 'empty'); }
  discount(price: number, sale: number) { return Math.round((1 - sale / price) * 100); }

  allImages = computed<string[]>(() => {
    const p = this.product();
    if (!p) return [];
    const base = p.imageUrl ? [p.imageUrl] : [];
    const extras = (p.images ?? []).filter((u: string) => u !== p.imageUrl);
    return [...base, ...extras];
  });

  prevImage() {
    const imgs = this.allImages();
    const idx = imgs.indexOf(this.selectedImage());
    this.selectedImage.set(imgs[(idx - 1 + imgs.length) % imgs.length]);
  }

  nextImage() {
    const imgs = this.allImages();
    const idx = imgs.indexOf(this.selectedImage());
    this.selectedImage.set(imgs[(idx + 1) % imgs.length]);
  }
}
