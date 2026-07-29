import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnnouncementService, Announcement } from '../../../core/services/announcement.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-announcement-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">

      <!-- Form: Add announcement -->
      <div class="card p-6">
        <h2 class="font-bold text-slate-900 text-lg mb-1">📢 Fil d'annonces défilant</h2>
        <p class="text-xs text-slate-500 mb-5">
          Créez des messages défilants (promotions, alertes, informations) affichés tout en haut du site.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Message text -->
          <div class="col-span-2 md:col-span-1">
            <label class="label-field">Message d'annonce *</label>
            <input [(ngModel)]="form.message" class="input-field"
                   placeholder="Ex: 🚚 Livraison offerte dès 100 TND d'achat !">
          </div>

          <!-- Type -->
          <div>
            <label class="label-field">Type & Style</label>
            <select [(ngModel)]="form.type" class="input-field">
              <option value="INFO">🟢 Information (Vert sombre)</option>
              <option value="PROMO">⚡ Promotion (Gradient Vert-Cyan)</option>
              <option value="ALERT">🔴 Alerte (Rouge)</option>
            </select>
          </div>

          <!-- Link label -->
          <div>
            <label class="label-field">Libellé du lien (optionnel)</label>
            <input [(ngModel)]="form.linkLabel" class="input-field" placeholder="Ex: Profiter de l'offre">
          </div>

          <!-- Link URL -->
          <div>
            <label class="label-field">URL / Lien de destination (optionnel)</label>
            <input [(ngModel)]="form.linkUrl" class="input-field" placeholder="Ex: /shop ou https://...">
          </div>

          <!-- Sort order -->
          <div>
            <label class="label-field">Ordre d'affichage</label>
            <input [(ngModel)]="form.sortOrder" type="number" class="input-field" placeholder="0">
          </div>

          <!-- Active checkbox -->
          <div class="flex items-center gap-2 pt-4">
            <input type="checkbox" id="activeChk" [(ngModel)]="form.active" class="w-4 h-4 accent-green-600 rounded cursor-pointer">
            <label for="activeChk" class="text-sm font-semibold text-slate-700 cursor-pointer">Actif immédiatement</label>
          </div>
        </div>

        <div class="flex gap-3 mt-5">
          <button (click)="save()" [disabled]="saving()" class="btn-primary">
            @if (saving()) { Enregistrement... } @else if (editingId()) { Modifier l'annonce } @else { ➕ Publier l'annonce }
          </button>
          @if (editingId()) {
            <button (click)="resetForm()" class="btn-outline">Annuler</button>
          }
        </div>
      </div>

      <!-- Announcements List Table -->
      <div class="card overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="font-bold text-slate-900">Annonces enregistrées ({{ announcements().length }})</h3>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-600">
              <tr>
                <th class="px-5 py-3 text-left">Ordre</th>
                <th class="px-5 py-3 text-left">Type</th>
                <th class="px-5 py-3 text-left">Message</th>
                <th class="px-5 py-3 text-left">Lien</th>
                <th class="px-5 py-3 text-left">Statut</th>
                <th class="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (a of announcements(); track a.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-5 py-3 font-mono font-bold text-slate-400">#{{ a.sortOrder }}</td>

                  <!-- Type Badge -->
                  <td class="px-5 py-3">
                    <span class="type-pill" [attr.data-type]="a.type">
                      {{ a.type }}
                    </span>
                  </td>

                  <!-- Message -->
                  <td class="px-5 py-3 font-medium text-slate-800">
                    {{ a.message }}
                  </td>

                  <!-- Link -->
                  <td class="px-5 py-3 text-slate-500 text-xs">
                    @if (a.linkUrl) {
                      <a [href]="a.linkUrl" target="_blank" class="text-cyan-600 underline hover:text-cyan-800">
                        {{ a.linkLabel || a.linkUrl }}
                      </a>
                    } @else {
                      <span class="text-gray-300">—</span>
                    }
                  </td>

                  <!-- Active Toggle Switch -->
                  <td class="px-5 py-3">
                    <button (click)="toggleActive(a)"
                            class="badge text-xs px-2.5 py-1 transition-colors cursor-pointer"
                            [class]="a.active ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'">
                      {{ a.active ? '🟢 Actif' : '⚪ Inactif' }}
                    </button>
                  </td>

                  <!-- Actions -->
                  <td class="px-5 py-3 text-right space-x-2">
                    <button (click)="edit(a)" class="text-xs font-semibold text-cyan-600 hover:text-cyan-800 hover:bg-cyan-50 px-2 py-1 rounded transition-colors">
                      ✏️ Éditer
                    </button>
                    <button (click)="delete(a.id!)" class="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded transition-colors">
                      🗑️ Supprimer
                    </button>
                  </td>
                </tr>
              }
              @if (announcements().length === 0) {
                <tr>
                  <td colspan="6" class="px-5 py-8 text-center text-gray-400">
                    Aucune annonce. Créez-en une ci-dessus pour la faire défiler sur le site !
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <style>
      .type-pill {
        display: inline-block; padding: 0.15rem 0.5rem; border-radius: 9999px;
        font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
      }
      .type-pill[data-type="INFO"]  { background: #dcfce7; color: #15803d; }
      .type-pill[data-type="PROMO"] { background: #cff4fc; color: #055160; }
      .type-pill[data-type="ALERT"] { background: #fee2e2; color: #b91c1c; }
    </style>
  `
})
export class AnnouncementAdminComponent implements OnInit {
  announcements = signal<Announcement[]>([]);
  editingId     = signal<number | null>(null);
  saving        = signal(false);

  form: Announcement = {
    message: '',
    type: 'INFO',
    active: true,
    linkUrl: '',
    linkLabel: '',
    sortOrder: 0
  };

  constructor(private svc: AnnouncementService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.svc.getAll().subscribe({
      next: data => this.announcements.set(data),
      error: () => this.toast.error('Erreur lors du chargement des annonces')
    });
  }

  save() {
    if (!this.form.message.trim()) {
      this.toast.error('Le message de l\'annonce est requis');
      return;
    }
    this.saving.set(true);

    if (this.editingId()) {
      this.svc.update(this.editingId()!, this.form).subscribe({
        next: () => {
          this.toast.success('Annonce mise à jour');
          this.resetForm();
          this.load();
          this.saving.set(false);
        },
        error: () => { this.toast.error('Erreur'); this.saving.set(false); }
      });
    } else {
      this.svc.create(this.form).subscribe({
        next: () => {
          this.toast.success('Annonce publiée avec succès !');
          this.resetForm();
          this.load();
          this.saving.set(false);
        },
        error: () => { this.toast.error('Erreur'); this.saving.set(false); }
      });
    }
  }

  edit(a: Announcement) {
    this.editingId.set(a.id!);
    this.form = { ...a };
  }

  toggleActive(a: Announcement) {
    if (!a.id) return;
    this.svc.toggle(a.id).subscribe({
      next: updated => {
        this.toast.success(updated.active ? 'Annonce activée' : 'Annonce désactivée');
        this.load();
      }
    });
  }

  delete(id: number) {
    if (!confirm('Voulez-vous vraiment supprimer cette annonce ?')) return;
    this.svc.delete(id).subscribe({
      next: () => {
        this.toast.success('Annonce supprimée');
        this.load();
      }
    });
  }

  resetForm() {
    this.editingId.set(null);
    this.form = { message: '', type: 'INFO', active: true, linkUrl: '', linkLabel: '', sortOrder: 0 };
  }
}
