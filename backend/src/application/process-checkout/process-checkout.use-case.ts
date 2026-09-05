import { Result } from '../../shared/result.js';
import type { Transaction } from '../../domain/entities/transaction.js';
import type { ProcessPaymentUseCase } from '../process-payment/process-payment.use-case.js';
import type { AssignDeliveryUseCase } from '../assign-delivery/assign-delivery.use-case.js';
import type { UpdateStockUseCase } from '../update-stock/update-stock.use-case.js';
import type { ProcessCheckoutCommand } from './process-checkout.command.js';
import type { ProcessCheckoutError } from './process-checkout.errors.js';

/**
 * Orchestrates the full checkout flow for an approved payment:
 * charge the card, verify the delivery and decrement the stock.
 * Declined payments short-circuit before any stock or delivery side effect.
 */
export class ProcessCheckoutUseCase {
  constructor(
    private readonly processPayment: ProcessPaymentUseCase,
    private readonly assignDelivery: AssignDeliveryUseCase,
    private readonly updateStock: UpdateStockUseCase,
  ) {}

  async execute(
    command: ProcessCheckoutCommand,
  ): Promise<Result<Transaction, ProcessCheckoutError>> {
    const payment = await this.processPayment.execute(command);
    if (payment.isErr()) {
      return Result.err<Transaction, ProcessCheckoutError>(
        payment.getError() as ProcessCheckoutError,
      );
    }

    const transaction = payment.unwrapOr(null) as Transaction;

    if (transaction.status !== 'APPROVED') {
      return Result.ok<Transaction, ProcessCheckoutError>(transaction);
    }

    const delivery = await this.assignDelivery.execute({
      transactionId: transaction.id,
    });
    if (delivery.isErr()) {
      return Result.err<Transaction, ProcessCheckoutError>(
        delivery.getError() as ProcessCheckoutError,
      );
    }

    const stock = await this.updateStock.execute({
      transactionId: transaction.id,
    });
    if (stock.isErr()) {
      return Result.err<Transaction, ProcessCheckoutError>(
        stock.getError() as ProcessCheckoutError,
      );
    }

    return Result.ok<Transaction, ProcessCheckoutError>(transaction);
  }
}
