import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { HttpModule } from '../src/infrastructure/http/http.module.js';
import {
  CUSTOMER_REPOSITORY,
  DELIVERY_REPOSITORY,
  PRODUCT_REPOSITORY,
  TRANSACTION_REPOSITORY,
} from '../src/infrastructure/persistence/persistence.tokens.js';
import { PAYMENT_GATEWAY } from '../src/infrastructure/payment-gateway/payment-gateway.tokens.js';

describe('HttpModule (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
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

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  afterAll(async () => {
    await app.close();
  });
});
