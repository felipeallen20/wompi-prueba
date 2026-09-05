import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Full name of the customer',
    example: 'Ada Lovelace',
  })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ description: 'Contact email', example: 'ada@example.com' })
  @Transform(trim)
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contact phone', example: '+573001234567' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  phone: string;
}
