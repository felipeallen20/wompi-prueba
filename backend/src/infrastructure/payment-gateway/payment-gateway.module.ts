import { Module } from '@nestjs/common';
import { PAYMENT_GATEWAY } from './payment-gateway.tokens.js';
import { SandboxPaymentGateway } from './sandbox.payment-gateway.js';

@Module({
  providers: [{ provide: PAYMENT_GATEWAY, useClass: SandboxPaymentGateway }],
  exports: [PAYMENT_GATEWAY],
})
export class PaymentGatewayModule {}
