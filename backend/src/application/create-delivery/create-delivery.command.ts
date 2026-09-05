export interface CreateDeliveryCommand {
  readonly customerId: string;
  readonly address: string;
  readonly city: string;
}
