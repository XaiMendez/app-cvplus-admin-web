import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';

import { SelfRegistrationService } from '../data-access/self-registration.service';
import { OdooContact, Tier } from '../models/odoo-contact.model';

type FormState = 'idle' | 'searching' | 'found' | 'submitting' | 'success' | 'error';

@Component({
  selector: 'app-self-registration-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    CardModule,
    MessageModule,
    ProgressSpinnerModule,
    ChipModule,
    DividerModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './self-registration-form.component.html',
  styleUrl: './self-registration-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelfRegistrationFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(SelfRegistrationService);
  private cdr = inject(ChangeDetectorRef);
  private messageService = inject(MessageService);

  state: FormState = 'idle';
  searchForm!: FormGroup;
  membershipForm!: FormGroup;
  contact: OdooContact | null = null;
  tiers: { label: string; value: string }[] = [];
  errorMessage = '';
  successMessage = '';

  orderStatusOptions = [
    { label: 'Entregado', value: 'Entregado' },
    { label: 'Pendiente', value: 'Pendiente' },
    { label: 'Cancelado', value: 'Cancelado' }
  ];

  filledFields: Set<string> = new Set();

  ngOnInit() {
    this.initSearchForm();
    this.initMembershipForm();
    this.loadTiers();
  }

  private initSearchForm() {
    this.searchForm = this.fb.group({
      dui: ['', [Validators.required]]
    });
  }

  private initMembershipForm() {
    this.membershipForm = this.fb.group({
      tier_id: ['', Validators.required],
      end_date: ['', Validators.required],
      store_name: ['', Validators.required],
      order_status_name: ['Entregado', Validators.required],
      label_customer_name: ['', Validators.required]
    });

    this.setupFormValueTracking();
  }

  private setupFormValueTracking() {
    Object.keys(this.membershipForm.controls).forEach(fieldName => {
      this.membershipForm.get(fieldName)?.valueChanges.subscribe(value => {
        if (value !== null && value !== '' && value !== undefined) {
          this.filledFields.add(fieldName);
        } else {
          this.filledFields.delete(fieldName);
        }
        this.cdr.markForCheck();
      });

      const initialValue = this.membershipForm.get(fieldName)?.value;
      if (initialValue !== null && initialValue !== '' && initialValue !== undefined) {
        this.filledFields.add(fieldName);
      }
    });
  }

  private async loadTiers() {
    try {
      const tiers = await firstValueFrom(this.service.getTiers());
      this.tiers = (tiers || []).map((t: any) => ({
        label: t.name,
        value: t.id
      }));
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error cargando tiers:', error);
    }
  }

  async onSearchContact() {
    if (this.searchForm.invalid) return;

    this.state = 'searching';
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    try {
      const dui = this.searchForm.get('dui')?.value;
      const contacts = await firstValueFrom(this.service.getByDui(dui));
      this.contact = contacts && contacts.length > 0 ? contacts[0] : null;
      if (!this.contact) {
        throw new Error('No se encontró contacto');
      }
      this.state = 'found';
      this.cdr.markForCheck();
    } catch (error: any) {
      this.state = 'error';
      this.errorMessage = 'No se encontró contacto con este DUI';
      console.error('Error buscando DUI:', error);
      this.cdr.markForCheck();
    }
  }

  isFieldFilled(fieldName: string): boolean {
    const value = this.membershipForm.get(fieldName)?.value;
    return value !== null && value !== '' && value !== undefined;
  }

  onReset() {
    this.state = 'idle';
    this.contact = null;
    this.searchForm.reset();
    this.membershipForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
    this.filledFields.clear();
    this.cdr.markForCheck();
  }

  async onSubmit() {
    if (!this.contact) return;

    this.state = 'submitting';
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    try {
      const internalCustomerId = this.contact.internal_customer_id || this.contact.id;
      const response = await firstValueFrom(this.service.createMembership(internalCustomerId));

      if (response.success) {
        const message = response.message || '¡Membresía creada exitosamente!';
        this.messageService.add({
          severity: 'success',
          summary: '¡Éxito!',
          detail: message,
          life: 3000
        });
        setTimeout(() => this.onReset(), 3000);
      } else {
        const message = response.message || response?.errors?.[0]?.message || 'Error al crear la membresía';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: message,
          life: 5000
        });
      }
      this.state = 'found';
      this.cdr.markForCheck();
    } catch (error: any) {
      let errorMessage = 'Error al crear la membresía. Por favor, intenta de nuevo.';

      if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error?.error?.errors?.[0]?.message) {
        errorMessage = error.error.errors[0].message;
      } else if (error?.error?.detail) {
        errorMessage = error.error.detail;
      }

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 5000
      });

      this.state = 'found';
      console.error('Error creando membresía:', error);
      this.cdr.markForCheck();
    }
  }
}
