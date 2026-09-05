import { Delivery } from './delivery.js';

describe('Delivery', () => {
  it('creates a delivery with the given attributes', () => {
    const delivery = new Delivery(
      'delivery-1',
      'customer-1',
      'Av. El Dorado 123',
      'Bogota',
      'PENDING',
    );

    expect(delivery.id).toBe('delivery-1');
    expect(delivery.customerId).toBe('customer-1');
    expect(delivery.address).toBe('Av. El Dorado 123');
    expect(delivery.city).toBe('Bogota');
    expect(delivery.status).toBe('PENDING');
  });
});
