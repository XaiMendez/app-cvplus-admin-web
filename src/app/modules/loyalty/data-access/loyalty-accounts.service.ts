import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoyaltyAccount, LoyaltyTransaction, LoyaltyRules } from '../models/loyalty-account.model';

@Injectable({
  providedIn: 'root'
})
export class LoyaltyAccountsService {
  private http = inject(HttpClient);
  private baseUrl = 'https://cvplus-passes-admin-production.up.railway.app/api/loyalty';

  getAccounts(): Observable<LoyaltyAccount[]> {
    return this.http.get<LoyaltyAccount[]>(`${this.baseUrl}/accounts`);
  }

  getAccountByCustomer(customerId: string): Observable<LoyaltyAccount> {
    return this.http.get<LoyaltyAccount>(`${this.baseUrl}/accounts/customer/${customerId}`);
  }

  getAccount(id: string): Observable<LoyaltyAccount> {
    return this.http.get<LoyaltyAccount>(`${this.baseUrl}/accounts/${id}`);
  }

  getTransactions(customerId: string): Observable<LoyaltyTransaction[]> {
    return this.http.get<LoyaltyTransaction[]>(`${this.baseUrl}/transactions?customer_id=${customerId}`);
  }

  getRules(): Observable<LoyaltyRules[]> {
    return this.http.get<LoyaltyRules[]>(`${this.baseUrl}/rules`);
  }

  createAccount(account: Partial<LoyaltyAccount>): Observable<LoyaltyAccount> {
    return this.http.post<LoyaltyAccount>(`${this.baseUrl}/accounts`, account);
  }

  updateRules(id: string, rules: Partial<LoyaltyRules>): Observable<LoyaltyRules> {
    return this.http.put<LoyaltyRules>(`${this.baseUrl}/rules/${id}`, rules);
  }
}