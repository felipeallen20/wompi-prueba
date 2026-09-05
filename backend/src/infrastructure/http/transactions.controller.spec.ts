import { jest } from '@jest/globals';
import { Result } from '../../shared/result.js';
import type { CreateTransactionUseCase } from '../../application/create-transaction/create-transaction.use-case.js';
import type { GetTransactionUseCase } from '../../application/get-transaction/get-transaction.use-case.js';
import type { ProcessCheckoutUseCase } from '../../application/process-checkout/process-checkout.use-case.js';
import { TransactionsController } from './transactions.controller.js';

const transaction = {
  id: 't1',
  productId: 'p1',
  customerId: 'c1',
  deliveryId: 'd1',
  status: 'PENDING',
  amount: 50000,
  baseFee: 2000,
  deliveryFee: 8000,
  gatewayReference: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

describe('TransactionsController', () => {
  const createTransaction = {
    execute: jest.fn(),
  } as unknown as CreateTransactionUseCase;
  const getTransaction = {
    execute: jest.fn(),
  } as unknown as GetTransactionUseCase;
  const processCheckout = {
    execute: jest.fn(),
  } as unknown as ProcessCheckoutUseCase;

  const controller = new TransactionsController(
    createTransaction,
    getTransaction,
    processCheckout,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a PENDING transaction with an optional delivery', async () => {
    createTransaction.execute.mockResolvedValue(Result.ok(transaction));

    const dto = { productId: 'p1', customerId: 'c1', deliveryId: 'd1' };
    await expect(controller.create(dto)).resolves.toEqual(transaction);
    expect(createTransaction.execute).toHaveBeenCalledWith(dto);
  });

  it('creates a transaction without a delivery reference', async () => {
    createTransaction.execute.mockResolvedValue(Result.ok(transaction));

    await controller.create({ productId: 'p1', customerId: 'c1' });

    expect(createTransaction.execute).toHaveBeenCalledWith({
      productId: 'p1',
      customerId: 'c1',
      deliveryId: null,
    });
  });

  it('returns 404 when the product does not exist', async () => {
    createTransaction.execute.mockResolvedValue(
      Result.err({ code: 'PRODUCT_NOT_FOUND', message: 'missing product' }),
    );

    const promise = controller.create({
      productId: 'p9',
      customerId: 'c1',
    });
    await expect(promise).rejects.toMatchObject({
      status: 404,
      response: { code: 'PRODUCT_NOT_FOUND' },
    });
  });

  it('fetches a transaction by id', async () => {
    getTransaction.execute.mockResolvedValue(Result.ok(transaction));

    await expect(controller.get('t1')).resolves.toEqual(transaction);
  });

  it('returns 404 when the transaction does not exist', async () => {
    getTransaction.execute.mockResolvedValue(
      Result.err({ code: 'TRANSACTION_NOT_FOUND', message: 'missing tx' }),
    );

    const promise = controller.get('t9');
    await expect(promise).rejects.toMatchObject({
      status: 404,
      response: { code: 'TRANSACTION_NOT_FOUND' },
    });
  });

  it('processes the payment of a transaction', async () => {
    processCheckout.execute.mockResolvedValue(
      Result.ok({ ...transaction, status: 'APPROVED' }),
    );

    const dto = {
      cardNumber: '4242424242424242',
      cardExpiryMonth: 12,
      cardExpiryYear: 2030,
      cardCvv: '123',
    };
    await expect(controller.process('t1', dto)).resolves.toMatchObject({
      status: 'APPROVED',
    });
    expect(processCheckout.execute).toHaveBeenCalledWith({
      transactionId: 't1',
      ...dto,
    });
  });

  it('returns 400 when the payment details are invalid', async () => {
    processCheckout.execute.mockResolvedValue(
      Result.err({ code: 'INVALID_INPUT', message: 'bad card' }),
    );

    const promise = controller.process('t1', {
      cardNumber: 'x',
      cardExpiryMonth: 13,
      cardExpiryYear: 2010,
      cardCvv: '1',
    });
    await expect(promise).rejects.toMatchObject({
      status: 400,
      response: { code: 'INVALID_INPUT' },
    });
  });

  it('returns 409 when the transaction was already processed', async () => {
    processCheckout.execute.mockResolvedValue(
      Result.err({
        code: 'TRANSACTION_ALREADY_PROCESSED',
        message: 'already approved',
      }),
    );

    const promise = controller.process('t1', {
      cardNumber: '4242424242424242',
      cardExpiryMonth: 12,
      cardExpiryYear: 2030,
      cardCvv: '123',
    });
    await expect(promise).rejects.toMatchObject({
      status: 409,
      response: { code: 'TRANSACTION_ALREADY_PROCESSED' },
    });
  });
});
