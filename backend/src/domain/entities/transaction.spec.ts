import { Transaction } from './transaction.js';

describe('Transaction', () => {
  it('creates a transaction with the given attributes', () => {
    const createdAt = new Date('2026-09-05T10:00:00Z');
    const updatedAt = new Date('2026-09-05T10:00:00Z');
    const transaction = new Transaction(
      'transaction-1',
      'product-1',
      'customer-1',
      'delivery-1',
      'PENDING',
      45000,
      2000,
      8000,
      'gateway-ref-1',
      createdAt,
      updatedAt,
    );

    expect(transaction.id).toBe('transaction-1');
    expect(transaction.productId).toBe('product-1');
    expect(transaction.customerId).toBe('customer-1');
    expect(transaction.deliveryId).toBe('delivery-1');
    expect(transaction.status).toBe('PENDING');
    expect(transaction.amount).toBe(45000);
    expect(transaction.baseFee).toBe(2000);
    expect(transaction.deliveryFee).toBe(8000);
    expect(transaction.gatewayReference).toBe('gateway-ref-1');
    expect(transaction.createdAt).toBe(createdAt);
    expect(transaction.updatedAt).toBe(updatedAt);
  });

  it('allows delivery and gateway reference to be null', () => {
    const createdAt = new Date('2026-09-05T10:00:00Z');
    const transaction = new Transaction(
      'transaction-2',
      'product-1',
      'customer-1',
      null,
      'PENDING',
      45000,
      2000,
      8000,
      null,
      createdAt,
      createdAt,
    );

    expect(transaction.deliveryId).toBeNull();
    expect(transaction.gatewayReference).toBeNull();
  });
});
