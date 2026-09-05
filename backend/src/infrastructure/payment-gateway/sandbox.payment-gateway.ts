import { randomUUID } from 'node:crypto';
import type {
  PaymentGateway,
  PaymentResult,
  ProcessPaymentRequest,
} from '../../domain/ports/payment-gateway.js';

const APPROVED_CARD_PREFIX = '4242';
const DECLINED_CARD_PREFIX = '4000';

/**
 * Sandbox implementation of the PaymentGateway port.
 * It never touches a real provider: specific test cards map to a fixed
 * outcome so the full flow can be exercised safely in development.
 */
export class SandboxPaymentGateway implements PaymentGateway {
  async processPayment(request: ProcessPaymentRequest): Promise<PaymentResult> {
    const cardNumber = request.cardNumber.replace(/\s+/g, '');

    if (cardNumber.startsWith(APPROVED_CARD_PREFIX)) {
      return {
        status: 'APPROVED',
        gatewayReference: this.buildGatewayReference(
          request.transactionReference,
        ),
        errorMessage: null,
      };
    }

    if (cardNumber.startsWith(DECLINED_CARD_PREFIX)) {
      return {
        status: 'DECLINED',
        gatewayReference: null,
        errorMessage: 'The card was declined by the sandbox gateway',
      };
    }

    return {
      status: 'ERROR',
      gatewayReference: null,
      errorMessage: 'Unsupported test card number for the sandbox gateway',
    };
  }

  private buildGatewayReference(transactionReference: string): string {
    return `sandbox-${transactionReference}-${randomUUID()}`;
  }
}
