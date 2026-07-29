import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { AdminService } from '../../core/services/api.service';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { Order, Category, Product } from '../../core/models/models';
import { InventoryComponent } from './inventory/inventory.component';
import { SuppliersComponent } from './suppliers/suppliers.component';

import { AnnouncementAdminComponent } from './announcement-admin/announcement-admin.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BaseChartDirective, InventoryComponent, SuppliersComponent, AnnouncementAdminComponent],
  template: `
    <!-- ── Confirmation Modal ── -->
    @if (confirmDialog().show) {
      <div class="confirm-overlay" (click)="cancelConfirm()">
        <div class="confirm-modal" (click)="$event.stopPropagation()">
          <div class="confirm-icon">⚠️</div>
          <h3 class="confirm-title">Confirmer la suppression</h3>
          <p class="confirm-msg">{{ confirmDialog().message }}</p>
          <div class="confirm-actions">
            <button (click)="cancelConfirm()" class="confirm-btn-cancel">Annuler</button>
            <button (click)="executeConfirm()" class="confirm-btn-delete">🗑 Supprimer</button>
          </div>
        </div>
      </div>
    }

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-10 h-10 bg-sage-500 rounded-xl flex items-center justify-center">
          <span class="text-white text-lg">🔑</span>
        </div>
        <div>
          <h1 class="font-display text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p class="text-gray-500 text-sm">pharma_alyosr Administration</p>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-10">
        @for (stat of stats(); track stat.label) {
          <div class="card p-6">
            <div class="flex items-center justify-between mb-3">
              <span class="text-2xl">{{ stat.icon }}</span>
              <span class="badge badge-new text-xs">Live</span>
            </div>
            <p class="text-3xl font-bold font-display text-gray-900">{{ stat.value }}</p>
            <p class="text-sm text-gray-500 mt-1">{{ stat.label }}</p>
          </div>
        }
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6 border-b border-gray-100 pb-2">
        @for (tab of tabs; track tab.key) {
          <button (click)="activeTab.set(tab.key)"
                  class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  [class.bg-sage-100]="activeTab() === tab.key"
                  [class.text-sage-700]="activeTab() === tab.key"
                  [class.text-gray-500]="activeTab() !== tab.key">
            {{ tab.icon }} {{ tab.label }}
          </button>
        }
      </div>

      <!-- Inventory Tab -->
      @if (activeTab() === 'inventory') {
        <app-inventory></app-inventory>
      }

      <!-- Suppliers Tab -->
      @if (activeTab() === 'suppliers') {
        <app-suppliers></app-suppliers>
      }


      <!-- Announcements Ticker Tab -->
      @if (activeTab() === 'announcements') {
        <app-announcement-admin></app-announcement-admin>
      }

      <!-- Analytics Tab -->
      @if (activeTab() === 'analytics') {
        <div class="space-y-6">

          <!-- Low Stock Alert Banner -->
          @if (lowStockAlerts().length > 0) {
            <div class="alert-banner">
              <span class="text-lg">🔥</span>
              <div class="flex-1">
                <p class="font-bold text-orange-900">Alerte Stock Faible — {{ lowStockAlerts().length }} produit(s) en rupture imminente</p>
                <div class="flex flex-wrap gap-2 mt-2">
                  @for (p of lowStockAlerts(); track p.id) {
                    <span class="low-stock-chip">{{ p.name }} — <strong>{{ p.stock }} restant(s)</strong></span>
                  }
                </div>
              </div>
            </div>
          }

          <!-- KPI Row (Revenue + Orders) -->
          <div class="grid md:grid-cols-3 gap-5">
            <div class="analytics-card">
              <p class="analytics-label">Revenu total</p>
              <p class="analytics-value" style="color:#16a34a">{{ totalRevenue() | number:'1.2-2' }} TND</p>
              <p class="analytics-sub">Commandes payées / livrées</p>
            </div>
            <div class="analytics-card">
              <p class="analytics-label">Commandes (30j)</p>
              <p class="analytics-value">{{ ordersChart().length > 0 ? sumChart(ordersChart(), 'count') : orders().length }}</p>
              <p class="analytics-sub">Derniers 30 jours</p>
            </div>
            <div class="analytics-card">
              <p class="analytics-label">Revenu (30j)</p>
              <p class="analytics-value" style="color:#0891b2">{{ sumChart(revenueChart(), 'revenue') | number:'1.2-2' }} TND</p>
              <p class="analytics-sub">Derniers 30 jours</p>
            </div>
          </div>

          <!-- Revenue Bar Chart -->
          <div class="chart-card">
            <h3 class="chart-title">📊 Revenu par jour (30 derniers jours)</h3>
            @if (revenueChart().length === 0) {
              <div class="chart-empty">Aucune donnée de paiement pour la période</div>
            } @else {
              <div style="display: block; height: 300px;">
                <canvas baseChart
                  [data]="revenueChartData"
                  [options]="barChartOptions"
                  [type]="'bar'">
                </canvas>
              </div>
            }
          </div>

          <!-- Orders Bar Chart -->
          <div class="chart-card">
            <h3 class="chart-title">📦 Commandes par jour (30 derniers jours)</h3>
            @if (ordersChart().length === 0) {
              <div class="chart-empty">Aucune commande pour la période</div>
            } @else {
              <div style="display: block; height: 300px;">
                <canvas baseChart
                  [data]="ordersChartData"
                  [options]="lineChartOptions"
                  [type]="'line'">
                </canvas>
              </div>
            }
          </div>

          <!-- Growth & Categories -->
          <div class="grid md:grid-cols-2 gap-5">
            <div class="chart-card">
              <h3 class="chart-title">📈 Croissance des Utilisateurs</h3>
              @if (userGrowthChart().length === 0) {
                <div class="chart-empty">Aucune donnée</div>
              } @else {
                <div style="display: block; height: 300px;">
                  <canvas baseChart
                    [data]="userGrowthChartData"
                    [options]="lineChartOptions"
                    [type]="'line'">
                  </canvas>
                </div>
              }
            </div>

            <div class="chart-card">
              <h3 class="chart-title">🧩 Revenu par Catégorie</h3>
              @if (revenueByCategoryChart().length === 0) {
                <div class="chart-empty">Aucune donnée</div>
              } @else {
                <div style="display: block; height: 300px; padding: 20px;">
                  <canvas baseChart
                    [data]="categoryChartData"
                    [options]="pieChartOptions"
                    [type]="'doughnut'">
                  </canvas>
                </div>
              }
            </div>
          </div>

          <!-- Bottom row: Top Products + Status -->
          <div class="grid md:grid-cols-2 gap-5">

            <!-- Top 10 Best Sellers -->
            <div class="chart-card">
              <h3 class="chart-title">🏆 Top 10 Produits</h3>
              @if (topProducts().length === 0) {
                <div class="chart-empty">Aucune vente enregistrée</div>
              } @else {
                <div class="space-y-2 mt-3">
                  @for (p of topProducts(); track p.id; let i = $index) {
                    <div class="top-product-row">
                      <span class="rank-badge">{{ i + 1 }}</span>
                      <span class="flex-1 text-sm font-semibold text-slate-800 truncate">{{ p.name }}</span>
                      <span class="text-xs text-slate-400 mr-2">{{ p.quantity }} vendus</span>
                      <span class="text-sm font-bold" style="color:#16a34a">{{ p.revenue | number:'1.0-0' }} TND</span>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Orders by Status -->
            <div class="chart-card">
              <h3 class="chart-title">🔢 Commandes par statut</h3>
              <div class="space-y-3 mt-3">
                @for (entry of statusEntries(); track entry.status) {
                  <div class="status-row">
                    <span class="status-dot" [style.background]="statusColor(entry.status)"></span>
                    <span class="flex-1 text-sm text-slate-700">{{ entry.status }}</span>
                    <span class="text-sm font-bold text-slate-900">{{ entry.count }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Promo Codes Tab -->
      @if (activeTab() === 'promo') {
        <div class="space-y-6">
          <!-- Create promo -->
          <div class="card p-6">
            <h2 class="font-bold text-slate-900 mb-4">➕ Créer un code promo</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="label-field">Code</label>
                <input [(ngModel)]="newPromo.code" class="input-field uppercase" placeholder="EX: PHARMA10">
              </div>
              <div>
                <label class="label-field">Type</label>
                <select [(ngModel)]="newPromo.type" class="input-field">
                  <option value="PERCENTAGE">Pourcentage (%)</option>
                  <option value="FIXED_AMOUNT">Montant fixe (TND)</option>
                </select>
              </div>
              <div>
                <label class="label-field">Valeur</label>
                <input [(ngModel)]="newPromo.value" class="input-field" type="number" placeholder="10">
              </div>
              <div>
                <label class="label-field">Montant min. panier</label>
                <input [(ngModel)]="newPromo.minOrderAmount" class="input-field" type="number" placeholder="Optionnel">
              </div>
              <div>
                <label class="label-field">Utilisations max.</label>
                <input [(ngModel)]="newPromo.maxUses" class="input-field" type="number" placeholder="Illimité">
              </div>
              <div>
                <label class="label-field">Description (note interne)</label>
                <input [(ngModel)]="newPromo.description" class="input-field" placeholder="Optionnel">
              </div>
            </div>
            <button (click)="createPromo()" [disabled]="creatingPromo()" class="btn-primary mt-4">
              @if (creatingPromo()) { Création... } @else { Créer le code }
            </button>
          </div>
          <!-- Promo list -->
          <div class="card overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-5 py-3 text-left font-semibold text-gray-700">Code</th>
                    <th class="px-5 py-3 text-left font-semibold text-gray-700">Type</th>
                    <th class="px-5 py-3 text-left font-semibold text-gray-700">Valeur</th>
                    <th class="px-5 py-3 text-left font-semibold text-gray-700">Utilisations</th>
                    <th class="px-5 py-3 text-left font-semibold text-gray-700">Statut</th>
                    <th class="px-5 py-3 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (p of promos(); track p.id) {
                    <tr class="hover:bg-gray-50">
                      <td class="px-5 py-3 font-bold font-mono" style="color:#0891b2">{{ p.code }}</td>
                      <td class="px-5 py-3 text-gray-500">{{ p.type === 'PERCENTAGE' ? '%' : 'TND fixe' }}</td>
                      <td class="px-5 py-3 font-semibold">{{ p.value }}{{ p.type === 'PERCENTAGE' ? '%' : ' TND' }}</td>
                      <td class="px-5 py-3 text-gray-500">{{ p.currentUses }} / {{ p.maxUses ?? '∞' }}</td>
                      <td class="px-5 py-3">
                        <span class="badge text-xs px-2.5 py-1"
                              [class]="p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'">
                          {{ p.active ? 'Actif' : 'Désactivé' }}
                        </span>
                      </td>
                      <td class="px-5 py-3 flex gap-2">
                        <button (click)="togglePromo(p.id)" class="text-xs px-2 py-1 rounded-lg border transition-colors"
                                [class]="p.active ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-green-200 text-green-600 hover:bg-green-50'">
                          {{ p.active ? 'Désactiver' : 'Activer' }}
                        </button>
                        <button (click)="deletePromoCode(p.id)" class="text-xs px-2 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  }
                  @if (promos().length === 0) {
                    <tr><td colspan="6" class="px-5 py-8 text-center text-gray-400">Aucun code promo créé</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      <!-- Orders Tab -->
      @if (activeTab() === 'orders') {
        <div class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-5 py-3 text-left font-semibold text-gray-700">Order</th>
                  <th class="px-5 py-3 text-left font-semibold text-gray-700">Customer</th>
                  <th class="px-5 py-3 text-left font-semibold text-gray-700">Amount</th>
                  <th class="px-5 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th class="px-5 py-3 text-left font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (order of orders(); track order.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-5 py-4 font-medium">#{{ order.id }}</td>
                    <td class="px-5 py-4 text-gray-500">{{ order.userEmail }}</td>
                    <td class="px-5 py-4 font-semibold">{{ order.totalAmount | number:'1.2-2' }} €</td>
                    <td class="px-5 py-4">
                      <span class="badge text-xs px-2.5 py-1" [class]="statusClass(order.status)">{{ order.status }}</span>
                    </td>
                    <td class="px-5 py-4">
                      <select (change)="updateStatus(order.id, $event)" class="text-xs border border-gray-200 rounded-lg px-2 py-1">
                        @for (s of statuses; track s) { <option [value]="s" [selected]="s === order.status">{{ s }}</option> }
                      </select>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Products Tab -->
      @if (activeTab() === 'products') {
        <!-- Existing Products List -->
        <div class="card overflow-hidden mb-6">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 class="font-semibold text-gray-900">All Products ({{ products().length }})</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-5 py-3 text-left font-semibold text-gray-700">Product</th>
                  <th class="px-5 py-3 text-left font-semibold text-gray-700">Brand</th>
                  <th class="px-5 py-3 text-left font-semibold text-gray-700">Category</th>
                  <th class="px-5 py-3 text-left font-semibold text-gray-700">Price</th>
                  <th class="px-5 py-3 text-left font-semibold text-gray-700">Stock</th>
                  <th class="px-5 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th class="px-5 py-3 text-left font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (p of products(); track p.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-5 py-3">
                      <div class="flex items-center gap-3">
                        <img [src]="p.imageUrl" [alt]="p.name"
                             class="w-10 h-10 object-cover rounded-xl bg-beige-50"
                             onerror="this.src='https://placehold.co/40x40?text=P'">
                        <span class="font-medium text-gray-900 line-clamp-1">{{ p.name }}</span>
                      </div>
                    </td>
                    <td class="px-5 py-3 text-gray-500">{{ p.brand }}</td>
                    <td class="px-5 py-3"><span class="badge bg-sage-50 text-sage-700 text-xs">{{ p.categoryName }}</span></td>
                    <td class="px-5 py-3 font-semibold">
                      @if (p.salePrice) {
                        <span class="text-sage-600">{{ p.salePrice | number:'1.2-2' }} €</span>
                        <span class="text-xs text-gray-400 line-through ml-1">{{ p.price | number:'1.2-2' }} €</span>
                      } @else {
                        {{ p.price | number:'1.2-2' }} €
                      }
                    </td>
                    <td class="px-5 py-3">
                      <span [class]="p.stock === 0 ? 'text-red-500 font-medium' : 'text-gray-700'">{{ p.stock }}</span>
                    </td>
                    <td class="px-5 py-3">
                      @if (p.featured) { <span class="badge badge-new text-xs mr-1">⭐ Top</span> }
                      @if (p.onSale)   { <span class="badge-sale text-xs">SALE</span> }
                    </td>
                     <td class="px-5 py-3">
                       <div class="flex items-center gap-1.5">
                         <button (click)="openImageUpload(p)" title="Ajouter des photos"
                                 class="text-cyan-600 hover:bg-cyan-50 p-1.5 rounded-lg transition-colors text-xs font-medium">
                           🖼️ Photos
                         </button>
                         <button (click)="deleteProduct(p.id)"
                                 class="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors text-xs font-medium">
                           🗑 Suppr.
                         </button>
                       </div>
                     </td>
                   </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Image Upload Panel -->
        @if (uploadTargetProduct()) {
          <div class="card p-6 border-2 border-cyan-200 bg-cyan-50/30">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="font-bold text-slate-900">🖼️ Photos pour : <span style="color:#0891b2">{{ uploadTargetProduct()!.name }}</span></h3>
                <p class="text-xs text-slate-400 mt-0.5">Téléchargez plusieurs photos vers Cloudinary (JPG, PNG, WEBP)</p>
              </div>
              <button (click)="uploadTargetProduct.set(null)" class="text-slate-400 hover:text-slate-700 text-xl">✕</button>
            </div>

            <!-- Current images strip -->
            @if (uploadTargetProduct()!.images?.length) {
              <div class="flex flex-wrap gap-2 mb-4">
                @for (img of uploadTargetProduct()!.images; track img) {
                  <div class="relative group">
                    <img [src]="img" class="w-20 h-20 object-cover rounded-xl border border-slate-200" onerror="this.src='https://placehold.co/80x80?text=P'">
                  </div>
                }
              </div>
            }

            <!-- Upload zone -->
            <label class="upload-zone" [class.upload-zone-active]="uploadingImages()">
              <input type="file" multiple accept="image/*" class="hidden"
                     (change)="uploadProductImages($event, uploadTargetProduct()!.id)"
                     [disabled]="uploadingImages()">
              @if (uploadingImages()) {
                <div class="flex flex-col items-center gap-2">
                  <svg class="w-8 h-8 animate-spin text-cyan-500" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <p class="text-sm text-cyan-700 font-semibold">Téléchargement en cours...</p>
                </div>
              } @else {
                <div class="flex flex-col items-center gap-2">
                  <div class="text-4xl">📤</div>
                  <p class="font-semibold text-slate-700">Cliquez pour sélectionner des photos</p>
                  <p class="text-xs text-slate-400">ou glissez-déposez ici — plusieurs fichiers acceptés</p>
                </div>
              }
            </label>
          </div>
        }

        <!-- Ajouter un produit -->
        <div class="card p-6">
          <h2 class="font-semibold text-gray-900 mb-5">➕ Ajouter un produit</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label-field">Nom du produit</label>
              <input [(ngModel)]="newProduct.name" class="input-field" placeholder="Sérum Hydra Glow">
            </div>
            <div>
              <label class="label-field">Marque</label>
              <input [(ngModel)]="newProduct.brand" class="input-field" placeholder="Ex: La Roche-Posay">
            </div>
            <div>
              <label class="label-field">Prix (TND)</label>
              <input [(ngModel)]="newProduct.price" class="input-field" type="number" placeholder="29.90">
            </div>
            <div>
              <label class="label-field">Prix promo (TND)</label>
              <input [(ngModel)]="newProduct.salePrice" class="input-field" type="number" placeholder="Optionnel">
            </div>
            <div>
              <label class="label-field">Stock</label>
              <input [(ngModel)]="newProduct.stock" class="input-field" type="number" placeholder="100">
            </div>
            <div>
              <label class="label-field">Catégorie</label>
              <select [(ngModel)]="newProduct.categoryId" class="input-field">
                <option value="">— Sélectionner —</option>
                @for (c of categories(); track c.id) { <option [value]="c.id">{{ c.name }}</option> }
              </select>
            </div>
            <div class="col-span-2">
              <label class="label-field">URL image principale</label>
              <input [(ngModel)]="newProduct.imageUrl" class="input-field" placeholder="https://res.cloudinary.com/...">
            </div>
            <div class="col-span-2">
              <label class="label-field">Description</label>
              <textarea [(ngModel)]="newProduct.description" class="input-field h-24 resize-none"></textarea>
            </div>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" [(ngModel)]="newProduct.featured" class="accent-sage-500"> Mis en avant
              </label>
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" [(ngModel)]="newProduct.onSale" class="accent-sage-500"> En promotion
              </label>
            </div>
          </div>
          <button (click)="createProduct()" class="btn-primary mt-5">Créer le produit</button>
        </div>
      }

      <!-- Categories Tab -->
      @if (activeTab() === 'categories') {
        <div class="card p-6">
          <h2 class="font-semibold text-gray-900 mb-5">Add New Category</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label-field">Category Name</label>
              <input [(ngModel)]="newCategory.name" class="input-field" placeholder="Aromatherapy">
            </div>
            <div>
              <label class="label-field">Icon (emoji)</label>
              <input [(ngModel)]="newCategory.icon" class="input-field" placeholder="🌸">
            </div>
            <div class="col-span-2">
              <label class="label-field">Image URL</label>
              <input [(ngModel)]="newCategory.imageUrl" class="input-field" placeholder="https://...">
            </div>
            <div class="col-span-2">
              <label class="label-field">Description</label>
              <textarea [(ngModel)]="newCategory.description" class="input-field h-20 resize-none"></textarea>
            </div>
          </div>
          <button (click)="createCategory()" class="btn-primary mt-5">➕ Add Category</button>

          <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (c of categories(); track c.id) {
              <div class="flex items-center justify-between p-4 border border-gray-100 rounded-2xl">
                <div class="flex items-center gap-3">
                  <span class="text-xl">{{ c.icon }}</span>
                  <div>
                    <p class="font-medium text-gray-900 text-sm">{{ c.name }}</p>
                    <p class="text-xs text-gray-400">{{ c.productCount }} products</p>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Blog Tab -->
      @if (activeTab() === 'blog') {
        <div class="card overflow-hidden mb-6">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 class="font-semibold text-gray-900">All Articles ({{ blogPosts().length }})</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-5 py-3 text-left font-semibold text-gray-700">Title</th>
                  <th class="px-5 py-3 text-left font-semibold text-gray-700">Category</th>
                  <th class="px-5 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th class="px-5 py-3 text-left font-semibold text-gray-700">Date</th>
                  <th class="px-5 py-3 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (post of blogPosts(); track post.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-5 py-3">
                      <div class="flex items-center gap-3">
                        <img [src]="post.imageUrl" class="w-10 h-10 object-cover rounded-xl bg-beige-50"
                             onerror="this.src='https://placehold.co/40x40?text=B'">
                        <span class="font-medium text-gray-900 line-clamp-1 max-w-xs">{{ post.title }}</span>
                      </div>
                    </td>
                    <td class="px-5 py-3"><span class="badge bg-sage-50 text-sage-700 text-xs">{{ post.category }}</span></td>
                    <td class="px-5 py-3">
                      <span class="badge text-xs" [class.badge-new]="post.published" [class.bg-gray-100]="!post.published" [class.text-gray-500]="!post.published">
                        {{ post.published ? '✅ Published' : '📝 Draft' }}
                      </span>
                    </td>
                    <td class="px-5 py-3 text-gray-400 text-xs">{{ post.createdAt | date:'MMM d, y' }}</td>
                    <td class="px-5 py-3">
                      <button (click)="deleteBlogPost(post.id)" class="text-red-500 hover:text-red-700 text-xs font-medium">🗑 Delete</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <div class="card p-6">
          <h2 class="font-semibold text-gray-900 mb-5">✍️ New Article</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="label-field">Title</label>
              <input [(ngModel)]="newPost.title" class="input-field" placeholder="5 Morning Rituals for Glowing Skin">
            </div>
            <div>
              <label class="label-field">Category</label>
              <select [(ngModel)]="newPost.category" class="input-field">
                <option value="">— Select —</option>
                @for (c of blogCategories; track c) { <option [value]="c">{{ c }}</option> }
              </select>
            </div>
            <div>
              <label class="label-field">Cover Image</label>
              <div class="flex gap-2">
                <input [(ngModel)]="newPost.imageUrl" class="input-field" placeholder="URL or upload below">
                <label class="btn-outline cursor-pointer flex-shrink-0 flex items-center gap-1 px-3">
                  📁
                  <input type="file" accept="image/*" class="hidden" (change)="uploadBlogCover($event)">
                </label>
              </div>
              @if (uploadingBlog()) { <p class="text-xs text-sage-600 mt-1">⏳ Uploading...</p> }
            </div>
            <div class="col-span-2">
              <label class="label-field">Excerpt</label>
              <input [(ngModel)]="newPost.excerpt" class="input-field" placeholder="Short summary shown in the blog list...">
            </div>
            <div class="col-span-2">
              <label class="label-field">Content (Markdown supported: ## Heading, **bold**, - list)</label>
              <textarea [(ngModel)]="newPost.content" class="input-field resize-none" style="height:180px"></textarea>
            </div>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" [(ngModel)]="newPost.published" class="accent-sage-500"> Publish immediately
              </label>
            </div>
          </div>
          <button (click)="createBlogPost()" class="btn-primary mt-5">Publish Article</button>
        </div>
      }

      <!-- Users Tab -->
      @if (activeTab() === 'users') {
        <div class="card overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-5 py-3 text-left font-semibold text-gray-700">Name</th>
                <th class="px-5 py-3 text-left font-semibold text-gray-700">Email</th>
                <th class="px-5 py-3 text-left font-semibold text-gray-700">Role</th>
                <th class="px-5 py-3 text-left font-semibold text-gray-700">Joined</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (u of users(); track u.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-5 py-4 font-medium">{{ u.firstName }} {{ u.lastName }}</td>
                  <td class="px-5 py-4 text-gray-500">{{ u.email }}</td>
                  <td class="px-5 py-4">
                    <span class="badge text-xs px-2.5 py-1"
                          [class.badge-new]="u.role === 'ROLE_ADMIN'"
                          [class.bg-beige-100]="u.role !== 'ROLE_ADMIN'"
                          [class.text-beige-700]="u.role !== 'ROLE_ADMIN'">
                      {{ u.role === 'ROLE_ADMIN' ? '🔑 Admin' : '👤 User' }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-gray-400">{{ u.createdAt | date:'mediumDate' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
      <!-- Confirmation Modal Styles -->
      <style>
        .confirm-overlay {
          position: fixed; inset: 0; z-index: 99999;
          background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; p: 1rem;
          animation: fadeIn 0.2s ease-out;
        }
        .confirm-modal {
          background: white; border-radius: 1.25rem; max-width: 420px; width: 100%;
          padding: 1.75rem; text-align: center;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
          border: 1px solid #f1f5f9; animation: scaleUp 0.2s ease-out;
        }
        .confirm-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
        .confirm-title { font-size: 1.25rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem; }
        .confirm-msg { font-size: 0.9rem; color: #64748b; margin-bottom: 1.5rem; line-height: 1.5; }
        .confirm-actions { display: flex; gap: 0.75rem; }
        .confirm-btn-cancel {
          flex: 1; padding: 0.65rem 1rem; border-radius: 0.75rem; font-weight: 600; font-size: 0.9rem;
          background: #f1f5f9; color: #475569; border: none; cursor: pointer; transition: all 0.15s;
        }
        .confirm-btn-cancel:hover { background: #e2e8f0; }
        .confirm-btn-delete {
          flex: 1; padding: 0.65rem 1rem; border-radius: 0.75rem; font-weight: 700; font-size: 0.9rem;
          background: #ef4444; color: white; border: none; cursor: pointer; transition: all 0.15s;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
        .confirm-btn-delete:hover { background: #dc2626; transform: translateY(-1px); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      </style>
    </div>
  `
})
export class AdminComponent implements OnInit {
  adminSvc    = inject(AdminService);
  categorySvc = inject(CategoryService);
  productSvc  = inject(ProductService);
  toast       = inject(ToastService);

