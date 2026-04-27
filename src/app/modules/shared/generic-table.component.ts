import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';

export interface Column {
  key: string;
  label: string;
  type?: 'text' | 'status' | 'date' | 'count';
}

@Component({
  selector: 'app-generic-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    ProgressSpinnerModule,
    CardModule,
    TooltipModule,
    TagModule,
    DropdownModule,
    MultiSelectModule,
    CalendarModule
  ],
  templateUrl: './generic-table.component.html',
  styleUrl: './generic-table.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericTableComponent implements OnChanges {

  @Input() data: any[] = [];
  @Input() columns: Column[] = [];
  @Input() loading = false;

  @Output() actionTriggered = new EventEmitter<{ action: string; row: any }>();

  filterValue = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] || changes['columns']) {
      console.log('DATA:', this.data);
      console.log('COLUMNS:', this.columns);
    }
  }

  // 🔥 FIX PRINCIPAL
  getValue(obj: any, path: string): string | undefined {
    const value = path.split('.').reduce((acc, key) => acc?.[key], obj);
    return value ?? undefined;
  }

  getMembershipsCount(row: any): number {
    return row?.memberships?.length ?? 0;
  }

  getSeverity(value?: string): 'success' | 'danger' | 'warn' | 'info' | undefined {
    if (!value) return undefined;

    const v = value.toUpperCase();

    if (['ACTIVO', 'CREADO', 'SUCCESS', 'COMPLETADO', 'APROBADO'].includes(v)) {
      return 'success';
    }

    if (['INACTIVO', 'ERROR', 'RECHAZADO', 'CANCELADO'].includes(v)) {
      return 'danger';
    }

    if (['PENDIENTE', 'EN PROGRESO', 'PROCESANDO'].includes(v)) {
      return 'warn';
    }

    return 'info';
  }

  onAction(action: string, row: any) {
    this.actionTriggered.emit({ action, row });
  }

  onFilter(event: any) {
    this.filterValue = event.target.value;
  }
}