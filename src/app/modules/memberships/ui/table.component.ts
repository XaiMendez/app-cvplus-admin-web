import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

@Component({
  selector: 'app-memberships-table',
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzSpaceModule,
    NzPaginationModule
  ],
  template: `
    <div class="table-wrapper">
      <div class="table-container">
        <table class="simple-table">
          <thead>
            <tr>
              <th>ID ODOO</th>
              <th>Cliente</th>
              <th>Puntos</th>
              <th>Estado</th>
              <th>Creado</th>
              <th class="actions-header">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of paginatedData; trackBy: trackByFn" class="table-row">
              <td class="cell-id">{{ item.customer?.customer_id }}</td>
              <td class="cell-name">{{ item.customer?.display_name }}</td>
              <td class="cell-number">{{ item.total_points }}</td>
              <td class="cell-status">
                <nz-tag [nzColor]="getColor(item.status)">{{ item.status }}</nz-tag>
              </td>
              <td class="cell-date">{{ item.created_at | date: 'short' }}</td>
              <td class="cell-actions">
                <div class="actions-group">
                  <button
                    nz-button
                    nzType="primary"
                    nzSize="small"
                    (click)="edit(item)"
                    class="btn-edit"
                    title="Editar membresía">
                    <i nz-icon nzType="edit" nzTheme="outline"></i>
                    <span class="btn-text">Editar</span>
                  </button>
                  <button
                    nz-button
                    nzType="default"
                    nzSize="small"
                    (click)="delete(item)"
                    class="btn-delete"
                    title="Eliminar membresía">
                    <i nz-icon nzType="delete" nzTheme="outline"></i>
                    <span class="btn-text">Eliminar</span>
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="!paginatedData || paginatedData.length === 0" class="empty-row">
              <td [attr.colspan]="6">
                <div class="empty-state">
                  <i nz-icon nzType="inbox" nzTheme="outline" class="empty-icon"></i>
                  <p>Sin datos disponibles</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINACION -->
      <div class="pagination-container" *ngIf="data && data.length > pageSize">
        <nz-pagination
          [(nzPageIndex)]="pageIndex"
          [nzPageSize]="pageSize"
          [nzTotal]="data.length"
          [nzShowSizeChanger]="true"
          [nzPageSizeOptions]="[5, 10, 20, 50]"
          nzShowQuickJumper
          (nzPageIndexChange)="onPageChange($event)"
          (nzPageSizeChange)="onPageSizeChange($event)">
        </nz-pagination>
        <span class="total-text">Total: {{ data.length }} registros</span>
      </div>
    </div>
  `,
  styles: [`
    .table-wrapper {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
    }

    .table-container {
      width: 100%;
      overflow-x: auto;
      border-radius: 6px;
      border: 1px solid #e8e8e8;
    }

    .simple-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
    }

    .simple-table thead {
      background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
      border-bottom: 2px solid #e8e8e8;
    }

    .simple-table th {
      padding: 16px;
      text-align: left;
      font-weight: 600;
      color: #262626;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .simple-table td {
      padding: 14px 16px;
      border-bottom: 1px solid #f0f0f0;
      vertical-align: middle;
    }

    .simple-table tbody tr:last-child td {
      border-bottom: none;
    }

    .table-row {
      transition: all 0.3s ease;
      background: white;
    }

    .table-row:hover {
      background: #fafafa;
      box-shadow: inset 0 0 0 1px rgba(10, 162, 192, 0.08);
    }

    .cell-id {
      font-weight: 600;
      color: #0aa2c0;
      font-size: 13px;
      font-family: 'Courier New', monospace;
    }

    .cell-name {
      font-weight: 500;
      color: #262626;
      max-width: 300px;
      white-space: normal;
      word-wrap: break-word;
    }

    .cell-number {
      text-align: center;
      font-weight: 500;
      color: #1890ff;
    }

    .cell-status {
      text-align: center;
    }

    .cell-date {
      color: #8c8c8c;
      font-size: 12px;
    }

    .cell-actions {
      text-align: center;
    }

    .actions-header {
      text-align: center;
    }

    .actions-group {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: center;
    }

    :host ::ng-deep {
      .btn-edit,
      .btn-delete {
        border-radius: 4px !important;
        transition: all 0.3s ease !important;
        font-weight: 500;
        height: 32px;
        padding: 0 12px !important;
        display: inline-flex;
        align-items: center;
        gap: 6px;

        i {
          font-size: 14px;
        }

        .btn-text {
          font-size: 12px;
        }
      }

      .btn-edit {
        background: linear-gradient(135deg, #0aa2c0 0%, #0891b2 100%) !important;
        border: none !important;
        color: white !important;
        box-shadow: 0 2px 8px rgba(10, 162, 192, 0.25);
      }

      .btn-edit:hover {
        box-shadow: 0 4px 12px rgba(10, 162, 192, 0.35) !important;
        transform: translateY(-2px);
      }

      .btn-edit:active {
        transform: translateY(0);
      }

      .btn-delete {
        background: white !important;
        border: 1px solid #ff4d4f !important;
        color: #ff4d4f !important;
      }

      .btn-delete:hover {
        background: #fff7f6 !important;
        border-color: #ff4d4f !important;
        color: #ff4d4f !important;
        box-shadow: 0 2px 8px rgba(255, 77, 79, 0.15) !important;
      }

      .btn-delete:active {
        background: #fde8e6 !important;
      }

      /* Pagination styles */
      .pagination-container {
        .ant-pagination {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .ant-pagination-item {
          border-color: #e8e8e8 !important;
          border-radius: 4px !important;
          transition: all 0.3s ease;

          a {
            color: #262626 !important;
          }

          &:hover {
            border-color: #0aa2c0 !important;
            color: #0aa2c0 !important;

            a {
              color: #0aa2c0 !important;
            }
          }
        }

        .ant-pagination-item-active {
          background: linear-gradient(135deg, #0aa2c0 0%, #0891b2 100%) !important;
          border-color: #0aa2c0 !important;

          a {
            color: white !important;
          }
        }

        .ant-pagination-prev,
        .ant-pagination-next,
        .ant-pagination-jump-prev,
        .ant-pagination-jump-next {
          button {
            border-color: #e8e8e8 !important;
            border-radius: 4px !important;
            transition: all 0.3s ease;

            &:hover {
              border-color: #0aa2c0 !important;
              color: #0aa2c0 !important;
            }
          }
        }

        .ant-pagination-total-text {
          color: #8c8c8c;
          font-size: 12px;
          margin: 0 8px;
        }
      }
    }

    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-top: 1px solid #f0f0f0;
      gap: 16px;
    }

    .total-text {
      color: #8c8c8c;
      font-size: 12px;
      white-space: nowrap;
    }

    .empty-row td {
      padding: 0 !important;
      border: none !important;
    }

    .empty-state {
      padding: 60px 20px;
      text-align: center;
      color: #8c8c8c;
    }

    .empty-icon {
      font-size: 48px;
      color: #bfbfbf;
      margin-bottom: 16px;
      display: block;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
    }
  `]
})
export class TableComponent implements OnChanges {
  @Input() data: any[] = [];
  @Output() editRow = new EventEmitter<any>();
  @Output() deleteRow = new EventEmitter<any>();

  pageIndex = 1;
  pageSize = 10;
  paginatedData: any[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.pageIndex = 1;
      this.updatePaginatedData();
    }
  }

  private updatePaginatedData() {
    const startIndex = (this.pageIndex - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.data.slice(startIndex, endIndex);
  }

  onPageChange(pageIndex: number) {
    this.pageIndex = pageIndex;
    this.updatePaginatedData();
  }

  onPageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.pageIndex = 1;
    this.updatePaginatedData();
  }

  trackByFn(index: number, item: any) {
    return item.id || index;
  }

  getColor(status: string) {
    if (!status) return 'default';
    const s = status.toUpperCase();
    if (s === 'CREADO' || s === 'ACTIVO') return 'green';
    if (s === 'INACTIVO') return 'red';
    return 'blue';
  }

  edit(row: any) {
    this.editRow.emit(row);
  }

  delete(row: any) {
    this.deleteRow.emit(row);
  }
}
