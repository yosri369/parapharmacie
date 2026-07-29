import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, Category, Page } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private http: HttpClient) {}

  getProducts(page = 0, size = 12, sort?: string, category?: number, search?: string): Observable<Page<Product>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (sort) params = params.set('sort', sort);
    if (category) params = params.set('category', category);
    if (search) params = params.set('search', search);
    return this.http.get<Page<Product>>(`${environment.apiUrl}/products`, { params });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${environment.apiUrl}/products/${id}`);
  }

  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${environment.apiUrl}/products/slug/${slug}`);
  }

  getFeatured(): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiUrl}/products/featured`);
  }

  getOnSale(): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiUrl}/products/on-sale`);
  }

  getRelated(id: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiUrl}/products/${id}/related`);
  }

  getSuggestions(q: string): Observable<{ id: number; name: string; imageUrl: string; price: number; slug: string }[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/products/suggestions`, { params: { q } });
  }

  getAiRecommendations(): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiUrl}/recommendations/personalized`);
  }
}
