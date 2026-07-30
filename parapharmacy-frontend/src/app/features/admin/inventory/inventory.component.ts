import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/api.service';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/models';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-display font-bold text-gray-900">📦 Gestion des Stocks</h1>
          <p class="text-xs text-gray-500 mt-1">Scanner d'inventaire prêt (Pistolet USB/Bluetooth actif)</p>
        </div>

        <!-- Scanner Widget -->
        <div class="bg-emerald-900 text-white rounded-2xl px-5 py-3 flex items-center gap-4 shadow-lg shadow-emerald-900/20 border border-emerald-700/50">
          <div class="relative flex items-center justify-center w-3 h-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
          </div>
          <div>
            <div class="text-xs font-bold text-emerald-300 uppercase tracking-wider">Pistolet Code-Barres</div>
            <div class="text-xs text-emerald-100">
              @if (lastScannedBarcode()) {
                Scanné: <code class="font-mono bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-300">{{ lastScannedBarcode() }}</code>
              } @else {
                En attente de détection...
              }
            </div>
          </div>
          <button (click)="openQuickScanModal()" class="ml-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-xl font-bold text-xs transition-all">
            ⚡ Scan Rapide
          </button>
        </div>
      </div>

      <!-- Alerts Section -->
      @if (!loadingAlerts()) {
        <div class="grid md:grid-cols-3 gap-6 mb-12">
          
          <!-- Low Stock -->
          <div class="bg-red-50 rounded-2xl p-6 border border-red-100">
            <h3 class="text-red-800 font-semibold mb-4 flex items-center gap-2">
              <span class="text-xl">⚠️</span> Stock Faible
            </h3>
            @if (alerts()?.lowStock?.length === 0) {
              <p class="text-red-600 text-sm">Aucune alerte</p>
            } @else {
              <div class="space-y-3">
                @for (p of alerts()?.lowStock; track p.id) {
                  <div class="flex justify-between items-center text-sm">
                    <span class="text-red-900 font-medium truncate pr-2">{{p.name}}</span>
                    <span class="bg-red-200 text-red-800 px-2 py-0.5 rounded-full font-bold">{{p.stock}} left</span>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Expiring Soon -->
          <div class="bg-amber-50 rounded-2xl p-6 border border-amber-100">
            <h3 class="text-amber-800 font-semibold mb-4 flex items-center gap-2">
              <span class="text-xl">⏳</span> Expire Bientôt (< 30 j)
            </h3>
            @if (alerts()?.expiring?.length === 0) {
              <p class="text-amber-600 text-sm">Aucune alerte</p>
            } @else {
              <div class="space-y-3">
                @for (b of alerts()?.expiring; track b.batchId) {
                  <div class="flex justify-between items-center text-sm border-b border-amber-200 pb-2">
                    <div class="truncate pr-2">
                      <span class="text-amber-900 font-medium block truncate">{{b.productName}}</span>
                      <span class="text-amber-700 text-xs">Lot: {{b.batchNumber}} (Qte: {{b.quantity}})</span>
                    </div>
                    <span class="text-amber-800 font-bold whitespace-nowrap">{{b.expirationDate | date:'dd/MM/yy'}}</span>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Not Selling -->
          <div class="bg-blue-50 rounded-2xl p-6 border border-blue-100">
            <h3 class="text-blue-800 font-semibold mb-4 flex items-center gap-2">
              <span class="text-xl">💤</span> Invendus (> 45 j)
            </h3>
            @if (alerts()?.notSelling?.length === 0) {
              <p class="text-blue-600 text-sm">Aucune alerte</p>
            } @else {
              <div class="space-y-3 max-h-48 overflow-y-auto pr-2">
                @for (p of alerts()?.notSelling; track p.id) {
                  <div class="text-sm text-blue-900 font-medium truncate mb-2">
                    • {{p.name}}
                  </div>
                }
              </div>
            }
          </div>

        </div>
      }

      <!-- Products Inventory Table -->
      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-12">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-900">Produits & Stock</h2>
          <div class="flex gap-3">
            <button (click)="exportCsv()" class="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-medium text-sm hover:bg-indigo-100 transition-colors flex items-center gap-2">
              <span>📥</span> Exporter CSV
            </button>
            <input type="text" [(ngModel)]="searchQuery" placeholder="Rechercher..." class="input-field max-w-xs">
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                <th class="p-4 font-semibold">Produit</th>
                <th class="p-4 font-semibold">Code-barres</th>
                <th class="p-4 font-semibold text-center">Stock Global</th>
                <th class="p-4 font-semibold text-center">Seuil d'alerte</th>
                <th class="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (p of filteredProducts(); track p.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="p-4">
                    <div class="flex items-center gap-3">
                      <img [src]="p.imageUrl" class="w-10 h-10 rounded-lg object-cover bg-gray-100" onerror="this.src='https://placehold.co/40'">
                      <div>
                        <div class="font-medium text-gray-900">{{ p.name }}</div>
                        <div class="text-xs text-gray-500">{{ p.brand }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="p-4 font-mono text-xs text-gray-500">
                    {{ p.barcode || '—' }}
                  </td>
                  <td class="p-4 text-center">
                    <span class="inline-flex items-center justify-center px-2.5 py-1 rounded-full font-bold text-sm"
                          [class.bg-green-100]="p.stock > p.minStockLevel" [class.text-green-800]="p.stock > p.minStockLevel"
                          [class.bg-red-100]="p.stock <= p.minStockLevel" [class.text-red-800]="p.stock <= p.minStockLevel">
                      {{ p.stock }}
                    </span>
                  </td>
                  <td class="p-4 text-center text-gray-600">{{ p.minStockLevel }}</td>
                  <td class="p-4 text-right space-x-2">
                    <button (click)="openBatchesModal(p)" class="text-sm font-medium text-primary-600 hover:text-primary-800 bg-primary-50 px-3 py-1 rounded-lg">Gérer Lots</button>
                    <button (click)="openAddStockModal(p)" class="text-sm font-medium text-green-600 hover:text-green-800 bg-green-50 px-3 py-1 rounded-lg">+ Ajouter</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modals Overlay -->
    @if (activeModal()) {
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div class="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
          
          <!-- Add Stock Modal -->
          @if (activeModal() === 'ADD_STOCK') {
            <div class="p-8">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900">Ajouter du stock</h2>
                <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <p class="text-gray-600 mb-6 font-medium">Produit : <span class="text-primary-700">{{ selectedProduct()?.name }}</span></p>

              <form (ngSubmit)="submitAddStock()" class="space-y-5">
                <div class="grid grid-cols-2 gap-5">
                  <div>
                    <label class="label-field">N° de Lot (Batch)</label>
                    <input type="text" [(ngModel)]="addStockData.batchNumber" name="batch" required class="input-field" placeholder="Ex: L-2023-45">
                  </div>
                  <div>
                    <label class="label-field">Fournisseur</label>
                    <input type="text" [(ngModel)]="addStockData.supplier" name="supplier" class="input-field" placeholder="Ex: PharmaCorp">
                  </div>
                  <div>
                    <label class="label-field">Quantité</label>
                    <input type="number" [(ngModel)]="addStockData.quantity" name="qty" required min="1" class="input-field">
                  </div>
                  <div>
                    <label class="label-field">Prix d'achat unitaire (TND)</label>
                    <input type="number" [(ngModel)]="addStockData.purchasePrice" name="price" step="0.01" class="input-field">
                  </div>
                  <div class="col-span-2">
                    <label class="label-field">Date d'expiration</label>
                    <input type="date" [(ngModel)]="addStockData.expirationDate" name="exp" required class="input-field">
                  </div>
                </div>
                <button type="submit" [disabled]="submitting()" class="btn-primary w-full justify-center py-3 mt-4">
                  {{ submitting() ? 'Enregistrement...' : "Confirmer l'ajout" }}
                </button>
              </form>
            </div>
          }

          <!-- Manage Batches / Adjust Stock Modal -->
          @if (activeModal() === 'MANAGE_BATCHES') {
            <div class="p-8">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900">Gérer les lots</h2>
                <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <p class="text-gray-600 mb-6 font-medium">Produit : <span class="text-primary-700">{{ selectedProduct()?.name }}</span></p>

              @if (batchesLoading()) {
                <div class="text-center py-8 text-gray-500">Chargement des lots...</div>
              } @else if (productBatches().length === 0) {
                <div class="text-center py-8 bg-gray-50 rounded-xl text-gray-500">Aucun lot actif pour ce produit.</div>
              } @else {
                <div class="space-y-4">
                  @for (b of productBatches(); track b.id) {
                    <div class="border border-gray-200 rounded-xl p-4">
                      <div class="flex justify-between items-start mb-3">
                        <div>
                          <span class="font-bold text-gray-900">Lot: {{ b.batchNumber }}</span>
                          <span class="text-xs text-gray-500 ml-2">Exp: {{ b.expirationDate | date:'dd/MM/yyyy' }}</span>
                        </div>
                        <span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">Qte: {{ b.quantity }}</span>
                      </div>

                      <div class="bg-gray-50 p-4 rounded-lg mt-3 flex gap-3 items-end">
                        <div class="flex-1">
                          <label class="text-xs font-semibold text-gray-600 uppercase mb-1 block">Ajustement</label>
                          <select #typeSelect class="input-field py-2">
                            <option value="DAMAGED">Signaler Endommagé (-)</option>
                            <option value="RETURN">Retour Client (+)</option>
                          </select>
                        </div>
                        <div class="w-24">
                          <label class="text-xs font-semibold text-gray-600 uppercase mb-1 block">Qte</label>
                          <input type="number" #qtyInput min="1" [max]="b.quantity" class="input-field py-2" value="1">
                        </div>
                        <div class="flex-1">
                          <label class="text-xs font-semibold text-gray-600 uppercase mb-1 block">Raison</label>
                          <input type="text" #reasonInput class="input-field py-2" placeholder="Ex: Cassé">
                        </div>
                        <button (click)="submitAdjustment(b.id, typeSelect.value, qtyInput.value, reasonInput.value)" 
                                [disabled]="submitting()"
                                class="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 h-[42px]">
                          OK
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          <!-- Quick Scan Barcode Modal -->
          @if (activeModal() === 'QUICK_SCAN') {
            <div class="p-8">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span>⚡</span> Scanner de Code-Barres
                </h2>
                <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>

              <div class="bg-slate-900 text-white rounded-2xl p-6 mb-6 text-center space-y-3">
                <div class="text-4xl animate-bounce">📱</div>
                <p class="font-bold text-slate-200">Utilisez votre pistolet scanner ou saisissez manuellement :</p>
                <div class="flex gap-2 max-w-md mx-auto">
                  <input #manualInput type="text" [(ngModel)]="manualBarcode" 
                         (keyup.enter)="onBarcodeScanned(manualBarcode); manualBarcode=''"
                         placeholder="Code-barres (ex: 3337875543219)" 
                         class="input-field bg-slate-800 border-slate-700 text-white placeholder-slate-500 font-mono">
                  <button (click)="onBarcodeScanned(manualBarcode); manualBarcode=''" 
                          class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl font-bold text-sm">
                    Chercher
                  </button>
                </div>
              </div>

              @if (scannedProduct()) {
                <div class="border-2 border-emerald-500/30 bg-emerald-50/50 rounded-2xl p-6 space-y-4">
                  <div class="flex items-center gap-4">
                    <img [src]="scannedProduct()!.imageUrl" class="w-16 h-16 rounded-xl object-cover bg-white border border-emerald-100" onerror="this.src='https://placehold.co/64'">
                    <div class="flex-1">
                      <h3 class="font-bold text-slate-900 text-lg">{{ scannedProduct()!.name }}</h3>
                      <p class="text-xs text-slate-500">{{ scannedProduct()!.brand }} · Code: <code class="font-mono text-emerald-700">{{ scannedProduct()!.barcode }}</code></p>
                      <p class="text-sm font-semibold text-emerald-600 mt-1">Stock actuel : {{ scannedProduct()!.stock }} unité(s)</p>
                    </div>
                  </div>
                  <div class="flex gap-3 pt-2">
                    <button (click)="openAddStockModal(scannedProduct()!)" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-sm">
                      + Ajouter du Stock
                    </button>
                    <button (click)="openBatchesModal(scannedProduct()!)" class="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-xl font-bold text-sm">
                      Gérer les Lots
                    </button>
                  </div>
                </div>
              }
            </div>
          }

        </div>
      </div>
    }

  `
})
export class InventoryComponent implements OnInit {
  private adminSvc = inject(AdminService);
  private productSvc = inject(ProductService);
  private toastSvc = inject(ToastService);

  alerts = signal<any>(null);
  loadingAlerts = signal(true);
  
  products = signal<Product[]>([]);
  searchQuery = '';
  
  activeModal = signal<'ADD_STOCK' | 'MANAGE_BATCHES' | 'QUICK_SCAN' | null>(null);
  selectedProduct = signal<Product | null>(null);
  scannedProduct = signal<Product | null>(null);
  
  addStockData: any = {};
  submitting = signal(false);

  productBatches = signal<any[]>([]);
  batchesLoading = signal(false);

  lastScannedBarcode = signal<string | null>(null);
  manualBarcode = '';
  private barcodeBuffer = '';
  private lastKeyTime = Date.now();

  @HostListener('window:keydown', ['$event'])
  handleGlobalKeyboard(event: KeyboardEvent) {
    const now = Date.now();
    const timeDiff = now - this.lastKeyTime;
    this.lastKeyTime = now;

    // Reset buffer if human delay (> 80ms per key)
    if (timeDiff > 80) {
      this.barcodeBuffer = '';
    }

    if (event.key === 'Enter') {
      if (this.barcodeBuffer.length >= 4) {
        this.onBarcodeScanned(this.barcodeBuffer);
        this.barcodeBuffer = '';
      }
    } else if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
      this.barcodeBuffer += event.key;
    }
  }

  ngOnInit() {
    this.loadAlerts();
    this.loadProducts();
  }

  loadAlerts() {
    this.loadingAlerts.set(true);
    this.adminSvc.getInventoryAlerts().subscribe({
      next: (res) => { this.alerts.set(res); this.loadingAlerts.set(false); },
      error: () => this.loadingAlerts.set(false)
    });
  }

  loadProducts() {
    this.productSvc.getProducts(0, 1000).subscribe(page => {
      this.products.set(page.content);
    });
  }

  filteredProducts() {
    if (!this.searchQuery) return this.products();
    const q = this.searchQuery.toLowerCase();
    return this.products().filter(p => p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
  }

  openAddStockModal(p: Product) {
    this.selectedProduct.set(p);
    this.addStockData = {
      productId: p.id,
      batchNumber: '', supplier: '', purchasePrice: null, quantity: 1, expirationDate: ''
    };
    this.activeModal.set('ADD_STOCK');
  }

  openBatchesModal(p: Product) {
    this.selectedProduct.set(p);
    this.productBatches.set([]);
    this.activeModal.set('MANAGE_BATCHES');
    this.batchesLoading.set(true);
    
    this.adminSvc.getProductBatches(p.id).subscribe({
      next: (batches) => {
        this.productBatches.set(batches.filter(b => b.quantity > 0)); // Only show active batches
        this.batchesLoading.set(false);
      },
      error: () => {
        this.toastSvc.error('Erreur lors du chargement des lots');
        this.batchesLoading.set(false);
      }
    });
  }

  closeModal() {
    this.activeModal.set(null);
    this.selectedProduct.set(null);
    this.scannedProduct.set(null);
  }

  openQuickScanModal() {
    this.activeModal.set('QUICK_SCAN');
  }

  onBarcodeScanned(barcode: string) {
    if (!barcode) return;
    const cleanBarcode = barcode.trim();
    this.lastScannedBarcode.set(cleanBarcode);
    
    this.productSvc.getProductByBarcode(cleanBarcode).subscribe({
      next: (product) => {
        this.scannedProduct.set(product);
        this.toastSvc.success(`Produit scanné : ${product.name}`);
        if (this.activeModal() !== 'QUICK_SCAN') {
          this.activeModal.set('QUICK_SCAN');
        }
      },
      error: () => {
        // Fallback: search by name/barcode substring in loaded products
        const localMatch = this.products().find(p => p.barcode === cleanBarcode || p.name.toLowerCase().includes(cleanBarcode.toLowerCase()));
        if (localMatch) {
          this.scannedProduct.set(localMatch);
          this.toastSvc.success(`Produit trouvé : ${localMatch.name}`);
        } else {
          this.toastSvc.error(`Aucun produit trouvé pour le code-barres : ${cleanBarcode}`);
        }
      }
    });
  }

  submitAddStock() {
    if (!this.addStockData.batchNumber || !this.addStockData.quantity || !this.addStockData.expirationDate) {
      this.toastSvc.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.submitting.set(true);
    this.adminSvc.addStock(this.addStockData).subscribe({
      next: () => {
        this.toastSvc.success('Stock ajouté avec succès');
        this.submitting.set(false);
        this.closeModal();
        this.loadProducts(); // Refresh stock
        this.loadAlerts(); // Refresh alerts
      },
      error: (err) => {
        this.toastSvc.error(err.error?.message || "Erreur lors de l'ajout");
        this.submitting.set(false);
      }
    });
  }

  submitAdjustment(batchId: number, type: string, qtyStr: string, reason: string) {
    const quantity = parseInt(qtyStr, 10);
    if (!quantity || quantity <= 0) {
      this.toastSvc.error('Quantité invalide');
      return;
    }
    if (!reason) {
      this.toastSvc.error('Une raison est requise');
      return;
    }

    this.submitting.set(true);
    const payload = {
      productId: this.selectedProduct()!.id,
      batchId: batchId,
      type: type,
      quantity: quantity,
      reason: reason
    };

    this.adminSvc.adjustStock(payload).subscribe({
      next: () => {
        this.toastSvc.success('Stock ajusté avec succès');
        this.submitting.set(false);
        // Refresh batches
        this.openBatchesModal(this.selectedProduct()!);
        this.loadProducts();
        this.loadAlerts();
      },
      error: (err) => {
        this.toastSvc.error(err.error?.message || "Erreur lors de l'ajustement");
        this.submitting.set(false);
      }
    });
  }

  exportCsv() {
    this.adminSvc.exportStockCsv().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stock_report.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.toastSvc.success('Export CSV réussi');
      },
      error: () => this.toastSvc.error("Erreur lors de l'export CSV")
    });
  }
}
