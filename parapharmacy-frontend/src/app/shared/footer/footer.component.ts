import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <footer class="site-footer">

      <!-- Top accent line -->
      <div class="footer-accent"></div>

      <!-- Main body -->
      <div class="footer-container">
        <div class="footer-grid">

          <!-- Brand column -->
          <div class="footer-brand">
            <div class="footer-brand__logo">
              <img src="assets/logo.png" alt="pharma_alyosr" class="footer-brand__img"
                   onerror="this.style.display='none'; document.getElementById('footer-logo-fb').style.display='flex'">
              <div id="footer-logo-fb" class="footer-brand__fallback">
                <div class="footer-brand__icon">P</div>
                <span class="footer-brand__name">pharma_<span class="footer-brand__accent">alyosr</span></span>
              </div>
            </div>
            <p class="footer-brand__desc">
              Votre parapharmacie de confiance en Tunisie. Soins de peau, compléments alimentaires, beauté et bien-être au meilleur prix.
            </p>
            <!-- Social -->
            <div class="footer-socials">
              <a href="#" aria-label="Facebook" class="social-btn">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" aria-label="Instagram" class="social-btn">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" aria-label="WhatsApp" class="social-btn">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            </div>
          </div>

          <!-- Boutique links -->
          <div class="footer-col">
            <h4 class="footer-col__title">Boutique</h4>
            <ul class="footer-links">
              <li><a routerLink="/shop" class="footer-link">Tous les produits</a></li>
              <li><a routerLink="/shop" [queryParams]="{sale:true}" class="footer-link">Promotions</a></li>
              <li><a routerLink="/categories" class="footer-link">Soins de peau</a></li>
              <li><a routerLink="/categories" class="footer-link">Compléments alimentaires</a></li>
              <li><a routerLink="/categories" class="footer-link">Soin bébé</a></li>
              <li><a routerLink="/categories" class="footer-link">Hygiène</a></li>
            </ul>
          </div>

          <!-- Info links -->
          <div class="footer-col">
            <h4 class="footer-col__title">Informations</h4>
            <ul class="footer-links">
              <li><a routerLink="/about" class="footer-link">À propos de nous</a></li>
              <li><a routerLink="/blog" class="footer-link">Conseils santé</a></li>
              <li><a routerLink="/contact" class="footer-link">Contact</a></li>
              <li><a href="#" class="footer-link">Politique de retour</a></li>
              <li><a href="#" class="footer-link">Livraison</a></li>
              <li><a href="#" class="footer-link">Confidentialité</a></li>
            </ul>
          </div>

          <!-- Newsletter -->
          <div class="footer-col">
            <h4 class="footer-col__title">Newsletter</h4>
            <p class="footer-col__desc">
              Recevez nos conseils santé et nos offres exclusives directement dans votre boîte mail.
            </p>
            <div class="newsletter-form">
              <input type="email" placeholder="votre@email.com" class="newsletter-input">
              <button class="newsletter-btn">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </button>
            </div>
            <!-- Contact info — SVG icons, no emoji -->
            <div class="footer-contact">
              <div class="footer-contact__item">
                <svg class="footer-contact__icon" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                </svg>
                <span>Tunisie</span>
              </div>
              <div class="footer-contact__item">
                <svg class="footer-contact__icon" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                </svg>
                <span>contact&#64;pharma-alyosr.tn</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="footer-bottom">
        <div class="footer-container footer-bottom__inner">
          <span class="footer-bottom__copy">© 2026 <strong>pharma_alyosr</strong>. Tous droits réservés.</span>
          <div class="footer-bottom__links">
            <a href="#" class="footer-bottom__link">Confidentialité</a>
            <a href="#" class="footer-bottom__link">Conditions</a>
            <a href="#" class="footer-bottom__link">Cookies</a>
          </div>
        </div>
      </div>

      <style>
        .site-footer {
          background: #071a12;
          color: rgba(255,255,255,0.55);
        }
        .footer-accent {
          height: 3px;
          background: linear-gradient(90deg, #16a34a 0%, #0891b2 50%, #16a34a 100%);
          background-size: 200% 100%;
          animation: footerAccent 5s ease infinite;
        }
        @keyframes footerAccent {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        .footer-container { max-width: 1280px; margin: 0 auto; padding: 0 2rem; }
        .footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1.4fr;
          gap: 3rem;
          padding: 4rem 0;
        }
        @media (max-width: 1024px) { .footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; padding: 3rem 0; } }
        @media (max-width: 640px)  { .footer-grid { grid-template-columns: 1fr; gap: 2rem; padding: 2.5rem 0; } }

        /* Brand */
        .footer-brand__logo { margin-bottom: 1rem; }
        .footer-brand__img { height: 42px; width: auto; object-fit: contain; filter: brightness(0) invert(1) opacity(0.9); }
        .footer-brand__fallback { display: none; align-items: center; gap: 0.5rem; }
        .footer-brand__icon { width: 34px; height: 34px; border-radius: 9px; background: linear-gradient(135deg,#16a34a,#0891b2); display: flex; align-items: center; justify-content: center; font-weight: 800; color: white; font-size: 0.85rem; }
        .footer-brand__name { font-weight: 700; color: #f0fdf4; font-size: 1rem; }
        .footer-brand__accent { color: #4ade80; }
        .footer-brand__desc { font-size: 0.855rem; line-height: 1.75; color: rgba(255,255,255,0.4); margin-bottom: 1.5rem; }

        .footer-socials { display: flex; gap: 0.625rem; }
        .social-btn {
          width: 36px; height: 36px; border-radius: 0.625rem;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.45); text-decoration: none;
          transition: all 0.25s;
        }
        .social-btn:hover {
          background: linear-gradient(135deg,#16a34a,#0891b2);
          border-color: transparent; color: white; transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(22,163,74,0.3);
        }

        /* Columns */
        .footer-col__title {
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: rgba(255,255,255,0.9);
          margin-bottom: 1.25rem;
        }
        .footer-col__desc { font-size: 0.855rem; line-height: 1.75; color: rgba(255,255,255,0.38); margin-bottom: 1.25rem; }
        .footer-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.625rem; }
        .footer-link {
          font-size: 0.855rem; color: rgba(255,255,255,0.4); text-decoration: none;
          transition: all 0.2s; display: inline-block;
        }
        .footer-link:hover { color: #4ade80; transform: translateX(3px); }

        /* Newsletter */
        .newsletter-form { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; }
        .newsletter-input {
          flex: 1; padding: 0.625rem 0.875rem;
          background: rgba(255,255,255,0.05); border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 0.75rem; color: white; font-size: 0.855rem;
          outline: none; font-family: inherit; transition: border-color 0.2s;
        }
        .newsletter-input::placeholder { color: rgba(255,255,255,0.25); }
        .newsletter-input:focus { border-color: rgba(74,222,128,0.4); }
        .newsletter-btn {
          width: 42px; height: 42px; flex-shrink: 0;
          background: linear-gradient(135deg,#16a34a,#0891b2);
          border: none; border-radius: 0.75rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: white; transition: all 0.25s;
          box-shadow: 0 4px 12px rgba(22,163,74,0.3);
        }
        .newsletter-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(22,163,74,0.4); }

        /* Contact info */
        .footer-contact { display: flex; flex-direction: column; gap: 0.625rem; }
        .footer-contact__item { display: flex; align-items: center; gap: 0.625rem; font-size: 0.815rem; color: rgba(255,255,255,0.35); }
        .footer-contact__icon { width: 14px; height: 14px; flex-shrink: 0; color: rgba(74,222,128,0.5); }

        /* Bottom bar */
        .footer-bottom { border-top: 1px solid rgba(255,255,255,0.06); }
        .footer-bottom__inner {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 1.25rem; padding-bottom: 1.25rem;
          flex-wrap: wrap; gap: 0.75rem;
        }
        .footer-bottom__copy { font-size: 0.78rem; color: rgba(255,255,255,0.25); }
        .footer-bottom__copy strong { color: rgba(74,222,128,0.7); font-weight: 600; }
        .footer-bottom__links { display: flex; gap: 1.5rem; }
        .footer-bottom__link { font-size: 0.78rem; color: rgba(255,255,255,0.2); text-decoration: none; transition: color 0.2s; }
        .footer-bottom__link:hover { color: rgba(74,222,128,0.6); }
      </style>
    </footer>
  `
})
export class FooterComponent {}
