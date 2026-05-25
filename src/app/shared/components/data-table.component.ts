import { Component, Input, Output, EventEmitter, SimpleChange } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'status' | 'date' | 'number';
  width?: string;
}

export interface TableAction {
  action: string;
  row: any;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzTagModule,
    NzSpaceModule,
    NzPaginationModule
  ],
  template: `
    <div class="data-table-container">
      <!-- HEADER -->
      <div class="table-header">
        <h3>{{ title }}</h3>
        <div class="header-actions">
          <nz-input-group nzSearch [nzAddOnAfter]="searchButton">
            <input
              type="text"
              nz-input
              placeholder="Buscar..."
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearch($event)"
              nzSize="large" />
          </nz-input-group>
          <ng-content select="[tableAction]"></ng-content>
        </div>
      </div>

      <!-- TABLE -->
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th *ngFor="let col of columns" [style.width]="col.width">
                {{ col.label }}
              </th>
              <th style="text-align: center; width: 120px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of paginatedData; trackBy: trackById">
              <td *ngFor="let col of columns">
                <ng-container [ngSwitch]="col.type || 'text'">
                  <!-- Status -->
                  <nz-tag
                    *ngSwitchCase="'status'"
                    [nzColor]="getStatusColor(getValue(row, col.key))">
                    {{ getValue(row, col.key) || '-' }}
                  </nz-tag>

                  <!-- Date -->
                  <span *ngSwitchCase="'date'">
                    {{ getValue(row, col.key) | date: 'short' || '-' }}
                  </span>

                  <!-- Number -->
                  <span *ngSwitchCase="'number'">
                    {{ getValue(row, col.key) || '-' }}
                  </span>

                  <!-- Text (default) -->
                  <span *ngSwitchDefault>
                    {{ getValue(row, col.key) || '-' }}
                  </span>
                </ng-container>
              </td>
              <td style="text-align: center;">
                <button
                  nz-button
                  nzType="text"
                  nzSize="small"
                  (click)="onEdit(row)"
                  title="Editar">
                  <i nz-icon nzType="edit"></i>
                </button>
                <button
                  nz-button
                  nzType="text"
                  nzDanger
                  nzSize="small"
                  (click)="onDelete(row)"
                  title="Eliminar">
                  <i nz-icon nzType="delete"></i>
                </button>
              </td>
            </tr>
            <tr *ngIf="filteredData.length === 0">
              <td [attr.colspan]="columns.length + 1" style="text-align: center; padding: 40px;">
                <p>No hay datos disponibles</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION -->
      <div class="pagination-wrapper" *ngIf="filteredData.length > pageSize">
        <nz-pagination
          [nzPageIndex]="pageIndex"
          [nzPageSize]="pageSize"
          [nzTotal]="filteredData.length"
          nzShowSizeChanger
          [nzPageSizeOptions]="[10, 20, 50]"
          (nzPageIndexChange)="onPageChange($event)"
          (nzPageSizeChange)="onPageSizeChange($event)">
        </nz-pagination>
      </div>
    </div>

    <ng-template #searchButton>
      <button nz-button nzType="primary" nzSize="large">
        <i nz-icon nzType="search"></i>
      </button>
    </ng-template>
  `,
  styles: [`
    .data-table-container {
      width: 100%;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      gap: 20px;
    }

    .table-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: 10px;
      flex: 1;
      max-width: 500px;
    }

    .table-wrapper {
      border: 1px solid #f0f0f0;
      border-radius: 4px;
      overflow: auto;
      margin-bottom: 20px;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .data-table thead {
      background-color: #fafafa;
      border-bottom: 1px solid #f0f0f0;
    }

    .data-table th {
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      color: #262626;
      border-bottom: 1px solid #f0f0f0;
    }

    .data-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    .data-table tbody tr:hover {
      background-color: #fafafa;
    }

    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      padding: 16px 0;
    }
  `]
})
export class DataTableComponent {
  @Input() title = 'Datos';
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Output() action = new EventEmitter<TableAction>();

  searchTerm = '';
  filteredData: any[] = [];
  paginatedData: any[] = [];
  pageIndex = 1;
  pageSize = 10;

  ngOnChanges(changes: any) {
    if (changes['data'] && this.data) {
      this.filterData();
    }
  }

  ngOnInit() {
    this.filterData();
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.pageIndex = 1;
    this.filterData();
  }

  private filterData() {
    if (!this.searchTerm.trim()) {
      this.filteredData = [...this.data];
    } else {
      const search = this.searchTerm.toLowerCase();
      this.filteredData = this.data.filter(row =>
        this.columns.some(col => {
          const value = this.getValue(row, col.key);
          return value && value.toString().toLowerCase().includes(search);
        })
      );
    }
    this.updatePaginatedData();
  }

  private updatePaginatedData() {
    const start = (this.pageIndex - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.filteredData.slice(start, end);
  }

  onPageChange(page: number) {
    this.pageIndex = page;
    this.updatePaginatedData();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.pageIndex = 1;
    this.updatePaginatedData();
  }

  getValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  }

  getStatusColor(status: string): string {
    if (!status) return 'default';
    const s = status.toUpperCase();
    if (['ACTIVO', 'CREADO', 'COMPLETADO', 'APROBADO', 'SUCCESS'].includes(s)) return 'green';
    if (['INACTIVO', 'CANCELADO', 'RECHAZADO', 'ERROR'].includes(s)) return 'red';
    if (['PENDIENTE', 'EN PROGRESO', 'PROCESANDO'].includes(s)) return 'orange';
    return 'blue';
  }

  trackById(index: number, item: any): any {
    return item.id || index;
  }

  onEdit(row: any) {
    this.action.emit({ action: 'edit', row });
  }

  onDelete(row: any) {
    this.action.emit({ action: 'delete', row });
  }
}
