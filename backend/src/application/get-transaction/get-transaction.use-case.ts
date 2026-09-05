import { Result } from '../../shared/result.js';
import type { Transaction } from '../../domain/entities/transaction.js';
import type { TransactionRepository } from '../../domain/ports/transaction-repository.js';
import type { GetTransactionError } from './get-transaction.errors.js';

export class GetTransactionUseCase {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(id: string): Promise<Result<Transaction, GetTransactionError>> {
    if (!isNonEmptyString(id)) {
      return Result.err<Transaction, GetTransactionError>({
        code: 'INVALID_INPUT',
        message: 'a transaction id is required',
      });
    }

    const transaction = await this.transactionRepository.findById(id);
    if (transaction === null) {
      return Result.err<Transaction, GetTransactionError>({
        code: 'TRANSACTION_NOT_FOUND',
        message: `Transaction with id ${id} was not found`,
      });
    }

    return Result.ok<Transaction, GetTransactionError>(transaction);
  }
}

function isNonEmptyString(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}
