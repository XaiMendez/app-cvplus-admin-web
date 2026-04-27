import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { firstValueFrom } from 'rxjs';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';

import { MembershipsService } from '../data-access/memberships.service';
import { Membership, Customer, Tier } from '../models/membership.model';

@Component({
  selector: 'app-memberships-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    MessageModule,
    ProgressSpinnerModule,
    DividerModule
  ],
  templateUrl: './memberships-form.component.html',
  styleUrl: './memberships-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembershipsFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private membershipsService = inject(MembershipsService);
  private ref = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private cdr = inject(ChangeDetectorRef);

  form!: FormGroup;
  customers: { label: string; value: string }[] = [];
  tiers: { label: string; value: string }[] = [];
  programs: { label: string; value: string }[] = [];
  loading = false;
  isEditMode = false;

  // Track which fields have values for CSS styling
  filledFields: Set<string> = new Set();

  // Opciones de tipos de pase
  passTypeOptions = [
    { label: 'Membresía (Tier)', value: 'TIER' },
    { label: 'Programa de Lealtad', value: 'LOYALTY' }
  ];

  roundingOptions = [
    { label: 'Hacia Arriba', value: 'UP' },
    { label: 'Hacia Abajo', value: 'DOWN' },
    { label: 'Decimal', value: 'DECIMAL' }
  ];

  statusOptions = [
    { label: 'Creado', value: 'CREADO' },
    { label: 'Activo', value: 'ACTIVO' },
    { label: 'Inactivo', value: 'INACTIVO' }
  ];

  customerStatusOptions = [
    { label: 'Activo', value: 'ACTIVO' },
    { label: 'Inactivo', value: 'INACTIVO' },
    { label: 'Creado', value: 'CREADO' }
  ];

  orderStatusOptions = [
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'Completado', value: 'COMPLETADO' },
    { label: 'Cancelado', value: 'CANCELADO' }
  ];

  async ngOnInit() {
    this.initForm();
    await this.loadDropdownData();
    // Ensure initial state is correct
    setTimeout(() => {
      this.onPassTypeChange();
      this.setupFormValueTracking();
      this.cdr.markForCheck();
    }, 100);
  }

  private setupFormValueTracking() {
    // Track filled fields for dropdown/calendar styling
    Object.keys(this.form.controls).forEach(fieldName => {
      this.form.get(fieldName)?.valueChanges.subscribe(value => {
        if (value !== null && value !== '' && value !== undefined) {
          this.filledFields.add(fieldName);
        } else {
          this.filledFields.delete(fieldName);
        }
        this.cdr.markForCheck();
      });

      // Check initial value
      const initialValue = this.form.get(fieldName)?.value;
      if (initialValue !== null && initialValue !== '' && initialValue !== undefined) {
        this.filledFields.add(fieldName);
      }
    });
  }

  ngOnDestroy() {
    if (this.form) {
      this.form.reset();
    }
  }

  private initForm() {
    this.isEditMode = !!this.config.data?.membership;
    const membership = this.config.data?.membership;

    this.form = this.fb.group({
      dui: [''],
      customerName: [membership?.customer?.display_name || '', Validators.required],
      customerPhone: [membership?.customer?.phone || '', Validators.required],
      customerEmail: [membership?.customer?.email || '', Validators.required],
      customerStatus: [membership?.customer?.status || 'CREADO', Validators.required],
      passType: [membership?.pass_type || 'TIER', Validators.required],
      program: [{ value: membership?.tier?.program_passkit_id || '', disabled: membership?.pass_type === 'LOYALTY' }, [Validators.required]],
      tier: [{ value: membership?.tier?.id || '', disabled: membership?.pass_type === 'LOYALTY' }, [Validators.required]],
      expirationDate: [{ value: membership?.end_date ? new Date(membership.end_date) : '', disabled: membership?.pass_type === 'LOYALTY' }, [Validators.required]],
      pointsPerDollar: [{ value: membership?.loyalty_rules?.points_per_dollar || 1, disabled: membership?.pass_type !== 'LOYALTY' }, [Validators.required, Validators.min(0)]],
      maxPointsPerTransaction: [{ value: membership?.loyalty_rules?.max_points_per_transaction || 100, disabled: membership?.pass_type !== 'LOYALTY' }, [Validators.required, Validators.min(0)]],
      maxPointsPerDay: [{ value: membership?.loyalty_rules?.max_points_per_day || 500, disabled: membership?.pass_type !== 'LOYALTY' }, [Validators.required, Validators.min(0)]],
      redemptionRate: [{ value: membership?.loyalty_rules?.redemption_rate || 0.01, disabled: membership?.pass_type !== 'LOYALTY' }, [Validators.required, Validators.min(0)]],
      pointsValidity: [{ value: membership?.loyalty_rules?.points_validity_months || 18, disabled: membership?.pass_type !== 'LOYALTY' }, [Validators.required, Validators.min(1)]],
      roundingType: [{ value: membership?.loyalty_rules?.rounding_type || 'UP', disabled: membership?.pass_type !== 'LOYALTY' }, [Validators.required]],
      branch: ['PRINCIPAL', Validators.required],
      orderStatus: ['COMPLETADO', Validators.required],
      status: [membership?.status || 'CREADO', Validators.required]
    });

    this.form.get('passType')?.valueChanges.subscribe(() => {
      this.onPassTypeChange();
    });

    // Initialize with correct field states
    this.onPassTypeChange();
  }

  onPassTypeChange() {
    const passType = this.form.get('passType')?.value;
    const tierFields = ['program', 'tier', 'expirationDate'];
    const loyaltyFields = ['pointsPerDollar', 'maxPointsPerTransaction', 'maxPointsPerDay', 'redemptionRate', 'pointsValidity', 'roundingType'];

    if (passType === 'TIER') {
      // Enable and require TIER fields
      tierFields.forEach(field => {
        const control = this.form.get(field);
        control?.enable({ emitEvent: false });
        control?.setValidators([Validators.required]);
        control?.updateValueAndValidity({ emitEvent: false });
      });
      // Disable LOYALTY fields
      loyaltyFields.forEach(field => {
        const control = this.form.get(field);
        control?.disable({ emitEvent: false });
        control?.clearValidators();
        control?.updateValueAndValidity({ emitEvent: false });
      });
    } else if (passType === 'LOYALTY') {
      // Disable TIER fields
      tierFields.forEach(field => {
        const control = this.form.get(field);
        control?.disable({ emitEvent: false });
        control?.clearValidators();
        control?.updateValueAndValidity({ emitEvent: false });
      });
      // Enable and require LOYALTY fields
      loyaltyFields.forEach(field => {
        const control = this.form.get(field);
        control?.enable({ emitEvent: false });
        control?.setValidators([Validators.required, Validators.min(0)]);
        control?.updateValueAndValidity({ emitEvent: false });
      });
    }

    // Update overall form validity
    this.form.updateValueAndValidity({ emitEvent: false });
    this.cdr.markForCheck();
  }

  isFieldFilled(fieldName: string): boolean {
    const value = this.form.get(fieldName)?.value;
    return value !== null && value !== '' && value !== undefined;
  }

  private async loadDropdownData() {
    this.loading = true;
    this.cdr.markForCheck();
    
    try {
      const [customers, tiers] = await Promise.all([
        firstValueFrom(this.membershipsService.getCustomers()),
        firstValueFrom(this.membershipsService.getTiers())
      ]);

      this.customers = (customers || []).map((c: any) => ({
        label: c.display_name,
        value: c.id
      }));

      this.tiers = (tiers || []).map((t: any) => ({
        label: t.name,
        value: t.id
      }));

      this.programs = [
        { label: 'Programa Principal', value: 'PROGRAMA_PRINCIPAL' },
        { label: 'Programa VIP', value: 'PROGRAMA_VIP' }
      ];

      this.loading = false;
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error cargando datos:', error);
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  onCancel() {
    this.form.reset();
    this.ref.close(null);
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.cdr.markForCheck();
    
    const formValue = this.form.value;
    const passType = formValue.passType;

    let payload: any = {
      pass_type: passType,
      status: formValue.status
    };

    if (passType === 'TIER') {
      payload = {
        ...payload,
        tier_passkit_id: formValue.tier,
        end_date: new Date(formValue.expirationDate).toISOString()
      };
    } else if (passType === 'LOYALTY') {
      payload = {
        ...payload,
        loyalty_rules: {
          points_per_dollar: formValue.pointsPerDollar,
          max_points_per_transaction: formValue.maxPointsPerTransaction,
          max_points_per_day: formValue.maxPointsPerDay,
          redemption_rate: formValue.redemptionRate,
          points_validity_months: formValue.pointsValidity,
          rounding_type: formValue.roundingType
        }
      };
    }

    const request = this.isEditMode
      ? this.membershipsService.update(this.config.data.membership.id, payload)
      : this.membershipsService.create(payload);

    request.subscribe({
      next: (result) => {
        this.loading = false;
        this.cdr.markForCheck();
        this.ref.close(result);
      },
      error: (err) => {
        this.loading = false;
        this.cdr.markForCheck();
        console.error('Error:', err);
      }
    });
  }
}
