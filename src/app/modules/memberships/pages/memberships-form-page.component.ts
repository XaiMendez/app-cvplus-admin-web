import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';

import { MembershipsFormComponent } from '../ui/memberships-form.component';
import { MembershipsService } from '../data-access/memberships.service';
import { Membership } from '../models/membership.model';

@Component({
  selector: 'app-memberships-form-page',
  standalone: true,
  imports: [
    CommonModule,
    MembershipsFormComponent,
    NzPageHeaderModule,
    NzButtonModule,
    NzSpinModule
  ],
  templateUrl: './memberships-form-page.component.html',
  styleUrl: './memberships-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembershipsFormPageComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private membershipsService = inject(MembershipsService);
  private messageService = inject(NzMessageService);
  private cdr = inject(ChangeDetectorRef);

  membership: Membership | null = null;
  isEditMode = false;
  loading = false;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadMembership(id);
    }
  }

  private loadMembership(id: string) {
    this.loading = true;
    this.membershipsService.getById(id).subscribe({
      next: (data) => {
        this.membership = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading membership:', err);
        this.loading = false;
      }
    });
  }

  onFormSubmit(result: any) {
    const message = this.isEditMode ? 'Membresía actualizada correctamente' : 'Membresía creada correctamente';
    this.messageService.success(message);
    this.router.navigate(['/memberships']);
  }

  onFormCancel() {
    this.router.navigate(['/memberships']);
  }
}
