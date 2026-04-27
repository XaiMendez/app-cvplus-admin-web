import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';

import { LoyaltyAccountsService } from '../data-access/loyalty-accounts.service';
import { LoyaltyAccount } from '../models/loyalty-account.model';

@Component({
  selector: 'app-loyalty-accounts-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    TooltipModule,
    ProgressBarModule
  ],
  template: `
    <div class="loyalty-accounts-container">
      <div class="header-section">
        <h2>Cuentas de Lealtad</h2>
        <span class="subtitle">Gestiona puntos y transacciones de clientes</span>
      </div>

      <p-table
        #dt
        [value]="accounts"
        [paginator]="true"
        [rows]="10"
        [tableStyle]="{ 'min-width': '100%' }"
        [globalFilterFields]="['customer.display_name', 'customer.email']"
        [loading]="loading"
        styleClass="p-datatable-striped"
      >
        <ng-template pTemplate="caption">
          <div class="flex gap-2">
            <span class="p-input-icon-left w-full">
              <i class="pi pi-search"></i>
              <input
                pInputText
                type="text"
                #searchInput
                (input)="onSearchChange(searchInput.value)"
                placeholder="Buscar cliente..."
              />
            </span>
          </div>
        </ng-template>

        <ng-template pTemplate="header">
          <tr>
            <th>Cliente</th>
            <th>Email</th>
            <th>Saldo Actual</th>
            <th>Puntos Totales</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-account>
          <tr>
            <td>{{ account.customer?.display_name }}</td>
            <td>{{ account.customer?.email }}</td>
            <td>
              <span class="font-bold text-blue-600">{{ account.current_balance }}</span>
            </td>
            <td>{{ account.lifetime_points }}</td>
            <td>
              <p-tag
                [value]="account.status"
                [severity]="getStatusSeverity(account.status)"
              ></p-tag>
            </td>
            <td>
              <p-button
                icon="pi pi-eye"
                [rounded]="true"
                [text]="true"
                (click)="viewTransactions(account)"
                pTooltip="Ver transacciones"
                tooltipPosition="top"
              ></p-button>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" class="text-center text-gray-500 py-4">
              No hay cuentas de lealtad
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [`
    .loyalty-accounts-container {
      padding: 1.5rem;
    }

    .header-section {
      margin-bottom: 2rem;

      h2 {
        margin: 0;
        font-size: 1.75rem;
        font-weight: 700;
        color: #1f2937;
      }

      .subtitle {
        color: #6b7280;
        font-size: 0.95rem;
      }
    }

    :deep(.p-datatable) {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(30, 41, 59, 0.04);

      .p-datatable-thead > tr > th {
        background: #f3f4f6;
        border-color: #e5e7eb;
        font-weight: 600;
      }

      .p-datatable-tbody > tr:hover {
        background: #f9fafb;
      }
    }

    .transactions-container {
      padding: 1rem 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoyaltyAccountsListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  
  private loyaltyService = inject(LoyaltyAccountsService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  accounts: LoyaltyAccount[] = [];
  loading = false;

  ngOnInit() {
    this.loadAccounts();
  }

  onSearchChange(value: string) {
    if (this.dt) {
      this.dt.filterGlobal(value, 'contains');
    }
  }

  loadAccounts() {
    this.loading = true;
    this.cdr.markForCheck();

    this.loyaltyService.getAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando cuentas:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  viewTransactions(account: LoyaltyAccount) {
    this.router.navigate(['/loyalty/transactions', account.customer_id]);
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    const severityMap: Record<string, 'success' | 'warn' | 'danger' | 'info'> = {
      'ACTIVE': 'success',
      'INACTIVE': 'warn',
      'SUSPENDED': 'danger'
    };
    return severityMap[status] || 'info';
  }
}