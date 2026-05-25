import { Component, OnInit, ChangeDetectionStrategy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// Ant Design
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';

// Custom
import { TableComponent } from './table.component';
import { MembershipsService } from '../data-access/memberships.service';
import { Membership } from '../models/membership.model';

@Component({
  selector: 'app-memberships-list',
  standalone: true,
  imports: [
    CommonModule,
    TableComponent,
    NzButtonModule,
    NzAlertModule,
    NzIconModule
  ],
  templateUrl: './memberships-list.component.html',
  styleUrl: './memberships-list.component.scss',
  providers: [NzModalService, NzMessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembershipsListComponent implements OnInit {

  private membershipsService = inject(MembershipsService);
  private modalService = inject(NzModalService);
  private messageService = inject(NzMessageService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  memberships: Membership[] = [];
  loading = true;
  error = '';
  customerId: string | null = null;

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
    this.router.navigate(['/memberships/new']);
  }

  onEdit(row: Membership) {
    this.router.navigate(['/memberships', row.id, 'edit']);
  }

  onDelete(row: Membership) {
    this.modalService.confirm({
      nzTitle: 'Confirmar eliminación',
      nzContent: `¿Eliminar membresía de ${row.customer?.display_name || 'Sin cliente'}?`,
      nzOkText: 'Eliminar',
      nzCancelText: 'Cancelar',
      nzOkDanger: true,
      nzOnOk: () => {
        this.membershipsService.delete(row.id).subscribe(() => {
          this.messageService.success('Membresía eliminada');
          this.loadMemberships();
          this.cdr.markForCheck();
        });
      }
    });
  }
}
