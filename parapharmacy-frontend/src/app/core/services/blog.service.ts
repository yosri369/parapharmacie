import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BlogPost, Page } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/blog`;

  getPosts(page = 0, size = 9, category?: string): Observable<Page<BlogPost>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (category) params = params.set('category', category);
    return this.http.get<Page<BlogPost>>(this.base, { params });
  }

  getPostBySlug(slug: string): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.base}/${slug}`);
  }
}
