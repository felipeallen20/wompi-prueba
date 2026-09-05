import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { setupSwagger, SWAGGER_TITLE } from './swagger.js';
import { HealthController } from '../http/health.controller.js';

describe('setupSwagger', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    app = moduleRef.createNestApplication();
    setupSwagger(app);
    await app.init();
  });

  it('serves the OpenAPI document at /api-docs-json', async () => {
    const response = await request(app.getHttpServer())
      .get('/api-docs-json')
      .expect(200);

    expect(response.body.openapi).toMatch(/^3\./);
    expect(response.body.info.title).toBe(SWAGGER_TITLE);
  });

  it('serves the Swagger UI at /api-docs', async () => {
    await request(app.getHttpServer())
      .get('/api-docs')
      .expect(200)
      .expect('content-type', /text\/html/);
  });

  afterAll(async () => {
    await app.close();
  });
});
