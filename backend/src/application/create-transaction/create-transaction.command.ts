export interface CreateTransactionCommand {
  readonly productId: string;
  readonly customerId: string;
  readonly deliveryId: string | null;
}
