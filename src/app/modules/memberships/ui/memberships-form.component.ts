import { Component, OnInit, Input, Output, EventEmitter, inject, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { MembershipsService } from '../data-access/memberships.service';
import { Membership } from '../models/membership.model';

@Component({
  selector: 'app-memberships-form',
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
    NzDividerModule,
    NzMessageModule
  ],
  templateUrl: './memberships-form.component.html',
  styleUrl: './memberships-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembershipsFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private membershipsService = inject(MembershipsService);
  private messageService = inject(NzMessageService);
  private cdr = inject(ChangeDetectorRef);

  @Input() membership: Membership | null = null;
  @Output() submit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  loading = false;
  isEditMode = false;
  errorMessage = '';

  statusOptions = [
    { label: 'Creado', value: 'CREADO' },
    { label: 'Activo', value: 'ACTIVO' },
    { label: 'Inactivo', value: 'INACTIVO' }
  ];

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['membership'] && this.form) {
      this.isEditMode = !!this.membership;
      this.updateFormWithMembership();
      this.cdr.markForCheck();
    }
  }

  private updateFormWithMembership() {
    if (!this.form || !this.membership) return;

    this.form.patchValue({
      customerName: this.membership.customer?.display_name || '',
      customerEmail: this.membership.customer?.email || '',
      customerPhone: this.membership.customer?.phone || '',
      totalPoints: this.membership.total_points || 0,
      status: this.membership.status || 'CREADO'
    });
  }

  private initForm() {
    this.form = this.fb.group({
      customerName: [this.membership?.customer?.display_name || '', Validators.required],
      customerEmail: [this.membership?.customer?.email || '', [Validators.required, Validators.email]],
      customerPhone: [this.membership?.customer?.phone || '', Validators.required],
      totalPoints: [this.membership?.total_points || 0, [Validators.required, Validators.min(0)]],
      status: [this.membership?.status || 'CREADO', Validators.required]
    });
  }

  onCancel() {
    this.form.reset();
    this.errorMessage = '';
    this.cancel.emit();
  }

  onSubmit() {
    if (this.form.invalid || !this.membership) {
      console.log('🔴 Form invalid or no membership');
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    const formValue = this.form.value;
    const payload = {
      status: formValue.status,
      total_points: formValue.totalPoints
    };

    console.log('🔴 Updating membership:', this.membership.id, payload);
    this.membershipsService.update(this.membership.id, payload).subscribe({
      next: (result) => {
        console.log('🔴 Update success:', result);
        this.loading = false;
        this.cdr.markForCheck();
        this.messageService.success('Membresía actualizada correctamente');
        this.submit.emit(result);
      },
      error: (err) => {
        console.error('🔴 Update error:', err);
        this.loading = false;
        this.errorMessage = 'Error al actualizar membresía';
        this.messageService.error(this.errorMessage);
        this.cdr.markForCheck();
      }
    });
  }
}
