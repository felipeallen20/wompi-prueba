export const TRANSACTION_STATUSES = [
  'PENDING',
  'APPROVED',
  'DECLINED',
  'ERROR',
] as const;

export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export function isTransactionStatus(
  value: unknown,
): value is TransactionStatus {
  return TRANSACTION_STATUSES.includes(value as TransactionStatus);
}