  orders     = signal<Order[]>([]);
  categories = signal<Category[]>([]);
  users      = signal<any[]>([]);
  products   = signal<Product[]>([]);
  stats      = signal<any[]>([]);
  activeTab  = signal('orders');

  tabs = [
    { key: 'analytics',    label: 'Analytiques',     icon: '📈' },
    { key: 'announcements',label: 'Fil d\'annonces', icon: '📢' },
    { key: 'inventory',    label: 'Stocks',           icon: '📦' },
    { key: 'suppliers',  label: 'Fournisseurs',   icon: '🤝' },

    { key: 'orders',     label: 'Commandes',      icon: '🛒' },
    { key: 'products',   label: 'Produits',       icon: '🧴' },
    { key: 'categories', label: 'Catégories',     icon: '📂' },
    { key: 'blog',       label: 'Blog',           icon: '✍️' },
    { key: 'promo',      label: 'Codes Promo',    icon: '🏷️' },
    { key: 'users',      label: 'Utilisateurs',   icon: '👥' },
  ];

  blogPosts     = signal<any[]>([]);
  uploadingBlog = signal(false);
  blogCategories = ['Skincare', 'Supplements', 'Hair Care', 'Wellness', 'Baby Care'];
  newPost: any  = { title:'', category:'', imageUrl:'', excerpt:'', content:'', published: true };

