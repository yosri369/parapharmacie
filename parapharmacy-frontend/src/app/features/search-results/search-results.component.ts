import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Product, Category, Page } from '../../core/models/models';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProductCardComponent],
  template: `
    <!-- Hero -->
    <section class="search-hero">
      <div class="search-hero-bg"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div class="hero-chip mb-4">🔍 Recherche</div>
        <h1 class="search-title">
          @if (query()) {
            Résultats pour <span class="query-highlight">"{{ query() }}"</span>
          } @else {
            Rechercher un produit
          }
        </h1>
        <p class="search-sub">
          @if (!loading()) {
            {{ total() }} produit{{ total() !== 1 ? 's' : '' }} trouvé{{ total() !== 1 ? 's' : '' }}
          }
        </p>

        <!-- Search bar -->
        <div class="search-bar-wrap">
          <svg class="bar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" [(ngModel)]="searchInput"
                 (keydown.enter)="doSearch()"
                 placeholder="Saisissez votre recherche..."
                 class="search-bar-input">
          <button (click)="doSearch()" class="search-bar-btn">Rechercher</button>
        </div>
      </div>
    </section>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="flex flex-col lg:flex-row gap-8">

        <!-- Sidebar -->
        <aside class="lg:w-60 shrink-0">
          <div class="sidebar-card sticky top-24 space-y-5">
            <p class="font-bold text-slate-900">Affiner par catégorie</p>
            <div class="space-y-1">
              <button (click)="setCategory(null)" class="sidebar-cat-btn w-full"
                      [class.sidebar-cat-active]="!selectedCategory()">
                Toutes les catégories
              </button>
              @for (cat of categories(); track cat.id) {
                <button (click)="setCategory(cat.id)" class="sidebar-cat-btn w-full"
                        [class.sidebar-cat-active]="selectedCategory() === cat.id">
                  {{ cat.icon }} {{ cat.name }}
                </button>
              }
            </div>
            <div style="border-top:1px solid #f1f5f9; padding-top:1rem">
              <p class="sidebar-label mb-2">Trier par</p>
              <select [(ngModel)]="sortBy" (ngModelChange)="load()" class="input-field text-sm">
                <option value="rating">Mieux notés</option>
                <option value="newest">Nouveautés</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
              </select>
            </div>
          </div>
        </aside>

        <!-- Results -->
        <div class="flex-1 min-w-0">

          <!-- Skeleton -->
          @if (loading()) {
            <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              @for (i of [1,2,3,4,5,6]; track i) {
                <div class="skeleton rounded-2xl" style="height:330px"></div>
              }
            </div>
          }

          <!-- Results grid -->
          @if (!loading() && products().length > 0) {
            <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger">
              @for (p of products(); track p.id) {
                <app-product-card [product]="p" class="animate-fade-in-up" />
              }
            </div>
            <!-- Pagination -->
            @if ((pageData()?.totalPages ?? 0) > 1) {
              <div class="flex justify-center gap-2 mt-10">
                <button (click)="changePage(currentPage() - 1)" [disabled]="pageData()?.first" class="page-btn">←</button>
                @for (p of pageNumbers(); track p) {
                  <button (click)="changePage(p)" class="page-btn" [class.page-active]="p === currentPage()">{{ p + 1 }}</button>
                }
                <button (click)="changePage(currentPage() + 1)" [disabled]="pageData()?.last" class="page-btn">→</button>
              </div>
            }
          }

          <!-- Empty -->
          @if (!loading() && products().length === 0) {
            <div class="empty-state">
              <div class="text-6xl mb-4">🔍</div>
              <h2 class="text-xl font-bold text-slate-800 mb-2">Aucun produit trouvé</h2>
              @if (query()) {
                <p class="text-slate-400 mb-2">Aucun résultat pour <strong>"{{ query() }}"</strong></p>
              }
              <p class="text-slate-400 text-sm mb-6">Essayez des mots-clés différents ou parcourez nos catégories.</p>
              <div class="flex gap-3 justify-center flex-wrap">
                <button (click)="setCategory(null)" class="btn-outline">Effacer les filtres</button>
                <a routerLink="/shop" class="btn-primary">Voir toute la boutique</a>
              </div>
              <!-- Popular categories -->
              <div class="mt-8">
                <p class="text-sm font-semibold text-slate-500 mb-3">Parcourir les catégories</p>
                <div class="flex flex-wrap gap-2 justify-center">
                  @for (cat of categories(); track cat.id) {
                    <button (click)="setCategory(cat.id)" class="chip-suggest">{{ cat.icon }} {{ cat.name }}</button>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>

    <style>
      .search-hero { position:relative; overflow:hidden; }
      .search-hero-bg {
        position:absolute; inset:0;
        background:linear-gradient(135deg, #0c4a6e 0%, #155e75 55%, #14532d 100%);
      }
      .hero-chip {
        display:inline-flex; align-items:center; gap:.375rem;
        padding:.375rem 1rem; border-radius:9999px; font-size:.8rem; font-weight:700;
        background:rgba(255,255,255,.12); color:#7dd3fc;
        border:1px solid rgba(125,211,252,.3);
      }
      .search-title { font-size:clamp(1.6rem,4vw,2.75rem); font-weight:800; color:white; }
      .query-highlight { color:#7dd3fc; }
      .search-sub { color:rgba(255,255,255,.65); margin-top:.375rem; font-size:1rem; }

      .search-bar-wrap {
        position:relative; max-width:560px; margin:1.5rem auto 0;
        display:flex; align-items:center; gap:.5rem;
        background:rgba(255,255,255,.12); border:1.5px solid rgba(255,255,255,.2);
        border-radius:1rem; padding:.25rem .25rem .25rem 1rem;
        backdrop-filter:blur(8px);
      }
      .bar-icon { width:1.125rem; height:1.125rem; color:rgba(255,255,255,.5); flex-shrink:0; }
      .search-bar-input {
        flex:1; background:transparent; border:none; outline:none;
        color:white; font-size:.95rem; font-family:inherit; padding:.5rem 0;
      }
      .search-bar-input::placeholder { color:rgba(255,255,255,.45); }
      .search-bar-btn {
        padding:.625rem 1.25rem; border-radius:.75rem; font-weight:700; font-size:.875rem;
        background:linear-gradient(135deg,#0891b2,#16a34a); color:white;
        border:none; cursor:pointer; white-space:nowrap; transition:opacity .2s;
      }
      .search-bar-btn:hover { opacity:.9; }

      .sidebar-card {
        background:white; border-radius:1.25rem; padding:1.5rem;
        border:1px solid #f1f5f9;
        box-shadow:0 1px 4px rgba(0,0,0,.05), 0 4px 16px rgba(0,0,0,.04);
      }
      .sidebar-label { font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:#94a3b8; }
      .sidebar-cat-btn {
        display:flex; align-items:center; gap:.5rem; text-align:left;
        padding:.5rem .75rem; border-radius:.75rem; font-size:.875rem;
        color:#475569; transition:all .15s; border:none; background:none; cursor:pointer;
      }
      .sidebar-cat-btn:hover { background:#f0f9ff; color:#0891b2; }
      .sidebar-cat-active { background:#e0f2fe !important; color:#0891b2 !important; font-weight:600; }

      .empty-state {
        text-align:center; padding:4rem 2rem;
        background:white; border-radius:1.5rem;
        border:1px dashed #e2e8f0;
      }
      .chip-suggest {
        padding:.35rem .875rem; border-radius:9999px; font-size:.82rem; font-weight:600;
        background:#f0f9ff; color:#0891b2; border:1.5px solid #bae6fd;
        cursor:pointer; transition:all .2s;
      }
      .chip-suggest:hover { background:#0891b2; color:white; border-color:#0891b2; }

      .page-btn {
        width:2.5rem; height:2.5rem; border-radius:.75rem; border:1.5px solid #e2e8f0;
        background:white; font-size:.875rem; font-weight:600; color:#475569;
        cursor:pointer; transition:all .15s;
        display:flex; align-items:center; justify-content:center;
      }
      .page-btn:hover:not(:disabled) { border-color:#0891b2; color:#0891b2; background:#f0f9ff; }
      .page-btn:disabled { opacity:.35; cursor:not-allowed; }
      .page-active { background:linear-gradient(135deg,#0891b2,#0e7490) !important; color:white !important; border-color:transparent !important; }
    </style>
  `
})
export class SearchResultsComponent implements OnInit {
  private productSvc  = inject(ProductService);
  private categorySvc = inject(CategoryService);
  private route       = inject(ActivatedRoute);
  private router      = inject(Router);

