import { Delivery } from '../../../domain/entities/delivery.js';
import type { DeliveryRepository } from '../../../domain/ports/delivery-repository.js';
import type { Delivery as PrismaDeliveryModel } from '../../../generated/prisma/client.js';
import type { PrismaService } from '../prisma/prisma.service.js';

export class PrismaDeliveryRepository implements DeliveryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(delivery: Delivery): Promise<Delivery> {
    const row = await this.prisma.delivery.upsert({
      where: { id: delivery.id },
      create: {
        id: delivery.id,
        customerId: delivery.customerId,
        address: delivery.address,
        city: delivery.city,
        status: delivery.status,
      },
      update: {
        customerId: delivery.customerId,
        address: delivery.address,
        city: delivery.city,
        status: delivery.status,
      },
    });
    return this.toDomain(row);
  }

  async findById(id: string): Promise<Delivery | null> {
    const row = await this.prisma.delivery.findUnique({ where: { id } });
    return row === null ? null : this.toDomain(row);
  }

  private toDomain(row: PrismaDeliveryModel): Delivery {
    return new Delivery(
      row.id,
      row.customerId,
      row.address,
      row.city,
      row.status,
    );
  }
}
