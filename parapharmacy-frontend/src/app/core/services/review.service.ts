import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review, ReviewCreateRequest, Page } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/products`;

  getReviews(productId: number, page = 0, size = 5): Observable<Page<Review>> {
    return this.http.get<Page<Review>>(`${this.base}/${productId}/reviews`, {
      params: { page, size }
    });
  }

  createReview(productId: number, req: ReviewCreateRequest): Observable<Review> {
    return this.http.post<Review>(`${this.base}/${productId}/reviews`, req);
  }
}
