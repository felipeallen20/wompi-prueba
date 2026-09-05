import { jest } from '@jest/globals';
import { Result } from '../../shared/result.js';
import { Transaction } from '../../domain/entities/transaction.js';
import type { ProductRepository } from '../../domain/ports/product-repository.js';
import type { TransactionRepository } from '../../domain/ports/transaction-repository.js';
import { UpdateStockUseCase } from './update-stock.use-case.js';
import type { UpdateStockError } from './update-stock.errors.js';

function buildTransaction(
  status: Transaction['status'] = 'APPROVED',
): Transaction {
  return new Transaction(
    'transaction-1',
    'product-1',
    'customer-1',
    'delivery-1',
    status,
    45000,
    2000,
    8000,
    status === 'PENDING' ? null : 'gateway-ref-1',
    new Date('2026-09-05T10:00:00Z'),
    new Date('2026-09-05T10:00:00Z'),
  );
}

describe('UpdateStockUseCase', () => {
  let transactionRepository: jest.Mocked<TransactionRepository>;
  let productRepository: jest.Mocked<ProductRepository>;
  let useCase: UpdateStockUseCase;

  beforeEach(() => {
    transactionRepository = {
      save: jest.fn(),
      findById: jest.fn(),
    } as jest.Mocked<TransactionRepository>;

    productRepository = {
      listWithStock: jest.fn(),
      findById: jest.fn(),
      findStockByProductId: jest.fn(),
      decrementStock: jest.fn(),
    } as jest.Mocked<ProductRepository>;

    useCase = new UpdateStockUseCase(transactionRepository, productRepository);
  });

  it('decrements stock by one for an approved transaction', async () => {
    transactionRepository.findById.mockResolvedValue(buildTransaction());
    productRepository.decrementStock.mockResolvedValue(true);

    const result = await useCase.execute({ transactionId: 'transaction-1' });

    expect(result.isOk()).toBe(true);
    expect(productRepository.decrementStock).toHaveBeenCalledTimes(1);
    expect(productRepository.decrementStock).toHaveBeenCalledWith(
      'product-1',
      1,
    );
  });

  it('short-circuits with INVALID_INPUT for a missing transaction id', async () => {
    const result = await useCase.execute({ transactionId: '  ' });

    expect(result).toEqual(
      Result.err<null, UpdateStockError>({
        code: 'INVALID_INPUT',
        message: expect.any(String),
      }),
    );
    expect(transactionRepository.findById).not.toHaveBeenCalled();
  });

  it('short-circuits with TRANSACTION_NOT_FOUND when the transaction is missing', async () => {
    transactionRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute({ transactionId: 'transaction-x' });

    expect(result).toEqual(
      Result.err<null, UpdateStockError>({
        code: 'TRANSACTION_NOT_FOUND',
        message: expect.any(String),
      }),
    );
    expect(productRepository.decrementStock).not.toHaveBeenCalled();
  });

  it('does not decrement stock for a transaction that is not approved', async () => {
    transactionRepository.findById.mockResolvedValue(
      buildTransaction('PENDING'),
    );

    const result = await useCase.execute({ transactionId: 'transaction-1' });

    expect(result).toEqual(
      Result.err<null, UpdateStockError>({
        code: 'TRANSACTION_NOT_APPROVED',
        message: expect.any(String),
      }),
    );
    expect(productRepository.decrementStock).not.toHaveBeenCalled();
  });

  it('short-circuits with INSUFFICIENT_STOCK when the decrement fails', async () => {
    transactionRepository.findById.mockResolvedValue(buildTransaction());
    productRepository.decrementStock.mockResolvedValue(false);

    const result = await useCase.execute({ transactionId: 'transaction-1' });

    expect(result).toEqual(
      Result.err<null, UpdateStockError>({
        code: 'INSUFFICIENT_STOCK',
        message: expect.any(String),
      }),
    );
  });
});
