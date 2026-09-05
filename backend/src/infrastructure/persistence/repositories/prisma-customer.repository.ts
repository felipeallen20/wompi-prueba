import { Customer } from '../../../domain/entities/customer.js';
import type { CustomerRepository } from '../../../domain/ports/customer-repository.js';
import type { Customer as PrismaCustomerModel } from '../../../generated/prisma/client.js';
import type { PrismaService } from '../prisma/prisma.service.js';

export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(customer: Customer): Promise<Customer> {
    const row = await this.prisma.customer.upsert({
      where: { id: customer.id },
      create: {
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
      update: {
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
    return this.toDomain(row);
  }

  async findById(id: string): Promise<Customer | null> {
    const row = await this.prisma.customer.findUnique({ where: { id } });
    return row === null ? null : this.toDomain(row);
  }

  private toDomain(row: PrismaCustomerModel): Customer {
    return new Customer(row.id, row.fullName, row.email, row.phone);
  }
}
