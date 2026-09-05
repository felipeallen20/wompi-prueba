import { SandboxPaymentGateway } from './sandbox.payment-gateway.js';

const REQUEST = {
  transactionReference: 'transaction-1',
  amount: 55000,
  currency: 'COP' as const,
  customerFullName: 'Ada Lovelace',
  customerEmail: 'ada@example.com',
  cardNumber: '4242424242424242',
  cardExpiryMonth: 12,
  cardExpiryYear: 2030,
  cardCvv: '123',
};

describe('SandboxPaymentGateway', () => {
  const gateway = new SandboxPaymentGateway();

  it('approves cards in the 4242 test family', async () => {
    const result = await gateway.processPayment(REQUEST);

    expect(result.status).toBe('APPROVED');
    expect(result.errorMessage).toBeNull();
    expect(result.gatewayReference).toMatch(
      /^sandbox-transaction-1-[0-9a-f-]{36}$/,
    );
  });

  it('ignores spaces in the card number', async () => {
    const result = await gateway.processPayment({
      ...REQUEST,
      cardNumber: '4242 4242 4242 4242',
    });

    expect(result.status).toBe('APPROVED');
  });

  it('declines cards in the 4000 test family', async () => {
    const result = await gateway.processPayment({
      ...REQUEST,
      cardNumber: '4000000000000002',
    });

    expect(result.status).toBe('DECLINED');
    expect(result.gatewayReference).toBeNull();
    expect(result.errorMessage).not.toBeNull();
  });

  it('returns an ERROR for any other card number', async () => {
    const result = await gateway.processPayment({
      ...REQUEST,
      cardNumber: '5555555555554444',
    });

    expect(result.status).toBe('ERROR');
    expect(result.gatewayReference).toBeNull();
    expect(result.errorMessage).not.toBeNull();
  });
});
