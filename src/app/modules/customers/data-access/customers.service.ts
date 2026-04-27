import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseCrudService } from '../../shared/services/base-crud.service';
import { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomersService extends BaseCrudService<Customer> {
  constructor(http: HttpClient) {
    super(http, 'customers');
  }
}

