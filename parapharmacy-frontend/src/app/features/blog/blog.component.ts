import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../core/services/blog.service';
import { BlogPost } from '../../core/models/models';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Hero -->
      <section class="relative overflow-hidden bg-[#071a12] py-20 text-white">
        <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse 80% 70% at 50% -20%, rgba(22,163,74,0.3) 0%, transparent 70%), linear-gradient(160deg, #071a12 0%, #0c2b1e 50%, #071a12 100%);"></div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span class="inline-block text-xs font-bold px-3 py-1.5 rounded-full mb-4" style="background: rgba(74,222,128,0.12); color:#4ade80; border: 1px solid rgba(74,222,128,0.3);">CONSEILS SANTÉ</span>
          <h1 class="font-display text-5xl font-extrabold mb-4">Espace Bien-être & Conseils</h1>
          <p class="text-white/70 text-lg max-w-xl mx-auto">Découvrez les secrets de nos experts pour prendre soin de votre santé et de votre beauté au quotidien.</p>
        </div>
      </section>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <!-- Category Filters -->
        <div class="flex flex-wrap gap-3 mb-10 justify-center">
          @for (cat of categories; track cat) {
            <button (click)="selectCategory(cat)"
                    class="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                    [class.bg-[#16a34a]]="activeCategory() === cat"
                    [class.text-white]="activeCategory() === cat"
                    [class.bg-white]="activeCategory() !== cat"
                    [class.text-slate-600]="activeCategory() !== cat"
                    [class.border]="activeCategory() !== cat"
                    [class.border-slate-100]="activeCategory() !== cat">
              {{ cat }}
            </button>
          }
        </div>

        <!-- Loading -->
        @if (loading()) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="card overflow-hidden animate-pulse">
                <div class="bg-gray-200 h-52 w-full"></div>
                <div class="p-6 space-y-3">
                  <div class="bg-gray-200 h-4 rounded w-1/3"></div>
                  <div class="bg-gray-200 h-6 rounded w-3/4"></div>
                  <div class="bg-gray-200 h-4 rounded w-full"></div>
                  <div class="bg-gray-200 h-4 rounded w-2/3"></div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Posts Grid -->
        @if (!loading()) {
          @if (posts().length === 0) {
            <div class="text-center py-20">
              <p class="text-5xl mb-4">📝</p>
              <p class="text-gray-500">No articles found in this category yet.</p>
            </div>
          } @else {
            <!-- Featured first post -->
            @if (featuredPost() && activeCategory() === 'All Articles') {
              <div class="card overflow-hidden mb-12 md:flex group cursor-pointer"
                   [routerLink]="['/blog', featuredPost()!.slug]">
                <div class="md:w-1/2 overflow-hidden">
                  <img [src]="featuredPost()!.imageUrl" [alt]="featuredPost()!.title"
                       class="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                       onerror="this.src='https://placehold.co/800x400?text=Article'">
                </div>
                <div class="md:w-1/2 p-8 flex flex-col justify-center">
                  <span class="badge bg-sage-100 text-sage-700 text-xs mb-3 self-start">{{ featuredPost()!.category }}</span>
                  <h2 class="font-display text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#16a34a] transition-colors">
                    {{ featuredPost()!.title }}
                  </h2>
                  <p class="text-gray-500 mb-6 line-clamp-3">{{ featuredPost()!.excerpt }}</p>
                  <div class="flex items-center gap-4 text-sm text-gray-400">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-700 font-semibold text-xs">
                        {{ featuredPost()!.authorName.charAt(0) }}
                      </div>
                      <span>{{ featuredPost()!.authorName }}</span>
                    </div>
                    <span>·</span>
                    <span>{{ featuredPost()!.readTimeMinutes }} min read</span>
                    <span>·</span>
                    <span>{{ featuredPost()!.publishedAt | date:'MMM d, y' }}</span>
                  </div>
                  <a class="mt-6 text-[#16a34a] font-semibold hover:text-[#15803d] flex items-center gap-1 transition-colors">
                    Read Article <span>→</span>
                  </a>
                </div>
              </div>
            }

            <!-- Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              @for (post of regularPosts(); track post.id) {
                <article class="card overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300"
                         [routerLink]="['/blog', post.slug]">
                  <div class="overflow-hidden h-52">
                    <img [src]="post.imageUrl" [alt]="post.title"
                         class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                         onerror="this.src='https://placehold.co/600x300?text=Article'">
                  </div>
                  <div class="p-6">
                    <span class="badge bg-emerald-55 text-emerald-800 text-xs mb-3 inline-block" style="background: rgba(22,163,74,0.08); color: #15803d;">{{ post.category }}</span>
                    <h2 class="font-display text-lg font-bold text-gray-900 mb-2 group-hover:text-[#16a34a] transition-colors line-clamp-2">
                      {{ post.title }}
                    </h2>
                    <p class="text-gray-500 text-sm mb-4 line-clamp-2">{{ post.excerpt }}</p>
                    <div class="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100">
                      <div class="flex items-center gap-2">
                        <div class="w-6 h-6 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-700 font-semibold text-xs">
                          {{ post.authorName.charAt(0) }}
                        </div>
                        <span>{{ post.authorName }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span>📖 {{ post.readTimeMinutes }} min</span>
                        <span>·</span>
                        <span>{{ post.publishedAt | date:'MMM d' }}</span>
                      </div>
                    </div>
                  </div>
                </article>
              }
            </div>

            <!-- Pagination -->
            @if (totalPages() > 1) {
              <div class="flex justify-center gap-2 mt-12">
                <button (click)="changePage(currentPage() - 1)" [disabled]="currentPage() === 0"
                        class="px-4 py-2 rounded-xl border border-gray-200 text-sm disabled:opacity-40 hover:bg-emerald-50 transition-colors">
                  ← Prev
                </button>
                @for (p of pageNumbers(); track p) {
                  <button (click)="changePage(p)"
                          class="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                          [class.bg-[#16a34a]]="p === currentPage()"
                          [class.text-white]="p === currentPage()"
                          [class.border]="p !== currentPage()"
                          [class.border-gray-200]="p !== currentPage()">
                    {{ p + 1 }}
                  </button>
                }
                <button (click)="changePage(currentPage() + 1)" [disabled]="currentPage() === totalPages() - 1"
                        class="px-4 py-2 rounded-xl border border-gray-200 text-sm disabled:opacity-40 hover:bg-emerald-50 transition-colors">
                  Next →
                </button>
              </div>
            }
          }
        }
      </div>
    </div>
  `
})
export class BlogComponent implements OnInit {
  private blogSvc = inject(BlogService);

  posts        = signal<BlogPost[]>([]);
  loading      = signal(true);
  currentPage  = signal(0);
  totalPages   = signal(0);
  activeCategory = signal('All Articles');

  categories = ['All Articles', 'Skincare', 'Supplements', 'Hair Care', 'Wellness', 'Baby Care'];

  featuredPost  = computed(() => this.posts()[0] ?? null);
  regularPosts  = computed(() => {
    if (this.activeCategory() === 'All Articles' && this.posts().length > 1) {
      return this.posts().slice(1);
    }
    return this.posts();
  });
  pageNumbers   = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i));

  ngOnInit() { this.loadPosts(); }

  loadPosts() {
    this.loading.set(true);
    const cat = this.activeCategory() === 'All Articles' ? undefined : this.activeCategory();
    this.blogSvc.getPosts(this.currentPage(), 9, cat).subscribe({
      next: p => {
        this.posts.set(p.content);
        this.totalPages.set(p.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  selectCategory(cat: string) {
    this.activeCategory.set(cat);
    this.currentPage.set(0);
    this.loadPosts();
  }

  changePage(page: number) {
    this.currentPage.set(page);
    this.loadPosts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
