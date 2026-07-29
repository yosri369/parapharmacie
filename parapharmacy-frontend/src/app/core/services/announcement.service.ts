import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Announcement {
  id?: number;
  message: string;
  type: 'INFO' | 'PROMO' | 'ALERT';
  active: boolean;
  linkUrl?: string;
  linkLabel?: string;
  sortOrder: number;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AnnouncementService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getActive(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.base}/announcements`);
  }

  getAll(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.base}/admin/announcements`);
  }

  create(a: Announcement): Observable<Announcement> {
    return this.http.post<Announcement>(`${this.base}/admin/announcements`, a);
  }

  update(id: number, a: Announcement): Observable<Announcement> {
    return this.http.put<Announcement>(`${this.base}/admin/announcements/${id}`, a);
  }

  toggle(id: number): Observable<Announcement> {
    return this.http.patch<Announcement>(`${this.base}/admin/announcements/${id}/toggle`, {});
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/admin/announcements/${id}`);
  }
}
