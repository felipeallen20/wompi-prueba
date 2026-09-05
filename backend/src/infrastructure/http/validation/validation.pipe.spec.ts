import type { ArgumentMetadata } from '@nestjs/common';
import { ApiError } from '../utils/result-http.js';
import { CreateCustomerDto } from '../dto/create-customer.dto.js';
import { CreateTransactionDto } from '../dto/create-transaction.dto.js';
import { ProcessPaymentDto } from '../dto/process-payment.dto.js';
import { buildValidationPipe } from './validation.pipe.js';

const BODY_META: ArgumentMetadata = {
  type: 'body',
  metatype: CreateCustomerDto,
};

describe('buildValidationPipe', () => {
  const pipe = buildValidationPipe();

  it('transforms a valid body into the DTO instance', async () => {
    const body = {
      fullName: ' Ada Lovelace ',
      email: 'ada@example.com',
      phone: '+57 300 000 0000',
    };

    const dto = await pipe.transform(body, BODY_META);

    expect(dto).toBeInstanceOf(CreateCustomerDto);
    expect(dto.fullName).toBe('Ada Lovelace');
  });

  it('rejects invalid input with the consistent ApiError', async () => {
    const body = {
      fullName: '',
      email: 'not-an-email',
      phone: '',
    };

    const promise = pipe.transform(body, BODY_META);
    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({
      status: 400,
      response: { code: 'INVALID_INPUT' },
    });
  });

  it('rejects unknown properties', async () => {
    const body = {
      fullName: 'Ada',
      email: 'ada@example.com',
      phone: '123',
      extraField: 'not allowed',
    };

    const promise = pipe.transform(body, BODY_META);
    await expect(promise).rejects.toMatchObject({
      status: 400,
      response: { code: 'INVALID_INPUT' },
    });
  });

  it('normalizes the card number and validates the payment fields', async () => {
    const pipe = buildValidationPipe();

    await expect(
      pipe.transform(
        {
          cardNumber: '4242 4242 4242 4242',
          cardExpiryMonth: 12,
          cardExpiryYear: 2030,
          cardCvv: '123',
        },
        { type: 'body', metatype: ProcessPaymentDto },
      ),
    ).resolves.toMatchObject({ cardNumber: '4242424242424242' });

    await expect(
      pipe.transform(
        {
          cardNumber: '4242424242424242',
          cardExpiryMonth: 13,
          cardExpiryYear: 2010,
          cardCvv: '1',
        },
        { type: 'body', metatype: ProcessPaymentDto },
      ),
    ).rejects.toMatchObject({
      status: 400,
      response: { code: 'INVALID_INPUT' },
    });
  });

  it('rejects a transaction missing required fields', async () => {
    const promise = pipe.transform(
      { customerId: 'c1' },
      { type: 'body', metatype: CreateTransactionDto },
    );

    await expect(promise).rejects.toMatchObject({
      status: 400,
      response: { code: 'INVALID_INPUT' },
    });
  });
});
