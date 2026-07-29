import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center px-4">
      <div class="text-center max-w-md animate-fade-in">
        <div class="text-8xl mb-6 animate-float block">🌿</div>
        <h1 class="font-display text-8xl font-bold text-sage-200 mb-2">404</h1>
        <h2 class="font-display text-2xl font-bold text-gray-900 mb-3">Page not found</h2>
        <p class="text-gray-500 mb-8 text-lg">Looks like this page wandered off. Let's get you back to wellness.</p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <a routerLink="/" class="btn-primary">Go Home</a>
          <a routerLink="/shop" class="btn-secondary">Explore Shop</a>
        </div>
      </div>
    </div>
  `
})
export class NotFoundComponent {}
