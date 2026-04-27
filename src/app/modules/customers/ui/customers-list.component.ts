import { Component, OnInit, ChangeDetectionStrategy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { DialogService } from 'primeng/dynamicdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

// Custom
import { GenericTableComponent, Column } from '../../shared/generic-table.component';
import { CustomersFormComponent } from './customers-form.component';
import { CustomersService } from '../data-access/customers.service';
import { Customer } from '../models/customer.model';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [
    CommonModule,
    GenericTableComponent,
    ToolbarModule,
    ButtonModule,
    MessageModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './customers-list.component.html',
  styleUrl: './customers-list.component.scss',
  providers: [DialogService, MessageService, ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersListComponent implements OnInit {

  private customersService = inject(CustomersService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

  customers: Customer[] = [];
  loading = true;
  error = '';

  columns: Column[] = [
    { key: 'display_name', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'status', label: 'Estado', type: 'status' },
    { key: 'memberships', label: 'Membresías', type: 'count' },
    { key: 'created_at', label: 'Creado' }
  ];

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.loading = true;
    this.error = '';

    this.customersService.getAll().subscribe({
      next: (data) => {
        this.customers = data;
        console.log('Clientes recibidos:', this.customers);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = 'Error al cargar los clientes';
        this.loading = false;
        console.error('Error al cargar clientes:', err);
        this.cdr.markForCheck();
      }
    });
  }

  onCreate() {
    const ref = this.dialogService.open(CustomersFormComponent, {
      header: 'Crear cliente',
      width: '500px',
      data: { customer: null }
    });

    ref?.onClose.subscribe((result: any) => {
      if (result) {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Cliente creado correctamente'
        });
        this.loadCustomers();
      }
    });
  }

  onTableAction(event: { action: string; row: Customer }) {

    if (event.action === 'view') {
      // Navegar a memberships filtradas por cliente
      window.location.href = `/memberships?customerId=${event.row.id}`;
    }

    if (event.action === 'edit') {
      const ref = this.dialogService.open(CustomersFormComponent, {
        header: 'Editar cliente',
        width: '500px',
        data: { customer: event.row }
      });

      ref?.onClose.subscribe((result: any) => {
        if (result) {
          this.messageService.add({
            severity: 'success',
            summary: 'Actualizado',
            detail: 'Cliente actualizado'
          });
          this.loadCustomers();
        }
      });
    }

    if (event.action === 'delete') {
      this.confirmationService.confirm({
        message: `¿Eliminar cliente ${event.row.display_name}?`,
        header: 'Confirmar',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.customersService.delete(event.row.id).subscribe(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Eliminado',
              detail: 'Cliente eliminado'
            });
            this.loadCustomers();
          });
        }
      });
    }
  }
}
