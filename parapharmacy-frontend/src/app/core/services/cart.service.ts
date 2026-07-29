import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CartItem } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CartService {
  items = signal<CartItem[]>([]);
  itemCount = computed(() => this.items().reduce((sum, i) => sum + i.quantity, 0));
  total     = computed(() => this.items().reduce((sum, i) => sum + i.subtotal, 0));

  constructor(private http: HttpClient) {}

  loadCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${environment.apiUrl}/cart`).pipe(
      tap(items => this.items.set(items))
    );
  }

  addToCart(productId: number, quantity = 1): Observable<CartItem> {
    return this.http.post<CartItem>(`${environment.apiUrl}/cart/items`, { productId, quantity }).pipe(
      tap(() => this.loadCart().subscribe())
    );
  }

  updateQuantity(itemId: number, quantity: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}/cart/items/${itemId}`, { quantity }).pipe(
      tap(() => this.loadCart().subscribe())
    );
  }

  removeItem(itemId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/cart/items/${itemId}`).pipe(
      tap(() => this.items.update(items => items.filter(i => i.id !== itemId)))
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/cart/clear`).pipe(
      tap(() => this.items.set([]))
    );
  }

  clearLocal() {
    this.items.set([]);
  }
}
