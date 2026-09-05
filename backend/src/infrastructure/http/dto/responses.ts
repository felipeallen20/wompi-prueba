import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { DeliveryStatus } from '../../../domain/entities/delivery.js';
import type { TransactionStatus } from '../../../domain/value-objects/transaction-status.js';

export class StockResponse {
  @ApiProperty({ description: 'Product identifier', example: 'product-1' })
  productId: string;

  @ApiProperty({ description: 'Units available for sale', example: 3 })
  quantityAvailable: number;
}

export class ProductResponse {
  @ApiProperty({ example: 'product-1' })
  id: string;

  @ApiProperty({ example: 'Mechanical Keyboard' })
  name: string;

  @ApiProperty({ example: 'RGB backlit mechanical keyboard' })
  description: string;

  @ApiProperty({
    description: 'Price in minor currency units (COP)',
    example: 350000,
  })
  price: number;

  @ApiProperty({ example: 'https://cdn.example.com/keyboard.png' })
  imageUrl: string;

  @ApiProperty({ type: () => StockResponse })
  stock: StockResponse;
}

export class CustomerResponse {
  @ApiProperty({ example: 'customer-1' })
  id: string;

  @ApiProperty({ example: 'Ada Lovelace' })
  fullName: string;

  @ApiProperty({ example: 'ada@example.com' })
  email: string;

  @ApiProperty({ example: '+573001234567' })
  phone: string;
}

export class DeliveryResponse {
  @ApiProperty({ example: 'delivery-1' })
  id: string;

  @ApiProperty({ example: 'customer-1' })
  customerId: string;

  @ApiProperty({ example: 'Cra 15 # 123-45, Apartamento 401' })
  address: string;

  @ApiProperty({ example: 'Bogota' })
  city: string;

  @ApiProperty({ enum: ['PENDING', 'SHIPPED', 'DELIVERED'] })
  status: DeliveryStatus;
}

export class TransactionResponse {
  @ApiProperty({ example: 'transaction-1' })
  id: string;

  @ApiProperty({ example: 'product-1' })
  productId: string;

  @ApiProperty({ example: 'customer-1' })
  customerId: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Delivery assigned after a successful payment',
  })
  deliveryId: string | null;

  @ApiProperty({ enum: ['PENDING', 'APPROVED', 'DECLINED', 'ERROR'] })
  status: TransactionStatus;

  @ApiProperty({
    description: 'Total charged to the customer in minor currency units',
    example: 385000,
  })
  amount: number;

  @ApiProperty({
    description: 'Gateway base fee in minor currency units',
    example: 35000,
  })
  baseFee: number;

  @ApiProperty({
    description: 'Delivery fee in minor currency units',
    example: 0,
  })
  deliveryFee: number;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Reference of the payment returned by the gateway',
  })
  gatewayReference: string | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Creation timestamp (ISO 8601)',
  })
  createdAt: Date;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Last update timestamp (ISO 8601)',
  })
  updatedAt: Date;
}

export class ErrorResponse {
  @ApiProperty({ description: 'HTTP status code', example: 404 })
  statusCode: number;

  @ApiProperty({
    description: 'Stable machine-readable error code',
    example: 'PRODUCT_NOT_FOUND',
  })
  code: string;

  @ApiProperty({
    description: 'Human readable error message',
    example: 'Product product-1 was not found',
  })
  message: string;
}
