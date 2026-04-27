import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { CardModule } from 'primeng/card';

import { LoyaltyAccountsService } from '../data-access/loyalty-accounts.service';
import { LoyaltyTransaction, LoyaltyAccount } from '../models/loyalty-account.model';

@Component({
  selector: 'app-loyalty-transactions',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    ProgressBarModule,
    CardModule
  ],
  template: `
    <div class="transactions-container">
      <div class="header-section">
        <h2>Historial de Transacciones</h2>
        <p class="subtitle" *ngIf="account">
          Cliente: <strong>{{ account.customer?.display_name }}</strong> | 
          Saldo Actual: <strong class="text-blue-600">{{ account.current_balance }} pts</strong>
        </p>
      </div>

      <p-card>
        <p-table
          [value]="transactions"
          [paginator]="true"
          [rows]="15"
          [tableStyle]="{ 'min-width': '100%' }"
          [loading]="loading"
          styleClass="p-datatable-striped"
          [scrollable]="true"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 10%">Tipo</th>
              <th style="width: 12%">Puntos</th>
              <th style="width: 12%">Saldo Después</th>
              <th style="width: 25%">Descripción</th>
              <th style="width: 15%">Fecha</th>
              <th style="width: 15%">Vencimiento</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-tx>
            <tr>
              <td>
                <p-tag
                  [value]="tx.type"
                  [severity]="getTransactionSeverity(tx.type)"
                ></p-tag>
              </td>
              <td class="font-bold" [ngClass]="{ 'text-green-600': tx.points_amount > 0, 'text-red-600': tx.points_amount < 0 }">
                {{ tx.points_amount > 0 ? '+' : '' }}{{ tx.points_amount }}
              </td>
              <td class="font-semibold">{{ tx.points_balance_after }}</td>
              <td class="text-gray-700">{{ tx.description }}</td>
              <td>{{ tx.created_at | date: 'short' }}</td>
              <td>
                <span *ngIf="tx.expires_at; else noExpiry">
                  {{ tx.expires_at | date: 'short' }}
                </span>
                <ng-template #noExpiry>
                  <span class="text-gray-400">-</span>
                </ng-template>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center text-gray-500 py-4">
                Sin transacciones registradas
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `,
  styles: [`
    .transactions-container {
      padding: 1.5rem;
    }

    .header-section {
      margin-bottom: 2rem;

      h2 {
        margin: 0 0 0.5rem 0;
        font-size: 1.75rem;
        font-weight: 700;
        color: #1f2937;
      }

      .subtitle {
        margin: 0;
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

    :deep(.p-card) {
      box-shadow: 0 2px 8px rgba(30, 41, 59, 0.04);
      border: 1px solid #e5e7eb;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoyaltyTransactionsComponent implements OnInit {
  private loyaltyService = inject(LoyaltyAccountsService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  account: LoyaltyAccount | null = null;
  transactions: LoyaltyTransaction[] = [];
  loading = false;

  ngOnInit() {
    const customerId = this.route.snapshot.params['customerId'];
    if (customerId) {
      this.loadAccount(customerId);
      this.loadTransactions(customerId);
    }
  }

  loadAccount(customerId: string) {
    this.loyaltyService.getAccountByCustomer(customerId).subscribe({
      next: (data) => {
        this.account = data;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando cuenta:', err);
      }
    });
  }

  loadTransactions(customerId: string) {
    this.loading = true;
    this.cdr.markForCheck();

    this.loyaltyService.getTransactions(customerId).subscribe({
      next: (data) => {
        this.transactions = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando transacciones:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  getTransactionSeverity(type: string): 'success' | 'warning' | 'danger' | 'info' {
    const severityMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      'ACCUMULATION': 'success',
      'REDEMPTION': 'warning',
      'EXPIRATION': 'danger',
      'REVERSAL': 'info'
    };
    return severityMap[type] || 'info';
  }
}
