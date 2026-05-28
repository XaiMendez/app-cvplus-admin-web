import { Component, OnInit, Output, EventEmitter, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { MembershipsService } from '../data-access/memberships.service';
import { Customer } from '../models/membership.model';

@Component({
  selector: 'app-memberships-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzButtonModule,
    NzSpinModule,
    NzMessageModule
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

  searchForm!: FormGroup;
  membershipForm!: FormGroup;
  loading = false;
  searching = false;
  customer: Customer | null = null;
  errorMessage = '';
  searchError = '';

  statusOptions = [
    { label: 'Creado', value: 'CREADO' },
    { label: 'Activo', value: 'ACTIVO' },
    { label: 'Inactivo', value: 'INACTIVO' }
  ];

  ngOnInit() {
    this.initSearchForm();
    this.initMembershipForm();
  }

  private initSearchForm() {
    this.searchForm = this.fb.group({
      dui: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  private initMembershipForm() {
    this.membershipForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      totalPoints: [0, Validators.required],
      status: ['CREADO', Validators.required]
    });
  }

  searchCustomer() {
    const dui = this.searchForm.get('dui')!.value;
    console.log('🔴 Searching customer by DUI:', dui);

    this.searching = true;
    this.searchError = '';
    this.cdr.markForCheck();

    this.membershipsService.searchCustomerByDui(dui).subscribe({
      next: (response: any) => {
        console.log('🔴 Search response:', response);

        // El endpoint devuelve un array de contactos
        const contacts = Array.isArray(response) ? response : response?.result || [];

        if (contacts && contacts.length > 0) {
          const contact = contacts[0];
          // Mapear contacto de Odoo a Customer
          this.customer = {
            id: contact.id,
            display_name: contact.name,
            first_name: contact.name?.split(' ')[0] || '',
            last_name: contact.name?.split(' ').slice(1).join(' ') || '',
            email: contact.email || '',
            phone: contact.phone || '',
            customer_id: contact.dui || dui,
            status: 'CREADO',
            created_at: contact.create_date || new Date().toISOString(),
            updated_at: contact.create_date || new Date().toISOString()
          } as Customer;

          this.membershipForm.patchValue({
            name: this.customer.display_name,
            email: this.customer.email,
            phone: this.customer.phone
          });
          this.searchError = '';
        } else {
          this.searchError = 'Cliente no encontrado con ese DUI';
          this.customer = null;
        }
        this.searching = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('🔴 Search error:', err);
        this.searching = false;
        this.searchError = 'Error al buscar cliente';
        this.customer = null;
        this.cdr.markForCheck();
      }
    });
  }

  onCancel() {
    this.searchForm.reset();
    this.membershipForm.reset();
    this.customer = null;
    this.searchError = '';
    this.errorMessage = '';
    this.cancel.emit();
  }

  onSubmit() {
    console.log('🔴 Submit clicked');
    if (!this.customer || this.membershipForm.invalid) {
      console.log('🔴 Missing customer or invalid form');
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    const formValue = this.membershipForm.value;
    const payload = {
      customer_id: this.customer.id,
      status: formValue.status,
      total_points: formValue.totalPoints
    };

    console.log('🔴 Submitting payload:', payload);
    this.membershipsService.create(payload).subscribe({
      next: (result) => {
        console.log('🔴 Success:', result);
        this.loading = false;
        this.cdr.markForCheck();
        this.messageService.success('Membresía creada correctamente');
        this.submit.emit(result);
      },
      error: (err) => {
        console.error('🔴 Error:', err);
        this.loading = false;
        this.errorMessage = 'Error al crear membresía';
        this.messageService.error(this.errorMessage);
        this.cdr.markForCheck();
      }
    });
  }
}
