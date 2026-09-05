import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Identifier of an existing product',
    example: 'product-1',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Identifier of an existing customer',
    example: 'customer-1',
  })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiPropertyOptional({
    description: 'Identifier of an existing delivery (optional at creation)',
    example: 'delivery-1',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  deliveryId?: string;
}
