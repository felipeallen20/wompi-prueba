import { jest } from '@jest/globals';
import { Transaction } from '../../../domain/entities/transaction.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { PrismaTransactionRepository } from './prisma-transaction.repository.js';

function buildTransaction(): Transaction {
  return new Transaction(
    'transaction-1',
    'product-1',
    'customer-1',
    'delivery-1',
    'APPROVED',
    45000,
    2000,
    8000,
    'gateway-ref-1',
    new Date('2026-09-05T10:00:00Z'),
    new Date('2026-09-05T10:05:00Z'),
  );
}

const transactionRow = {
  id: 'transaction-1',
  productId: 'product-1',
  customerId: 'customer-1',
  deliveryId: 'delivery-1',
  status: 'APPROVED',
  amount: 45000,
  baseFee: 2000,
  deliveryFee: 8000,
  gatewayReference: 'gateway-ref-1',
  createdAt: new Date('2026-09-05T10:00:00Z'),
  updatedAt: new Date('2026-09-05T10:05:00Z'),
};

describe('PrismaTransactionRepository', () => {
  let prisma: {
    transaction: {
      upsert: ReturnType<typeof jest.fn>;
      findUnique: ReturnType<typeof jest.fn>;
    };
  };

  let repository: PrismaTransactionRepository;

  beforeEach(() => {
    prisma = {
      transaction: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    repository = new PrismaTransactionRepository(
      prisma as unknown as PrismaService,
    );
  });

  it('creates or updates a transaction and maps it back to the domain', async () => {
    const transaction = buildTransaction();
    prisma.transaction.upsert.mockResolvedValue(transactionRow);

    const saved = await repository.save(transaction);

    expect(saved).toEqual(transaction);
    expect(prisma.transaction.upsert).toHaveBeenCalledWith({
      where: { id: 'transaction-1' },
      create: {
        id: 'transaction-1',
        productId: 'product-1',
        customerId: 'customer-1',
        deliveryId: 'delivery-1',
        status: 'APPROVED',
        amount: 45000,
        baseFee: 2000,
        deliveryFee: 8000,
        gatewayReference: 'gateway-ref-1',
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      },
      update: {
        status: 'APPROVED',
        gatewayReference: 'gateway-ref-1',
        updatedAt: transaction.updatedAt,
      },
    });
  });

  it('finds an existing transaction by id', async () => {
    prisma.transaction.findUnique.mockResolvedValue(transactionRow);

    const transaction = await repository.findById('transaction-1');

    expect(transaction?.id).toBe('transaction-1');
    expect(transaction?.status).toBe('APPROVED');
    expect(prisma.transaction.findUnique).toHaveBeenCalledWith({
      where: { id: 'transaction-1' },
    });
  });

  it('returns null when the transaction does not exist', async () => {
    prisma.transaction.findUnique.mockResolvedValue(null);

    const transaction = await repository.findById('transaction-x');

    expect(transaction).toBeNull();
  });
});
