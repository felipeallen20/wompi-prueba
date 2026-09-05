import { jest } from '@jest/globals';
import { Customer } from '../../../domain/entities/customer.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { PrismaCustomerRepository } from './prisma-customer.repository.js';

const customerRow = {
  id: 'customer-1',
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '+573001234567',
};

describe('PrismaCustomerRepository', () => {
  let prisma: {
    customer: {
      upsert: ReturnType<typeof jest.fn>;
      findUnique: ReturnType<typeof jest.fn>;
    };
  };

  let repository: PrismaCustomerRepository;

  beforeEach(() => {
    prisma = {
      customer: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    repository = new PrismaCustomerRepository(
      prisma as unknown as PrismaService,
    );
  });

  it('creates or updates a customer and maps it back to the domain', async () => {
    const customer = new Customer(
      'customer-1',
      'Ada Lovelace',
      'ada@example.com',
      '+573001234567',
    );
    prisma.customer.upsert.mockResolvedValue(customerRow);

    const saved = await repository.save(customer);

    expect(saved).toEqual(customer);
    expect(prisma.customer.upsert).toHaveBeenCalledWith({
      where: { id: 'customer-1' },
      create: {
        id: 'customer-1',
        fullName: 'Ada Lovelace',
        email: 'ada@example.com',
        phone: '+573001234567',
      },
      update: {
        fullName: 'Ada Lovelace',
        email: 'ada@example.com',
        phone: '+573001234567',
      },
    });
  });

  it('finds an existing customer by id', async () => {
    prisma.customer.findUnique.mockResolvedValue(customerRow);

    const customer = await repository.findById('customer-1');

    expect(customer).toEqual(
      new Customer(
        'customer-1',
        'Ada Lovelace',
        'ada@example.com',
        '+573001234567',
      ),
    );
  });

  it('returns null when the customer does not exist', async () => {
    prisma.customer.findUnique.mockResolvedValue(null);

    const customer = await repository.findById('customer-x');

    expect(customer).toBeNull();
  });
});
