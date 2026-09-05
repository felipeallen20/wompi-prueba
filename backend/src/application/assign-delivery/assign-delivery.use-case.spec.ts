import { jest } from '@jest/globals';
import { Result } from '../../shared/result.js';
import { Delivery } from '../../domain/entities/delivery.js';
import { Transaction } from '../../domain/entities/transaction.js';
import type { DeliveryRepository } from '../../domain/ports/delivery-repository.js';
import type { TransactionRepository } from '../../domain/ports/transaction-repository.js';
import { AssignDeliveryUseCase } from './assign-delivery.use-case.js';
import type { AssignDeliveryError } from './assign-delivery.errors.js';

const delivery = new Delivery(
  'delivery-1',
  'customer-1',
  '123 Main St',
  'Bogota',
  'PENDING',
);

function buildTransaction(
  overrides: {
    status?: Transaction['status'];
    deliveryId?: string | null;
    customerId?: string;
  } = {},
): Transaction {
  const {
    status = 'APPROVED',
    deliveryId = 'delivery-1',
    customerId = 'customer-1',
  } = overrides;
  return new Transaction(
    'transaction-1',
    'product-1',
    customerId,
    deliveryId,
    status,
    45000,
    2000,
    8000,
    status === 'PENDING' ? null : 'gateway-ref-1',
    new Date('2026-09-05T10:00:00Z'),
    new Date('2026-09-05T10:00:00Z'),
  );
}

describe('AssignDeliveryUseCase', () => {
  let transactionRepository: jest.Mocked<TransactionRepository>;
  let deliveryRepository: jest.Mocked<DeliveryRepository>;
  let useCase: AssignDeliveryUseCase;

  beforeEach(() => {
    transactionRepository = {
      save: jest.fn(),
      findById: jest.fn(),
    } as jest.Mocked<TransactionRepository>;

    deliveryRepository = {
      save: jest.fn(),
      findById: jest.fn(),
    } as jest.Mocked<DeliveryRepository>;

    useCase = new AssignDeliveryUseCase(
      transactionRepository,
      deliveryRepository,
    );
  });

  it('returns the delivery when the transaction is approved and the delivery is owned by the same customer', async () => {
    transactionRepository.findById.mockResolvedValue(buildTransaction());
    deliveryRepository.findById.mockResolvedValue(delivery);

    const result = await useCase.execute({ transactionId: 'transaction-1' });

    expect(result.isOk()).toBe(true);
    expect(result.unwrapOr(null)).toEqual(delivery);
    expect(deliveryRepository.findById).toHaveBeenCalledWith('delivery-1');
  });

  it('short-circuits with INVALID_INPUT for a missing transaction id', async () => {
    const result = await useCase.execute({ transactionId: '   ' });

    expect(result).toEqual(
      Result.err<Delivery, AssignDeliveryError>({
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
      Result.err<Delivery, AssignDeliveryError>({
        code: 'TRANSACTION_NOT_FOUND',
        message: expect.any(String),
      }),
    );
    expect(deliveryRepository.findById).not.toHaveBeenCalled();
  });

  it('short-circuits with TRANSACTION_NOT_APPROVED for a non-approved transaction', async () => {
    transactionRepository.findById.mockResolvedValue(
      buildTransaction({ status: 'PENDING' }),
    );

    const result = await useCase.execute({ transactionId: 'transaction-1' });

    expect(result).toEqual(
      Result.err<Delivery, AssignDeliveryError>({
        code: 'TRANSACTION_NOT_APPROVED',
        message: expect.any(String),
      }),
    );
    expect(deliveryRepository.findById).not.toHaveBeenCalled();
  });

  it('short-circuits with DELIVERY_NOT_FOUND when the transaction has no delivery', async () => {
    transactionRepository.findById.mockResolvedValue(
      buildTransaction({ deliveryId: null }),
    );

    const result = await useCase.execute({ transactionId: 'transaction-1' });

    expect(result).toEqual(
      Result.err<Delivery, AssignDeliveryError>({
        code: 'DELIVERY_NOT_FOUND',
        message: expect.any(String),
      }),
    );
    expect(deliveryRepository.findById).not.toHaveBeenCalled();
  });

  it('short-circuits with DELIVERY_NOT_FOUND when the delivery does not exist', async () => {
    transactionRepository.findById.mockResolvedValue(buildTransaction());
    deliveryRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute({ transactionId: 'transaction-1' });

    expect(result).toEqual(
      Result.err<Delivery, AssignDeliveryError>({
        code: 'DELIVERY_NOT_FOUND',
        message: expect.any(String),
      }),
    );
  });

  it('short-circuits with DELIVERY_CUSTOMER_MISMATCH when the delivery belongs to a different customer', async () => {
    transactionRepository.findById.mockResolvedValue(
      buildTransaction({ customerId: 'customer-1' }),
    );
    deliveryRepository.findById.mockResolvedValue(
      new Delivery(
        'delivery-1',
        'customer-999',
        '456 Other St',
        'Medellin',
        'PENDING',
      ),
    );

    const result = await useCase.execute({ transactionId: 'transaction-1' });

    expect(result).toEqual(
      Result.err<Delivery, AssignDeliveryError>({
        code: 'DELIVERY_CUSTOMER_MISMATCH',
        message: expect.any(String),
      }),
    );
  });
});
