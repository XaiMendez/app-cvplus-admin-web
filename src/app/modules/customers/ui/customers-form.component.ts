import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { CustomersService } from '../data-access/customers.service';
import { Customer } from '../models/customer.model';

@Component({
  selector: 'app-customers-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    ToastModule
  ],
  template: `
    <p-toast></p-toast>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        
        <div>
          <label for="display_name">Nombre Completo *</label>
          <input
            id="display_name"
            type="text"
            formControlName="display_name"
            pInputText
            class="w-full"
            placeholder="Ej: Xavier Mendez" />
        </div>

        <div>
          <label for="first_name">Nombre *</label>
          <input
            id="first_name"
            type="text"
            formControlName="first_name"
            pInputText
            class="w-full"
            placeholder="Ej: Xavier" />
        </div>

        <div>
          <label for="last_name">Apellido *</label>
          <input
            id="last_name"
            type="text"
            formControlName="last_name"
            pInputText
            class="w-full"
            placeholder="Ej: Mendez" />
        </div>

        <div>
          <label for="email">Email *</label>
          <input
            id="email"
            type="email"
            formControlName="email"
            pInputText
            class="w-full"
            placeholder="Ej: usuario@email.com" />
        </div>

        <div>
          <label for="phone">Teléfono</label>
          <input
            id="phone"
            type="text"
            formControlName="phone"
            pInputText
            class="w-full"
            placeholder="Ej: 76151840" />
        </div>

        <div>
          <label for="status">Estado *</label>
          <p-dropdown
            id="status"
            formControlName="status"
            [options]="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar estado"
            class="w-full">
          </p-dropdown>
        </div>

        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
          <p-button
            label="Cancelar"
            [text]="true"
            severity="secondary"
            (onClick)="ref.close()">
          </p-button>
          <p-button
            label="Guardar"
            [disabled]="!form.valid"
            (onClick)="onSubmit()">
          </p-button>
        </div>
      </div>
    </form>
  `,
  styles: [`
    :host ::ng-deep {
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }
    }
  `]
})
export class CustomersFormComponent implements OnInit {

  ref = inject(DynamicDialogRef);
  config = inject(DynamicDialogConfig);
  private customersService = inject(CustomersService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  form!: FormGroup;

  statusOptions = [
    { label: 'Creado', value: 'CREADO' },
    { label: 'Activo', value: 'ACTIVO' },
    { label: 'Inactivo', value: 'INACTIVO' }
  ];

  ngOnInit() {
    this.initForm();
    if (this.config.data?.customer) {
      this.form.patchValue(this.config.data.customer);
    }
  }

  initForm() {
    this.form = this.fb.group({
      display_name: ['', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      status: ['CREADO', Validators.required]
    });
  }

  onSubmit() {
    if (!this.form.valid) {
      return;
    }

    const customer = this.config.data?.customer;
    const data = this.form.value;

    if (customer) {
      // Actualizar
      this.customersService.update(customer.id, data).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Cliente actualizado'
          });
          this.ref.close(true);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el cliente'
          });
        }
      });
    } else {
      // Crear
      this.customersService.create(data).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Cliente creado'
          });
          this.ref.close(true);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el cliente'
          });
        }
      });
    }
  }
}
