import { Test } from '@nestjs/testing';
import { PersistenceModule } from './persistence.module.js';
import {
  CUSTOMER_REPOSITORY,
  DELIVERY_REPOSITORY,
  PRODUCT_REPOSITORY,
  TRANSACTION_REPOSITORY,
} from './persistence.tokens.js';
import { PrismaService } from './prisma/prisma.service.js';

describe('PersistenceModule', () => {
  it('compiles and binds the repository tokens and the prisma service', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PersistenceModule],
    }).compile();
    const app = moduleRef.createNestApplication();

    expect(app.get(PrismaService)).toBeDefined();
    expect(app.get(PRODUCT_REPOSITORY)).toBeDefined();
    expect(app.get(TRANSACTION_REPOSITORY)).toBeDefined();
    expect(app.get(CUSTOMER_REPOSITORY)).toBeDefined();
    expect(app.get(DELIVERY_REPOSITORY)).toBeDefined();

    await app.close();
  });
});
