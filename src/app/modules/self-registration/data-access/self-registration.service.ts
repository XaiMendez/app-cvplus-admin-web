import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse, EnrollPayload, EnrollResponse, LookupResult } from '../models/odoo-contact.model';
import { config } from '../../../../config';

@Injectable({ providedIn: 'root' })
export class SelfRegistrationService {
  private http = inject(HttpClient);
  private apiUrl = config.apiUrl;

  /** Busca por DUI. El DUI va en el cuerpo (no en la URL) y la respuesta solo trae datos enmascarados. */
  lookup(dui: string, captchaToken?: string): Observable<LookupResult> {
    return this.http
      .post<ApiResponse<LookupResult>>(`${this.apiUrl}/self-registration/lookup`, {
        dui,
        ...(captchaToken ? { captcha_token: captchaToken } : {})
      })
      .pipe(map((res) => res.data as LookupResult));
  }

  createMembership(payload: EnrollPayload): Observable<EnrollResponse> {
    return this.http.post<EnrollResponse>(`${this.apiUrl}/self-registration/enroll`, payload);
  }
}
