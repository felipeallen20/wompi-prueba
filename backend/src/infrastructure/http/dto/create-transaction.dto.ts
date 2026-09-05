export interface CreateTransactionDto {
  readonly productId: string;
  readonly customerId: string;
  readonly deliveryId?: string;
}
