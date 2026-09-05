import { jest } from '@jest/globals';
import { Result } from '../../shared/result.js';
import { Product } from '../../domain/entities/product.js';
import { Stock } from '../../domain/entities/stock.js';
import type { ProductRepository } from '../../domain/ports/product-repository.js';
import type { TransactionRepository } from '../../domain/ports/transaction-repository.js';
import { CreateTransactionUseCase } from './create-transaction.use-case.js';
import type { CreateTransactionError } from './create-transaction.errors.js';

describe('CreateTransactionUseCase', () => {
  const product = new Product(
    'product-1',
    'Wireless Mouse',
    'A comfortable wireless mouse',
    45000,
    'https://shop.example.com/mouse.png',
  );
  const productWithStock = {
    ...product,
    stock: new Stock('product-1', 10),
  };

  let productRepository: jest.Mocked<ProductRepository>;
  let transactionRepository: jest.Mocked<TransactionRepository>;
  let useCase: CreateTransactionUseCase;

  beforeEach(() => {
    productRepository = {
      listWithStock: jest.fn(),
      findById: jest.fn(),
      findStockByProductId: jest.fn(),
      decrementStock: jest.fn(),
    } as jest.Mocked<ProductRepository>;

    transactionRepository = {
      save: jest.fn(),
      findById: jest.fn(),
    } as jest.Mocked<TransactionRepository>;

    useCase = new CreateTransactionUseCase(
      productRepository,
      transactionRepository,
    );
  });

  it('creates a PENDING transaction with backend-side totals', async () => {
    productRepository.findById.mockResolvedValue(productWithStock);
    transactionRepository.save.mockImplementation(
      async (transaction) => transaction,
    );

    const result = await useCase.execute({
      productId: 'product-1',
      customerId: 'customer-1',
      deliveryId: 'delivery-1',
    });

    expect(result.isOk()).toBe(true);
    const transaction = result.unwrapOr(null);
    expect(transaction?.productId).toBe('product-1');
    expect(transaction?.customerId).toBe('customer-1');
    expect(transaction?.deliveryId).toBe('delivery-1');
    expect(transaction?.status).toBe('PENDING');
    expect(transaction?.amount).toBe(45000);
    expect(transaction?.baseFee).toBe(2000);
    expect(transaction?.deliveryFee).toBe(8000);
    expect(transaction?.gatewayReference).toBeNull();
    expect(transaction?.createdAt).toBeInstanceOf(Date);
    expect(transactionRepository.save).toHaveBeenCalledTimes(1);
  });

  it('accepts a null delivery for a PENDING transaction', async () => {
    productRepository.findById.mockResolvedValue(productWithStock);
    transactionRepository.save.mockImplementation(
      async (transaction) => transaction,
    );

    const result = await useCase.execute({
      productId: 'product-1',
      customerId: 'customer-1',
      deliveryId: null,
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrapOr(null)?.deliveryId).toBeNull();
  });

  it('short-circuits with INVALID_INPUT when productId is missing', async () => {
    const result = await useCase.execute({
      productId: '   ',
      customerId: 'customer-1',
      deliveryId: null,
    });

    expect(result).toEqual(
      Result.err<Transaction, CreateTransactionError>({
        code: 'INVALID_INPUT',
        message: expect.any(String),
      }),
    );
    expect(productRepository.findById).not.toHaveBeenCalled();
    expect(transactionRepository.save).not.toHaveBeenCalled();
  });

  it('short-circuits with INVALID_INPUT when customerId is missing', async () => {
    const result = await useCase.execute({
      productId: 'product-1',
      customerId: '',
      deliveryId: null,
    });

    expect(result.isErr()).toBe(true);
    expect(result).toEqual(
      Result.err<Transaction, CreateTransactionError>({
        code: 'INVALID_INPUT',
        message: expect.any(String),
      }),
    );
    expect(transactionRepository.save).not.toHaveBeenCalled();
  });

  it('short-circuits with PRODUCT_NOT_FOUND when the product does not exist', async () => {
    productRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute({
      productId: 'product-unknown',
      customerId: 'customer-1',
      deliveryId: null,
    });

    expect(result).toEqual(
      Result.err<Transaction, CreateTransactionError>({
        code: 'PRODUCT_NOT_FOUND',
        message: expect.any(String),
      }),
    );
    expect(transactionRepository.save).not.toHaveBeenCalled();
  });
});
