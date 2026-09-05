import {
  TRANSACTION_STATUSES,
  isTransactionStatus,
} from './transaction-status.js';

describe('TransactionStatus', () => {
  it('exposes the supported statuses', () => {
    expect(TRANSACTION_STATUSES).toEqual([
      'PENDING',
      'APPROVED',
      'DECLINED',
      'ERROR',
    ]);
  });

  it.each(TRANSACTION_STATUSES)('recognizes %s as a valid status', (status) => {
    expect(isTransactionStatus(status)).toBe(true);
  });

  it('rejects unknown statuses', () => {
    expect(isTransactionStatus('CANCELLED')).toBe(false);
    expect(isTransactionStatus(123)).toBe(false);
  });
});
