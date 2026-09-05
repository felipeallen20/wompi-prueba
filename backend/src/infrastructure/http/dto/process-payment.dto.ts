export interface ProcessPaymentDto {
  readonly cardNumber: string;
  readonly cardExpiryMonth: number;
  readonly cardExpiryYear: number;
  readonly cardCvv: string;
}
