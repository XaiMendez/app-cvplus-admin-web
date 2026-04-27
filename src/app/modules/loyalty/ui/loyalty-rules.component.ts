import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { LoyaltyAccountsService } from '../data-access/loyalty-accounts.service';
import { LoyaltyRules } from '../models/loyalty-account.model';

@Component({
  selector: 'app-loyalty-rules',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    DropdownModule,
    CardModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="rules-container">
      <div class="header-section">
        <h2>Configuración de Reglas de Lealtad</h2>
        <p class="subtitle">Define la estructura de tu programa de puntos</p>
      </div>

      <p-toast></p-toast>

      <p-card class="form-card">
        <form [formGroup]="rulesForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <div class="form-group">
              <label for="points_per_dollar">Puntos por Dólar</label>
              <p-inputNumber
                id="points_per_dollar"
                formControlName="points_per_dollar"
                [min]="0.1"
                [step]="0.1"
                [suffix]="' pts'"
                placeholder="1.0"
              ></p-inputNumber>
            </div>

            <div class="form-group">
              <label for="max_points_per_transaction">Máx. Puntos por Transacción</label>
              <p-inputNumber
                id="max_points_per_transaction"
                formControlName="max_points_per_transaction"
                [min]="1"
                placeholder="500"
              ></p-inputNumber>
            </div>

            <div class="form-group">
              <label for="max_points_per_day">Máx. Puntos por Día</label>
              <p-inputNumber
                id="max_points_per_day"
                formControlName="max_points_per_day"
                [min]="1"
                placeholder="2000"
              ></p-inputNumber>
            </div>

            <div class="form-group">
              <label for="redemption_rate">Tasa de Canje (1 punto = X USD)</label>
              <p-inputNumber
                id="redemption_rate"
                formControlName="redemption_rate"
                [min]="0.001"
                [step]="0.001"
                [suffix]="' USD'"
                placeholder="0.01"
              ></p-inputNumber>
            </div>

            <div class="form-group">
              <label for="points_validity_months">Validez de Puntos (meses)</label>
              <p-inputNumber
                id="points_validity_months"
                formControlName="points_validity_months"
                [min]="1"
                placeholder="12"
              ></p-inputNumber>
            </div>

            <div class="form-group">
              <label for="rounding_type">Tipo de Redondeo</label>
              <p-dropdown
                id="rounding_type"
                formControlName="rounding_type"
                [options]="roundingOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecciona..."
              ></p-dropdown>
            </div>
          </div>

          <div class="form-actions">
            <p-button
              type="submit"
              label="Guardar Reglas"
              icon="pi pi-save"
              [loading]="saving"
              [disabled]="rulesForm.invalid || saving"
            ></p-button>
          </div>
        </form>
      </p-card>

      <p-card class="info-card" *ngIf="rules">
        <h3>Resumen Actual</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="label">Puntos por Dólar</span>
            <span class="value">{{ rules.points_per_dollar }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Tasa de Canje</span>
            <span class="value">1 pt = {{ getCurrencyFormat() }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Validez</span>
            <span class="value">{{ rules.points_validity_months }} meses</span>
          </div>
          <div class="summary-item">
            <span class="label">Estado</span>
            <span class="value" [ngClass]="{ 'text-green-600': rules.is_active, 'text-red-600': !rules.is_active }">
              {{ rules.is_active ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .rules-container {
      padding: 1.5rem;
      max-width: 1000px;
      margin: 0 auto;
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

    :deep(.p-card) {
      box-shadow: 0 2px 8px rgba(30, 41, 59, 0.04);
      border: 1px solid #e5e7eb;
      margin-bottom: 1.5rem;

      .p-card-content {
        padding: 1.5rem;
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;

      label {
        font-weight: 600;
        color: #374151;
        margin-bottom: 0.5rem;
        font-size: 0.95rem;
      }
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .info-card {
      background: #f0fdf4;
      border-color: #dcfce7;

      h3 {
        margin: 0 0 1rem 0;
        color: #15803d;
        font-size: 1.1rem;
      }
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      border: 1px solid #e5e7eb;

      .label {
        color: #6b7280;
        font-size: 0.85rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
      }

      .value {
        color: #1f2937;
        font-size: 1.25rem;
        font-weight: 700;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoyaltyRulesComponent implements OnInit {
  private loyaltyService = inject(LoyaltyAccountsService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  rulesForm!: FormGroup;
  rules: LoyaltyRules | null = null;
  saving = false;

  roundingOptions = [
    { label: 'Redondeado al Alza', value: 'UP' },
    { label: 'Redondeado a la Baja', value: 'DOWN' },
    { label: 'Decimal', value: 'DECIMAL' }
  ];

  ngOnInit() {
    this.initForm();
    this.loadRules();
  }

  initForm() {
    this.rulesForm = this.fb.group({
      points_per_dollar: [1.0, [Validators.required, Validators.min(0.1)]],
      max_points_per_transaction: [500, [Validators.required, Validators.min(1)]],
      max_points_per_day: [2000, [Validators.required, Validators.min(1)]],
      redemption_rate: [1.0, [Validators.required, Validators.min(0.001)]],
      points_validity_months: [12, [Validators.required, Validators.min(1)]],
      rounding_type: ['DECIMAL', Validators.required]
    });
  }

  loadRules() {
    this.loyaltyService.getRules().subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.rules = data[0];
          this.rulesForm.patchValue({
            points_per_dollar: this.rules.points_per_dollar,
            max_points_per_transaction: this.rules.max_points_per_transaction,
            max_points_per_day: this.rules.max_points_per_day,
            redemption_rate: this.rules.redemption_rate,
            points_validity_months: this.rules.points_validity_months,
            rounding_type: this.rules.rounding_type
          });
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando reglas:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las reglas'
        });
      }
    });
  }

  onSubmit() {
    if (this.rulesForm.invalid || !this.rules) return;

    this.saving = true;
    this.cdr.markForCheck();

    const updatedRules = this.rulesForm.value;

    this.loyaltyService.updateRules(this.rules.id, updatedRules).subscribe({
      next: (data) => {
        this.rules = data;
        this.saving = false;
        this.cdr.markForCheck();
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Reglas de lealtad actualizadas correctamente'
        });
      },
      error: (err) => {
        console.error('Error actualizando reglas:', err);
        this.saving = false;
        this.cdr.markForCheck();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron actualizar las reglas'
        });
      }
    });
  }

  getCurrencyFormat(): string {
    return this.rules ? `$${this.rules.redemption_rate}` : '$0.00';
  }
}
