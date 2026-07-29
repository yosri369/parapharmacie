import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'shop', loadComponent: () => import('./features/shop/shop.component').then(m => m.ShopComponent) },
  {
    path: 'products/:id',
    loadComponent: () => import('./features/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  { path: 'categories', loadComponent: () => import('./features/categories/categories.component').then(m => m.CategoriesComponent) },
  { path: 'cart', loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent), canActivate: [authGuard] },
  { path: 'checkout', loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent), canActivate: [authGuard] },
  { path: 'wishlist', loadComponent: () => import('./features/wishlist/wishlist.component').then(m => m.WishlistComponent), canActivate: [authGuard] },
  {
    path: 'auth',
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
      { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
      { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
    ]
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'orders', loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent) },
    ]
  },
  { path: 'about', loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent) },
  { path: 'contact', loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent) },
  { path: 'blog', loadComponent: () => import('./features/blog/blog.component').then(m => m.BlogComponent) },
  { path: 'blog/:slug', loadComponent: () => import('./features/blog-detail/blog-detail.component').then(m => m.BlogDetailComponent) },
  { path: 'search', loadComponent: () => import('./features/search-results/search-results.component').then(m => m.SearchResultsComponent) },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent)
  },
  { path: 'payment-result',      loadComponent: () => import('./features/payment-result/payment-result.component').then(m => m.PaymentResultComponent) },
  { path: 'order-confirmation',  loadComponent: () => import('./features/payment-result/payment-result.component').then(m => m.PaymentResultComponent) },
  { path: '**', loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent) },
];
