import type { Delivery } from '../entities/delivery.js';

export interface DeliveryRepository {
  save(delivery: Delivery): Promise<Delivery>;
  findById(id: string): Promise<Delivery | null>;
}
