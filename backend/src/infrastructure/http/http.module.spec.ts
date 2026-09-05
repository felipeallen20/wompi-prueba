import { Test } from '@nestjs/testing';
import { HttpModule } from './http.module.js';
import {
  CUSTOMER_REPOSITORY,
  DELIVERY_REPOSITORY,
  PRODUCT_REPOSITORY,
  TRANSACTION_REPOSITORY,
} from '../persistence/persistence.tokens.js';
import { PAYMENT_GATEWAY } from '../payment-gateway/payment-gateway.tokens.js';
import { HealthController } from './health.controller.js';
import { ProductsController } from './products.controller.js';
import { CustomersController } from './customers.controller.js';
import { TransactionsController } from './transactions.controller.js';
import { DeliveriesController } from './deliveries.controller.js';

describe('HttpModule', () => {
  it('compiles and exposes the REST controllers', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule],
    })
      .overrideProvider(PRODUCT_REPOSITORY)
      .useValue({})
      .overrideProvider(TRANSACTION_REPOSITORY)
      .useValue({})
      .overrideProvider(CUSTOMER_REPOSITORY)
      .useValue({})
      .overrideProvider(DELIVERY_REPOSITORY)
      .useValue({})
      .overrideProvider(PAYMENT_GATEWAY)
      .useValue({})
      .compile();

    expect(moduleRef.get(HealthController)).toBeDefined();
    expect(moduleRef.get(ProductsController)).toBeDefined();
    expect(moduleRef.get(CustomersController)).toBeDefined();
    expect(moduleRef.get(TransactionsController)).toBeDefined();
    expect(moduleRef.get(DeliveriesController)).toBeDefined();
  });
});
