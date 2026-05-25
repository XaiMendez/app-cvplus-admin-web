import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OdooContact, Tier } from '../models/odoo-contact.model';
import { config } from '../../../../config';

@Injectable({ providedIn: 'root' })
export class SelfRegistrationService {

  private apiUrl = config.apiUrl;

  constructor(private http: HttpClient) {}

  getByDui(dui: string): Observable<OdooContact[]> {
    return this.http.get<OdooContact[]>(`${this.apiUrl}/odoo-contacts?dui=${dui}`);
  }

  getTiers(): Observable<Tier[]> {
    return this.http.get<Tier[]>(`${this.apiUrl}/tiers`);
  }

  createMembership(internalCustomerId: string, userData?: { name: string; email: string; phone: string }): Observable<any> {
    const payload: any = {
      internal_customer_id: internalCustomerId
    };
    if (userData) {
      payload.name = userData.name;
      payload.email = userData.email;
      payload.phone = userData.phone;
    }
    return this.http.post(`${this.apiUrl}/memberships/self-enroll`, payload);
  }
}
