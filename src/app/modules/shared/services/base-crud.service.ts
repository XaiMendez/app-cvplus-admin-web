import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, shareReplay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export abstract class BaseCrudService<T> {
  protected apiUrl = 'https://cvplus-passes-admin-production.up.railway.app';
  protected endpoint: string = '';

  constructor(protected http: HttpClient, endpoint: string) {
    this.endpoint = endpoint;
  }

  getAll(): Observable<T[]> {
    return this.http.get<T[]>(`${this.apiUrl}/${this.endpoint}`).pipe(
      shareReplay(1),
      catchError(this.handleError)
    );
  }

  getById(id: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${this.endpoint}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  create(data: Partial<T>): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${this.endpoint}`, data).pipe(
      catchError(this.handleError)
    );
  }

  update(id: string, data: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${this.endpoint}/${id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${this.endpoint}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  protected handleError = (error: any) => {
    console.error('Error en la API:', error);
    return throwError(() => new Error(error?.error?.message || 'Error desconocido'));
  };
}
