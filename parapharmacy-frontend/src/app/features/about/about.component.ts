import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- Hero Section -->
    <section class="relative pt-24 pb-20 overflow-hidden bg-[#071a12]">
      <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse 80% 70% at 50% -20%, rgba(22,163,74,0.3) 0%, transparent 70%), linear-gradient(160deg, #071a12 0%, #0c2b1e 50%, #071a12 100%);"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-6" style="background: rgba(74,222,128,0.12); color:#4ade80; border: 1px solid rgba(74,222,128,0.3);">
          Découvrez notre histoire
        </span>
        <h1 class="font-display text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
          Votre santé, <br class="hidden md:block"/>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">notre priorité absolue</span>
        </h1>
        <p class="text-xl md:text-2xl text-slate-350 max-w-3xl mx-auto leading-relaxed mb-10" style="color: rgba(255,255,255,0.7);">
          Pharma Alyosr est née d'une conviction simple : chacun mérite d'accéder à des produits de bien-être de qualité premium, authentiques et efficaces.
        </p>
      </div>
    </section>

    <!-- Content Section -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Story -->
        <div class="grid md:grid-cols-2 gap-16 items-center mb-24">
          <div class="order-2 md:order-1 space-y-6">
            <h2 class="font-display text-4xl font-bold text-slate-900 leading-tight">La nature rencontre <br/> l'excellence scientifique</h2>
            <p class="text-lg text-slate-600 leading-relaxed">
              Nous sélectionnons rigoureusement les meilleurs produits naturels et validés scientifiquement auprès de marques de confiance à travers le monde. De la dermo-cosmétique française aux innovations bien-être les plus récentes.
            </p>
            <p class="text-lg text-slate-600 leading-relaxed">
              Chaque produit proposé sur notre plateforme est soumis à une sélection stricte basée sur la qualité des ingrédients, les preuves cliniques et les normes de sécurité les plus élevées.
            </p>
            <div class="pt-4">
              <a routerLink="/shop" class="btn-primary" style="background: linear-gradient(135deg, #16a34a 0%, #0891b2 100%); border:none;">
                Découvrir nos produits
                <svg class="w-5 h-5 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </a>
            </div>
          </div>
          <div class="relative order-1 md:order-2">
            <div class="absolute inset-0 bg-gradient-to-tr from-emerald-400 to-cyan-400 rounded-[2.5rem] transform rotate-3 scale-105 opacity-20 -z-10"></div>
            <img src="https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=800&q=80" alt="Pharma Alyosr Store" class="w-full h-auto object-cover rounded-[2.5rem] shadow-2xl">
          </div>
        </div>

        <!-- Metrics -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
          @for (stat of stats; track stat.label) {
            <div class="bg-slate-50 rounded-3xl p-8 text-center border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1 cursor-default">
              <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 text-emerald-600 mb-5 text-2xl">
                <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="inline-block"><path stroke-linecap="round" stroke-linejoin="round" [attr.d]="stat.iconPath"/></svg>
              </div>
              <p class="font-display text-4xl font-bold text-slate-900 mb-2">{{ stat.value }}</p>
              <p class="text-sm text-slate-500 font-bold uppercase tracking-wider">{{ stat.label }}</p>
            </div>
          }
        </div>

        <!-- Values -->
        <div class="text-center mb-16">
          <h2 class="font-display text-4xl font-bold text-slate-900 mb-4">Nos Valeurs Fondamentales</h2>
          <p class="text-lg text-slate-500 max-w-2xl mx-auto">Ce qui nous motive chaque jour à vous offrir la meilleure expérience parapharmaceutique.</p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
          @for (val of values; track val.title) {
            <div class="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:border-emerald-200 transition-colors duration-300">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl mb-6 shadow-lg shadow-emerald-100">
                <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" [attr.d]="val.iconPath"/></svg>
              </div>
              <h3 class="text-xl font-bold text-slate-900 mb-3">{{ val.title }}</h3>
              <p class="text-slate-600 leading-relaxed">{{ val.desc }}</p>
            </div>
          }
        </div>

      </div>
    </section>
  `
})
export class AboutComponent {
  stats = [
    { value: '15,000+', label: 'Clients', iconPath: 'M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3' },
    { value: '800+', label: 'Produits', iconPath: 'M20 7h-9L9 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z' },
    { value: '60+', label: 'Marques', iconPath: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75' },
    { value: '4.9★', label: 'Avis Moyen', iconPath: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  ];

  values = [
    { iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Authenticité Garantie', desc: 'Nous nous approvisionnons exclusivement auprès des laboratoires officiels et distributeurs agréés pour garantir une traçabilité totale.' },
    { iconPath: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 5a7 7 0 100 14 7 7 0 000-14z', title: 'Sélection Exigeante', desc: 'Chaque produit est méticuleusement choisi par nos experts en dermo-cosmétique pour son efficacité prouvée et sa sécurité.' },
    { iconPath: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'Service Rapide', desc: 'Une logistique optimisée pour préparer et expédier vos commandes dans les plus brefs délais, partout en Tunisie.' },
  ];
}
