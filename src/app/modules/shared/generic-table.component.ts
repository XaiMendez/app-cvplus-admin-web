import { Component, Input, Output, EventEmitter, OnInit, OnChanges, CUSTOM_ELEMENTS_SCHEMA, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { FormsModule } from '@angular/forms';

export interface Column {
  key: string;
  label: string;
  width?: string;
  type?: 'text' | 'status' | 'count';
}

@Component({
  selector: 'app-generic-table',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzSpinModule,
    NzTagModule,
    NzIconModule,
    NzSpaceModule,
    NzCardModule,
    NzGridModule,
    FormsModule
  ],
  templateUrl: './generic-table.component.html',
  styleUrl: './generic-table.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GenericTableComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];
  @Input() columns: Column[] = [];
  @Input() loading = false;
  @Output() actionTriggered = new EventEmitter<{ action: string; row: any }>();

  searchValue = '';
  tableColumns: any[] = [];
  displayData: any[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    console.log('[GenericTable] ngOnInit - data:', this.data);
    this.updateTableColumns();
    this.updateDisplayData();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('[GenericTable] ngOnChanges - changes:', changes);
    console.log('[GenericTable] ngOnChanges - data value:', this.data);
    if (changes['data'] || changes['columns']) {
      this.updateTableColumns();
      this.updateDisplayData();
    }
  }

  private updateDisplayData() {
    this.displayData = this.getFilteredData();
    console.log('[GenericTable] updateDisplayData - displayData:', this.displayData);
    this.cdr.markForCheck();
  }

  private updateTableColumns() {
    this.tableColumns = [
      ...this.columns.map(col => ({
        title: col.label,
        width: col.width || 'auto'
      })),
      {
        title: 'Acciones',
        width: '120px'
      }
    ];
  }

  getValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  }

  getMembershipsCount(row: any): number {
    return row?.memberships?.length ?? 0;
  }

  getSeverity(value?: string): 'success' | 'error' | 'warning' | 'processing' | undefined {
    if (!value) return undefined;
    const v = value.toUpperCase();
    if (['ACTIVO', 'CREADO', 'SUCCESS', 'COMPLETADO', 'APROBADO'].includes(v)) return 'success';
    if (['INACTIVO', 'ERROR', 'RECHAZADO', 'CANCELADO'].includes(v)) return 'error';
    if (['PENDIENTE', 'EN PROGRESO', 'PROCESANDO'].includes(v)) return 'warning';
    return 'processing';
  }

  onAction(action: string, row: any) {
    this.actionTriggered.emit({ action, row });
  }

  onSearchChange() {
    this.updateDisplayData();
  }

  private getFilteredData(): any[] {
    if (!this.searchValue.trim()) {
      return [...this.data];
    }
    const search = this.searchValue.toLowerCase();
    return this.data.filter(row =>
      this.columns.some(col => {
        const value = this.getValue(row, col.key);
        return value && value.toString().toLowerCase().includes(search);
      })
    );
  }

  getTagColor(value?: string): string {
    if (!value) return 'default';
    const v = value.toUpperCase();
    if (['ACTIVO', 'CREADO', 'SUCCESS', 'COMPLETADO', 'APROBADO'].includes(v)) return 'green';
    if (['INACTIVO', 'ERROR', 'RECHAZADO', 'CANCELADO'].includes(v)) return 'red';
    if (['PENDIENTE', 'EN PROGRESO', 'PROCESANDO'].includes(v)) return 'orange';
    return 'blue';
  }

  trackByRow(index: number, item: any): any {
    return item.id || index;
  }
}
