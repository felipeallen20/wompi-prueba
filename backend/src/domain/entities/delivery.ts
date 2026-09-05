export type DeliveryStatus = 'PENDING' | 'SHIPPED' | 'DELIVERED';

export class Delivery {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly address: string,
    public readonly city: string,
    public readonly status: DeliveryStatus,
  ) {}
}
