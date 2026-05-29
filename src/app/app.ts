import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthService } from './modules/auth/data-access/auth.service';

interface MenuItem {
  label: string;
  icon?: string;
  routerLink?: string[];
  url?: string;
  items?: MenuItem[];
  command?: () => void;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, NzLayoutModule, NzMenuModule, NzButtonModule, NzIconModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  menuItems: MenuItem[] | undefined;
  isLoggedIn = false;
  protected readonly date = new Date();

  constructor(
    public router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();

    if (!this.isLoggedIn) {
      this.menuItems = [
        {
          label: 'Iniciar Sesión',
          icon: 'login',
          routerLink: ['/login']
        }
      ];
      return;
    }

    this.menuItems = [
      {
        label: 'Membresías',
        routerLink: ['/memberships']
      },
      {
        label: 'Clientes',
        routerLink: ['/customers']
      },
      {
        label: 'Cerrar Sesión',
        command: () => this.logout()
      }
    ];
  }

  isPublicPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/self-registration';
  }

  getMenuLabel(label: string): string {
    return label;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/self-registration']);
  }
}
