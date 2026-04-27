import { Component, computed } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { AuthService } from './modules/auth/data-access/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MenubarModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  menuItems = computed<MenuItem[]>(() => {
    if (!this.authService.isLoggedIn()) {
      return [
        {
          label: 'Iniciar Sesión',
          icon: 'pi pi-fw pi-sign-in',
          routerLink: ['/login']
        }
      ];
    }

    return [
      {
        label: 'Home',
        icon: 'pi pi-fw pi-home',
        routerLink: ['/memberships']
      },
      {
        label: 'Membresías',
        icon: 'pi pi-fw pi-card',
        routerLink: ['/memberships']
      },
      {
        label: 'Clientes',
        icon: 'pi pi-fw pi-users',
        routerLink: ['/customers']
      },
      {
        label: 'Lealtad',
        icon: 'pi pi-fw pi-star',
        items: [
          {
            label: 'Cuentas',
            icon: 'pi pi-fw pi-list',
            routerLink: ['/loyalty/accounts']
          },
          {
            label: 'Reglas',
            icon: 'pi pi-fw pi-cog',
            routerLink: ['/loyalty/rules']
          }
        ]
      },
      {
        label: 'Ayuda',
        icon: 'pi pi-fw pi-question',
        items: [
          {
            label: 'Documentación',
            icon: 'pi pi-fw pi-book',
            url: '#'
          },
          {
            label: 'Contacto',
            icon: 'pi pi-fw pi-envelope',
            url: '#'
          }
        ]
      },
      {
        label: 'Cerrar Sesión',
        icon: 'pi pi-fw pi-sign-out',
        command: () => this.logout()
      }
    ];
  });

  constructor(
    public router: Router,
    private authService: AuthService
  ) {}

  isPublicPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/self-registration';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/self-registration']);
  }
}
