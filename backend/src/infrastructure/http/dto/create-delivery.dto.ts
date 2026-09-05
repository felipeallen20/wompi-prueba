import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateDeliveryDto {
  @ApiProperty({
    description: 'Identifier of an existing customer',
    example: 'customer-1',
  })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({
    description: 'Delivery address',
    example: 'Cra 15 # 123-45, Apartamento 401',
  })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'Delivery city', example: 'Bogota' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  city: string;
}
