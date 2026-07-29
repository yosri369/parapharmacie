import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, Product } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private http: HttpClient) {}

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${environment.apiUrl}/orders`);
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${environment.apiUrl}/orders/${id}`);
  }

  placeOrder(payload: any): Observable<Order> {
    return this.http.post<Order>(`${environment.apiUrl}/orders`, payload);
  }
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
  constructor(private http: HttpClient) {}

  getWishlist(): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiUrl}/wishlist`);
  }

  add(productId: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/wishlist`, { productId });
  }

  remove(productId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/wishlist/${productId}`);
  }

  check(productId: number): Observable<{ inWishlist: boolean }> {
    return this.http.get<{ inWishlist: boolean }>(`${environment.apiUrl}/wishlist/check/${productId}`);
  }
}

@Injectable({ providedIn: 'root' })
export class PromoService {
  constructor(private http: HttpClient) {}
  validate(code: string, orderTotal: number): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/promo/validate`, { code, orderTotal });
  }
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getProfile(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/users/me`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/users/me`, data);
  }
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  // Dashboard
  getStats(): Observable<any>               { return this.http.get(`${this.base}/admin/stats`); }

  // Orders
  getAllOrders(): Observable<Order[]>        { return this.http.get<Order[]>(`${this.base}/admin/orders`); }
  getAllUsers(): Observable<any[]>           { return this.http.get<any[]>(`${this.base}/admin/users`); }
  updateOrderStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.base}/admin/orders/${id}/status`, { status });
  }

  // Products
  createProduct(data: any): Observable<any>   { return this.http.post(`${this.base}/admin/products`, data); }
  updateProduct(id: number, data: any): Observable<any> { return this.http.put(`${this.base}/admin/products/${id}`, data); }
  deleteProduct(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/admin/products/${id}`); }

  // Categories
  createCategory(data: any): Observable<any>  { return this.http.post(`${this.base}/admin/categories`, data); }
  deleteCategory(id: number): Observable<void>{ return this.http.delete<void>(`${this.base}/admin/categories/${id}`); }

  // Blog
  getAllBlogPosts(page = 0, size = 20): Observable<any> { return this.http.get(`${this.base}/admin/blog`, { params: { page, size } }); }
  createBlogPost(data: any): Observable<any>  { return this.http.post(`${this.base}/admin/blog`, data); }
  updateBlogPost(id: number, data: any): Observable<any> { return this.http.put(`${this.base}/admin/blog/${id}`, data); }
  deleteBlogPost(id: number): Observable<void>{ return this.http.delete<void>(`${this.base}/admin/blog/${id}`); }

  // Cloudinary image upload
  uploadProductImage(file: File): Observable<{ url: string }> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<{ url: string }>(`${this.base}/admin/upload/product-image`, fd);
  }
  uploadBlogImage(file: File): Observable<{ url: string }> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<{ url: string }>(`${this.base}/admin/upload/blog-image`, fd);
  }
  // Promo Codes
  getAllPromos(): Observable<any[]>              { return this.http.get<any[]>(`${this.base}/admin/promo`); }
  createPromo(data: any): Observable<any>       { return this.http.post<any>(`${this.base}/admin/promo`, data); }
  togglePromo(id: number): Observable<any>      { return this.http.patch<any>(`${this.base}/admin/promo/${id}/toggle`, {}); }
  deletePromo(id: number): Observable<void>     { return this.http.delete<void>(`${this.base}/admin/promo/${id}`); }

  // Multi-image upload for a product
  uploadProductImages(productId: number, formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.base}/admin/products/${productId}/images`, formData);
  }

  // Inventory
  getInventoryAlerts(): Observable<any> {
    return this.http.get<any>(`${this.base}/admin/inventory/alerts`);
  }
  exportStockCsv(): Observable<Blob> {
    return this.http.get(`${this.base}/admin/inventory/export/stock`, { responseType: 'blob' });
  }
  addStock(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/admin/inventory/stock`, data);
  }
  adjustStock(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/admin/inventory/adjust`, data);
  }
  getProductBatches(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/admin/inventory/batches/${productId}`);
  }

  // Suppliers
  getSuppliers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/admin/suppliers`);
  }
  createSupplier(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/admin/suppliers`, data);
  }
  updateSupplier(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.base}/admin/suppliers/${id}`, data);
  }
  deleteSupplier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/admin/suppliers/${id}`);
  }

  // Purchase Requests
  getPurchaseRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/admin/suppliers/requests`);
  }
  createPurchaseRequest(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/admin/suppliers/requests`, data);
  }
  updatePurchaseRequestStatus(id: number, status: string): Observable<any> {
    return this.http.patch<any>(`${this.base}/admin/suppliers/requests/${id}/status`, { status });
  }
}
