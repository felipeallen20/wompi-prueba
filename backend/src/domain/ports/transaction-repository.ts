import type { Transaction } from '../entities/transaction.js';

export interface TransactionRepository {
  save(transaction: Transaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
}
