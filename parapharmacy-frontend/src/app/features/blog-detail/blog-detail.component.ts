import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { BlogService } from '../../core/services/blog.service';
import { BlogPost } from '../../core/models/models';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (loading()) {
      <div class="max-w-3xl mx-auto px-4 py-16 animate-pulse space-y-4">
        <div class="bg-gray-200 h-10 rounded w-3/4"></div>
        <div class="bg-gray-200 h-4 rounded w-1/2"></div>
        <div class="bg-gray-200 h-80 rounded-2xl"></div>
        <div class="space-y-2">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="bg-gray-200 h-4 rounded"></div>
          }
        </div>
      </div>
    }

    @if (!loading() && post()) {
      <article class="min-h-screen bg-white">
        <!-- Hero Image -->
        <div class="relative h-72 sm:h-96 w-full overflow-hidden bg-gray-100">
          <img [src]="post()!.imageUrl" [alt]="post()!.title"
               class="w-full h-full object-cover"
               onerror="this.src='https://placehold.co/1200x400?text=Article'">
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-8">
            <span class="inline-block bg-sage-500 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
              {{ post()!.category }}
            </span>
            <h1 class="font-display text-3xl sm:text-4xl font-bold text-white leading-tight max-w-3xl">
              {{ post()!.title }}
            </h1>
          </div>
        </div>

        <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <!-- Meta -->
          <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
            <div class="flex items-center gap-2">
              <div class="w-9 h-9 bg-sage-100 rounded-full flex items-center justify-center font-semibold text-sage-700">
                {{ post()!.authorName.charAt(0) }}
              </div>
              <div>
                <p class="font-medium text-gray-900 text-sm">{{ post()!.authorName }}</p>
                <p class="text-xs text-gray-400">Health Expert</p>
              </div>
            </div>
            <span class="text-gray-300">|</span>
            <span>{{ post()!.publishedAt | date:'MMMM d, y' }}</span>
            <span class="text-gray-300">|</span>
            <span>📖 {{ post()!.readTimeMinutes }} min read</span>
          </div>

          <!-- Excerpt -->
          <p class="text-xl text-gray-600 leading-relaxed mb-8 italic border-l-4 border-sage-300 pl-4">
            {{ post()!.excerpt }}
          </p>

          <!-- Content -->
          <div class="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-gray-900
                      prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-gray-900
                      prose-blockquote:border-sage-400 prose-blockquote:bg-sage-50 prose-blockquote:rounded-r-xl
                      prose-blockquote:py-2 prose-blockquote:not-italic prose-blockquote:text-gray-600"
               [innerHTML]="renderedContent()">
          </div>

          <!-- Back -->
          <div class="mt-16 pt-8 border-t border-gray-100">
            <a routerLink="/blog"
               class="inline-flex items-center gap-2 text-sage-600 hover:text-sage-800 font-medium transition-colors">
              ← Back to Wellness Tips
            </a>
          </div>
        </div>
      </article>
    }

    @if (!loading() && !post()) {
      <div class="text-center py-32">
        <p class="text-5xl mb-4">😕</p>
        <h2 class="font-display text-2xl font-bold text-gray-900 mb-2">Article not found</h2>
        <a routerLink="/blog" class="btn-primary mt-4 inline-block">Browse all articles</a>
      </div>
    }
  `
})
export class BlogDetailComponent implements OnInit {
  private route    = inject(ActivatedRoute);
  private blogSvc  = inject(BlogService);
  private sanitizer = inject(DomSanitizer);

  post    = signal<BlogPost | null>(null);
  loading = signal(true);

  renderedContent = () => {
    const p = this.post();
    if (!p) return '';
    // Convert markdown-like content to simple HTML
    const html = p.content
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      .replace(/^> \*\*(.+?)\*\*(.*)$/gm, '<blockquote><strong>$1</strong>$2</blockquote>')
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[hul]|<block)(.+)$/gm, '<p>$1</p>');
    return this.sanitizer.bypassSecurityTrustHtml(html) as SafeHtml;
  };

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.blogSvc.getPostBySlug(slug).subscribe({
      next: p => { this.post.set(p); this.loading.set(false); },
      error: () => { this.post.set(null); this.loading.set(false); }
    });
  }
}
