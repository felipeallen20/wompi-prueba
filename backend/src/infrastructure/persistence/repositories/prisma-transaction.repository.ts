import { Transaction } from '../../../domain/entities/transaction.js';
import type { TransactionRepository } from '../../../domain/ports/transaction-repository.js';
import type { Transaction as PrismaTransactionModel } from '../../../generated/prisma/client.js';
import type { PrismaService } from '../prisma/prisma.service.js';

export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(transaction: Transaction): Promise<Transaction> {
    const row = await this.prisma.transaction.upsert({
      where: { id: transaction.id },
      create: {
        id: transaction.id,
        productId: transaction.productId,
        customerId: transaction.customerId,
        deliveryId: transaction.deliveryId,
        status: transaction.status,
        amount: transaction.amount,
        baseFee: transaction.baseFee,
        deliveryFee: transaction.deliveryFee,
        gatewayReference: transaction.gatewayReference,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      },
      update: {
        status: transaction.status,
        gatewayReference: transaction.gatewayReference,
        updatedAt: transaction.updatedAt,
      },
    });
    return this.toDomain(row);
  }

  async findById(id: string): Promise<Transaction | null> {
    const row = await this.prisma.transaction.findUnique({ where: { id } });
    return row === null ? null : this.toDomain(row);
  }

  private toDomain(row: PrismaTransactionModel): Transaction {
    return new Transaction(
      row.id,
      row.productId,
      row.customerId,
      row.deliveryId,
      row.status,
      row.amount,
      row.baseFee,
      row.deliveryFee,
      row.gatewayReference,
      row.createdAt,
      row.updatedAt,
    );
  }
}
