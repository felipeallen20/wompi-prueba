import { jest } from '@jest/globals';
import { Delivery } from '../../../domain/entities/delivery.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { PrismaDeliveryRepository } from './prisma-delivery.repository.js';

const deliveryRow = {
  id: 'delivery-1',
  customerId: 'customer-1',
  address: '123 Main St',
  city: 'Bogota',
  status: 'PENDING',
};

describe('PrismaDeliveryRepository', () => {
  let prisma: {
    delivery: {
      upsert: ReturnType<typeof jest.fn>;
      findUnique: ReturnType<typeof jest.fn>;
    };
  };

  let repository: PrismaDeliveryRepository;

  beforeEach(() => {
    prisma = {
      delivery: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    repository = new PrismaDeliveryRepository(
      prisma as unknown as PrismaService,
    );
  });

  it('creates or updates a delivery and maps it back to the domain', async () => {
    const delivery = new Delivery(
      'delivery-1',
      'customer-1',
      '123 Main St',
      'Bogota',
      'PENDING',
    );
    prisma.delivery.upsert.mockResolvedValue(deliveryRow);

    const saved = await repository.save(delivery);

    expect(saved).toEqual(delivery);
    expect(prisma.delivery.upsert).toHaveBeenCalledWith({
      where: { id: 'delivery-1' },
      create: {
        id: 'delivery-1',
        customerId: 'customer-1',
        address: '123 Main St',
        city: 'Bogota',
        status: 'PENDING',
      },
      update: {
        customerId: 'customer-1',
        address: '123 Main St',
        city: 'Bogota',
        status: 'PENDING',
      },
    });
  });

  it('finds an existing delivery by id', async () => {
    prisma.delivery.findUnique.mockResolvedValue(deliveryRow);

    const delivery = await repository.findById('delivery-1');

    expect(delivery).toEqual(
      new Delivery(
        'delivery-1',
        'customer-1',
        '123 Main St',
        'Bogota',
        'PENDING',
      ),
    );
  });

  it('returns null when the delivery does not exist', async () => {
    prisma.delivery.findUnique.mockResolvedValue(null);

    const delivery = await repository.findById('delivery-x');

    expect(delivery).toBeNull();
  });
});
