import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';

import { AnnouncementBarComponent } from '../announcement-bar/announcement-bar.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule, AnnouncementBarComponent],
  template: `
    <app-announcement-bar></app-announcement-bar>
    <header [class]="headerClass()">
      <nav class="nav-inner">
        <div class="nav-row">

          <!-- Logo -->
          <a routerLink="/" class="nav-logo group">
            <img src="assets/logo.png" alt="pharma_alyosr"
                 class="nav-logo__img"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
            <div class="nav-logo__fallback">
              <div class="nav-logo__icon">P</div>
              <span class="nav-logo__text">pharma_<span class="nav-logo__accent">alyosr</span></span>
            </div>
          </a>

          <!-- Desktop nav links -->
          <div class="nav-links">
            <a routerLink="/" routerLinkActive="nav-link--active" [routerLinkActiveOptions]="{exact:true}" class="nav-link">Accueil</a>
            <a routerLink="/shop" routerLinkActive="nav-link--active" class="nav-link">Boutique</a>
            <a routerLink="/categories" routerLinkActive="nav-link--active" class="nav-link">Catégories</a>
            <a routerLink="/blog" routerLinkActive="nav-link--active" class="nav-link">Conseils Santé</a>
            <a routerLink="/about" routerLinkActive="nav-link--active" class="nav-link">À propos</a>
          </div>

          <!-- Desktop right actions -->
          <div class="nav-actions">
            <!-- Search -->
            <button (click)="searchOpen.set(!searchOpen())" class="nav-icon-btn" aria-label="Rechercher">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>

            <!-- Wishlist -->
            <a routerLink="/wishlist" class="nav-icon-btn" aria-label="Favoris">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </a>

            <!-- Cart -->
            <a routerLink="/cart" class="nav-icon-btn nav-icon-btn--cart" aria-label="Panier">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              @if (cart.itemCount() > 0) {
                <span class="cart-badge">{{ cart.itemCount() }}</span>
              }
            </a>

            <!-- Auth -->
            @if (auth.isLoggedIn()) {
              <div class="profile-wrap" #profileWrap>
                <button class="profile-btn" (click)="toggleProfile($event)">
                  <div class="profile-avatar">{{ auth.currentUser()?.firstName?.charAt(0) }}</div>
                  <span class="profile-name">{{ auth.currentUser()?.firstName }}</span>
                  <svg class="profile-chevron" [class.rotated]="profileOpen()" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                @if (profileOpen()) {
                  <div class="dropdown" (click)="$event.stopPropagation()">
                    <div class="dropdown__header">
                      <p class="dropdown__sub">Connecté en tant que</p>
                      <p class="dropdown__name">{{ auth.currentUser()?.firstName }} {{ auth.currentUser()?.lastName }}</p>
                    </div>
                    <a routerLink="/profile" class="dropdown-item">
                      <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                      Mon Profil
                    </a>
                    <a routerLink="/profile/orders" class="dropdown-item">
                      <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                      Mes Commandes
                    </a>
                    @if (auth.isAdmin()) {
                      <a routerLink="/admin" class="dropdown-item dropdown-item--admin">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        Administration
                      </a>
                    }
                    <div class="dropdown__divider"></div>
                    <button (click)="auth.logout()" class="dropdown-item dropdown-item--danger">
                      <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                      Se déconnecter
                    </button>
                  </div>
                }
              </div>
            } @else {
              <a routerLink="/auth/login" class="nav-btn-primary">Se connecter</a>
            }
          </div>

          <!-- Mobile menu toggle -->
          <button (click)="menuOpen.set(!menuOpen())" class="nav-icon-btn nav-mobile-toggle" aria-label="Menu">
            @if (!menuOpen()) {
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            } @else {
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            }
          </button>
        </div>

        <!-- Search bar -->
        @if (searchOpen()) {
          <div class="search-bar">
            <div class="search-bar__inner">
              <svg class="search-bar__icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input type="text" [(ngModel)]="searchQuery" name="q"
                     placeholder="Rechercher produits, marques..."
                     class="search-bar__input"
                     (input)="onSearchInput()"
                     (keydown.enter)="doSearch()"
                     (keydown.escape)="closeSearch()"
                     autofocus>
              @if (searchQuery) {
                <button (click)="searchQuery=''; suggestions.set([])" class="search-bar__clear">
                  <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              }
              @if (suggestions().length > 0) {
                <div class="suggestions">
                  @for (s of suggestions(); track s.id) {
                    <button (click)="goToProduct(s)" class="suggestion-item">
                      <img [src]="s.imageUrl" [alt]="s.name" class="suggestion-item__img"
                           onerror="this.src='https://placehold.co/40x40?text=P'">
                      <div class="suggestion-item__text">
                        <p class="suggestion-item__name">{{ s.name }}</p>
                        <p class="suggestion-item__price">{{ s.price | number:'1.2-2' }} TND</p>
                      </div>
                      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  }
                  <button (click)="doSearch()" class="suggestion-all">
                    Voir tous les résultats pour "{{ searchQuery }}"
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                    </svg>
                  </button>
                </div>
              }
            </div>
          </div>
        }

        <!-- Mobile menu -->
        @if (menuOpen()) {
          <div class="mobile-menu">
            <a routerLink="/"           (click)="menuOpen.set(false)" class="mobile-link">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
              Accueil
            </a>
            <a routerLink="/shop"       (click)="menuOpen.set(false)" class="mobile-link">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
              Boutique
            </a>
            <a routerLink="/categories" (click)="menuOpen.set(false)" class="mobile-link">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
              Catégories
            </a>
            <a routerLink="/blog"       (click)="menuOpen.set(false)" class="mobile-link">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              Conseils Santé
            </a>
            <a routerLink="/wishlist"   (click)="menuOpen.set(false)" class="mobile-link">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              Favoris
            </a>
            <a routerLink="/cart"       (click)="menuOpen.set(false)" class="mobile-link">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              Panier
              @if (cart.itemCount() > 0) {
                <span class="mobile-link__badge">{{ cart.itemCount() }}</span>
              }
            </a>
            <div class="mobile-divider"></div>
            @if (auth.isLoggedIn()) {
              <a routerLink="/profile" (click)="menuOpen.set(false)" class="mobile-link">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                Mon Profil
              </a>
              <button (click)="auth.logout(); menuOpen.set(false)" class="mobile-link mobile-link--danger">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                Se déconnecter
              </button>
            } @else {
              <a routerLink="/auth/login" (click)="menuOpen.set(false)" class="nav-btn-primary mobile-btn-primary">Se connecter</a>
            }
          </div>
        }
      </nav>
    </header>

    <style>
      /* ─── Base header ─── */
      :host {
        display: block;
        position: relative;
        z-index: 99999 !important;
      }
      app-navbar, header {
        position: sticky; top: 0; z-index: 99999 !important;
        transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
      }
      .nav-scrolled {
        background: rgba(255,255,255,0.98) !important;
        box-shadow: 0 1px 0 rgba(0,0,0,0.06), 0 4px 24px rgba(0,0,0,0.04);
        border-bottom: 1px solid rgba(22,163,74,0.08) !important;
      }
      .nav-default {
        background: #ffffff;
        border-bottom: 1px solid transparent;
      }
      .nav-inner { max-width: 1280px; margin: 0 auto; padding: 0 2rem; overflow: visible; }
      .nav-row { display: flex; align-items: center; justify-content: space-between; height: 68px; gap: 1rem; overflow: visible; }

      /* ─── Logo ─── */
      .nav-logo { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; flex-shrink: 0; }
      .nav-logo__img { height: 44px; width: auto; object-fit: contain; transition: transform 0.3s; }
      .nav-logo:hover .nav-logo__img { transform: scale(1.04); }
      .nav-logo__fallback { display: none; align-items: center; gap: 0.5rem; }
      .nav-logo__icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg,#16a34a,#0891b2); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; color: white; }
      .nav-logo__text { font-weight: 700; font-size: 1.05rem; color: #0f172a; }
      .nav-logo__accent { color: #16a34a; }

      /* ─── Desktop links ─── */
      .nav-links { display: none; align-items: center; gap: 0.25rem; }
      @media (min-width: 1024px) { .nav-links { display: flex; } }
      .nav-link {
        padding: 0.5rem 0.875rem; font-size: 0.875rem; font-weight: 500;
        color: #475569; border-radius: 0.75rem; text-decoration: none;
        transition: all 0.2s; white-space: nowrap; position: relative;
      }
      .nav-link:hover { color: #16a34a; background: rgba(22,163,74,0.06); }
      .nav-link--active { color: #16a34a !important; font-weight: 600 !important; background: rgba(22,163,74,0.08) !important; }

      /* ─── Actions ─── */
      .nav-actions { display: none; align-items: center; gap: 0.25rem; }
      @media (min-width: 1024px) { .nav-actions { display: flex; } }
      .nav-mobile-toggle { display: flex !important; }
      @media (min-width: 1024px) { .nav-mobile-toggle { display: none !important; } }

      .nav-icon-btn {
        width: 40px; height: 40px; border-radius: 0.75rem; border: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        color: #475569; background: transparent;
        transition: all 0.2s; text-decoration: none; position: relative;
      }
      .nav-icon-btn:hover { background: rgba(22,163,74,0.07); color: #16a34a; }
      .cart-badge {
        position: absolute; top: -4px; right: -4px; width: 18px; height: 18px;
        background: linear-gradient(135deg,#16a34a,#0891b2); color: white;
        font-size: 0.65rem; font-weight: 700; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        border: 2px solid white;
      }

      /* ─── Profile ─── */
      .profile-wrap { position: relative; display: inline-block; }
      .profile-btn {
        display: flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.75rem;
        border-radius: 0.875rem; border: none; cursor: pointer; background: transparent;
        transition: background 0.2s;
      }
      .profile-btn:hover { background: rgba(22,163,74,0.06); }
      .profile-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg,#16a34a,#0891b2); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; color: white; flex-shrink: 0; }
      .profile-name { font-size: 0.875rem; font-weight: 600; color: #334155; }
      .profile-chevron { color: #94a3b8; transition: transform 0.25s; }
      .profile-chevron.rotated { transform: rotate(180deg); }

      /* ─── Dropdown ─── */
      .dropdown {
        position: absolute; right: 0; top: calc(100% + 8px); width: 230px;
        background: #ffffff !important; border-radius: 1rem;
        box-shadow: 0 20px 50px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.15);
        border: 1px solid #e2e8f0; padding: 0.5rem 0;
        animation: dropDown 0.18s cubic-bezier(0.16,1,0.3,1);
        z-index: 99999 !important;
      }
      @keyframes dropDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:none; } }
      .dropdown__header { padding: 0.75rem 1rem; border-bottom: 1px solid #f1f5f9; margin-bottom: 0.25rem; }
      .dropdown__sub { font-size: 0.7rem; color: #94a3b8; font-weight: 500; margin-bottom: 2px; }
      .dropdown__name { font-size: 0.875rem; font-weight: 700; color: #0f172a; }
      .dropdown__divider { height: 1px; background: #f1f5f9; margin: 0.25rem 0; }
      .dropdown-item {
        display: flex; align-items: center; gap: 0.625rem; padding: 0.6rem 1rem;
        font-size: 0.85rem; color: #334155; text-decoration: none;
        transition: background 0.15s; width: 100%; border: none; background: transparent;
        cursor: pointer; text-align: left;
      }
      .dropdown-item:hover { background: rgba(22,163,74,0.05); color: #16a34a; }
      .dropdown-item--admin { color: #16a34a; font-weight: 600; }
      .dropdown-item--danger { color: #e11d48; }
      .dropdown-item--danger:hover { background: rgba(225,29,72,0.05); color: #e11d48; }

      /* ─── Auth button ─── */
      .nav-btn-primary {
        display: inline-flex; align-items: center; padding: 0.55rem 1.25rem;
        background: linear-gradient(135deg, #16a34a 0%, #0891b2 100%);
        color: white; font-weight: 600; font-size: 0.875rem; border-radius: 0.875rem;
        text-decoration: none; transition: all 0.3s; border: none; cursor: pointer;
        box-shadow: 0 4px 14px rgba(22,163,74,0.3);
      }
      .nav-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(22,163,74,0.4); }

      /* ─── Search bar ─── */
      .search-bar { padding: 0 0 1rem; }
      .search-bar__inner { position: relative; }
      .search-bar__icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
      .search-bar__input {
        width: 100%; padding: 0.75rem 3rem; border: 1.5px solid #e2e8f0;
        border-radius: 0.875rem; font-size: 0.9rem; outline: none;
        transition: border-color 0.2s, box-shadow 0.2s; font-family: inherit;
        background: #fafafa; color: #0f172a;
      }
      .search-bar__input:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,0.08); background: white; }
      .search-bar__input::placeholder { color: #94a3b8; }
      .search-bar__clear { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; background: none; border: none; cursor: pointer; padding: 0.25rem; border-radius: 0.375rem; transition: color 0.2s; }
      .search-bar__clear:hover { color: #475569; }

      /* ─── Suggestions ─── */
      .suggestions {
        position: absolute; top: calc(100% + 0.5rem); left: 0; right: 0;
        background: white; border-radius: 1rem; z-index: 100;
        box-shadow: 0 8px 32px rgba(0,0,0,0.10); border: 1px solid #f1f5f9;
        overflow: hidden; animation: dropDown 0.15s ease;
      }
      .suggestion-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; width: 100%; border: none; background: transparent; cursor: pointer; transition: background 0.15s; }
      .suggestion-item:hover { background: rgba(22,163,74,0.04); }
      .suggestion-item__img { width: 40px; height: 40px; border-radius: 0.625rem; object-fit: cover; background: #f8fafc; flex-shrink: 0; }
      .suggestion-item__text { flex: 1; min-width: 0; text-align: left; }
      .suggestion-item__name { font-size: 0.875rem; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .suggestion-item__price { font-size: 0.75rem; color: #16a34a; font-weight: 600; margin-top: 1px; }
      .suggestion-all { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding: 0.75rem 1rem; width: 100%; border: none; border-top: 1px solid #f1f5f9; background: #f8fafb; font-size: 0.8rem; font-weight: 700; color: #16a34a; cursor: pointer; transition: background 0.15s; }
      .suggestion-all:hover { background: rgba(22,163,74,0.05); }

      /* ─── Mobile menu ─── */
      .mobile-menu {
        display: flex; flex-direction: column; gap: 0.125rem;
        border-top: 1px solid rgba(22,163,74,0.08); padding: 0.75rem 0 1rem;
        animation: dropDown 0.2s cubic-bezier(0.16,1,0.3,1);
      }
      @media (min-width: 1024px) { .mobile-menu { display: none; } }
      .mobile-link {
        display: flex; align-items: center; gap: 0.75rem;
        padding: 0.75rem 0.875rem; font-size: 0.875rem; font-weight: 500;
        color: #334155; border-radius: 0.75rem; text-decoration: none;
        transition: all 0.15s; border: none; background: transparent; cursor: pointer; width: 100%; text-align: left;
      }
      .mobile-link:hover { background: rgba(22,163,74,0.06); color: #16a34a; }
      .mobile-link--danger { color: #e11d48; }
      .mobile-link--danger:hover { background: rgba(225,29,72,0.05); color: #e11d48; }
      .mobile-link__badge { margin-left: auto; background: linear-gradient(135deg,#16a34a,#0891b2); color: white; font-size: 0.7rem; font-weight: 700; padding: 0.1rem 0.45rem; border-radius: 9999px; }
      .mobile-divider { height: 1px; background: #f1f5f9; margin: 0.375rem 0; }
      .mobile-btn-primary { justify-content: center; margin-top: 0.5rem; }
    </style>
  `
})
export class NavbarComponent {
  auth       = inject(AuthService);
  cart       = inject(CartService);
  router     = inject(Router);
  productSvc = inject(ProductService);

