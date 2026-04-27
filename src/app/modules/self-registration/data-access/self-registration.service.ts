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

  createMembership(internalCustomerId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/memberships/self-enroll`, {
      internal_customer_id: internalCustomerId
    });
  }
}
