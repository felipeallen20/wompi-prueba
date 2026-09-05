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

  updatePaymentResult(
    status: Extract<TransactionStatus, 'APPROVED' | 'DECLINED'>,
    gatewayReference: string | null,
    updatedAt: Date,
  ): Transaction {
    return new Transaction(
      this.id,
      this.productId,
      this.customerId,
      this.deliveryId,
      status,
      this.amount,
      this.baseFee,
      this.deliveryFee,
      gatewayReference,
      this.createdAt,
      updatedAt,
    );
  }
}
