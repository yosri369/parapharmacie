import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="bg-gradient-to-br from-beige-50 to-sage-50 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="font-display text-5xl font-bold text-gray-900 mb-3">Contact Us</h1>
        <p class="text-gray-500 text-lg">We'd love to hear from you</p>
      </div>
    </section>
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-2 gap-12">
      <div>
        <h2 class="font-display text-2xl font-bold text-gray-900 mb-6">Get in touch</h2>
        <div class="space-y-5 mb-8">
          @for (info of contactInfo; track info.label) {
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-sage-100 rounded-2xl flex items-center justify-center text-2xl shrink-0">{{ info.icon }}</div>
              <div>
                <p class="font-semibold text-gray-800 text-sm">{{ info.label }}</p>
                <p class="text-gray-500 text-sm">{{ info.value }}</p>
              </div>
            </div>
          }
        </div>
      </div>
      <div class="card p-8">
        @if (!sent()) {
          <div class="space-y-4">
            <div>
              <label class="label-field">Your Name</label>
              <input [(ngModel)]="form.name" class="input-field" placeholder="Sophie Martin">
            </div>
            <div>
              <label class="label-field">Email</label>
              <input [(ngModel)]="form.email" type="email" class="input-field" placeholder="you@example.com">
            </div>
            <div>
              <label class="label-field">Subject</label>
              <input [(ngModel)]="form.subject" class="input-field" placeholder="Order question">
            </div>
            <div>
              <label class="label-field">Message</label>
              <textarea [(ngModel)]="form.message" class="input-field h-32 resize-none" placeholder="How can we help?"></textarea>
            </div>
            <button (click)="send()" class="btn-primary w-full justify-center">Send Message ✉️</button>
          </div>
        } @else {
          <div class="text-center py-12">
            <span class="text-6xl">🎉</span>
            <h3 class="font-display text-2xl font-bold text-gray-900 mt-4">Message Sent!</h3>
            <p class="text-gray-500 mt-2">We'll get back to you within 24 hours.</p>
          </div>
        }
      </div>
    </div>
  `
})
export class ContactComponent {
  form   = { name: '', email: '', subject: '', message: '' };
  sent   = signal(false);

  contactInfo = [
    { icon: '📧', label: 'Email', value: 'hello@vitanova.com' },
    { icon: '📞', label: 'Phone', value: '+33 1 40 00 00 00' },
    { icon: '📍', label: 'Address', value: '12 Rue du Bien-être, 75001 Paris' },
    { icon: '⏰', label: 'Hours', value: 'Mon–Sat, 9:00–18:00' },
  ];

  send() {
    if (this.form.name && this.form.email && this.form.message) this.sent.set(true);
  }
}
