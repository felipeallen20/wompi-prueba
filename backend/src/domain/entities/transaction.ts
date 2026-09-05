import { TransactionStatus } from '../value-objects/transaction-status.js';

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly customerId: string,
    public readonly deliveryId: string | null,
    public readonly status: TransactionStatus,
    public readonly amount: number,
    public readonly baseFee: number,
    public readonly deliveryFee: number,
    public readonly gatewayReference: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
