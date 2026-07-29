import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/api.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { Supplier, PurchaseRequest, PurchaseRequestStatus, Product } from '../../../core/models/models';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">

      <!-- Sub-tabs -->
      <div class="flex gap-2 border-b border-gray-100 pb-3">
        <button (click)="subTab.set('suppliers')"
                class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                [class.bg-indigo-100]="subTab() === 'suppliers'"
                [class.text-indigo-700]="subTab() === 'suppliers'"
                [class.text-gray-500]="subTab() !== 'suppliers'">
          🏭 Répertoire Fournisseurs
        </button>
        <button (click)="subTab.set('requests')"
                class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                [class.bg-indigo-100]="subTab() === 'requests'"
                [class.text-indigo-700]="subTab() === 'requests'"
                [class.text-gray-500]="subTab() !== 'requests'">
          📋 Commandes Fournisseurs
          @if (pendingCount() > 0) {
            <span class="ml-1.5 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5">{{ pendingCount() }}</span>
          }
        </button>
      </div>

      <!-- ======================== SUPPLIERS TAB ======================== -->
      @if (subTab() === 'suppliers') {
        <div class="grid lg:grid-cols-3 gap-8">

          <!-- Left: Supplier list -->
          <div class="lg:col-span-2 space-y-4">
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-bold text-gray-900">Fournisseurs ({{ suppliers().length }})</h2>
            </div>

            @if (suppliers().length === 0) {
              <div class="text-center py-16 bg-gray-50 rounded-2xl text-gray-400">
                <div class="text-5xl mb-3">🏭</div>
                <p class="font-medium">Aucun fournisseur enregistré</p>
                <p class="text-sm mt-1">Ajoutez votre premier fournisseur à droite →</p>
              </div>
            } @else {
              <div class="space-y-3">
                @for (s of suppliers(); track s.id) {
                  <div class="bg-white border border-gray-200 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-sm transition-all">
                    <div class="flex justify-between items-start">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {{ s.name.charAt(0).toUpperCase() }}
                          </span>
                          <h3 class="font-bold text-gray-900 truncate">{{ s.name }}</h3>
                        </div>
                        <div class="ml-10 space-y-0.5 text-sm text-gray-500">
                          @if (s.contactName) { <p>👤 {{ s.contactName }}</p> }
                          @if (s.email) { <p>✉️ {{ s.email }}</p> }
                          @if (s.phone) { <p>📞 {{ s.phone }}</p> }
                          @if (s.address) { <p class="truncate">📍 {{ s.address }}</p> }
                          <p class="mt-1">
                            <span class="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium">
                              ⏱ {{ s.estimatedDeliveryDays }} jours de livraison
                            </span>
                          </p>
                        </div>
                      </div>
                      <div class="flex gap-2 flex-shrink-0 ml-2">
                        <button (click)="startEdit(s)" class="text-xs text-indigo-600 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg font-medium transition-colors">✏️ Modifier</button>
                        <button (click)="deleteSupplier(s.id)" class="text-xs text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg font-medium transition-colors">🗑</button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Right: Create/Edit form -->
          <div class="bg-white border border-gray-200 rounded-2xl p-6 h-fit sticky top-4">
            <h3 class="font-bold text-gray-900 mb-5">
              {{ editingSupplier() ? '✏️ Modifier Fournisseur' : '➕ Nouveau Fournisseur' }}
            </h3>
            <form (ngSubmit)="saveSupplier()" class="space-y-4">
              <div>
                <label class="label-field">Nom *</label>
                <input [(ngModel)]="supplierForm.name" name="name" required class="input-field" placeholder="PharmaCorp">
              </div>
              <div>
                <label class="label-field">Contact</label>
                <input [(ngModel)]="supplierForm.contactName" name="contact" class="input-field" placeholder="Ali Ben Salah">
              </div>
              <div>
                <label class="label-field">Email</label>
                <input [(ngModel)]="supplierForm.email" name="email" type="email" class="input-field" placeholder="contact@pharmacorp.tn">
              </div>
              <div>
                <label class="label-field">Téléphone</label>
                <input [(ngModel)]="supplierForm.phone" name="phone" class="input-field" placeholder="+216 XX XXX XXX">
              </div>
              <div>
                <label class="label-field">Adresse</label>
                <input [(ngModel)]="supplierForm.address" name="address" class="input-field" placeholder="Tunis, Tunisie">
              </div>
              <div>
                <label class="label-field">Délai de livraison estimé (jours)</label>
                <input [(ngModel)]="supplierForm.estimatedDeliveryDays" name="days" type="number" min="1" class="input-field">
              </div>
              <div class="flex gap-2 pt-2">
                <button type="submit" [disabled]="saving()" class="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50">
                  {{ saving() ? 'Enregistrement...' : (editingSupplier() ? 'Mettre à jour' : 'Ajouter') }}
                </button>
                @if (editingSupplier()) {
                  <button type="button" (click)="cancelEdit()" class="px-4 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                    Annuler
                  </button>
                }
              </div>
            </form>
          </div>
        </div>
      }

      <!-- ======================== PURCHASE REQUESTS TAB ======================== -->
      @if (subTab() === 'requests') {
        <div class="grid lg:grid-cols-5 gap-8">

          <!-- Left: Request list -->
          <div class="lg:col-span-3 space-y-4">
            <h2 class="text-xl font-bold text-gray-900">Commandes Fournisseurs ({{ purchaseRequests().length }})</h2>

            @if (purchaseRequests().length === 0) {
              <div class="text-center py-16 bg-gray-50 rounded-2xl text-gray-400">
                <div class="text-5xl mb-3">📋</div>
                <p class="font-medium">Aucune commande enregistrée</p>
                <p class="text-sm mt-1">Créez votre première commande à droite →</p>
              </div>
            } @else {
              <div class="space-y-4">
                @for (req of purchaseRequests(); track req.id) {
                  <div class="bg-white border rounded-2xl overflow-hidden transition-all hover:shadow-sm"
                       [class.border-gray-200]="req.status !== 'DELIVERED'"
                       [class.border-green-200]="req.status === 'DELIVERED'">
                    <div class="p-5">
                      <div class="flex justify-between items-start mb-3">
                        <div>
                          <div class="flex items-center gap-2">
                            <span class="font-bold text-gray-900">Commande #{{ req.id }}</span>
                            <span class="text-xs px-2.5 py-1 rounded-full font-semibold"
                                  [class]="statusClass(req.status)">
                              {{ statusLabel(req.status) }}
                            </span>
                          </div>
                          <p class="text-sm text-gray-500 mt-1">
                            🏭 {{ req.supplier.name }} · 📅 {{ req.orderDate | date:'dd/MM/yyyy' }}
                          </p>
                          @if (req.expectedDeliveryDate) {
                            <p class="text-xs text-gray-400 mt-0.5">
                              Livraison prévue: {{ req.expectedDeliveryDate | date:'dd/MM/yyyy' }}
                            </p>
                          }
                        </div>
                        <div class="text-right">
                          <p class="font-bold text-gray-900">{{ req.totalAmount | number:'1.2-2' }} TND</p>
                          <p class="text-xs text-gray-400">{{ req.items.length }} article(s)</p>
                        </div>
                      </div>

                      <!-- Items -->
                      <div class="bg-gray-50 rounded-xl p-3 mb-3 space-y-1">
                        @for (item of req.items; track item.id) {
                          <div class="flex justify-between text-sm">
                            <span class="text-gray-700">{{ item.productName }}</span>
                            <span class="text-gray-500">{{ item.quantity }} × {{ item.unitPrice | number:'1.2-2' }} TND</span>
                          </div>
                        }
                      </div>

                      <!-- Status Actions -->
                      @if (req.status !== 'DELIVERED' && req.status !== 'CANCELLED') {
                        <div class="flex gap-2 flex-wrap">
                          @if (req.status === 'PENDING') {
                            <button (click)="updateStatus(req.id, 'ORDERED')" class="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                              📦 Marquer Commandé
                            </button>
                          }
                          @if (req.status === 'ORDERED') {
                            <button (click)="updateStatus(req.id, 'SHIPPED')" class="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg font-medium hover:bg-purple-100 transition-colors">
                              🚚 Marquer Expédié
                            </button>
                          }
                          @if (req.status === 'ORDERED' || req.status === 'SHIPPED') {
                            <button (click)="updateStatus(req.id, 'DELIVERED')" class="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors">
                              ✅ Marquer Livré (+Stock auto)
                            </button>
                          }
                          <button (click)="updateStatus(req.id, 'CANCELLED')" class="text-xs px-3 py-1.5 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors">
                            ❌ Annuler
                          </button>
                        </div>
                      }

                      @if (req.status === 'DELIVERED') {
                        <p class="text-xs text-green-600 font-medium flex items-center gap-1">
                          <span>✅</span> Stock mis à jour automatiquement le {{ req.actualDeliveryDate | date:'dd/MM/yyyy à HH:mm' }}
                        </p>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Right: New Request form -->
          <div class="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 h-fit sticky top-4 space-y-5">
            <h3 class="font-bold text-gray-900">📋 Nouvelle Commande</h3>

            <div>
              <label class="label-field">Fournisseur *</label>
              <select [(ngModel)]="newRequest.supplierId" class="input-field">
                <option [ngValue]="null">— Sélectionner un fournisseur —</option>
                @for (s of suppliers(); track s.id) {
                  <option [ngValue]="s.id">{{ s.name }}</option>
                }
              </select>
            </div>

            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="label-field mb-0">Articles</label>
                <button (click)="addItem()" type="button" class="text-xs text-indigo-600 font-semibold hover:underline">+ Ajouter</button>
              </div>
              <div class="space-y-3">
                @for (item of newRequest.items; track $index; let i = $index) {
                  <div class="bg-gray-50 p-3 rounded-xl space-y-2">
                    <div class="flex justify-between items-center">
                      <span class="text-xs font-semibold text-gray-500">Article {{ i + 1 }}</span>
                      @if (newRequest.items.length > 1) {
                        <button (click)="removeItem(i)" type="button" class="text-red-400 hover:text-red-600 text-xs">✕</button>
                      }
                    </div>
                    <select [(ngModel)]="item.productId" class="input-field py-2 text-sm">
                      <option [ngValue]="null">— Produit —</option>
                      @for (p of products(); track p.id) {
                        <option [ngValue]="p.id">{{ p.name }}</option>
                      }
                    </select>
                    <div class="grid grid-cols-2 gap-2">
                      <div>
                        <label class="text-xs text-gray-500 mb-1 block">Qté</label>
                        <input type="number" [(ngModel)]="item.quantity" min="1" class="input-field py-2 text-sm">
                      </div>
                      <div>
                        <label class="text-xs text-gray-500 mb-1 block">Prix unit. (TND)</label>
                        <input type="number" [(ngModel)]="item.unitPrice" step="0.01" min="0" class="input-field py-2 text-sm">
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Total preview -->
            @if (newRequest.items.length > 0) {
              <div class="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span class="text-sm text-gray-500">Total estimé</span>
                <span class="font-bold text-gray-900">{{ requestTotal() | number:'1.2-2' }} TND</span>
              </div>
            }

            <button (click)="submitRequest()" [disabled]="saving()"
                    class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50">
              {{ saving() ? 'Création...' : 'Créer la commande' }}
            </button>
          </div>

        </div>
      }

    </div>
  `
})
export class SuppliersComponent implements OnInit {
  private adminSvc = inject(AdminService);
  private productSvc = inject(ProductService);
  private toastSvc = inject(ToastService);

  subTab = signal<'suppliers' | 'requests'>('suppliers');
  suppliers = signal<Supplier[]>([]);
  purchaseRequests = signal<PurchaseRequest[]>([]);
  products = signal<Product[]>([]);
  saving = signal(false);

  editingSupplier = signal<Supplier | null>(null);
  supplierForm: Partial<Supplier> = this.emptyForm();

  newRequest: { supplierId: number | null; items: { productId: number | null; quantity: number; unitPrice: number }[] } = {
    supplierId: null,
    items: [{ productId: null, quantity: 1, unitPrice: 0 }]
  };

  pendingCount = computed(() => this.purchaseRequests().filter(r => r.status === 'PENDING' || r.status === 'ORDERED').length);

  requestTotal = computed(() =>
    this.newRequest.items.reduce((sum, i) => sum + (i.quantity || 0) * (i.unitPrice || 0), 0)
  );

  ngOnInit() {
    this.loadSuppliers();
    this.loadRequests();
    this.productSvc.getProducts(0, 1000).subscribe(page => this.products.set(page.content));
  }

  loadSuppliers() {
    this.adminSvc.getSuppliers().subscribe({ next: (s) => this.suppliers.set(s), error: () => {} });
  }

  loadRequests() {
    this.adminSvc.getPurchaseRequests().subscribe({ next: (r) => this.purchaseRequests.set(r), error: () => {} });
  }

  emptyForm(): Partial<Supplier> {
    return { name: '', contactName: '', email: '', phone: '', address: '', estimatedDeliveryDays: 7 };
  }

  startEdit(s: Supplier) {
    this.editingSupplier.set(s);
    this.supplierForm = { ...s };
  }

  cancelEdit() {
    this.editingSupplier.set(null);
    this.supplierForm = this.emptyForm();
  }

  saveSupplier() {
    if (!this.supplierForm.name?.trim()) { this.toastSvc.error('Le nom est obligatoire'); return; }
    this.saving.set(true);
    const editing = this.editingSupplier();
    const obs = editing
      ? this.adminSvc.updateSupplier(editing.id, this.supplierForm)
      : this.adminSvc.createSupplier(this.supplierForm);

    obs.subscribe({
      next: () => {
        this.toastSvc.success(editing ? 'Fournisseur mis à jour' : 'Fournisseur ajouté');
        this.saving.set(false);
        this.cancelEdit();
        this.loadSuppliers();
      },
      error: (err) => {
        this.toastSvc.error(err.error?.message || 'Erreur lors de la sauvegarde');
        this.saving.set(false);
      }
    });
  }

  deleteSupplier(id: number) {
    if (!confirm('Supprimer ce fournisseur ?')) return;
    this.adminSvc.deleteSupplier(id).subscribe({
      next: () => { this.toastSvc.success('Fournisseur supprimé'); this.loadSuppliers(); },
      error: () => this.toastSvc.error('Impossible de supprimer ce fournisseur')
    });
  }

  addItem() {
    this.newRequest.items.push({ productId: null, quantity: 1, unitPrice: 0 });
  }

  removeItem(i: number) {
    this.newRequest.items.splice(i, 1);
  }

  submitRequest() {
    if (!this.newRequest.supplierId) { this.toastSvc.error('Veuillez sélectionner un fournisseur'); return; }
    const validItems = this.newRequest.items.filter(i => i.productId && i.quantity > 0);
    if (validItems.length === 0) { this.toastSvc.error('Ajoutez au moins un article valide'); return; }

    this.saving.set(true);
    const payload = { supplierId: this.newRequest.supplierId, items: validItems };

    this.adminSvc.createPurchaseRequest(payload).subscribe({
      next: () => {
        this.toastSvc.success('Commande créée avec succès');
        this.saving.set(false);
        this.newRequest = { supplierId: null, items: [{ productId: null, quantity: 1, unitPrice: 0 }] };
        this.loadRequests();
        this.subTab.set('requests');
      },
      error: (err) => {
        this.toastSvc.error(err.error?.message || 'Erreur lors de la création');
        this.saving.set(false);
      }
    });
  }

  updateStatus(id: number, status: string) {
    const label = status === 'DELIVERED' ? 'Cela ajoutera automatiquement le stock. Confirmer ?' : 'Confirmer le changement de statut ?';
    if (!confirm(label)) return;
    this.adminSvc.updatePurchaseRequestStatus(id, status).subscribe({
      next: () => {
        this.toastSvc.success('Statut mis à jour');
        this.loadRequests();
      },
      error: () => this.toastSvc.error('Erreur lors de la mise à jour')
    });
  }

  statusLabel(s: PurchaseRequestStatus): string {
    const map: Record<PurchaseRequestStatus, string> = {
      PENDING: '⏳ En attente', ORDERED: '📦 Commandé',
      SHIPPED: '🚚 Expédié', DELIVERED: '✅ Livré', CANCELLED: '❌ Annulé'
    };
    return map[s] ?? s;
  }

  statusClass(s: PurchaseRequestStatus): string {
    const map: Record<PurchaseRequestStatus, string> = {
      PENDING: 'bg-orange-100 text-orange-700',
      ORDERED: 'bg-blue-100 text-blue-700',
      SHIPPED: 'bg-purple-100 text-purple-700',
      DELIVERED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-500'
    };
    return map[s] ?? 'bg-gray-100 text-gray-600';
  }
}
