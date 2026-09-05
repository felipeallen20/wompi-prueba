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

  it('updates the payment result keeping immutable fields', () => {
    const createdAt = new Date('2026-09-05T10:00:00Z');
    const processedAt = new Date('2026-09-05T10:05:00Z');
    const transaction = new Transaction(
      'transaction-3',
      'product-1',
      'customer-1',
      'delivery-1',
      'PENDING',
      45000,
      2000,
      8000,
      null,
      createdAt,
      createdAt,
    );

    const updated = transaction.updatePaymentResult(
      'APPROVED',
      'gateway-ref-3',
      processedAt,
    );

    expect(updated.id).toBe(transaction.id);
    expect(updated.productId).toBe(transaction.productId);
    expect(updated.customerId).toBe(transaction.customerId);
    expect(updated.deliveryId).toBe(transaction.deliveryId);
    expect(updated.status).toBe('APPROVED');
    expect(updated.amount).toBe(transaction.amount);
    expect(updated.baseFee).toBe(transaction.baseFee);
    expect(updated.deliveryFee).toBe(transaction.deliveryFee);
    expect(updated.gatewayReference).toBe('gateway-ref-3');
    expect(updated.createdAt).toBe(createdAt);
    expect(updated.updatedAt).toBe(processedAt);
  });
});
