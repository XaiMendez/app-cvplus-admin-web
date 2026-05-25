import { Component, OnInit, Input, Output, EventEmitter, inject, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
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
    NzIconModule,
    NzDividerModule
  ],
  templateUrl: './memberships-form.component.html',
  styleUrl: './memberships-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembershipsFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private membershipsService = inject(MembershipsService);
  private cdr = inject(ChangeDetectorRef);

  @Input() membership: Membership | null = null;
  @Output() submit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  loading = false;
  isEditMode = false;

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
      customerEmail: [this.membership?.customer?.email || '', Validators.required],
      customerPhone: [this.membership?.customer?.phone || '', Validators.required],
      totalPoints: [this.membership?.total_points || 0, [Validators.required, Validators.min(0)]],
      status: [this.membership?.status || 'CREADO', Validators.required]
    });
  }

  onCancel() {
    this.form.reset();
    this.cancel.emit();
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.cdr.markForCheck();

    const formValue = this.form.value;
    const payload = {
      status: formValue.status,
      total_points: formValue.totalPoints
    };

    const request = this.isEditMode && this.membership
      ? this.membershipsService.update(this.membership.id, payload)
      : this.membershipsService.create(payload);

    request.subscribe({
      next: (result) => {
        this.loading = false;
        this.cdr.markForCheck();
        this.submit.emit(result);
      },
      error: (err) => {
        this.loading = false;
        this.cdr.markForCheck();
        console.error('Error:', err);
      }
    });
  }
}
