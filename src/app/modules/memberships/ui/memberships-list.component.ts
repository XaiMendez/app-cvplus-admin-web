import { Component, OnInit, ChangeDetectionStrategy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

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
import { MembershipsFormComponent } from './memberships-form.component';
import { MembershipsService } from '../data-access/memberships.service';
import { Membership } from '../models/membership.model';

@Component({
  selector: 'app-memberships-list',
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
  templateUrl: './memberships-list.component.html',
  styleUrl: './memberships-list.component.scss',
  providers: [DialogService, MessageService, ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembershipsListComponent implements OnInit {

  private membershipsService = inject(MembershipsService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);

  memberships: Membership[] = [];
  loading = true;
  error = '';
  customerId: string | null = null;

  columns: Column[] = [
    { key: 'customer.display_name', label: 'Cliente' },
    { key: 'total_points', label: 'Puntos' },
    { key: 'status', label: 'Estado', type: 'status' },
    //{ key: 'end_date', label: 'Fecha Fin' },
    { key: 'created_at', label: 'Creado' }
  ];

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.customerId = params['customerId'] || null;
      this.loadMemberships();
    });
  }

  loadMemberships() {
    this.loading = true;
    this.error = '';

    const loadObservable = this.customerId 
      ? this.membershipsService.getByCustomerId(this.customerId)
      : this.membershipsService.getAll();

    loadObservable.subscribe({
      next: (data) => {
        this.memberships = data;
        console.log('Membresías recibidas:', this.memberships);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = 'Error al cargar las membresías';
        this.loading = false;
        console.error('Error al cargar membresías:', err);
        this.cdr.markForCheck();
      }
    });
  }

  onCreate() {
    const ref = this.dialogService.open(MembershipsFormComponent, {
      header: 'Crear membresía',
      width: '90vw',
      modal: true,
      styleClass: 'memberships-modal',
      closable: true,
      closeOnEscape: true,
      data: { membership: null }
    });

    ref?.onClose.subscribe((result: any) => {
      if (result) {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Membresía creada correctamente'
        });
        this.loadMemberships();
      }
    });
  }

  onTableAction(event: { action: string; row: Membership }) {

    if (event.action === 'edit') {
      const ref = this.dialogService.open(MembershipsFormComponent, {
        header: 'Editar membresía',
        width: '90vw',
        modal: true,
        styleClass: 'memberships-modal',
        closable: true,
        closeOnEscape: true,
        data: { membership: event.row }
      });

      ref?.onClose.subscribe((result: any) => {
        if (result) {
          this.messageService.add({
            severity: 'success',
            summary: 'Actualizado',
            detail: 'Membresía actualizada'
          });
          this.loadMemberships();
        }
      });
    }

    if (event.action === 'delete') {
      this.confirmationService.confirm({
        message: `¿Eliminar membresía de ${event.row.customer?.display_name || 'Sin cliente'}?`,
        header: 'Confirmar',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.membershipsService.delete(event.row.id).subscribe(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Eliminado',
              detail: 'Membresía eliminada'
            });
            this.loadMemberships();
          });
        }
      });
    }
  }
}