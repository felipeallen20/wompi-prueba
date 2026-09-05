import { Customer } from './customer.js';

describe('Customer', () => {
  it('creates a customer with the given attributes', () => {
    const customer = new Customer(
      'customer-1',
      'Jane Doe',
      'jane.doe@example.com',
      '+573001234567',
    );

    expect(customer.id).toBe('customer-1');
    expect(customer.fullName).toBe('Jane Doe');
    expect(customer.email).toBe('jane.doe@example.com');
    expect(customer.phone).toBe('+573001234567');
  });
});
