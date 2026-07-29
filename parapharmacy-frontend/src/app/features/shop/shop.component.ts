import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Product, Category, Page } from '../../core/models/models';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProductCardComponent],
  template: `
    <!-- Shop Hero Banner -->
    <section class="shop-hero">
      <div class="shop-hero-bg"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div class="hero-chip mb-3">🛍️ Notre Boutique</div>
            <h1 class="shop-title">Tous nos produits</h1>
            <p class="shop-subtitle">{{ pageData()?.totalElements || 0 }} produits disponibles — Soins, beauté & bien-être</p>
          </div>
          <!-- Inline search bar -->
          <div class="shop-search-wrap">
            <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearch()"
                   placeholder="Rechercher produits, marques..."
                   class="shop-search-input">
            @if (searchQuery) {
              <button (click)="searchQuery=''; onSearch()" class="search-clear">✕</button>
            }
          </div>
        </div>

        <!-- Category chips -->
        <div class="flex flex-wrap gap-2 mt-7">
          <button (click)="setCategory(null)" [class.chip-active]="!selectedCategory()" class="chip">
            Tout voir
          </button>
          @for (cat of categories(); track cat.id) {
            <button (click)="setCategory(cat.id)" [class.chip-active]="selectedCategory() === cat.id" class="chip">
              {{ cat.icon }} {{ cat.name }}
              <span class="chip-count">{{ cat.productCount }}</span>
            </button>
          }
        </div>
      </div>
    </section>

    <!-- Main content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="flex flex-col lg:flex-row gap-8">

        <!-- Sidebar -->
        <aside class="lg:w-64 shrink-0">
          <div class="sidebar-card sticky top-24 space-y-6">
            <div class="sidebar-header">
              <span class="text-base">⚙️</span>
              <span class="font-bold text-slate-900">Filtres</span>
              @if (hasActiveFilters()) {
                <button (click)="resetFilters()" class="ml-auto text-xs font-semibold reset-btn">
                  Réinitialiser
                </button>
              }
            </div>

            <!-- Sort -->
            <div>
              <p class="sidebar-label">Trier par</p>
              <select [(ngModel)]="sortBy" (ngModelChange)="load()" class="input-field text-sm">
                <option value="newest">Nouveautés</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="rating">Mieux notés</option>
                <option value="name">A–Z</option>
              </select>
            </div>

            <!-- Category list (desktop) -->
            <div class="hidden lg:block">
              <p class="sidebar-label">Catégorie</p>
              <div class="space-y-1">
                <button (click)="setCategory(null)"
                        class="sidebar-cat-btn w-full"
                        [class.sidebar-cat-active]="!selectedCategory()">
                  <span>🛒</span> Toutes les catégories
                </button>
                @for (cat of categories(); track cat.id) {
                  <button (click)="setCategory(cat.id)"
                          class="sidebar-cat-btn w-full"
                          [class.sidebar-cat-active]="selectedCategory() === cat.id">
                    <span>{{ cat.icon }}</span> {{ cat.name }}
                    <span class="ml-auto text-xs" style="color:#94a3b8">{{ cat.productCount }}</span>
                  </button>
                }
              </div>
            </div>

            <!-- Quick filters -->
            <div>
              <p class="sidebar-label">Disponibilité</p>
              <div class="space-y-2">
                <label class="filter-check">
                  <input type="checkbox" [(ngModel)]="onSaleOnly" (ngModelChange)="load()" class="accent-primary-600">
                  <span class="text-sm text-slate-600">En promotion</span>
                  <span class="ml-auto badge-sale text-xs px-1.5 py-0.5">-%</span>
                </label>
                <label class="filter-check">
                  <input type="checkbox" [(ngModel)]="featuredOnly" (ngModelChange)="load()" class="accent-primary-600">
                  <span class="text-sm text-slate-600">Coups de cœur</span>
                  <span class="ml-auto text-base">⭐</span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        <!-- Products area -->
        <div class="flex-1 min-w-0">

          <!-- Toolbar -->
          <div class="toolbar mb-6">
            <p class="text-sm text-slate-500">
              @if (!loading()) {
                <span class="font-semibold text-slate-700">{{ products().length }}</span>
                sur {{ pageData()?.totalElements || 0 }} produits
              }
            </p>
            <div class="flex items-center gap-2">
              <!-- View toggle -->
              <div class="view-toggle">
                <button (click)="viewMode.set('grid')" [class.active]="viewMode()==='grid'" title="Grille">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                  </svg>
                </button>
                <button (click)="viewMode.set('list')" [class.active]="viewMode()==='list'" title="Liste">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Active filter tags -->
          @if (hasActiveFilters()) {
            <div class="flex flex-wrap gap-2 mb-5">
              @if (selectedCategory()) {
                <span class="filter-tag">
                  {{ activeCategoryName() }}
                  <button (click)="setCategory(null)">✕</button>
                </span>
              }
              @if (onSaleOnly) {
                <span class="filter-tag">
                  Promotions <button (click)="onSaleOnly=false; load()">✕</button>
                </span>
              }
              @if (featuredOnly) {
                <span class="filter-tag">
                  Coups de cœur <button (click)="featuredOnly=false; load()">✕</button>
                </span>
              }
              @if (searchQuery) {
                <span class="filter-tag">
                  "{{ searchQuery }}" <button (click)="searchQuery=''; onSearch()">✕</button>
                </span>
              }
            </div>
          }

          <!-- Skeleton -->
          @if (loading()) {
            <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              @for (i of [1,2,3,4,5,6]; track i) {
                <div class="skeleton rounded-2xl" style="height:340px"></div>
              }
            </div>
          }

          <!-- Grid -->
          @if (!loading() && products().length > 0) {
            <div class="stagger"
                 [class.grid]="viewMode()==='grid'"
                 [class.grid-gap]="viewMode()==='grid'"
                 [class.flex]="viewMode()==='list'"
                 [class.flex-col]="viewMode()==='list'"
                 [class.gap-4]="viewMode()==='list'">
              @for (p of products(); track p.id) {
                <app-product-card [product]="p" class="animate-fade-in-up" />
              }
            </div>
          }

          <!-- Empty -->
          @if (!loading() && products().length === 0) {
            <div class="empty-state">
              <div class="text-6xl mb-4">🔍</div>
              <h3 class="text-xl font-bold text-slate-800 mb-2">Aucun produit trouvé</h3>
              <p class="text-slate-400 mb-6">Essayez de modifier vos filtres ou votre recherche.</p>
              <button (click)="resetFilters()" class="btn-primary">Effacer les filtres</button>
            </div>
          }

          <!-- Pagination -->
          @if (!loading() && (pageData()?.totalPages ?? 0) > 1) {
            <div class="flex justify-center gap-2 mt-12">
              <button (click)="changePage(currentPage() - 1)" [disabled]="pageData()?.first" class="page-btn">
                ←
              </button>
              @for (page of pageNumbers(); track page) {
                <button (click)="changePage(page)" class="page-btn" [class.page-active]="page === currentPage()">
                  {{ page + 1 }}
                </button>
              }
              <button (click)="changePage(currentPage() + 1)" [disabled]="pageData()?.last" class="page-btn">
                →
              </button>
            </div>
          }
        </div>
      </div>
    </div>

    <style>
      /* Hero */
      .shop-hero { position:relative; overflow:hidden; background:#071a12; }
      .shop-hero-bg {
        position:absolute; inset:0;
        background: radial-gradient(ellipse 80% 70% at 50% -20%, rgba(22,163,74,0.3) 0%, transparent 70%),
                    linear-gradient(160deg, #071a12 0%, #0c2b1e 50%, #071a12 100%);
      }
      .hero-chip {
        display:inline-flex; align-items:center; gap:0.375rem;
        padding:0.375rem 1rem; border-radius:9999px; font-size:0.8rem; font-weight:700;
        background:rgba(74,222,128,0.12); color:#4ade80;
        border:1px solid rgba(74,222,128,0.3);
      }
      .shop-title { font-size:clamp(1.75rem,4vw,3rem); font-weight:800; color:white; line-height:1.15; }
      .shop-subtitle { color:rgba(255,255,255,0.65); font-size:1rem; margin-top:0.375rem; }

      /* Hero search */
      .shop-search-wrap {
        position:relative; min-width:300px; max-width:400px; flex:1;
      }
      .search-icon {
        position:absolute; left:1rem; top:50%; transform:translateY(-50%);
        width:1.125rem; height:1.125rem; color:rgba(255,255,255,0.5); pointer-events:none;
      }
      .shop-search-input {
        width:100%; padding:0.75rem 2.75rem 0.75rem 2.75rem; border-radius:1rem;
        background:rgba(255,255,255,0.08); border:1.5px solid rgba(255,255,255,0.15);
        color:white; font-size:0.9rem; font-family:inherit; outline:none;
        transition:all 0.2s; backdrop-filter:blur(8px);
      }
      .shop-search-input::placeholder { color:rgba(255,255,255,0.45); }
      .shop-search-input:focus { background:rgba(255,255,255,0.14); border-color:#4ade80; }
      .search-clear {
        position:absolute; right:0.875rem; top:50%; transform:translateY(-50%);
        color:rgba(255,255,255,0.5); font-size:0.75rem; cursor:pointer; border:none; background:none;
      }
      .search-clear:hover { color:white; }

      /* Chips */
      .chip {
        display:inline-flex; align-items:center; gap:0.375rem;
        padding:0.4rem 0.875rem; border-radius:9999px; font-size:0.82rem; font-weight:600;
        background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.75);
        border:1.5px solid rgba(255,255,255,0.12); cursor:pointer;
        transition:all 0.2s; white-space:nowrap;
      }
      .chip:hover { background:rgba(255,255,255,0.16); color:white; }
      .chip-active { background:#16a34a !important; color:white !important; border-color:#16a34a !important; }
      .chip-count {
        background:rgba(255,255,255,0.2); color:inherit;
        padding:0.1rem 0.4rem; border-radius:9999px; font-size:0.7rem;
      }
      .chip-active .chip-count { background:rgba(255,255,255,0.25); }

      /* Sidebar */
      .sidebar-card {
        background:white; border-radius:1.25rem; padding:1.5rem;
        border:1px solid #f1f5f9;
        box-shadow:0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04);
      }
      .sidebar-header { display:flex; align-items:center; gap:0.625rem; margin-bottom:-0.5rem; }
      .sidebar-label { font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#94a3b8; margin-bottom:0.625rem; }
      .sidebar-cat-btn {
        display:flex; align-items:center; gap:0.5rem; text-align:left;
        padding:0.5rem 0.75rem; border-radius:0.75rem; font-size:0.875rem;
        color:#475569; transition:all 0.15s; border:none; background:none; cursor:pointer;
      }
      .sidebar-cat-btn:hover { background:#f0f9ff; color:#0891b2; }
      .sidebar-cat-active { background:#e0f2fe !important; color:#0891b2 !important; font-weight:600; }
      .reset-btn { color:#0891b2; background:none; border:none; cursor:pointer; }
      .reset-btn:hover { text-decoration:underline; }
      .filter-check { display:flex; align-items:center; gap:0.5rem; cursor:pointer; }

      /* Toolbar */
      .toolbar { display:flex; align-items:center; justify-content:space-between; }
      .view-toggle {
        display:flex; background:#f1f5f9; border-radius:0.75rem; padding:0.25rem; gap:0.25rem;
      }
      .view-toggle button {
        padding:0.375rem 0.625rem; border-radius:0.5rem; border:none; cursor:pointer;
        background:transparent; color:#94a3b8; transition:all 0.15s;
      }
      .view-toggle button.active { background:white; color:#0891b2; box-shadow:0 1px 4px rgba(0,0,0,0.08); }

      /* Filter tags */
      .filter-tag {
        display:inline-flex; align-items:center; gap:0.5rem;
        padding:0.25rem 0.75rem; border-radius:9999px; font-size:0.8rem; font-weight:600;
        background:#e0f2fe; color:#0891b2; border:1px solid #bae6fd;
      }
      .filter-tag button { background:none; border:none; cursor:pointer; color:#0891b2; font-size:0.7rem; }

      /* Grid */
      .grid-gap { grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:1.25rem; }

      /* Empty */
      .empty-state {
        text-align:center; padding:5rem 2rem;
        background:white; border-radius:1.5rem;
        border:1px dashed #e2e8f0;
      }

      /* Pagination */
      .page-btn {
        width:2.5rem; height:2.5rem; border-radius:0.75rem; border:1.5px solid #e2e8f0;
        background:white; font-size:0.875rem; font-weight:600; color:#475569;
        cursor:pointer; transition:all 0.15s; display:flex; align-items:center; justify-content:center;
      }
      .page-btn:hover:not(:disabled) { border-color:#0891b2; color:#0891b2; background:#f0f9ff; }
      .page-btn:disabled { opacity:0.35; cursor:not-allowed; }
      .page-active { background:linear-gradient(135deg,#0891b2,#0e7490) !important; color:white !important; border-color:transparent !important; }
    </style>
  `
})
export class ShopComponent implements OnInit {
  private productSvc  = inject(ProductService);
  private categorySvc = inject(CategoryService);
  private route       = inject(ActivatedRoute);
  private router      = inject(Router);

