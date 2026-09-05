import { Transform } from 'class-transformer';
import { IsInt, IsString, Matches, Max, Min } from 'class-validator';

const CURRENT_YEAR = new Date().getFullYear();
const EXPIRY_MAX_HORIZON_YEARS = 15;

export class ProcessPaymentDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replace(/\s+/g, '') : value,
  )
  @IsString()
  @Matches(/^\d{13,19}$/)
  cardNumber: string;

  @IsInt()
  @Min(1)
  @Max(12)
  cardExpiryMonth: number;

  @IsInt()
  @Min(CURRENT_YEAR)
  @Max(CURRENT_YEAR + EXPIRY_MAX_HORIZON_YEARS)
  cardExpiryYear: number;

  @IsString()
  @Matches(/^\d{3,4}$/)
  cardCvv: string;
}
