import { randomUUID } from 'node:crypto';
import { Result } from '../../shared/result.js';
import { Transaction } from '../../domain/entities/transaction.js';
import type { ProductRepository } from '../../domain/ports/product-repository.js';
import type { TransactionRepository } from '../../domain/ports/transaction-repository.js';
import type { CreateTransactionCommand } from './create-transaction.command.js';
import type { CreateTransactionError } from './create-transaction.errors.js';

const BASE_FEE_MINOR_UNITS = 2000;
const DELIVERY_FEE_MINOR_UNITS = 8000;

export class CreateTransactionUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(
    command: CreateTransactionCommand,
  ): Promise<Result<Transaction, CreateTransactionError>> {
    if (!hasValidInput(command)) {
      return Result.err<Transaction, CreateTransactionError>({
        code: 'INVALID_INPUT',
        message: 'productId and customerId are required',
      });
    }

    const product = await this.productRepository.findById(command.productId);
    if (product === null) {
      return Result.err<Transaction, CreateTransactionError>({
        code: 'PRODUCT_NOT_FOUND',
        message: `Product with id ${command.productId} was not found`,
      });
    }

    const now = new Date();
    const transaction = new Transaction(
      randomUUID(),
      product.id,
      command.customerId,
      command.deliveryId ?? null,
      'PENDING',
      product.price,
      BASE_FEE_MINOR_UNITS,
      DELIVERY_FEE_MINOR_UNITS,
      null,
      now,
      now,
    );

    const saved = await this.transactionRepository.save(transaction);
    return Result.ok<Transaction, CreateTransactionError>(saved);
  }
}

function hasValidInput(command: CreateTransactionCommand): boolean {
  return (
    isNonEmptyString(command?.productId) &&
    isNonEmptyString(command?.customerId)
  );
}

function isNonEmptyString(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}
