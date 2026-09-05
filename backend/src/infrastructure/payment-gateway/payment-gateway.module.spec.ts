import { Test } from '@nestjs/testing';
import { PaymentGatewayModule } from './payment-gateway.module.js';
import { PAYMENT_GATEWAY } from './payment-gateway.tokens.js';
import { SandboxPaymentGateway } from './sandbox.payment-gateway.js';

describe('PaymentGatewayModule', () => {
  it('binds the PAYMENT_GATEWAY token to the sandbox adapter', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PaymentGatewayModule],
    }).compile();
    const app = moduleRef.createNestApplication();

    const gateway = app.get(PAYMENT_GATEWAY);
    expect(gateway).toBeInstanceOf(SandboxPaymentGateway);

    await app.close();
  });
});
