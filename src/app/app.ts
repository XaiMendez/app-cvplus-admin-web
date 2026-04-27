import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenubarModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('cvplus-landing');

  menuItems: MenuItem[] = [
    {
      label: 'Home',
      icon: 'pi pi-fw pi-home',
      routerLink: ['/memberships']
    },
    {
      label: 'Autoafiliación',
      icon: 'pi pi-fw pi-id-card',
      routerLink: ['/self-registration']
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
    }
  ];

  constructor(public router: Router) {}

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }
}
