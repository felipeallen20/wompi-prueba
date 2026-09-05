import type { Currency } from '../value-objects/money.js';

export type PaymentGatewayStatus = 'APPROVED' | 'DECLINED' | 'ERROR';

export interface ProcessPaymentRequest {
  readonly transactionReference: string;
  readonly amount: number;
  readonly currency: Currency;
  readonly customerFullName: string;
  readonly customerEmail: string;
  readonly cardNumber: string;
  readonly cardExpiryMonth: number;
  readonly cardExpiryYear: number;
  readonly cardCvv: string;
}

export interface PaymentResult {
  readonly status: PaymentGatewayStatus;
  readonly gatewayReference: string | null;
  readonly errorMessage: string | null;
}

export interface PaymentGateway {
  processPayment(request: ProcessPaymentRequest): Promise<PaymentResult>;
}
