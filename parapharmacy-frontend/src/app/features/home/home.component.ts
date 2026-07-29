import { Component, inject, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, NgZone, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Product, Category } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  template: `
    <!-- ══════════════════════════════════════════════
         LUXURY HERO
    ══════════════════════════════════════════════════ -->
    <section #heroSection class="lux-hero" (mousemove)="onMouseMove($event)">
      <div class="lux-hero__bg"></div>
      <div class="lux-hero__vignette"></div>

      <!-- RIGHT: Cinematic Visual -->
      <div class="lux-hero__visual" #heroVisual>
        <div class="lux-hero__img-wrap" #heroImgWrap>
          <img #heroImg src="/hero-cinematic.png" alt="Soin naturel premium" class="lux-hero__img" loading="eager"/>
          <div class="lux-hero__img-vignette"></div>
        </div>
        <!-- Floating badge — Rating -->
        <div class="lux-float-badge lux-float-badge--rating" #badge1>
          <div class="lux-float-badge__icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
          <div class="lux-float-badge__text">
            <span class="lux-float-badge__value">4.9 / 5</span>
            <span class="lux-float-badge__label">12 000+ clients</span>
          </div>
        </div>
        <!-- Floating badge — New -->
        <div class="lux-float-badge lux-float-badge--new" #badge2>
          <div class="lux-float-badge__dot"></div>
          <span class="lux-float-badge__tag">Nouveauté · Sérum Vitamine C</span>
        </div>
      </div>

      <!-- LEFT: Editorial Text -->
      <div class="lux-hero__content">
        <div class="lux-eyebrow" #heroEyebrow>
          <span class="lux-eyebrow__line"></span>
          <span class="lux-eyebrow__text">Parapharmacie Premium en Ligne</span>
        </div>
        <h1 class="lux-headline" #heroHeadline>
          <span class="lux-headline__row"><span>Votre Santé,</span></span>
          <span class="lux-headline__row"><span>Notre</span>&nbsp;<span class="lux-headline__gradient">Priorité</span></span>
        </h1>
        <p class="lux-descriptor" #heroDescriptor>
          Découvrez notre sélection de soins de peau, compléments alimentaires
          et produits bien-être — <em>sélectionnés par des professionnels de santé.</em>
        </p>
        <div class="lux-cta-row" #heroCtas>
          <a routerLink="/shop" class="lux-btn lux-btn--primary">
            Découvrir la boutique
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </a>
          <a routerLink="/blog" class="lux-btn lux-btn--ghost">Conseils santé</a>
        </div>
        <!-- Trust badges — clean SVG icons, no emoji -->
        <div class="lux-trust" #heroTrust>
          @for (b of trustBadges; track b.label) {
            <div class="lux-trust__item">
              <svg class="lux-trust__svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path [attr.d]="b.iconPath"/>
              </svg>
              <span class="lux-trust__label">{{ b.label }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Scroll hint -->
      <div class="lux-scroll-hint" #scrollHint>
        <div class="lux-scroll-hint__mouse"><div class="lux-scroll-hint__wheel"></div></div>
        <span class="lux-scroll-hint__text">Défiler</span>
      </div>
    </section>

    <!-- ══ STATS BAND ══ -->
    <section class="stats-band">
      <div class="stats-band__inner">
        @for (s of stats; track s.label) {
          <div class="stat-item">
            <div class="stat-item__value">{{ s.value }}</div>
            <div class="stat-item__sep"></div>
            <div class="stat-item__label">{{ s.label }}</div>
          </div>
        }
      </div>
    </section>

    <!-- ══ LIFESTYLE GALLERY — Auto-rotating ══ -->
    <section class="gallery-section">
      <div class="gallery-track">
        @for (slide of gallerySlides; track slide.src; let i = $index) {
          <div class="gallery-slide" [class.is-active]="activeSlide === i">
            <img [src]="slide.src" [alt]="slide.caption" class="gallery-slide__img" loading="lazy"/>
            <div class="gallery-slide__overlay">
              <div class="gallery-slide__content">
                <span class="gallery-slide__eyebrow">{{ slide.eyebrow }}</span>
                <h3 class="gallery-slide__title">{{ slide.title }}</h3>
              </div>
            </div>
          </div>
        }
      </div>
      <!-- Progress bar auto-reset key -->
      <div class="gallery-progress">
        <div class="gallery-progress__bar" [style.animation-duration]="slideInterval + 'ms'"></div>
      </div>
      <!-- Navigation dots -->
      <div class="gallery-dots">
        @for (slide of gallerySlides; track slide.src; let i = $index) {
          <button class="gallery-dot" [class.is-active]="activeSlide === i" (click)="goToSlide(i)" [attr.aria-label]="'Slide ' + (i+1)"></button>
        }
      </div>
      <!-- Slide counter -->
      <div class="gallery-counter">
        <span class="gallery-counter__current">0{{ activeSlide + 1 }}</span>
        <span class="gallery-counter__sep">/</span>
        <span class="gallery-counter__total">0{{ gallerySlides.length }}</span>
      </div>
    </section>

    <!-- ══ CATEGORIES ══ -->
    <section class="page-section page-section--light">
      <div class="section-container">
        <div class="section-header text-center">
          <span class="section-overline">Collections</span>
          <h2 class="section-title">Explorez notre gamme</h2>
          <p class="section-sub section-sub--centered">Des produits sélectionnés pour chaque besoin de santé et bien-être</p>
        </div>
        @if (catLoading()) {
          <div class="cat-grid">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="skeleton-card"></div>
            }
          </div>
        } @else {
          <div class="cat-grid">
            @for (cat of categories(); track cat.id) {
              <a [routerLink]="['/shop']" [queryParams]="{category: cat.id}" class="cat-card">
                <div class="cat-card__inner">
                  <span class="cat-card__name">{{ cat.name }}</span>
                  <span class="cat-card__count">{{ cat.productCount }} produits</span>
                </div>
                <div class="cat-card__arrow">
                  <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                </div>
              </a>
            }
          </div>
        }
      </div>
    </section>

    <!-- ══ FEATURED PRODUCTS ══ -->
    <section class="page-section page-section--cream">
      <div class="section-container">
        <div class="section-header section-header--row">
          <div>
            <span class="section-overline">Sélection</span>
            <h2 class="section-title">Nos meilleures ventes</h2>
          </div>
          <a routerLink="/shop" class="link-arrow">
            Voir tout
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </a>
        </div>
        @if (prodLoading()) {
          <div class="product-grid">
            @for (i of [1,2,3,4]; track i) {
              <div class="skeleton-card skeleton-card--tall"></div>
            }
          </div>
        } @else {
          <div class="product-grid">
            @for (p of featured(); track p.id) {
              <app-product-card [product]="p"/>
            }
          </div>
        }
      </div>
    </section>

    <!-- ══ WHY US ══ -->
    <section class="why-section">
      <div class="why-section__glow"></div>
      <div class="section-container">
        <div class="section-header text-center">
          <span class="section-overline section-overline--light">Notre engagement</span>
          <h2 class="section-title section-title--light">Ce qui nous distingue</h2>
          <p class="section-sub section-sub--light section-sub--centered">Qualité, confiance et service — notre engagement envers vous</p>
        </div>
        <div class="features-grid">
          @for (f of features; track f.title) {
            <div class="feature-card">
              <div class="feature-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path [attr.d]="f.iconPath"/>
                </svg>
              </div>
              <h3 class="feature-card__title">{{ f.title }}</h3>
              <p class="feature-card__text">{{ f.text }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ══ SALE PRODUCTS ══ -->
    <section class="page-section page-section--light">
      <div class="section-container">
        <div class="section-header section-header--row">
          <div>
            <span class="section-overline">Offres exclusives</span>
            <h2 class="section-title">Promotions en cours</h2>
          </div>
          <a routerLink="/shop" [queryParams]="{sale:true}" class="link-arrow">
            Toutes les offres
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </a>
        </div>
        @if (!prodLoading()) {
          <div class="product-grid">
            @for (p of onSale(); track p.id) {
              <app-product-card [product]="p"/>
            }
          </div>
        }
      </div>
    </section>

    <!-- ══ TESTIMONIALS ══ -->
    <section class="page-section page-section--dark">
      <div class="section-container">
        <div class="section-header text-center">
          <span class="section-overline section-overline--light">Témoignages</span>
          <h2 class="section-title section-title--light">Ce que disent nos clients</h2>
        </div>
        <div class="testimonials-grid">
          @for (t of testimonials; track t.name) {
            <div class="testimonial-card">
              <div class="testimonial-card__quote">
                <svg viewBox="0 0 40 28" fill="currentColor" width="36" height="24">
                  <path d="M0 28V16.8C0 7.093 5.973 1.493 17.92 0l1.493 2.987C13.44 4.107 10.453 6.88 9.707 11.2H16.8V28H0zm22.4 0V16.8C22.4 7.093 28.373 1.493 40.32 0l1.493 2.987C36.267 4.107 33.28 6.88 32.533 11.2H39.2V28H22.4z"/>
                </svg>
              </div>
              <p class="testimonial-card__text">{{ t.text }}</p>
              <div class="testimonial-card__stars">
                @for (s of [1,2,3,4,5]; track s) {
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                }
              </div>
              <div class="testimonial-card__author">
                <div class="testimonial-card__avatar">{{ t.name.charAt(0) }}</div>
                <div>
                  <p class="testimonial-card__name">{{ t.name }}</p>
                  <p class="testimonial-card__role">{{ t.role }}</p>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ══ CTA ══ -->
    <section class="cta-section">
      <div class="cta-section__bg"></div>
      <div class="section-container">
        <div class="cta-section__content">
          <span class="section-overline section-overline--light">Commencez maintenant</span>
          <h2 class="cta-section__title">Prêt à prendre soin de vous&nbsp;?</h2>
          <p class="cta-section__sub">Rejoignez des milliers de clients satisfaits et découvrez nos produits de qualité pharmaceutique.</p>
          <div class="cta-section__actions">
            <a routerLink="/shop" class="lux-btn lux-btn--primary">Commencer mes achats</a>
            <a routerLink="/auth/register" class="lux-btn lux-btn--ghost">Créer un compte</a>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ SCOPED STYLES ══ -->
    <style>
      /* ─────────────────────────────────────────────
         LUXURY HERO
      ───────────────────────────────────────────── */
      :host {
        display: block;
        position: relative;
        z-index: 1;
      }
      .lux-hero {
        position: relative;
        z-index: 1;
        min-height: 100vh;
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: center;
        overflow: hidden;
        background: #071a12;
      }
      @media (max-width: 1024px) { .lux-hero { grid-template-columns: 1fr; } }

      .lux-hero__bg {
        position: absolute; inset: 0; z-index: 0; pointer-events: none;
        background:
          radial-gradient(ellipse 80% 60% at 70% 50%, rgba(22,101,52,0.55) 0%, transparent 70%),
          radial-gradient(ellipse 50% 80% at 20% 80%, rgba(8,145,178,0.15) 0%, transparent 60%),
          linear-gradient(160deg, #071a12 0%, #0a2218 50%, #071a12 100%);
      }
      .lux-hero__vignette {
        position: absolute; inset: 0; z-index: 2; pointer-events: none;
        background: linear-gradient(to bottom, rgba(7,26,18,0.6) 0%, transparent 20%, transparent 80%, rgba(7,26,18,0.7) 100%);
      }
      .lux-hero__visual {
        position: relative; height: 100vh; z-index: 3; overflow: hidden;
      }
      @media (max-width: 1024px) {
        .lux-hero__visual { position: absolute; inset: 0; height: 100%; opacity: 0.35; z-index: 1; }
      }
      .lux-hero__img-wrap { position: absolute; inset: 0; will-change: transform; }
      .lux-hero__img { width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; transform-origin: center center; }
      .lux-hero__img-vignette {
        position: absolute; inset: 0;
        background:
          linear-gradient(to right, #071a12 0%, rgba(7,26,18,0.6) 30%, transparent 60%),
          linear-gradient(to bottom, rgba(7,26,18,0.5) 0%, transparent 25%, transparent 75%, rgba(7,26,18,0.7) 100%);
        pointer-events: none;
      }

      /* Floating glass badges */
      .lux-float-badge {
        position: absolute; display: flex; align-items: center; gap: 0.75rem;
        padding: 0.75rem 1.25rem; border-radius: 100px;
        background: rgba(255,255,255,0.08); backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(255,255,255,0.14);
        box-shadow: 0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1);
        color: white; white-space: nowrap; will-change: transform;
      }
      .lux-float-badge--rating { bottom: 22%; left: -2rem; }
      .lux-float-badge--new    { top: 18%; right: 2rem; }
      .lux-float-badge__icon { width: 36px; height: 36px; border-radius: 50%; background: rgba(245,158,11,0.18); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .lux-float-badge__text  { display: flex; flex-direction: column; gap: 1px; }
      .lux-float-badge__value { font-size: 0.9rem; font-weight: 700; color: #fff; line-height: 1; }
      .lux-float-badge__label { font-size: 0.72rem; color: rgba(255,255,255,0.55); }
      .lux-float-badge__dot   { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 8px #4ade80, 0 0 16px rgba(74,222,128,0.4); flex-shrink: 0; animation: luxPulse 2.5s ease-in-out infinite; }
      .lux-float-badge__tag   { font-size: 0.8rem; font-weight: 500; color: rgba(255,255,255,0.85); }

      /* Hero content */
      .lux-hero__content {
        position: relative; z-index: 10; padding: 0 4rem 0 5rem;
        display: flex; flex-direction: column; gap: 2rem;
      }
      @media (max-width: 1280px) { .lux-hero__content { padding: 0 2rem 0 3rem; } }
      @media (max-width: 1024px) { .lux-hero__content { padding: 8rem 1.5rem 6rem; z-index: 10; } }

      .lux-eyebrow { display: flex; align-items: center; gap: 1rem; opacity: 0; }
      .lux-eyebrow__line { display: block; width: 2.5rem; height: 1px; background: linear-gradient(to right, #4ade80, rgba(74,222,128,0.2)); flex-shrink: 0; }
      .lux-eyebrow__text { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(74,222,128,0.75); }

      .lux-headline { display: flex; flex-direction: column; gap: 0.15em; font-size: clamp(3rem, 5.5vw, 5.5rem); font-weight: 800; line-height: 1.0; letter-spacing: -0.02em; color: #f8fafc; overflow: hidden; }
      .lux-headline__row { display: block; overflow: hidden; line-height: 1.1; }
      .lux-headline__row > span, .lux-headline__gradient { display: inline-block; transform: translateY(110%); }
      .lux-headline__gradient { background: linear-gradient(135deg, #4ade80 0%, #22d3ee 60%, #86efac 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

      .lux-descriptor { font-size: 1.05rem; line-height: 1.8; color: rgba(255,255,255,0.55); max-width: 420px; font-weight: 400; opacity: 0; }
      .lux-descriptor em { color: rgba(255,255,255,0.75); font-style: normal; }

      .lux-cta-row { display: flex; flex-wrap: wrap; gap: 1rem; opacity: 0; }
      .lux-btn { display: inline-flex; align-items: center; gap: 0.6rem; padding: 0.9rem 2rem; border-radius: 0.875rem; font-weight: 600; font-size: 0.95rem; text-decoration: none; transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s cubic-bezier(0.16,1,0.3,1); cursor: pointer; }
      .lux-btn--primary { background: linear-gradient(135deg, #16a34a 0%, #0891b2 100%); color: #fff; box-shadow: 0 8px 28px rgba(22,163,74,0.40), 0 2px 8px rgba(0,0,0,0.2); border: none; }
      .lux-btn--primary:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(22,163,74,0.50), 0 4px 12px rgba(0,0,0,0.25); }
      .lux-btn--ghost { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.85); border: 1.5px solid rgba(255,255,255,0.18); backdrop-filter: blur(8px); }
      .lux-btn--ghost:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.35); transform: translateY(-2px); }

      /* Trust — SVG only, no emoji */
      .lux-trust { display: flex; flex-wrap: wrap; gap: 1.75rem; opacity: 0; }
      .lux-trust__item { display: flex; align-items: center; gap: 0.5rem; }
      .lux-trust__svg { width: 15px; height: 15px; color: rgba(74,222,128,0.65); flex-shrink: 0; }
      .lux-trust__label { font-size: 0.78rem; font-weight: 500; color: rgba(255,255,255,0.45); letter-spacing: 0.02em; }

      /* Scroll hint */
      .lux-scroll-hint { position: absolute; bottom: 2.5rem; left: 50%; transform: translateX(-50%); z-index: 20; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; opacity: 0; }
      .lux-scroll-hint__mouse { width: 24px; height: 38px; border: 1.5px solid rgba(255,255,255,0.3); border-radius: 12px; display: flex; justify-content: center; padding-top: 6px; }
      .lux-scroll-hint__wheel { width: 3px; height: 7px; border-radius: 2px; background: rgba(74,222,128,0.7); animation: luxScrollWheel 2s ease-in-out infinite; }
      .lux-scroll-hint__text { font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.3); }

      /* ─────────────────────────────────────────────
         STATS BAND — dark luxury strip
      ───────────────────────────────────────────── */
      .stats-band {
        background: #080f0b;
        border-top: 1px solid rgba(74,222,128,0.08);
        border-bottom: 1px solid rgba(74,222,128,0.08);
      }
      .stats-band__inner {
        max-width: 1280px; margin: 0 auto; padding: 2.5rem 2rem;
        display: grid; grid-template-columns: repeat(4, 1fr);
      }
      @media (max-width: 768px) { .stats-band__inner { grid-template-columns: repeat(2, 1fr); gap: 0; } }
      .stat-item { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.25rem 1rem; text-align: center; position: relative; }
      .stat-item + .stat-item::before { content: ''; position: absolute; left: 0; top: 20%; bottom: 20%; width: 1px; background: rgba(255,255,255,0.06); }
      .stat-item__value { font-size: 2rem; font-weight: 800; color: #f0fdf4; line-height: 1; letter-spacing: -0.03em; }
      .stat-item__sep { width: 1.25rem; height: 1px; background: linear-gradient(to right, rgba(74,222,128,0.5), rgba(8,145,178,0.5)); margin: 0.45rem auto; }
      .stat-item__label { font-size: 0.72rem; color: rgba(255,255,255,0.35); font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; }

      /* ─────────────────────────────────────────────
         LIFESTYLE GALLERY — auto-rotating
      ───────────────────────────────────────────── */
      .gallery-section {
        position: relative; overflow: hidden;
        height: 58vh; min-height: 360px; max-height: 580px;
        background: #0a1f14;
      }
      .gallery-track { position: relative; width: 100%; height: 100%; }
      .gallery-slide {
        position: absolute; inset: 0;
        opacity: 0; transition: opacity 1.6s cubic-bezier(0.4,0,0.2,1);
        pointer-events: none;
      }
      .gallery-slide.is-active { opacity: 1; pointer-events: auto; }
      .gallery-slide__img {
        width: 100%; height: 100%; object-fit: cover; object-position: center; display: block;
        transform: scale(1.06); transition: transform 22s linear;
      }
      .gallery-slide.is-active .gallery-slide__img { transform: scale(1.0); }
      .gallery-slide__overlay {
        position: absolute; inset: 0;
        background: linear-gradient(to right, rgba(4,16,9,0.75) 0%, rgba(4,16,9,0.35) 45%, transparent 75%);
        display: flex; align-items: flex-end; padding: 3rem 4.5rem;
      }
      @media (max-width: 768px) { .gallery-slide__overlay { padding: 2rem 1.5rem; } }
      .gallery-slide__content { max-width: 520px; }
      .gallery-slide__eyebrow { display: block; font-size: 0.68rem; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(74,222,128,0.85); font-weight: 600; margin-bottom: 0.6rem; }
      .gallery-slide__title { font-size: clamp(1.4rem, 3vw, 2.2rem); font-weight: 700; color: #f0fdf4; line-height: 1.2; letter-spacing: -0.02em; }

      /* Progress bar */
      .gallery-progress {
        position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
        background: rgba(255,255,255,0.08); z-index: 10;
      }
      .gallery-progress__bar {
        height: 100%; background: linear-gradient(to right, #4ade80, #22d3ee);
        animation: galleryProgress linear forwards;
        transform-origin: left; will-change: transform;
      }
      @keyframes galleryProgress { from { transform: scaleX(0); } to { transform: scaleX(1); } }

      /* Dots */
      .gallery-dots {
        position: absolute; bottom: 1.75rem; left: 4.5rem;
        display: flex; gap: 0.5rem; z-index: 10;
      }
      @media (max-width: 768px) { .gallery-dots { left: 1.5rem; } }
      .gallery-dot {
        width: 24px; height: 2px; border-radius: 2px;
        background: rgba(255,255,255,0.3); border: none; cursor: pointer;
        padding: 0; transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
      }
      .gallery-dot.is-active { background: #4ade80; width: 40px; }

      /* Counter */
      .gallery-counter {
        position: absolute; bottom: 1.5rem; right: 3rem;
        display: flex; align-items: center; gap: 0.35rem; z-index: 10;
      }
      .gallery-counter__current { font-size: 1.2rem; font-weight: 700; color: #f0fdf4; line-height: 1; }
      .gallery-counter__sep { font-size: 0.75rem; color: rgba(255,255,255,0.3); margin-bottom: -2px; }
      .gallery-counter__total { font-size: 0.85rem; color: rgba(255,255,255,0.4); }

      /* ─────────────────────────────────────────────
         SHARED SECTION LAYOUT
      ───────────────────────────────────────────── */
      .page-section { padding: 4rem 0; }
      .page-section--light { background: #fdfdfb; }
      .page-section--cream { background: #f4f6f5; }
      .page-section--dark  { background: #071a12; }
      .section-container { max-width: 1280px; margin: 0 auto; padding: 0 2rem; }

      .section-header { margin-bottom: 3.5rem; }
      .section-header.text-center { text-align: center; }
      .section-header--row { display: flex; align-items: flex-end; justify-content: space-between; }
      @media (max-width: 640px) { .section-header--row { flex-direction: column; align-items: flex-start; gap: 1rem; } }

      .section-overline { display: block; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: #16a34a; margin-bottom: 0.6rem; }
      .section-overline--light { color: rgba(74,222,128,0.7); }

      .section-title { font-size: clamp(1.9rem, 3.5vw, 2.6rem); font-weight: 800; color: #0f172a; line-height: 1.15; letter-spacing: -0.025em; margin: 0; }
      .section-title--light { color: #f0fdf4; }

      .section-sub { color: #64748b; font-size: 1rem; margin-top: 0.75rem; line-height: 1.75; }
      .section-sub--light { color: rgba(255,255,255,0.45); }
      .section-sub--centered { max-width: 500px; margin-left: auto; margin-right: auto; }

      .link-arrow { display: inline-flex; align-items: center; gap: 0.45rem; font-size: 0.85rem; font-weight: 600; color: #16a34a; text-decoration: none; white-space: nowrap; transition: gap 0.25s; }
      .link-arrow:hover { gap: 0.7rem; }

      /* ─────────────────────────────────────────────
         CATEGORIES — no emoji, clean typography cards
      ───────────────────────────────────────────── */
      .cat-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; }
      @media (max-width: 1024px) { .cat-grid { grid-template-columns: repeat(3, 1fr); } }
      @media (max-width: 640px)  { .cat-grid { grid-template-columns: repeat(2, 1fr); } }

      .cat-card {
        display: flex; flex-direction: column; justify-content: space-between;
        padding: 1.5rem 1.25rem; border-radius: 1rem; text-decoration: none;
        border: 1.5px solid #e8edf2; background: white; min-height: 110px;
        position: relative; overflow: hidden;
        transition: all 0.35s cubic-bezier(0.34,1.2,0.64,1);
      }
      .cat-card__inner { position: relative; z-index: 1; }
      .cat-card__name { display: block; font-size: 0.875rem; font-weight: 700; color: #1e293b; margin-bottom: 0.35rem; transition: color 0.3s; line-height: 1.3; }
      .cat-card__count { display: block; font-size: 0.72rem; color: #94a3b8; font-weight: 500; transition: color 0.3s; }
      .cat-card__arrow { color: #cbd5e1; transition: all 0.3s; align-self: flex-end; position: relative; z-index: 1; opacity: 0.5; }
      .cat-card::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, #16a34a, #0891b2); opacity: 0; transition: opacity 0.35s; border-radius: inherit; }
      .cat-card:hover { border-color: transparent; transform: translateY(-5px); box-shadow: 0 20px 48px rgba(22,163,74,0.14); }
      .cat-card:hover::after { opacity: 1; }
      .cat-card:hover .cat-card__name { color: white; }
      .cat-card:hover .cat-card__count { color: rgba(255,255,255,0.65); }
      .cat-card:hover .cat-card__arrow { color: white; opacity: 0.9; }

      /* ─────────────────────────────────────────────
         PRODUCT GRID
      ───────────────────────────────────────────── */
      .product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
      @media (max-width: 1024px) { .product-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 640px)  { .product-grid { grid-template-columns: 1fr; } }

      /* ─────────────────────────────────────────────
         WHY US — dark forest, glass cards, SVG icons
      ───────────────────────────────────────────── */
      .why-section {
        padding: 4.5rem 0; position: relative; overflow: hidden;
        background: linear-gradient(160deg, #071a12 0%, #0b2119 60%, #071a12 100%);
      }
      .why-section__glow {
        position: absolute; top: -30%; right: -10%; width: 700px; height: 700px;
        background: radial-gradient(circle, rgba(22,163,74,0.10) 0%, transparent 65%);
        pointer-events: none;
      }
      .features-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }
      @media (max-width: 1024px) { .features-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 640px)  { .features-grid { grid-template-columns: 1fr; } }

      .feature-card {
        padding: 2rem 1.75rem; border-radius: 1.25rem;
        background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
        backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
      }
      .feature-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(74,222,128,0.2); transform: translateY(-5px); box-shadow: 0 24px 56px rgba(0,0,0,0.25); }
      .feature-card__icon {
        width: 46px; height: 46px; border-radius: 11px;
        background: rgba(22,163,74,0.1); border: 1px solid rgba(22,163,74,0.18);
        display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem;
      }
      .feature-card__icon svg { width: 20px; height: 20px; color: #4ade80; }
      .feature-card__title { font-size: 0.95rem; font-weight: 700; color: #f0fdf4; margin-bottom: 0.5rem; }
      .feature-card__text { font-size: 0.855rem; color: rgba(255,255,255,0.45); line-height: 1.75; }

      /* ─────────────────────────────────────────────
         TESTIMONIALS — dark, editorial quote style
      ───────────────────────────────────────────── */
      .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
      @media (max-width: 1024px) { .testimonials-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 640px)  { .testimonials-grid { grid-template-columns: 1fr; } }

      .testimonial-card {
        padding: 2rem; border-radius: 1.25rem;
        background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
        transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
      }
      .testimonial-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(74,222,128,0.18); transform: translateY(-4px); }
      .testimonial-card__quote { color: rgba(74,222,128,0.18); margin-bottom: 1rem; }
      .testimonial-card__text { color: rgba(255,255,255,0.6); font-size: 0.885rem; line-height: 1.8; margin-bottom: 1.25rem; }
      .testimonial-card__stars { display: flex; gap: 2px; margin-bottom: 1.5rem; }
      .testimonial-card__author { display: flex; align-items: center; gap: 0.75rem; }
      .testimonial-card__avatar { width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0; background: linear-gradient(135deg, #16a34a, #0891b2); display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; font-size: 0.85rem; }
      .testimonial-card__name { font-size: 0.85rem; font-weight: 700; color: #f0fdf4; }
      .testimonial-card__role { font-size: 0.72rem; color: rgba(255,255,255,0.38); margin-top: 2px; letter-spacing: 0.02em; }

      /* ─────────────────────────────────────────────
         CTA — cinematic dark, no emoji
      ───────────────────────────────────────────── */
      .cta-section { position: relative; padding: 5rem 0; overflow: hidden; background: #041009; }
      .cta-section__bg {
        position: absolute; inset: 0; pointer-events: none;
        background:
          radial-gradient(ellipse 70% 90% at 50% 50%, rgba(22,163,74,0.18) 0%, transparent 70%),
          radial-gradient(ellipse 50% 60% at 80% 10%, rgba(8,145,178,0.12) 0%, transparent 60%);
      }
      .cta-section__content { position: relative; z-index: 1; text-align: center; }
      .cta-section__title { font-size: clamp(2.2rem, 4.5vw, 3.4rem); font-weight: 800; color: #f0fdf4; letter-spacing: -0.025em; margin: 0.75rem 0 1.25rem; line-height: 1.1; }
      .cta-section__sub { font-size: 1.05rem; color: rgba(255,255,255,0.45); max-width: 460px; margin: 0 auto 2.5rem; line-height: 1.75; }
      .cta-section__actions { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; }

      /* ─────────────────────────────────────────────
         SKELETONS
      ───────────────────────────────────────────── */
      .skeleton-card { border-radius: 1rem; height: 110px; background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
      .skeleton-card--tall { height: 320px; }
      @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

      /* ─────────────────────────────────────────────
         KEYFRAMES
      ───────────────────────────────────────────── */
      @keyframes luxPulse {
        0%,100% { box-shadow: 0 0 8px #4ade80, 0 0 16px rgba(74,222,128,0.4); }
        50%      { box-shadow: 0 0 14px #4ade80, 0 0 28px rgba(74,222,128,0.6); }
      }
      @keyframes luxScrollWheel {
        0%   { transform: translateY(0); opacity: 1; }
        80%  { transform: translateY(10px); opacity: 0; }
        81%  { transform: translateY(0); opacity: 0; }
        100% { opacity: 1; }
      }
    </style>
  `
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private ngZone     = inject(NgZone);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('heroSection')    heroSection!:    ElementRef<HTMLElement>;
  @ViewChild('heroImgWrap')    heroImgWrap!:    ElementRef<HTMLElement>;
  @ViewChild('heroImg')        heroImg!:        ElementRef<HTMLImageElement>;
  @ViewChild('heroEyebrow')    heroEyebrow!:    ElementRef<HTMLElement>;
  @ViewChild('heroHeadline')   heroHeadline!:   ElementRef<HTMLElement>;
  @ViewChild('heroDescriptor') heroDescriptor!: ElementRef<HTMLElement>;
  @ViewChild('heroCtas')       heroCtas!:       ElementRef<HTMLElement>;
  @ViewChild('heroTrust')      heroTrust!:      ElementRef<HTMLElement>;
  @ViewChild('heroVisual')     heroVisual!:     ElementRef<HTMLElement>;
  @ViewChild('badge1')         badge1!:         ElementRef<HTMLElement>;
  @ViewChild('badge2')         badge2!:         ElementRef<HTMLElement>;
  @ViewChild('scrollHint')     scrollHint!:     ElementRef<HTMLElement>;

  private lenis?: Lenis;
  private mouseX = 0;
  private mouseY = 0;
  private rafId?: ReturnType<typeof requestAnimationFrame>;
  private slideTimer?: ReturnType<typeof setInterval>;

  activeSlide = 0;
  readonly slideInterval = 20000;

  onMouseMove(e: MouseEvent) {
    if (!isPlatformBrowser(this.platformId)) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    this.mouseX = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
    this.mouseY = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
  }

  goToSlide(i: number) {
    this.activeSlide = i;
    if (this.slideTimer) clearInterval(this.slideTimer);
    this.slideTimer = setInterval(() => this.ngZone.run(() => this.nextSlide()), this.slideInterval);
  }

  private nextSlide() {
    this.activeSlide = (this.activeSlide + 1) % this.gallerySlides.length;
  }

  private productSvc  = inject(ProductService);
  private categorySvc = inject(CategoryService);
  auth = inject(AuthService);

  featured          = signal<Product[]>([]);
  onSale            = signal<Product[]>([]);
  categories        = signal<Category[]>([]);
  aiRecommendations = signal<Product[]>([]);
  prodLoading       = signal(true);
  catLoading        = signal(true);

  /* ── Trust badges — all SVG path icons, no emoji ── */
  trustBadges = [
    {
      iconPath: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
      label: 'Produits certifiés'
    },
    {
      iconPath: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12',
      label: 'Livraison rapide'
    },
    {
      iconPath: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z',
      label: 'Paiement sécurisé'
    },
    {
      iconPath: 'M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z',
      label: 'Support 7j/7'
    },
  ];

  stats = [
    { value: '12 000+', label: 'Clients satisfaits' },
    { value: '500+',    label: 'Produits disponibles' },
    { value: '4.9/5',   label: 'Note moyenne' },
    { value: '48h',     label: 'Livraison express' },
  ];

  /* ── Auto-rotating lifestyle gallery ── */
  gallerySlides = [
    { src: '/gallery-1.png', eyebrow: 'Soins de la peau', title: 'La science au service de votre beauté', caption: 'Skincare lifestyle' },
    { src: '/gallery-2.png', eyebrow: 'Bien-être naturel',  title: 'Des formules pures, des résultats visibles', caption: 'Natural wellness flat-lay' },
    { src: '/gallery-3.png', eyebrow: 'Pharmacie en ligne', title: 'Votre santé, notre expertise', caption: 'Premium wellness products' },
  ];

  /* ── Features — SVG icon paths (Heroicons) ── */
  features = [
    {
      iconPath: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
      title: 'Qualité certifiée',
      text: 'Tous nos produits sont sélectionnés et vérifiés par des professionnels de santé.'
    },
    {
      iconPath: 'M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155',
      title: 'Conseil pharmaceutique',
      text: 'Notre équipe répond à vos questions santé et bien-être 7 jours sur 7.'
    },
    {
      iconPath: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12',
      title: 'Livraison rapide',
      text: 'Livraison express en 24–48h partout en Tunisie. Suivi en temps réel.'
    },
    {
      iconPath: 'M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3',
      title: 'Retour facile',
      text: 'Retour gratuit sous 14 jours. Satisfaction garantie ou remboursé.'
    },
  ];

  testimonials = [
    { name: 'Amina Trabelsi',  role: 'Cliente fidèle',    text: 'Je commande depuis 2 ans. Produits authentiques, livraison rapide et service exceptionnel. Je recommande à tout le monde !' },
    { name: 'Karim Mansouri',  role: 'Nutritionniste',    text: 'En tant que professionnel de santé, je recommande à mes patients. La qualité des compléments alimentaires est irréprochable.' },
    { name: 'Fatma Khelifi',   role: 'Cliente satisfaite', text: 'Le site est magnifique et facile à utiliser. Les soins de peau commandés ont transformé ma routine beauté !' },
  ];

  ngOnInit() {
    this.productSvc.getProducts(0, 8).subscribe(p => {
      const all = p.content;
      this.featured.set(all.filter(x => x.featured).slice(0, 4));
      this.onSale.set(all.filter(x => x.onSale).slice(0, 4));
      this.prodLoading.set(false);
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => ScrollTrigger.refresh(), 200);
      }
    });
    this.categorySvc.getAll().subscribe(cats => {
      this.categories.set(cats.slice(0, 6));
      this.catLoading.set(false);
    });
    if (this.auth.isLoggedIn()) {
      this.productSvc.getAiRecommendations().subscribe({
        next: (recs) => this.aiRecommendations.set(recs),
        error: (err) => console.error('Failed to load recommendations', err)
      });
    }
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.ngZone.runOutsideAngular(() => {
      this.initLenis();
      this.initHeroAnimations();
      this.initMouseParallax();
      this.initScrollAnimations();
    });
    // Start gallery auto-rotation
    this.slideTimer = setInterval(() => {
      this.ngZone.run(() => this.nextSlide());
    }, this.slideInterval);
  }

  ngOnDestroy() {
    this.lenis?.destroy();
    ScrollTrigger.getAll().forEach(t => t.kill());
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.slideTimer) clearInterval(this.slideTimer);
  }

  /* ── Lenis smooth scroll ── */
  private initLenis() {
    this.lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    this.lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => this.lenis!.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ── Hero intro timeline ── */
  private initHeroAnimations() {
    const tl = gsap.timeline({ delay: 0.2 });

    tl.fromTo(this.heroImg.nativeElement,
      { scale: 1.12 }, { scale: 1.0, duration: 3.5, ease: 'power2.out' }, 0);
    tl.fromTo(this.heroVisual.nativeElement,
      { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 1.8, ease: 'expo.out' }, 0);
    tl.fromTo(this.heroEyebrow.nativeElement,
      { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 1.0, ease: 'power3.out' }, 0.4);

    const lines = this.heroHeadline.nativeElement.querySelectorAll('.lux-headline__row > span, .lux-headline__gradient');
    tl.fromTo(lines, { y: '110%' }, { y: '0%', duration: 1.2, stagger: 0.12, ease: 'power4.out' }, 0.55);

    tl.fromTo(this.heroDescriptor.nativeElement,
      { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }, 1.0);
    tl.fromTo(this.heroCtas.nativeElement,
      { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 1.15);
    tl.fromTo(this.heroTrust.nativeElement,
      { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 1.3);
    tl.fromTo([this.badge1.nativeElement, this.badge2.nativeElement],
      { opacity: 0, scale: 0.85, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 1.2, stagger: 0.2, ease: 'back.out(1.4)' }, 1.0);
    tl.fromTo(this.scrollHint.nativeElement,
      { opacity: 0 }, { opacity: 1, duration: 1.0, ease: 'power2.out' }, 1.8);

    gsap.to(this.badge1.nativeElement, { y: -10, duration: 3.2, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.5 });
    gsap.to(this.badge2.nativeElement, { y: -8,  duration: 2.8, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 2.0 });
  }

  /* ── Smooth mouse parallax ── */
  private initMouseParallax() {
    let curX = 0, curY = 0;
    const speed = 0.06;
    const tick = () => {
      curX += (this.mouseX - curX) * speed;
      curY += (this.mouseY - curY) * speed;
      gsap.set(this.heroImgWrap.nativeElement, { x: curX * -14, y: curY * -10 });
      gsap.set(this.badge1.nativeElement, { x: curX * 8,  y: curY * 6 });
      gsap.set(this.badge2.nativeElement, { x: curX * -6, y: curY * 4 });
      this.rafId = requestAnimationFrame(tick);
    };
    tick();
  }

  /* ── Scroll-triggered reveals ── */
  private initScrollAnimations() {
    // Scroll animations temporarily disabled due to GSAP opacity bugs
    // Elements will now render natively without being hidden
  }
}
