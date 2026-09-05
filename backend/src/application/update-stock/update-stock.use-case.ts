import { Result } from '../../shared/result.js';
import type { ProductRepository } from '../../domain/ports/product-repository.js';
import type { TransactionRepository } from '../../domain/ports/transaction-repository.js';
import type { UpdateStockCommand } from './update-stock.command.js';
import type { UpdateStockError } from './update-stock.errors.js';

const PURCHASE_QUANTITY = 1;

export class UpdateStockUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(
    command: UpdateStockCommand,
  ): Promise<Result<null, UpdateStockError>> {
    if (!isNonEmpty(command.transactionId)) {
      return Result.err<null, UpdateStockError>({
        code: 'INVALID_INPUT',
        message: 'transactionId is required',
      });
    }

    const transaction = await this.transactionRepository.findById(
      command.transactionId,
    );
    if (transaction === null) {
      return Result.err<null, UpdateStockError>({
        code: 'TRANSACTION_NOT_FOUND',
        message: `Transaction with id ${command.transactionId} was not found`,
      });
    }

    if (transaction.status !== 'APPROVED') {
      return Result.err<null, UpdateStockError>({
        code: 'TRANSACTION_NOT_APPROVED',
        message: `Transaction ${transaction.id} is not approved`,
      });
    }

    const decremented = await this.productRepository.decrementStock(
      transaction.productId,
      PURCHASE_QUANTITY,
    );
    if (!decremented) {
      return Result.err<null, UpdateStockError>({
        code: 'INSUFFICIENT_STOCK',
        message: `Not enough stock for product ${transaction.productId}`,
      });
    }

    return Result.ok<null, UpdateStockError>(null);
  }
}

function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}