  statuses = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'];

  newProduct: any = { name:'', brand:'', price:0, salePrice:null, stock:0, categoryId:'', imageUrl:'', description:'', featured:false, onSale:false };
  newCategory: any = { name:'', icon:'', imageUrl:'', description:'' };

  // Analytics
  revenueChart           = signal<any[]>([]);
  ordersChart            = signal<any[]>([]);
  userGrowthChart        = signal<any[]>([]);
  revenueByCategoryChart = signal<any[]>([]);
  topProducts            = signal<any[]>([]);
  statusBreakdown        = signal<Record<string,number>>({});
  lowStockAlerts         = signal<any[]>([]);
  totalRevenue           = signal(0);

  // Chart.js Data
  revenueChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  ordersChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  userGrowthChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  categoryChartData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [] };

  barChartOptions: ChartOptions<'bar'> = { responsive: true, maintainAspectRatio: false };
  lineChartOptions: ChartOptions<'line'> = { responsive: true, maintainAspectRatio: false, elements: { line: { tension: 0.4 } } };
  pieChartOptions: ChartOptions<'doughnut'> = { responsive: true, maintainAspectRatio: false };

  // Promo codes
  promos          = signal<any[]>([]);
  newPromo: any   = { code:'', type:'PERCENTAGE', value:10, minOrderAmount:null, maxUses:null, description:'' };
  creatingPromo   = signal(false);

  ngOnInit() {
    this.activeTab.set('analytics');
    this.adminSvc.getAllOrders().subscribe(o => this.orders.set(o));
    this.categorySvc.getAll().subscribe(c => this.categories.set(c));
    this.adminSvc.getAllUsers().subscribe(u => this.users.set(u));
    this.productSvc.getProducts(0, 100).subscribe(p => this.products.set(p.content));
    this.adminSvc.getAllBlogPosts().subscribe((p: any) => this.blogPosts.set(p.content ?? []));
    this.adminSvc.getAllPromos().subscribe(p => this.promos.set(p));
    this.adminSvc.getStats().subscribe(s => {
      // KPI cards
      this.stats.set([
        { label: 'Commandes',    value: s.totalOrders,                    icon: '📦' },
        { label: 'Revenu Total', value: (s.totalRevenue ?? 0) + ' TND',   icon: '💰' },
        { label: 'Utilisateurs', value: s.totalUsers ?? this.users().length, icon: '👥' },
        { label: 'Produits',     value: s.totalProducts ?? this.products().length, icon: '🧴' },
      ]);
      // Analytics charts
      this.revenueChart.set(s.revenueChart ?? []);
      this.ordersChart.set(s.ordersChart ?? []);
      this.userGrowthChart.set(s.userGrowth ?? []);
      this.revenueByCategoryChart.set(s.revenueByCategory ?? []);
      this.topProducts.set(s.topProducts ?? []);
      this.statusBreakdown.set(s.statusBreakdown ?? {});
      this.lowStockAlerts.set(s.lowStockAlerts ?? []);
      this.totalRevenue.set(s.totalRevenue ?? 0);

      this.updateChartData();
    });
  }

  updateChartData() {
    this.revenueChartData = {
      labels: this.revenueChart().map(d => d.date.substring(5)),
      datasets: [{ data: this.revenueChart().map(d => d.revenue), label: 'Revenu (TND)', backgroundColor: '#0891b2', borderRadius: 4 }]
    };

    this.ordersChartData = {
      labels: this.ordersChart().map(d => d.date.substring(5)),
      datasets: [{ data: this.ordersChart().map(d => d.count), label: 'Commandes', borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,0.1)', fill: true }]
    };

    this.userGrowthChartData = {
      labels: this.userGrowthChart().map(d => d.date.substring(5)),
      datasets: [{ data: this.userGrowthChart().map(d => d.count), label: 'Nouveaux Utilisateurs', borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.1)', fill: true }]
    };

    this.categoryChartData = {
      labels: this.revenueByCategoryChart().map(d => d.category),
      datasets: [{ data: this.revenueByCategoryChart().map(d => d.revenue), backgroundColor: ['#0891b2', '#16a34a', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b'] }]
    };
  }

  updateStatus(orderId: number, event: Event) {
    const status = (event.target as HTMLSelectElement).value;
    this.adminSvc.updateOrderStatus(orderId, status).subscribe(() => {
      this.toast.success(`Order #${orderId} updated to ${status}`);
      this.orders.update(orders => orders.map(o => o.id === orderId ? { ...o, status: status as any } : o));
    });
  }

  createProduct() {
    if (!this.newProduct.name || !this.newProduct.categoryId) { this.toast.error('Name and category are required'); return; }
    this.adminSvc.createProduct(this.newProduct).subscribe({
      next: (p) => {
        this.toast.success('Product created successfully!');
        this.products.update(list => [...list, p]);
        this.newProduct = { name:'', brand:'', price:0, salePrice:null, stock:0, categoryId:'', imageUrl:'', description:'', featured:false, onSale:false };
      },
      error: () => this.toast.error('Failed to create product')
    });
  }

  deleteProduct(id: number) {
    this.showConfirm('Voulez-vous vraiment supprimer ce produit ? Cette action est irréversible.', () => {
      this.adminSvc.deleteProduct(id).subscribe({
        next: () => { this.toast.success('Produit supprimé.'); this.products.update(list => list.filter(p => p.id !== id)); },
        error: () => this.toast.error('Erreur lors de la suppression du produit.')
      });
    });
  }

  createCategory() {
    if (!this.newCategory.name) { this.toast.error('Category name is required'); return; }
    this.adminSvc.createCategory(this.newCategory).subscribe({
      next: (c) => { this.toast.success('Category created!'); this.categories.update(cats => [...cats, c]); this.newCategory = { name:'', icon:'', imageUrl:'', description:'' }; },
      error: () => this.toast.error('Failed to create category')
    });
  }

  createBlogPost() {
    if (!this.newPost.title || !this.newPost.content) { this.toast.error('Title and content are required'); return; }
    this.adminSvc.createBlogPost(this.newPost).subscribe({
      next: (p) => { this.toast.success('Article published!'); this.blogPosts.update(list => [p, ...list]); this.newPost = { title:'', category:'', imageUrl:'', excerpt:'', content:'', published: true }; },
      error: () => this.toast.error('Failed to create article')
    });
  }

  deleteBlogPost(id: number) {
    this.showConfirm('Voulez-vous vraiment supprimer cet article ? Cette action est irréversible.', () => {
      this.adminSvc.deleteBlogPost(id).subscribe({
        next: () => { this.toast.success('Article supprimé.'); this.blogPosts.update(list => list.filter(p => p.id !== id)); },
        error: () => this.toast.error('Erreur lors de la suppression de l\'article.')
      });
    });
  }

  uploadBlogCover(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingBlog.set(true);
    this.adminSvc.uploadBlogImage(file).subscribe({
      next: (r) => { this.newPost.imageUrl = r.url; this.uploadingBlog.set(false); this.toast.success('Image uploaded!'); },
      error: () => { this.uploadingBlog.set(false); this.toast.error('Upload failed'); }
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = { PENDING:'bg-amber-100 text-amber-700', CONFIRMED:'bg-blue-100 text-blue-700', PROCESSING:'bg-purple-100 text-purple-700', SHIPPED:'bg-indigo-100 text-indigo-700', DELIVERED:'bg-sage-100 text-sage-700', CANCELLED:'bg-red-100 text-red-700' };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }

  // Image upload
  uploadTargetProduct = signal<any | null>(null);
  uploadingImages     = signal(false);

  openImageUpload(product: any) {
    this.uploadTargetProduct.set(product);
    // scroll to upload panel
    setTimeout(() => document.querySelector('.upload-zone')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  }

  uploadProductImages(event: Event, productId: number) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const formData = new FormData();
    Array.from(input.files).forEach(f => formData.append('files', f));
    this.uploadingImages.set(true);
    this.adminSvc.uploadProductImages(productId, formData).subscribe({
      next: (updated: any) => {
        this.uploadingImages.set(false);
        this.toast.success(`${input.files!.length} photo(s) ajoutée(s) !`);
        // update the product in list + upload panel
        this.products.update(list => list.map(p => p.id === productId ? { ...p, images: updated.images } : p));
        this.uploadTargetProduct.set({ ...this.uploadTargetProduct()!, images: updated.images });
        input.value = '';
      },
      error: (e: any) => { this.uploadingImages.set(false); this.toast.error(e?.error?.message ?? 'Erreur lors du téléchargement'); }
    });
  }
  barHeight(value: number, data: any[], key: string): number {
    const max = Math.max(...data.map(d => +d[key]), 1);
    return Math.round((+value / max) * 140);
  }

  sumChart(data: any[], key: string): number {
    return data.reduce((s, d) => s + +d[key], 0);
  }

  statusEntries() {
    return Object.entries(this.statusBreakdown()).map(([status, count]) => ({ status, count }));
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      PENDING: '#f59e0b', CONFIRMED: '#3b82f6', PROCESSING: '#a855f7',
      SHIPPED: '#6366f1', DELIVERED: '#16a34a', CANCELLED: '#ef4444', PAID: '#0891b2'
    };
    return map[status] ?? '#94a3b8';
  }

  // ── Promo Code methods ────────────────────────────────────────────────────
  createPromo() {
    if (!this.newPromo.code || !this.newPromo.value) { this.toast.error('Code et valeur requis'); return; }
    this.creatingPromo.set(true);
    this.adminSvc.createPromo(this.newPromo).subscribe({
      next: (p) => { this.promos.update(l => [p, ...l]); this.creatingPromo.set(false); this.toast.success('Code promo créé !'); this.newPromo = { code:'', type:'PERCENTAGE', value:10, minOrderAmount:null, maxUses:null, description:'' }; },
      error: (e) => { this.creatingPromo.set(false); this.toast.error(e?.error?.message ?? 'Erreur lors de la création'); }
    });
  }

  togglePromo(id: number) {
    this.adminSvc.togglePromo(id).subscribe({
      next: (p) => { this.promos.update(l => l.map(x => x.id === id ? p : x)); this.toast.success('Statut mis à jour'); },
      error: () => this.toast.error('Erreur')
    });
  }

  deletePromoCode(id: number) {
    this.showConfirm('Voulez-vous vraiment supprimer ce code promo ?', () => {
      this.adminSvc.deletePromo(id).subscribe({
        next: () => { this.promos.update(l => l.filter(x => x.id !== id)); this.toast.success('Code promo supprimé.'); },
        error: () => this.toast.error('Erreur lors de la suppression.')
      });
    });
  }

  // ── Confirm Dialog ──────────────────────────────────────────────────────
  confirmDialog = signal<{ show: boolean; message: string; action: (() => void) | null }>({
    show: false, message: '', action: null
  });

  showConfirm(message: string, action: () => void) {
    this.confirmDialog.set({ show: true, message, action });
  }

  executeConfirm() {
    this.confirmDialog().action?.();
    this.confirmDialog.set({ show: false, message: '', action: null });
  }

  cancelConfirm() {
    this.confirmDialog.set({ show: false, message: '', action: null });
  }
}
