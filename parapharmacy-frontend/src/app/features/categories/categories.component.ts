import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/models';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="relative overflow-hidden bg-[#071a12] py-16">
      <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse 80% 70% at 50% -20%, rgba(22,163,74,0.3) 0%, transparent 70%), linear-gradient(160deg, #071a12 0%, #0c2b1e 50%, #071a12 100%);"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-3" style="background: rgba(74,222,128,0.12); color:#4ade80; border: 1px solid rgba(74,222,128,0.3);">
          📂 Rayons
        </div>
        <h1 class="font-display text-4xl font-extrabold text-white mb-2">Nos Catégories</h1>
        <p class="text-white/60 text-base">Découvrez toutes nos gammes santé, bien-être et beauté</p>
      </div>
    </section>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (i of [1,2,3,4,5,6]; track i) { <div class="skeleton h-48 rounded-3xl"></div> }
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (cat of categories(); track cat.id) {
            <a [routerLink]="['/shop']" [queryParams]="{category: cat.id}"
               class="group relative rounded-3xl overflow-hidden h-48 shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1">
              <img [src]="cat.imageUrl" [alt]="cat.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='https://placehold.co/500x300?text=Category'">
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div class="absolute bottom-0 left-0 p-5">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-2xl">{{ cat.icon }}</span>
                  <span class="badge bg-white/20 text-white backdrop-blur-sm text-xs">{{ cat.productCount }} products</span>
                </div>
                <h3 class="font-display text-xl font-bold text-white">{{ cat.name }}</h3>
                <p class="text-white/70 text-sm mt-0.5 line-clamp-1">{{ cat.description }}</p>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `
})
export class CategoriesComponent implements OnInit {
  categorySvc = inject(CategoryService);
  categories  = signal<Category[]>([]);
  loading     = signal(true);

  ngOnInit() {
    this.categorySvc.getAll().subscribe({
      next: c => { this.categories.set(c); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
