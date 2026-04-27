import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  isLoggedIn = signal(!!this.getToken());

  login(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.isLoggedIn.set(true);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isLoggedIn.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
