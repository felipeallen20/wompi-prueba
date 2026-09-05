import { jest } from '@jest/globals';
import { Transaction } from '../../domain/entities/transaction.js';
import type { TransactionRepository } from '../../domain/ports/transaction-repository.js';
import { GetTransactionUseCase } from './get-transaction.use-case.js';

const transaction = new Transaction(
  't1',
  'p1',
  'c1',
  'd1',
  'PENDING',
  50000,
  2000,
  8000,
  null,
  new Date('2026-01-01T00:00:00Z'),
  new Date('2026-01-01T00:00:00Z'),
);

const transactionRepository = {
  findById: jest.fn(async (id: string) => (id === 't1' ? transaction : null)),
} as unknown as TransactionRepository;

describe('GetTransactionUseCase', () => {
  const useCase = new GetTransactionUseCase(transactionRepository);

  it('returns a transaction by id', async () => {
    const result = await useCase.execute('t1');

    expect(result.isOk()).toBe(true);
    expect(result.unwrapOr(null)).toEqual(transaction);
  });

  it('fails when the id is empty', async () => {
    const result = await useCase.execute('');

    expect(result.isErr()).toBe(true);
    expect(result.getError()?.code).toBe('INVALID_INPUT');
  });

  it('fails when the transaction does not exist', async () => {
    const result = await useCase.execute('missing');

    expect(result.isErr()).toBe(true);
    expect(result.getError()?.code).toBe('TRANSACTION_NOT_FOUND');
  });
});
