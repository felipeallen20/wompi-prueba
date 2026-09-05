import { jest } from '@jest/globals';
import { Transaction } from '../../domain/entities/transaction.js';
import { Result } from '../../shared/result.js';
import type { ProcessPaymentUseCase } from '../process-payment/process-payment.use-case.js';
import type { AssignDeliveryUseCase } from '../assign-delivery/assign-delivery.use-case.js';
import type { UpdateStockUseCase } from '../update-stock/update-stock.use-case.js';
import { ProcessCheckoutUseCase } from './process-checkout.use-case.js';

function buildTransaction(status: 'APPROVED' | 'DECLINED'): Transaction {
  return new Transaction(
    't1',
    'p1',
    'c1',
    'd1',
    status,
    50000,
    2000,
    8000,
    null,
    new Date('2026-01-01T00:00:00Z'),
    new Date('2026-01-01T00:00:00Z'),
  );
}

const COMMAND = {
  transactionId: 't1',
  cardNumber: '4242424242424242',
  cardExpiryMonth: 12,
  cardExpiryYear: 2030,
  cardCvv: '123',
};

describe('ProcessCheckoutUseCase', () => {
  const processPayment = {
    execute: jest.fn(),
  } as unknown as ProcessPaymentUseCase;
  const assignDelivery = {
    execute: jest.fn(),
  } as unknown as AssignDeliveryUseCase;
  const updateStock = {
    execute: jest.fn(),
  } as unknown as UpdateStockUseCase;

  const useCase = new ProcessCheckoutUseCase(
    processPayment,
    assignDelivery,
    updateStock,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('charges the card, verifies the delivery and updates the stock for an approved payment', async () => {
    processPayment.execute.mockResolvedValue(
      Result.ok<Transaction, never>(buildTransaction('APPROVED')),
    );
    assignDelivery.execute.mockResolvedValue(
      Result.ok<unknown, never>({ id: 'd1' }),
    );
    updateStock.execute.mockResolvedValue(Result.ok<null, never>(null));

    const result = await useCase.execute(COMMAND);

    expect(result.isOk()).toBe(true);
    expect(result.unwrapOr(null)?.status).toBe('APPROVED');
    expect(assignDelivery.execute).toHaveBeenCalledWith({
      transactionId: 't1',
    });
    expect(updateStock.execute).toHaveBeenCalledWith({ transactionId: 't1' });
  });

  it('short-circuits before stock and delivery for a declined payment', async () => {
    processPayment.execute.mockResolvedValue(
      Result.ok<Transaction, never>(buildTransaction('DECLINED')),
    );

    const result = await useCase.execute(COMMAND);

    expect(result.isOk()).toBe(true);
    expect(result.unwrapOr(null)?.status).toBe('DECLINED');
    expect(assignDelivery.execute).not.toHaveBeenCalled();
    expect(updateStock.execute).not.toHaveBeenCalled();
  });

  it('propagates a payment error without touching stock or delivery', async () => {
    processPayment.execute.mockResolvedValue(
      Result.err<
        Transaction,
        { code: 'PAYMENT_GATEWAY_ERROR'; message: string }
      >({
        code: 'PAYMENT_GATEWAY_ERROR',
        message: 'gateway down',
      }),
    );

    const result = await useCase.execute(COMMAND);

    expect(result.isErr()).toBe(true);
    expect(result.getError()?.code).toBe('PAYMENT_GATEWAY_ERROR');
    expect(assignDelivery.execute).not.toHaveBeenCalled();
    expect(updateStock.execute).not.toHaveBeenCalled();
  });

  it('propagates a delivery error when the approved payment cannot be assigned', async () => {
    processPayment.execute.mockResolvedValue(
      Result.ok<Transaction, never>(buildTransaction('APPROVED')),
    );
    assignDelivery.execute.mockResolvedValue(
      Result.err<
        unknown,
        { code: 'DELIVERY_CUSTOMER_MISMATCH'; message: string }
      >({
        code: 'DELIVERY_CUSTOMER_MISMATCH',
        message: 'delivery does not belong to the customer',
      }),
    );

    const result = await useCase.execute(COMMAND);

    expect(result.isErr()).toBe(true);
    expect(result.getError()?.code).toBe('DELIVERY_CUSTOMER_MISMATCH');
    expect(updateStock.execute).not.toHaveBeenCalled();
  });

  it('propagates a stock error when the approved payment cannot decrement stock', async () => {
    processPayment.execute.mockResolvedValue(
      Result.ok<Transaction, never>(buildTransaction('APPROVED')),
    );
    assignDelivery.execute.mockResolvedValue(
      Result.ok<unknown, never>({ id: 'd1' }),
    );
    updateStock.execute.mockResolvedValue(
      Result.err<null, { code: 'INSUFFICIENT_STOCK'; message: string }>({
        code: 'INSUFFICIENT_STOCK',
        message: 'not enough stock',
      }),
    );

    const result = await useCase.execute(COMMAND);

    expect(result.isErr()).toBe(true);
    expect(result.getError()?.code).toBe('INSUFFICIENT_STOCK');
  });
});
