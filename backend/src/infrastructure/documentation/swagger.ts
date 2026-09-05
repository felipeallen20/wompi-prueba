import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const SWAGGER_PATH = 'api-docs';
export const SWAGGER_TITLE = 'Checkout API';
export const SWAGGER_DESCRIPTION =
  'Checkout backend API — products, customers, deliveries and transactions. Sandbox payment gateway: use test cards 4242... (approved) or 4000... (declined).';
export const SWAGGER_VERSION = '1.0.0';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle(SWAGGER_TITLE)
    .setDescription(SWAGGER_DESCRIPTION)
    .setVersion(SWAGGER_VERSION)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SWAGGER_PATH, app, document);
}
