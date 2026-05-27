import { Component, OnInit, Output, EventEmitter, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Ant Design Modules
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';

import { MembershipsService } from '../data-access/memberships.service';
import { Customer } from '../models/membership.model';

@Component({
  selector: 'app-memberships-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzButtonModule,
    NzSpinModule,
    NzIconModule,
    NzDividerModule
  ],
  templateUrl: './memberships-create.component.html',
  styleUrl: './memberships-create.component.scss',
  providers: [NzMessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembershipsCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private membershipsService = inject(MembershipsService);
  private messageService = inject(NzMessageService);
  private cdr = inject(ChangeDetectorRef);

  @Output() submit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  loading = false;
  customers: Customer[] = [];
  selectedCustomer: Customer | null = null;
  searchLoading = false;

  statusOptions = [
    { label: 'Creado', value: 'CREADO' },
    { label: 'Activo', value: 'ACTIVO' },
    { label: 'Inactivo', value: 'INACTIVO' }
  ];

  ngOnInit() {
    this.initForm();
    this.loadCustomers();
  }

  private initForm() {
    this.form = this.fb.group({
      customerId: ['', Validators.required],
      totalPoints: [0, [Validators.required, Validators.min(0)]],
      status: ['CREADO', Validators.required]
    });
  }

  private loadCustomers() {
    this.membershipsService.getCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading customers:', err);
        this.messageService.error('Error al cargar clientes');
      }
    });
  }

  onCustomerSelect(customerId: string) {
    const customer = this.customers.find(c => c.id === customerId);
    this.selectedCustomer = customer || null;
    this.cdr.markForCheck();
  }

  onCancel() {
    this.form.reset();
    this.selectedCustomer = null;
    this.cancel.emit();
  }

  onSubmit() {
    if (this.form.invalid || !this.selectedCustomer) return;

    this.loading = true;
    this.cdr.markForCheck();

    const formValue = this.form.value;
    const payload = {
      customer_id: this.selectedCustomer.id,
      status: formValue.status,
      total_points: formValue.totalPoints
    };

    this.membershipsService.create(payload).subscribe({
      next: (result) => {
        this.loading = false;
        this.cdr.markForCheck();
        this.messageService.success('Membresía creada correctamente');
        this.submit.emit(result);
      },
      error: (err) => {
        this.loading = false;
        this.cdr.markForCheck();
        this.messageService.error('Error al crear membresía');
        console.error('Error:', err);
      }
    });
  }
}
