import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { HttpModule } from '../src/infrastructure/http/http.module.js';
import { setupSwagger } from '../src/infrastructure/documentation/swagger.js';
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
      .useValue({ save: async (customer: unknown) => customer })
      .overrideProvider(DELIVERY_REPOSITORY)
      .useValue({})
      .overrideProvider(PAYMENT_GATEWAY)
      .useValue({})
      .compile();

    app = moduleFixture.createNestApplication();
    setupSwagger(app);
    await app.init();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('/health carries security headers', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect('x-content-type-options', 'nosniff')
      .expect('x-frame-options', 'SAMEORIGIN')
      .expect('referrer-policy', 'no-referrer')
      .expect('content-security-policy', /default-src/);
  });

  it('/unknown (GET) returns a consistent 404 body', () => {
    return request(app.getHttpServer())
      .get('/does-not-exist')
      .expect(404)
      .expect(({ body }) => {
        expect(body).toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });
      });
  });

  it('/customers (POST) creates a customer', () => {
    return request(app.getHttpServer())
      .post('/customers')
      .send({
        fullName: 'Ada Lovelace',
        email: 'ada@example.com',
        phone: '+57 300 000 0000',
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body.fullName).toBe('Ada Lovelace');
        expect(body.id).toBeDefined();
      });
  });

  it('/customers (POST) rejects invalid input with a consistent body', () => {
    return request(app.getHttpServer())
      .post('/customers')
      .send({ fullName: '', email: 'not-an-email', phone: '' })
      .expect(400)
      .expect(({ body }) => {
        expect(body).toMatchObject({ statusCode: 400, code: 'INVALID_INPUT' });
        expect(body.message).toContain('email');
      });
  });

  it('/api-docs (GET) serves the Swagger UI', () => {
    return request(app.getHttpServer())
      .get('/api-docs')
      .expect(200)
      .expect('content-type', /text\/html/);
  });

  it('/api-docs-json (GET) exposes the OpenAPI document', () => {
    return request(app.getHttpServer())
      .get('/api-docs-json')
      .expect(200)
      .expect(({ body }) => {
        expect(body.openapi).toMatch(/^3\./);
        expect(body.info.title).toBe('Checkout API');
        expect(body.paths['/products']).toBeDefined();
        expect(
          body.paths['/transactions/{id}/process'].post.responses,
        ).toBeDefined();
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
