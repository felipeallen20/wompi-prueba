import type { Customer } from '../entities/customer.js';

export interface CustomerRepository {
  save(customer: Customer): Promise<Customer>;
  findById(id: string): Promise<Customer | null>;
}