  scrolled    = signal(false);
  menuOpen    = signal(false);
  searchOpen  = signal(false);
  profileOpen = signal(false);
  searchQuery = '';
  suggestions = signal<any[]>([]);
  private searchTimer: any;

  @HostListener('window:scroll')
  onScroll() { this.scrolled.set(window.scrollY > 10); }

  @HostListener('document:click')
  onDocumentClick() { this.profileOpen.set(false); }

  toggleProfile(event: MouseEvent) {
    event.stopPropagation();
    this.profileOpen.update(v => !v);
  }

  headerClass(): string {
    return this.scrolled() || this.menuOpen() ? 'nav-scrolled' : 'nav-default';
  }

  onSearchInput() {
    clearTimeout(this.searchTimer);
    if (!this.searchQuery.trim() || this.searchQuery.trim().length < 2) {
      this.suggestions.set([]); return;
    }
    this.searchTimer = setTimeout(() => {
      this.productSvc.getSuggestions(this.searchQuery.trim()).subscribe({
        next: s => this.suggestions.set(s),
        error: () => this.suggestions.set([])
      });
    }, 300);
  }

  doSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery.trim() } });
      this.closeSearch();
    }
  }

  goToProduct(s: any) {
    this.router.navigate(['/products', s.id]);
    this.closeSearch();
  }

  closeSearch() {
    this.searchOpen.set(false);
    this.searchQuery = '';
    this.suggestions.set([]);
  }
}
