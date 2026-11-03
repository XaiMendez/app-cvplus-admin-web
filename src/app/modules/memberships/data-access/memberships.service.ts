import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Membership, Customer, Tier } from '../models/membership.model';
import { BaseCrudService } from '../../shared/services/base-crud.service';
import { config } from '../../../../config';

@Injectable({ providedIn: 'root' })
export class MembershipsService extends BaseCrudService<Membership> {
  protected override apiUrl = config.apiUrl;

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

  searchCustomerByDui(dui: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/odoo-contacts?dui=${dui}`);
  }

  createSimple(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/memberships/simple`, data);
  }
}
