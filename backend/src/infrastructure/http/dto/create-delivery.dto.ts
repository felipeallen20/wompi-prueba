import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateDeliveryDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  address: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  city: string;
}
