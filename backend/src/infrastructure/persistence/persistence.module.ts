import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';
import { PrismaCustomerRepository } from './repositories/prisma-customer.repository.js';
import { PrismaDeliveryRepository } from './repositories/prisma-delivery.repository.js';
import { PrismaProductRepository } from './repositories/prisma-product.repository.js';
import { PrismaTransactionRepository } from './repositories/prisma-transaction.repository.js';
import {
  CUSTOMER_REPOSITORY,
  DELIVERY_REPOSITORY,
  PRODUCT_REPOSITORY,
  TRANSACTION_REPOSITORY,
} from './persistence.tokens.js';

@Module({
  providers: [
    PrismaService,
    { provide: PRODUCT_REPOSITORY, useClass: PrismaProductRepository },
    { provide: TRANSACTION_REPOSITORY, useClass: PrismaTransactionRepository },
    { provide: CUSTOMER_REPOSITORY, useClass: PrismaCustomerRepository },
    { provide: DELIVERY_REPOSITORY, useClass: PrismaDeliveryRepository },
  ],
  exports: [
    PrismaService,
    PRODUCT_REPOSITORY,
    TRANSACTION_REPOSITORY,
    CUSTOMER_REPOSITORY,
    DELIVERY_REPOSITORY,
  ],
})
export class PersistenceModule {}
