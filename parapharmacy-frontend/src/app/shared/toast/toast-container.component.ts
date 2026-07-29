import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
      @for (toast of toastSvc.toasts(); track toast.id) {
        <div class="pointer-events-auto toast-enter flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-hover min-w-[280px] max-w-sm"
             [class]="toastClass(toast.type)">
          <span class="text-lg shrink-0">{{ icon(toast.type) }}</span>
          <p class="text-sm font-medium leading-snug flex-1">{{ toast.message }}</p>
          <button (click)="toastSvc.dismiss(toast.id)" class="text-current opacity-60 hover:opacity-100 transition-opacity">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  toastSvc = inject(ToastService);

  toastClass(type: string): string {
    const map: Record<string, string> = {
      success: 'bg-sage-500 text-white',
      error:   'bg-rose-500 text-white',
      info:    'bg-blue-500 text-white',
      warning: 'bg-amber-500 text-white',
    };
    return map[type] ?? 'bg-gray-800 text-white';
  }

  icon(type: string): string {
    const map: Record<string, string> = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    return map[type] ?? '•';
  }
}
