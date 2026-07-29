import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/api.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { WebSocketService, GenerationProgress } from '../../../core/services/websocket.service';
import { Product } from '../../../core/models/models';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-marketing-studio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="studio-shell">

      <!-- ══ TOP HEADER ══════════════════════════════════════════════ -->
      <div class="studio-header">
        <div class="studio-header-left">
          <div class="studio-logo">
            <span class="studio-logo-icon">✦</span>
          </div>
          <div>
            <h1 class="studio-title">AI Creative Studio</h1>
            <p class="studio-sub">Propulsé par Leonardo AI · FLUX · SDXL</p>
          </div>
        </div>
        <div class="studio-header-right">
          <div class="ws-badge" [class.ws-online]="connected()" [class.ws-offline]="!connected()">
            <span class="ws-dot"></span>
            {{ connected() ? 'IA Connectée' : 'Hors ligne' }}
          </div>
          <!-- Tab switcher -->
          <div class="tab-switcher">
            <button class="tab-btn" [class.tab-active]="activeTab() === 'studio'" (click)="activeTab.set('studio')">
              🎨 Studio
            </button>
            <button class="tab-btn" [class.tab-active]="activeTab() === 'history'" (click)="switchToHistory()">
              🕐 Historique
            </button>
          </div>
        </div>
      </div>

      <!-- ══ STUDIO TAB ══════════════════════════════════════════════ -->
      @if (activeTab() === 'studio') {
        <div class="studio-body">

          <!-- ── SIDEBAR ─────────────────────────────────────────────── -->
          <aside class="studio-sidebar">

            <!-- Step 1: Product -->
            <div class="sidebar-card">
              <div class="sidebar-step">
                <span class="step-num">01</span>
                <span class="step-label">Produit</span>
              </div>
              <select [(ngModel)]="selectedProductId" class="studio-select" (change)="onProductChange()">
                <option [ngValue]="null">— Choisir un produit —</option>
                @for (p of products(); track p.id) {
                  <option [ngValue]="p.id">{{ p.name }} · {{ p.brand }}</option>
                }
              </select>

              <!-- Image Upload Zone -->
              <div class="upload-zone" [class.upload-zone--active]="uploadingImage()" [class.upload-zone--done]="!!customImageUrl()">
                <input type="file" (change)="onFileSelected($event)" accept="image/*"
                       class="upload-input" [disabled]="uploadingImage()">
                @if (uploadingImage()) {
                  <div class="upload-spinner">
                    <svg class="spin-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    <span>Détourage IA...</span>
                  </div>
                } @else if (customImageUrl()) {
                  <div class="upload-preview">
                    <div class="upload-preview-img-wrap">
                      <img [src]="customImageUrl()" class="upload-preview-img" alt="Cutout">
                    </div>
                    <div class="upload-preview-meta">
                      <span class="upload-done-badge">✅ Sujet extrait</span>
                      <span class="upload-change">Cliquez pour changer</span>
                    </div>
                  </div>
                } @else {
                  <div class="upload-placeholder">
                    <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                    </svg>
                    <span class="upload-hint">Glissez ou cliquez</span>
                    <span class="upload-hint-sub">Détourage auto via Cloudinary</span>
                  </div>
                }
              </div>
            </div>

            <!-- Step 2: Direction artistique -->
            <div class="sidebar-card">
              <div class="sidebar-step">
                <span class="step-num">02</span>
                <span class="step-label">Style IA</span>
              </div>

              <div class="style-grid">
                @for (style of styleOptions; track style.value) {
                  <label class="style-card" [class.style-card--active]="selectedStyle === style.value">
                    <input type="radio" name="style" [value]="style.value" [(ngModel)]="selectedStyle" class="style-radio">
                    <span class="style-emoji">{{ style.emoji }}</span>
                    <span class="style-name">{{ style.label }}</span>
                    <span class="style-desc">{{ style.desc }}</span>
                  </label>
                }
              </div>
            </div>

            <!-- Step 3: Format -->
            <div class="sidebar-card">
              <div class="sidebar-step">
                <span class="step-num">03</span>
                <span class="step-label">Format</span>
              </div>
              <div class="format-row">
                @for (fmt of formatOptions; track fmt.value) {
                  <button class="format-btn" [class.format-btn--active]="selectedFormat === fmt.value"
                          (click)="selectedFormat = fmt.value">
                    {{ fmt.emoji }} {{ fmt.label }}
                  </button>
                }
              </div>
            </div>

            <!-- Generate -->
            <button class="generate-btn" (click)="generate()"
                    [disabled]="isGenerating() || !selectedProductId"
                    id="generate-campaign-btn">
              <div class="generate-shimmer"></div>
              @if (isGenerating()) {
                <svg class="spin-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <span>Orchestration IA en cours...</span>
              } @else {
                <span>✦ Lancer la Génération</span>
              }
            </button>

          </aside>

          <!-- ── CANVAS ───────────────────────────────────────────────── -->
          <main class="studio-canvas">

            @if (!isGenerating() && tasks().length === 0) {
              <!-- Empty state -->
              <div class="canvas-empty">
                <div class="canvas-empty-art">
                  <div class="canvas-empty-ring canvas-empty-ring--1"></div>
                  <div class="canvas-empty-ring canvas-empty-ring--2"></div>
                  <div class="canvas-empty-ring canvas-empty-ring--3"></div>
                  <span class="canvas-empty-icon">✦</span>
                </div>
                <h3 class="canvas-empty-title">Studio en attente</h3>
                <p class="canvas-empty-body">
                  Sélectionnez un produit, choisissez votre direction artistique et lancez la génération.<br>
                  L'IA va créer <strong>3 variantes photoréalistes</strong> simultanément en temps réel.
                </p>
                <div class="canvas-empty-chips">
                  <span class="chip">🎬 Leonardo AI</span>
                  <span class="chip">⚡ FLUX Schnell</span>
                  <span class="chip">🏆 SDXL Alchemy</span>
                  <span class="chip">🌐 Cloudinary CDN</span>
                </div>
              </div>
            }

            @if (tasks().length > 0) {
              <div class="results-header">
                <div>
                  <h2 class="results-title">Campagne générée — {{ tasks().length }} variantes</h2>
                  <p class="results-sub">Style: <strong>{{ getStyleLabel(selectedStyle) }}</strong> · Format: <strong>{{ selectedFormat }}</strong></p>
                </div>
                <span class="status-badge" [class.status-badge--running]="isGenerating()">
                  <span class="status-dot"></span>
                  {{ isGenerating() ? 'Rendu en cours...' : 'Terminé ✓' }}
                </span>
              </div>

              <div class="poster-grid">
                @for (task of tasks(); track task.taskId) {
                  <div class="poster-card" [class.poster-card--done]="task.status === 'COMPLETED'">

                    <!-- Image area -->
                    <div class="poster-canvas" [style.aspect-ratio]="selectedFormat === 'Instagram Story' ? '4/5' : '1/1'">

                      <!-- PENDING / PROCESSING -->
                      @if (task.status === 'PENDING' || task.status === 'PROCESSING') {
                        <div class="poster-loading">
                          <div class="poster-loading-ring">
                            <svg viewBox="0 0 100 100" class="loading-ring-svg">
                              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8"/>
                              <circle cx="50" cy="50" r="40" fill="none" stroke="url(#grad)" stroke-width="8"
                                      stroke-linecap="round" stroke-dasharray="251" [attr.stroke-dashoffset]="251 - (task.progress / 100) * 251"
                                      class="loading-arc"/>
                              <defs>
                                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" style="stop-color:#818cf8"/>
                                  <stop offset="100%" style="stop-color:#c084fc"/>
                                </linearGradient>
                              </defs>
                            </svg>
                            <span class="loading-pct">{{ task.progress }}%</span>
                          </div>
                          <p class="loading-step">{{ task.step || 'Initialisation...' }}</p>
                          <div class="loading-bar-wrap">
                            <div class="loading-bar" [style.width]="task.progress + '%'"></div>
                          </div>
                        </div>
                      }

                      <!-- FAILED -->
                      @if (task.status === 'FAILED') {
                        <div class="poster-failed">
                          <span class="failed-icon">⚠</span>
                          <p class="failed-title">Échec du rendu</p>
                          <p class="failed-msg">{{ task.error }}</p>
                        </div>
                      }

                      <!-- COMPLETED -->
                      @if (task.status === 'COMPLETED' && task.resultImageUrl) {
                        <div [id]="'poster-' + task.taskId" class="poster-result">
                          <!-- BG -->
                          <img [src]="task.resultImageUrl" crossorigin="anonymous"
                               class="poster-bg" [alt]="task.headline">
                          <!-- Gradient vignette -->
                          <div class="poster-vignette"></div>
                          <!-- Product cutout -->
                          <img [src]="task.cutoutUrl" crossorigin="anonymous"
                               class="poster-product" [alt]="'product'">
                          <!-- Text -->
                          <div class="poster-text">
                            <h2 class="poster-headline">{{ task.headline }}</h2>
                            <p class="poster-brand">{{ selectedProduct()?.brand || 'Notre Marque' }}</p>
                          </div>
                          <!-- Hover overlay -->
                          <div class="poster-hover-overlay">
                            <button class="poster-dl-btn" (click)="downloadPoster('poster-' + task.taskId, task.taskId)" id="download-poster-btn">
                              <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                              </svg>
                              Export HD
                            </button>
                          </div>
                        </div>
                      }
                    </div>

                    <!-- Caption area -->
                    <div class="poster-info">
                      @if (task.status === 'COMPLETED') {
                        <p class="poster-caption">{{ task.caption }}</p>
                        <div class="poster-hashtags">{{ task.hashtags }}</div>
                        <div class="poster-actions">
                          <span class="poster-engine-badge">{{ getEngineBadge() }}</span>
                          <button class="copy-btn" (click)="copyText(task)" title="Copier la légende">
                            <svg class="btn-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2"/>
                            </svg>
                            Copier
                          </button>
                        </div>
                      } @else {
                        <div class="poster-skeleton">
                          <div class="skel skel--lg"></div>
                          <div class="skel skel--md"></div>
                          <div class="skel skel--sm"></div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </main>
        </div>
      }

      <!-- ══ HISTORY TAB ═════════════════════════════════════════════ -->
      @if (activeTab() === 'history') {
        <div class="history-body">
          <div class="history-header">
            <h2 class="history-title">🕐 Historique des campagnes</h2>
            <p class="history-sub">{{ historyItems().length }} campagnes générées</p>
          </div>

          @if (historyItems().length === 0) {
            <div class="history-empty">
              <p>Aucune campagne générée pour l'instant. Lancez votre première génération !</p>
            </div>
          }

          <div class="history-grid">
            @for (item of historyItems(); track item.id) {
              <div class="history-card">
                <div class="history-thumb">
                  @if (item.resultImageUrl) {
                    <img [src]="item.resultImageUrl" [alt]="item.headline" class="history-thumb-img" loading="lazy">
                    <div class="history-thumb-overlay">
                      @if (item.cutoutUrl) {
                        <img [src]="item.cutoutUrl" class="history-thumb-product" alt="product">
                      }
                    </div>
                  } @else if (item.status === 'FAILED') {
                    <div class="history-thumb-failed">⚠ Échec</div>
                  } @else {
                    <div class="history-thumb-pending">⏳</div>
                  }
                  <div class="history-style-badge">{{ getStyleEmoji(item.style) }} {{ item.style }}</div>
                </div>
                <div class="history-info">
                  <p class="history-headline">{{ item.headline || '(Sans titre)' }}</p>
                  <p class="history-caption">{{ item.caption }}</p>
                  <div class="history-meta">
                    <span class="history-status" [class.history-status--done]="item.status === 'COMPLETED'" [class.history-status--fail]="item.status === 'FAILED'">
                      {{ item.status }}
                    </span>
                    <span class="history-format">{{ item.format }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    /* ═══════════════════════════════════════════════════════════════
       DESIGN TOKENS & RESET
    ═══════════════════════════════════════════════════════════════ */
    :host {
      --c-bg: #0a0a0f;
      --c-surface: #111118;
      --c-surface-2: #1a1a24;
      --c-border: rgba(255,255,255,0.07);
      --c-border-hover: rgba(139,92,246,0.5);
      --c-accent: #818cf8;
      --c-accent-2: #c084fc;
      --c-accent-glow: rgba(129,140,248,0.2);
      --c-text: #f1f5f9;
      --c-text-muted: #64748b;
      --c-text-soft: #94a3b8;
      --c-danger: #f87171;
      --c-success: #34d399;
      --radius: 16px;
      --radius-sm: 10px;
      --shadow: 0 8px 32px rgba(0,0,0,0.4);
      display: block;
      font-family: 'Inter', system-ui, sans-serif;
    }

    /* ── Shell ───────────────────────────────────────────────────── */
    .studio-shell {
      min-height: 100vh;
      background: var(--c-bg);
      color: var(--c-text);
      display: flex;
      flex-direction: column;
    }

    /* ── Header ──────────────────────────────────────────────────── */
    .studio-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 32px;
      background: var(--c-surface);
      border-bottom: 1px solid var(--c-border);
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(12px);
    }
    .studio-header-left { display: flex; align-items: center; gap: 16px; }
    .studio-header-right { display: flex; align-items: center; gap: 16px; }

    .studio-logo {
      width: 44px; height: 44px;
      background: linear-gradient(135deg, var(--c-accent), var(--c-accent-2));
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
      box-shadow: 0 0 20px var(--c-accent-glow);
    }
    .studio-logo-icon { color: #fff; }
    .studio-title { font-size: 18px; font-weight: 700; letter-spacing: -0.02em; margin: 0; }
    .studio-sub { font-size: 12px; color: var(--c-text-muted); margin: 2px 0 0; }

    .ws-badge {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 999px;
      font-size: 12px; font-weight: 600;
      border: 1px solid var(--c-border);
    }
    .ws-badge.ws-online { border-color: rgba(52,211,153,0.3); color: var(--c-success); }
    .ws-badge.ws-offline { border-color: rgba(248,113,113,0.3); color: var(--c-danger); }
    .ws-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: currentColor;
      animation: pulse 2s infinite;
    }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

    .tab-switcher { display: flex; background: var(--c-surface-2); border-radius: var(--radius-sm); padding: 4px; gap: 2px; }
    .tab-btn {
      padding: 7px 18px; border-radius: 8px; font-size: 13px; font-weight: 600;
      background: none; border: none; color: var(--c-text-muted); cursor: pointer;
      transition: all 0.2s;
    }
    .tab-btn:hover { color: var(--c-text); }
    .tab-btn.tab-active { background: var(--c-accent); color: #fff; box-shadow: 0 2px 8px var(--c-accent-glow); }

    /* ── Studio body ──────────────────────────────────────────────── */
    .studio-body {
      display: grid;
      grid-template-columns: 340px 1fr;
      flex: 1;
      gap: 0;
    }

    /* ── Sidebar ──────────────────────────────────────────────────── */
    .studio-sidebar {
      background: var(--c-surface);
      border-right: 1px solid var(--c-border);
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      overflow-y: auto;
      max-height: calc(100vh - 76px);
    }

    .sidebar-card {
      background: var(--c-surface-2);
      border: 1px solid var(--c-border);
      border-radius: var(--radius);
      padding: 18px;
    }

    .sidebar-step { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
    .step-num { font-size: 11px; font-weight: 800; color: var(--c-accent); letter-spacing: 0.05em; }
    .step-label { font-size: 13px; font-weight: 700; color: var(--c-text); }

    .studio-select {
      width: 100%;
      background: var(--c-bg);
      border: 1px solid var(--c-border);
      color: var(--c-text);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      font-size: 13px;
      margin-bottom: 14px;
      outline: none;
      transition: border-color 0.2s;
      appearance: none;
    }
    .studio-select:focus { border-color: var(--c-accent); }

    /* Upload zone */
    .upload-zone {
      position: relative;
      border: 2px dashed var(--c-border);
      border-radius: var(--radius-sm);
      padding: 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.25s;
      min-height: 90px;
      display: flex; align-items: center; justify-content: center;
    }
    .upload-zone:hover { border-color: var(--c-accent); background: var(--c-accent-glow); }
    .upload-zone.upload-zone--done { border-style: solid; border-color: rgba(52,211,153,0.4); }
    .upload-zone.upload-zone--active { background: var(--c-accent-glow); }
    .upload-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; z-index: 2; width: 100%; height: 100%; }
    .upload-icon { width: 28px; height: 28px; color: var(--c-text-muted); margin-bottom: 6px; }
    .upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .upload-hint { font-size: 13px; font-weight: 600; color: var(--c-text-soft); }
    .upload-hint-sub { font-size: 11px; color: var(--c-text-muted); }
    .upload-spinner { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--c-accent); font-size: 13px; }
    .upload-preview { display: flex; align-items: center; gap: 12px; }
    .upload-preview-img-wrap { width: 56px; height: 56px; border-radius: 10px; overflow: hidden; background: rgba(255,255,255,0.05); flex-shrink: 0; }
    .upload-preview-img { width: 100%; height: 100%; object-fit: contain; }
    .upload-preview-meta { display: flex; flex-direction: column; gap: 4px; text-align: left; }
    .upload-done-badge { font-size: 12px; font-weight: 700; color: var(--c-success); }
    .upload-change { font-size: 11px; color: var(--c-text-muted); }

    /* Style grid */
    .style-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .style-card {
      position: relative;
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      padding: 14px 8px;
      background: var(--c-bg);
      border: 1px solid var(--c-border);
      border-radius: var(--radius-sm);
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
    }
    .style-card:hover { border-color: var(--c-accent); background: var(--c-accent-glow); }
    .style-card.style-card--active {
      border-color: var(--c-accent);
      background: var(--c-accent-glow);
      box-shadow: 0 0 0 1px var(--c-accent);
    }
    .style-radio { position: absolute; opacity: 0; width: 0; }
    .style-emoji { font-size: 22px; }
    .style-name { font-size: 11px; font-weight: 700; color: var(--c-text); }
    .style-desc { font-size: 10px; color: var(--c-text-muted); line-height: 1.3; }

    /* Format */
    .format-row { display: flex; gap: 8px; }
    .format-btn {
      flex: 1; padding: 10px 8px;
      background: var(--c-bg); border: 1px solid var(--c-border);
      border-radius: var(--radius-sm);
      color: var(--c-text-soft); font-size: 12px; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
    }
    .format-btn:hover { border-color: var(--c-accent); color: var(--c-text); }
    .format-btn.format-btn--active { background: var(--c-accent); border-color: var(--c-accent); color: #fff; }

    /* Generate button */
    .generate-btn {
      position: relative; overflow: hidden;
      width: 100%; padding: 16px;
      background: linear-gradient(135deg, var(--c-accent), var(--c-accent-2));
      border: none; border-radius: var(--radius);
      color: #fff; font-size: 15px; font-weight: 700;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: all 0.3s;
      letter-spacing: -0.01em;
    }
    .generate-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(129,140,248,0.4); }
    .generate-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .generate-shimmer {
      position: absolute; inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
      transform: translateX(-100%);
      animation: shimmer 2s infinite;
    }
    @keyframes shimmer { to { transform: translateX(100%); } }

    /* ── Canvas ───────────────────────────────────────────────────── */
    .studio-canvas {
      padding: 32px;
      overflow-y: auto;
      max-height: calc(100vh - 76px);
    }

    /* Empty state */
    .canvas-empty {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; text-align: center;
      min-height: 70vh; padding: 40px;
    }
    .canvas-empty-art {
      position: relative; width: 100px; height: 100px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 32px;
    }
    .canvas-empty-ring {
      position: absolute; border-radius: 50%;
      border: 1px solid var(--c-border);
      animation: ringPulse 3s ease-in-out infinite;
    }
    .canvas-empty-ring--1 { width: 100%; height: 100%; animation-delay: 0s; }
    .canvas-empty-ring--2 { width: 140%; height: 140%; left: -20%; top: -20%; animation-delay: 0.5s; opacity: 0.5; }
    .canvas-empty-ring--3 { width: 180%; height: 180%; left: -40%; top: -40%; animation-delay: 1s; opacity: 0.25; }
    @keyframes ringPulse { 0%,100%{border-color:var(--c-border)} 50%{border-color:var(--c-accent)} }
    .canvas-empty-icon { font-size: 36px; color: var(--c-accent); position: relative; z-index: 1; }
    .canvas-empty-title { font-size: 26px; font-weight: 800; margin: 0 0 12px; letter-spacing: -0.03em; }
    .canvas-empty-body { font-size: 14px; color: var(--c-text-soft); line-height: 1.7; max-width: 480px; margin: 0 0 24px; }
    .canvas-empty-chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
    .chip {
      padding: 6px 14px; background: var(--c-surface-2);
      border: 1px solid var(--c-border); border-radius: 999px;
      font-size: 12px; font-weight: 600; color: var(--c-text-soft);
    }

    /* Results */
    .results-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
    .results-title { font-size: 20px; font-weight: 800; margin: 0 0 4px; letter-spacing: -0.02em; }
    .results-sub { font-size: 13px; color: var(--c-text-muted); margin: 0; }
    .status-badge {
      display: flex; align-items: center; gap: 8px;
      padding: 7px 14px; border-radius: 999px;
      font-size: 12px; font-weight: 700;
      background: var(--c-surface-2); border: 1px solid var(--c-border);
      color: var(--c-success); white-space: nowrap;
    }
    .status-badge.status-badge--running { color: var(--c-accent); }
    .status-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; animation: pulse 1.5s infinite; }

    /* Poster grid */
    .poster-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }

    .poster-card {
      background: var(--c-surface);
      border: 1px solid var(--c-border);
      border-radius: var(--radius);
      overflow: hidden;
      display: flex; flex-direction: column;
      transition: all 0.3s;
    }
    .poster-card:hover { border-color: var(--c-border-hover); box-shadow: 0 16px 48px rgba(0,0,0,0.5); transform: translateY(-3px); }
    .poster-card.poster-card--done { border-color: rgba(129,140,248,0.2); }

    .poster-canvas { position: relative; width: 100%; overflow: hidden; background: #0d0d14; }

    /* Loading state */
    .poster-loading {
      position: absolute; inset: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #0d0d18, #13101f);
      padding: 24px;
    }
    .poster-loading-ring { position: relative; width: 80px; height: 80px; margin-bottom: 20px; }
    .loading-ring-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    .loading-arc { transition: stroke-dashoffset 0.7s ease; }
    .loading-pct {
      position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 800; color: var(--c-accent);
    }
    .loading-step { font-size: 12px; color: var(--c-text-soft); font-weight: 600; text-align: center; margin-bottom: 16px; }
    .loading-bar-wrap { width: 100%; height: 3px; background: rgba(255,255,255,0.08); border-radius: 99px; overflow: hidden; }
    .loading-bar { height: 100%; background: linear-gradient(90deg, var(--c-accent), var(--c-accent-2)); border-radius: 99px; transition: width 0.7s ease; }

    /* Failed state */
    .poster-failed {
      position: absolute; inset: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: rgba(239,68,68,0.05); padding: 20px; text-align: center;
    }
    .failed-icon { font-size: 32px; margin-bottom: 8px; color: var(--c-danger); }
    .failed-title { font-size: 14px; font-weight: 700; color: var(--c-danger); margin-bottom: 4px; }
    .failed-msg { font-size: 12px; color: var(--c-text-muted); }

    /* Completed poster */
    .poster-result { position: absolute; inset: 0; }
    .poster-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .poster-vignette {
      position: absolute; inset: 0; z-index: 1;
      background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0) 100%);
    }
    .poster-product {
      position: absolute; z-index: 2;
      left: 50%; transform: translateX(-50%);
      height: 62%; max-height: 380px;
      object-fit: contain;
      bottom: 15%;
      filter: drop-shadow(0 20px 30px rgba(0,0,0,0.7));
    }
    .poster-text {
      position: absolute; bottom: 0; left: 0; right: 0; z-index: 3;
      padding: 20px;
    }
    .poster-headline {
      font-size: clamp(14px, 3vw, 22px); font-weight: 900;
      color: #fff; margin: 0 0 4px;
      text-shadow: 0 2px 12px rgba(0,0,0,0.8);
      letter-spacing: -0.02em;
    }
    .poster-brand { font-size: 12px; color: rgba(255,255,255,0.7); margin: 0; font-weight: 600; }
    .poster-hover-overlay {
      position: absolute; inset: 0; z-index: 10;
      background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.25s;
      backdrop-filter: blur(4px);
    }
    .poster-result:hover .poster-hover-overlay { opacity: 1; }
    .poster-dl-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 22px; border-radius: 999px;
      background: #fff; color: #0a0a0f;
      font-size: 13px; font-weight: 800;
      border: none; cursor: pointer;
      transition: transform 0.2s;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    }
    .poster-dl-btn:hover { transform: scale(1.05); }

    /* Poster info area */
    .poster-info { padding: 16px; background: var(--c-surface); flex: 1; }
    .poster-caption { font-size: 12px; color: var(--c-text-soft); line-height: 1.6; margin: 0 0 8px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .poster-hashtags { font-size: 11px; color: var(--c-accent); font-weight: 500; margin-bottom: 12px; }
    .poster-actions { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--c-border); }
    .poster-engine-badge { font-size: 10px; font-weight: 700; color: var(--c-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .copy-btn {
      display: flex; align-items: center; gap: 5px;
      padding: 6px 12px; border-radius: var(--radius-sm);
      background: var(--c-surface-2); border: 1px solid var(--c-border);
      color: var(--c-text-soft); font-size: 12px; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
    }
    .copy-btn:hover { border-color: var(--c-accent); color: var(--c-accent); }
    .btn-icon { width: 16px; height: 16px; }
    .btn-icon-sm { width: 13px; height: 13px; }

    /* Skeleton */
    .poster-skeleton { display: flex; flex-direction: column; gap: 8px; padding: 4px 0; }
    .skel { height: 10px; border-radius: 99px; background: linear-gradient(90deg, var(--c-surface-2) 25%, var(--c-border) 50%, var(--c-surface-2) 75%); background-size: 200% 100%; animation: skeletonShimmer 1.5s infinite; }
    .skel--lg { width: 90%; }
    .skel--md { width: 70%; }
    .skel--sm { width: 50%; }
    @keyframes skeletonShimmer { to { background-position: -200% 0; } }

    /* Spin */
    .spin-icon { width: 20px; height: 20px; animation: spin 1s linear infinite; color: currentColor; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── History ──────────────────────────────────────────────────── */
    .history-body { padding: 32px; }
    .history-header { margin-bottom: 24px; }
    .history-title { font-size: 22px; font-weight: 800; margin: 0 0 4px; }
    .history-sub { font-size: 13px; color: var(--c-text-muted); margin: 0; }
    .history-empty { text-align: center; padding: 60px 20px; color: var(--c-text-muted); }

    .history-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
    .history-card {
      background: var(--c-surface); border: 1px solid var(--c-border);
      border-radius: var(--radius); overflow: hidden;
      transition: all 0.25s;
    }
    .history-card:hover { border-color: var(--c-border-hover); transform: translateY(-2px); box-shadow: var(--shadow); }
    .history-thumb { position: relative; aspect-ratio: 4/5; background: var(--c-surface-2); overflow: hidden; }
    .history-thumb-img { width: 100%; height: 100%; object-fit: cover; }
    .history-thumb-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
    .history-thumb-product { height: 60%; object-fit: contain; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.6)); }
    .history-thumb-failed { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--c-danger); font-size: 14px; font-weight: 700; }
    .history-thumb-pending { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 28px; }
    .history-style-badge {
      position: absolute; top: 8px; left: 8px;
      background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
      padding: 3px 8px; border-radius: 6px;
      font-size: 10px; font-weight: 700; color: #fff; text-transform: capitalize;
    }
    .history-info { padding: 14px; }
    .history-headline { font-size: 13px; font-weight: 700; margin: 0 0 4px; }
    .history-caption { font-size: 11px; color: var(--c-text-muted); line-height: 1.5; margin: 0 0 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .history-meta { display: flex; align-items: center; gap: 8px; }
    .history-status {
      font-size: 10px; font-weight: 800; padding: 2px 8px;
      border-radius: 4px; text-transform: uppercase;
      background: var(--c-surface-2); color: var(--c-text-muted);
    }
    .history-status.history-status--done { background: rgba(52,211,153,0.15); color: var(--c-success); }
    .history-status.history-status--fail { background: rgba(248,113,113,0.15); color: var(--c-danger); }
    .history-format { font-size: 10px; color: var(--c-text-muted); }
  `]
})
export class MarketingStudioComponent implements OnInit, OnDestroy {
  private adminSvc = inject(AdminService);
  private productSvc = inject(ProductService);
  private toastSvc = inject(ToastService);
  private wsSvc = inject(WebSocketService);

  products = signal<Product[]>([]);
  selectedProductId: number | null = null;
  selectedFormat = 'Instagram Post';
  selectedStyle = 'luxury';

  customImageUrl = signal<string | null>(null);
  uploadingImage = signal(false);
  connected = signal(false);
  activeTab = signal<'studio' | 'history'>('studio');

  tasks = signal<GenerationProgress[]>([]);
  historyItems = signal<any[]>([]);

  readonly styleOptions = [
    { value: 'luxury',     emoji: '💎', label: 'Éditorial Luxe',    desc: 'Marbre noir, bokeh profond, Chanel/Dior' },
    { value: 'medical',    emoji: '🩺', label: 'Clinique',           desc: 'Surfaces pures, lumière diffusée, La Roche-Posay' },
    { value: 'cinematic',  emoji: '🎬', label: 'Cinématique',        desc: 'Lumières volumétriques, neon, RED Cinema' },
    { value: 'influencer', emoji: '✨', label: 'Lifestyle',          desc: 'Lumière matinale, pastels, TikTok/IG' },
  ];

  readonly formatOptions = [
    { value: 'Instagram Post',  emoji: '📱', label: 'Post (1:1)' },
    { value: 'Instagram Story', emoji: '📲', label: 'Story (4:5)' },
  ];

  selectedProduct() {
    return this.products().find(p => p.id === this.selectedProductId);
  }

  getStyleLabel(val: string) {
    return this.styleOptions.find(s => s.value === val)?.label ?? val;
  }

  getStyleEmoji(val: string) {
    return this.styleOptions.find(s => s.value === val)?.emoji ?? '✦';
  }

  getEngineBadge() {
    // We don't know at runtime which engine was used, but we show the priority
    return 'Leonardo AI · FLUX';
  }

  ngOnInit() {
    this.productSvc.getProducts(0, 1000).subscribe(page => {
      this.products.set(page.content);
    });
    this.wsSvc.connect();
    this.wsSvc.getConnectionStatus().subscribe(status => this.connected.set(status));
  }

  ngOnDestroy() {
    this.wsSvc.disconnect();
  }

  onProductChange() {
    // Clear custom image when product changes
    this.customImageUrl.set(null);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.uploadingImage.set(true);
    this.adminSvc.uploadProductImage(file).subscribe({
      next: (res) => {
        const parts = res.url.split('/upload/');
        this.customImageUrl.set(parts[0] + '/upload/e_background_removal,c_pad,w_800/' + parts[1]);
        this.uploadingImage.set(false);
        this.toastSvc.success('Image analysée et détourée !');
      },
      error: () => {
        this.uploadingImage.set(false);
        this.toastSvc.error("Erreur lors de l'upload.");
      }
    });
  }

  generate() {
    if (!this.selectedProductId) return;
    this.tasks.set([]);

    const payload = {
      productId: this.selectedProductId,
      format: this.selectedFormat,
      style: this.selectedStyle,
      customImageUrl: this.customImageUrl(),
      numberOfVariants: 3
    };

    this.adminSvc.generateMarketingCampaign(payload).subscribe({
      next: (taskIds: string[]) => {
        this.toastSvc.success('✦ Génération IA lancée !');
        this.tasks.set(taskIds.map(id => ({
          taskId: id,
          step: "En file d'attente...",
          progress: 0,
          status: 'PENDING' as const
        })));
        taskIds.forEach(id => {
          this.wsSvc.watchGeneration(id).subscribe(update => this.updateTask(update));
        });
      },
      error: (err) => {
        this.toastSvc.error(err.error?.message || 'Erreur lors du lancement.');
      }
    });
  }

  switchToHistory() {
    this.activeTab.set('history');
    this.adminSvc.getMarketingHistory().subscribe({
      next: (items: any[]) => this.historyItems.set(items),
      error: () => this.toastSvc.error("Impossible de charger l'historique.")
    });
  }

  isGenerating(): boolean {
    return this.tasks().some(t => t.status === 'PENDING' || t.status === 'PROCESSING');
  }

  private updateTask(update: GenerationProgress) {
    this.tasks.update(current => {
      const idx = current.findIndex(t => t.taskId === update.taskId);
      if (idx === -1) return current;
      const next = [...current];
      next[idx] = { ...next[idx], ...update };
      return next;
    });
  }

  copyText(task: GenerationProgress) {
    const text = (task.caption || '') + '\n\n' + (task.hashtags || '');
    navigator.clipboard.writeText(text).then(() => this.toastSvc.success('Texte copié !'));
  }

  downloadPoster(elementId: string, taskId: string) {
    const el = document.getElementById(elementId);
    if (!el) return;
    html2canvas(el, { useCORS: true, allowTaint: true, scale: 2 }).then(canvas => {
      const link = document.createElement('a');
      link.download = `campagne-${taskId.substring(0, 6)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      this.toastSvc.success('Export HD téléchargé !');
    }).catch(() => this.toastSvc.error("Erreur lors de l'export."));
  }
}
