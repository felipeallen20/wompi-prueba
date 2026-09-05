import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsString, Matches, Max, Min } from 'class-validator';

const CURRENT_YEAR = new Date().getFullYear();
const EXPIRY_MAX_HORIZON_YEARS = 15;

export class ProcessPaymentDto {
  @ApiProperty({
    description:
      'Sandbox test card, spaces are stripped. Ends in 4242 → approved, 0002 → declined.',
    example: '4242424242424242',
    minLength: 13,
    maxLength: 19,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replace(/\s+/g, '') : value,
  )
  @IsString()
  @Matches(/^\d{13,19}$/)
  cardNumber: string;

  @ApiProperty({
    description: 'Card expiry month (1-12)',
    minimum: 1,
    maximum: 12,
    example: 12,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  cardExpiryMonth: number;

  @ApiProperty({
    description: 'Card expiry year',
    minimum: CURRENT_YEAR,
    maximum: CURRENT_YEAR + EXPIRY_MAX_HORIZON_YEARS,
    example: CURRENT_YEAR + 2,
  })
  @IsInt()
  @Min(CURRENT_YEAR)
  @Max(CURRENT_YEAR + EXPIRY_MAX_HORIZON_YEARS)
  cardExpiryYear: number;

  @ApiProperty({
    description: 'Card verification code. Never stored by the server.',
    example: '123',
    minLength: 3,
    maxLength: 4,
  })
  @IsString()
  @Matches(/^\d{3,4}$/)
  cardCvv: string;
}
