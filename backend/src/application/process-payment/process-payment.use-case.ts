import { Result } from '../../shared/result.js';
import type { Transaction } from '../../domain/entities/transaction.js';
import type { CustomerRepository } from '../../domain/ports/customer-repository.js';
import type { PaymentGateway } from '../../domain/ports/payment-gateway.js';
import type { TransactionRepository } from '../../domain/ports/transaction-repository.js';
import type { ProcessPaymentCommand } from './process-payment.command.js';
import type { ProcessPaymentError } from './process-payment.errors.js';

const CARD_EXPIRY_MAX_HORIZON_YEARS = 15;
const CARD_NUMBER_PATTERN = /^\d{13,19}$/;
const CVV_PATTERN = /^\d{3,4}$/;

export class ProcessPaymentUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(
    command: ProcessPaymentCommand,
  ): Promise<Result<Transaction, ProcessPaymentError>> {
    if (!hasValidInput(command)) {
      return Result.err<Transaction, ProcessPaymentError>({
        code: 'INVALID_INPUT',
        message: 'Invalid payment details',
      });
    }

    const transaction = await this.transactionRepository.findById(
      command.transactionId,
    );
    if (transaction === null) {
      return Result.err<Transaction, ProcessPaymentError>({
        code: 'TRANSACTION_NOT_FOUND',
        message: `Transaction with id ${command.transactionId} was not found`,
      });
    }

    if (transaction.status === 'APPROVED') {
      return Result.err<Transaction, ProcessPaymentError>({
        code: 'TRANSACTION_ALREADY_PROCESSED',
        message: `Transaction ${transaction.id} is already approved`,
      });
    }

    const customer = await this.customerRepository.findById(
      transaction.customerId,
    );
    if (customer === null) {
      return Result.err<Transaction, ProcessPaymentError>({
        code: 'CUSTOMER_NOT_FOUND',
        message: `Customer with id ${transaction.customerId} was not found`,
      });
    }

    const gatewayResult = await this.paymentGateway.processPayment({
      transactionReference: transaction.id,
      amount:
        transaction.amount + transaction.baseFee + transaction.deliveryFee,
      currency: 'COP',
      customerFullName: customer.fullName,
      customerEmail: customer.email,
      cardNumber: command.cardNumber,
      cardExpiryMonth: command.cardExpiryMonth,
      cardExpiryYear: command.cardExpiryYear,
      cardCvv: command.cardCvv,
    });

    if (gatewayResult.status === 'ERROR') {
      return Result.err<Transaction, ProcessPaymentError>({
        code: 'PAYMENT_GATEWAY_ERROR',
        message:
          gatewayResult.errorMessage ?? 'Payment gateway returned an error',
      });
    }

    const updated = transaction.updatePaymentResult(
      gatewayResult.status,
      gatewayResult.gatewayReference,
      new Date(),
    );

    const saved = await this.transactionRepository.save(updated);
    return Result.ok<Transaction, ProcessPaymentError>(saved);
  }
}

function hasValidInput(command: ProcessPaymentCommand): boolean {
  const cardNumber = command.cardNumber.replace(/\s+/g, '');
  const currentYear = new Date().getFullYear();
  return (
    isNonEmpty(command.transactionId) &&
    CARD_NUMBER_PATTERN.test(cardNumber) &&
    Number.isInteger(command.cardExpiryMonth) &&
    command.cardExpiryMonth >= 1 &&
    command.cardExpiryMonth <= 12 &&
    Number.isInteger(command.cardExpiryYear) &&
    command.cardExpiryYear >= currentYear &&
    command.cardExpiryYear <= currentYear + CARD_EXPIRY_MAX_HORIZON_YEARS &&
    CVV_PATTERN.test(command.cardCvv)
  );
}

function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}
