import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Membership, Customer, Tier } from '../models/membership.model';
import { BaseCrudService } from '../../shared/services/base-crud.service';

@Injectable({ providedIn: 'root' })
export class MembershipsService extends BaseCrudService<Membership> {
  protected override apiUrl = 'https://cvplus-passes-admin-production.up.railway.app';

  constructor(http: HttpClient) {
    super(http, 'memberships');
  }

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/customers`);
  }

  getTiers(): Observable<Tier[]> {
    return this.http.get<Tier[]>(`${this.apiUrl}/tiers`);
  }

  getByCustomerId(customerId: string): Observable<Membership[]> {
    return this.http.get<Membership[]>(`${this.apiUrl}/memberships?internal_customer_id=${customerId}`);
  }
}