  products         = signal<Product[]>([]);
  categories       = signal<Category[]>([]);
  pageData         = signal<Page<Product> | null>(null);
  loading          = signal(true);
  total            = signal(0);
  selectedCategory = signal<number | null>(null);
  currentPage      = signal(0);
  sortBy           = 'rating';
  query            = signal('');
  searchInput      = '';

  ngOnInit() {
    this.categorySvc.getAll().subscribe(c => this.categories.set(c));
    this.route.queryParamMap.subscribe(params => {
      const q   = params.get('q') || '';
      const cat = params.get('category');
      this.query.set(q);
      this.searchInput = q;
      if (cat) this.selectedCategory.set(+cat);
      this.currentPage.set(0);
      this.load();
    });
  }

  load() {
    this.loading.set(true);
    this.productSvc.getProducts(
      this.currentPage(), 12, this.sortBy,
      this.selectedCategory() ?? undefined,
      this.query() || undefined
    ).subscribe({
      next: page => {
        this.pageData.set(page);
        this.products.set(page.content);
        this.total.set(page.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  doSearch() {
    if (!this.searchInput.trim()) return;
    this.router.navigate(['/search'], { queryParams: { q: this.searchInput.trim() } });
  }

  setCategory(id: number | null) {
    this.selectedCategory.set(id);
    this.currentPage.set(0);
    this.load();
  }

  changePage(page: number) {
    this.currentPage.set(page);
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  pageNumbers() {
    return Array.from({ length: Math.min(this.pageData()?.totalPages ?? 0, 5) }, (_, i) => i);
  }
}
