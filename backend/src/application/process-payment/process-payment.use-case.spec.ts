import { jest } from '@jest/globals';
import { Result } from '../../shared/result.js';
import { Customer } from '../../domain/entities/customer.js';
import { Transaction } from '../../domain/entities/transaction.js';
import type { CustomerRepository } from '../../domain/ports/customer-repository.js';
import type { PaymentGateway } from '../../domain/ports/payment-gateway.js';
import type { TransactionRepository } from '../../domain/ports/transaction-repository.js';
import { ProcessPaymentUseCase } from './process-payment.use-case.js';
import type { ProcessPaymentCommand } from './process-payment.command.js';
import type { ProcessPaymentError } from './process-payment.errors.js';
import type { ProcessPaymentRequest } from '../../domain/ports/payment-gateway.js';

function buildTransaction(
  id = 'transaction-1',
  status: Transaction['status'] = 'PENDING',
  customerId = 'customer-1',
): Transaction {
  return new Transaction(
    id,
    'product-1',
    customerId,
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

function buildCommand(overrides: Partial<ProcessPaymentCommand> = {}) {
  return {
    transactionId: 'transaction-1',
    cardNumber: '4242424242424242',
    cardExpiryMonth: 12,
    cardExpiryYear: 2030,
    cardCvv: '123',
    ...overrides,
  };
}

describe('ProcessPaymentUseCase', () => {
  const customer = new Customer(
    'customer-1',
    'Ada Lovelace',
    'ada@example.com',
    '+573001234567',
  );

  let transactionRepository: jest.Mocked<TransactionRepository>;
  let customerRepository: jest.Mocked<CustomerRepository>;
  let paymentGateway: jest.Mocked<PaymentGateway>;
  let useCase: ProcessPaymentUseCase;

  beforeEach(() => {
    transactionRepository = {
      save: jest.fn(),
      findById: jest.fn(),
    } as jest.Mocked<TransactionRepository>;

    customerRepository = {
      save: jest.fn(),
      findById: jest.fn(),
    } as jest.Mocked<CustomerRepository>;

    paymentGateway = {
      processPayment: jest.fn(),
    } as jest.Mocked<PaymentGateway>;

    useCase = new ProcessPaymentUseCase(
      transactionRepository,
      customerRepository,
      paymentGateway,
    );
  });

  it('approves the transaction and hands the gateway the total', async () => {
    const pending = buildTransaction();
    transactionRepository.findById.mockResolvedValue(pending);
    customerRepository.findById.mockResolvedValue(customer);
    paymentGateway.processPayment.mockResolvedValue({
      status: 'APPROVED',
      gatewayReference: 'gateway-ref-1',
      errorMessage: null,
    });
    transactionRepository.save.mockImplementation(
      async (transaction) => transaction,
    );

    const result = await useCase.execute(buildCommand());

    expect(result.isOk()).toBe(true);
    const transaction = result.unwrapOr(null);
    expect(transaction?.status).toBe('APPROVED');
    expect(transaction?.gatewayReference).toBe('gateway-ref-1');
    expect(transaction?.updatedAt).toBeInstanceOf(Date);
    expect(transactionRepository.save).toHaveBeenCalledTimes(1);

    const request = paymentGateway.processPayment.mock
      .calls[0][0] as ProcessPaymentRequest;
    expect(request.transactionReference).toBe('transaction-1');
    expect(request.amount).toBe(55000);
    expect(request.currency).toBe('COP');
    expect(request.customerFullName).toBe('Ada Lovelace');
    expect(request.customerEmail).toBe('ada@example.com');
    expect(request.cardNumber).toBe('4242424242424242');
    expect(request.cardExpiryMonth).toBe(12);
    expect(request.cardExpiryYear).toBe(2030);
    expect(request.cardCvv).toBe('123');
  });

  it('marks the transaction as DECLINED without failing the use case', async () => {
    const pending = buildTransaction();
    transactionRepository.findById.mockResolvedValue(pending);
    customerRepository.findById.mockResolvedValue(customer);
    paymentGateway.processPayment.mockResolvedValue({
      status: 'DECLINED',
      gatewayReference: 'gateway-ref-1',
      errorMessage: 'Card declined',
    });
    transactionRepository.save.mockImplementation(
      async (transaction) => transaction,
    );

    const result = await useCase.execute(buildCommand());

    expect(result.isOk()).toBe(true);
    expect(result.unwrapOr(null)?.status).toBe('DECLINED');
    expect(result.unwrapOr(null)?.gatewayReference).toBe('gateway-ref-1');
  });

  it('short-circuits with PAYMENT_GATEWAY_ERROR when the gateway errors out', async () => {
    transactionRepository.findById.mockResolvedValue(buildTransaction());
    customerRepository.findById.mockResolvedValue(customer);
    paymentGateway.processPayment.mockResolvedValue({
      status: 'ERROR',
      gatewayReference: null,
      errorMessage: 'Gateway timeout',
    });

    const result = await useCase.execute(buildCommand());

    expect(result).toEqual(
      Result.err<Transaction, ProcessPaymentError>({
        code: 'PAYMENT_GATEWAY_ERROR',
        message: 'Gateway timeout',
      }),
    );
    expect(transactionRepository.save).not.toHaveBeenCalled();
  });

  it('short-circuits with TRANSACTION_NOT_FOUND when the transaction is missing', async () => {
    transactionRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(buildCommand());

    expect(result).toEqual(
      Result.err<Transaction, ProcessPaymentError>({
        code: 'TRANSACTION_NOT_FOUND',
        message: expect.any(String),
      }),
    );
    expect(customerRepository.findById).not.toHaveBeenCalled();
    expect(paymentGateway.processPayment).not.toHaveBeenCalled();
  });

  it('short-circuits with TRANSACTION_ALREADY_PROCESSED for an approved transaction', async () => {
    transactionRepository.findById.mockResolvedValue(
      buildTransaction('transaction-1', 'APPROVED'),
    );

    const result = await useCase.execute(buildCommand());

    expect(result).toEqual(
      Result.err<Transaction, ProcessPaymentError>({
        code: 'TRANSACTION_ALREADY_PROCESSED',
        message: expect.any(String),
      }),
    );
    expect(customerRepository.findById).not.toHaveBeenCalled();
    expect(paymentGateway.processPayment).not.toHaveBeenCalled();
    expect(transactionRepository.save).not.toHaveBeenCalled();
  });

  it('short-circuits with CUSTOMER_NOT_FOUND when the customer is missing', async () => {
    transactionRepository.findById.mockResolvedValue(buildTransaction());
    customerRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(buildCommand());

    expect(result).toEqual(
      Result.err<Transaction, ProcessPaymentError>({
        code: 'CUSTOMER_NOT_FOUND',
        message: expect.any(String),
      }),
    );
    expect(paymentGateway.processPayment).not.toHaveBeenCalled();
  });

  it('short-circuits with INVALID_INPUT for invalid card details', async () => {
    const result = await useCase.execute(buildCommand({ cardCvv: '12' }));

    expect(result).toEqual(
      Result.err<Transaction, ProcessPaymentError>({
        code: 'INVALID_INPUT',
        message: expect.any(String),
      }),
    );
    expect(transactionRepository.findById).not.toHaveBeenCalled();
    expect(paymentGateway.processPayment).not.toHaveBeenCalled();
  });
});