  products         = signal<Product[]>([]);
  categories       = signal<Category[]>([]);
  pageData         = signal<Page<Product> | null>(null);
  loading          = signal(true);
  selectedCategory = signal<number | null>(null);
  currentPage      = signal(0);
  viewMode         = signal<'grid' | 'list'>('grid');
  sortBy           = 'newest';
  searchQuery      = '';
  onSaleOnly       = false;
  featuredOnly     = false;
  private searchTimer: any;

  ngOnInit() {
    this.categorySvc.getAll().subscribe(c => this.categories.set(c));
    this.route.queryParamMap.subscribe(params => {
      const cat    = params.get('category');
      const search = params.get('search');
      const sale   = params.get('sale');
      if (cat)    this.selectedCategory.set(+cat);
      if (search) this.searchQuery = search;
      if (sale)   this.onSaleOnly = true;
      this.load();
    });
  }

  load() {
    this.loading.set(true);
    this.productSvc.getProducts(
      this.currentPage(), 12, this.sortBy,
      this.selectedCategory() ?? undefined,
      this.searchQuery.trim() || undefined
    ).subscribe({
      next: page => { this.pageData.set(page); this.products.set(page.content); this.loading.set(false); },
      error: ()  => this.loading.set(false)
    });
  }

  setCategory(id: number | null) { this.selectedCategory.set(id); this.currentPage.set(0); this.load(); }
  changePage(page: number) { this.currentPage.set(page); this.load(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  onSearch() { clearTimeout(this.searchTimer); this.searchTimer = setTimeout(() => { this.currentPage.set(0); this.load(); }, 400); }
  resetFilters() { this.selectedCategory.set(null); this.searchQuery = ''; this.sortBy = 'newest'; this.onSaleOnly = false; this.featuredOnly = false; this.currentPage.set(0); this.load(); }
  hasActiveFilters() { return !!(this.selectedCategory() || this.searchQuery || this.onSaleOnly || this.featuredOnly); }
  activeCategoryName() { return this.categories().find(c => c.id === this.selectedCategory())?.name ?? ''; }
  pageNumbers() {
    const total = this.pageData()?.totalPages ?? 0;
    const current = this.currentPage();
    const maxVisible = 5;
    let start = Math.max(0, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible);
    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }
    const pages: number[] = [];
    for (let i = start; i < end; i++) pages.push(i);
    return pages;
  }
}
