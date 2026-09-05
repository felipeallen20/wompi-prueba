export interface ProcessPaymentCommand {
  readonly transactionId: string;
  readonly cardNumber: string;
  readonly cardExpiryMonth: number;
  readonly cardExpiryYear: number;
  readonly cardCvv: string;
}
