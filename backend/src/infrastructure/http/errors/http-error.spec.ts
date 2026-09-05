import { HttpStatus } from '@nestjs/common';
import { toHttpStatus } from './http-error.js';

describe('toHttpStatus', () => {
  it('maps business codes to the expected HTTP statuses', () => {
    expect(toHttpStatus('INVALID_INPUT')).toBe(HttpStatus.BAD_REQUEST);
    expect(toHttpStatus('PRODUCT_NOT_FOUND')).toBe(HttpStatus.NOT_FOUND);
    expect(toHttpStatus('TRANSACTION_NOT_FOUND')).toBe(HttpStatus.NOT_FOUND);
    expect(toHttpStatus('CUSTOMER_NOT_FOUND')).toBe(HttpStatus.NOT_FOUND);
    expect(toHttpStatus('DELIVERY_NOT_FOUND')).toBe(HttpStatus.NOT_FOUND);
    expect(toHttpStatus('DELIVERY_CUSTOMER_MISMATCH')).toBe(
      HttpStatus.CONFLICT,
    );
    expect(toHttpStatus('TRANSACTION_ALREADY_PROCESSED')).toBe(
      HttpStatus.CONFLICT,
    );
    expect(toHttpStatus('TRANSACTION_NOT_APPROVED')).toBe(HttpStatus.CONFLICT);
    expect(toHttpStatus('INSUFFICIENT_STOCK')).toBe(HttpStatus.CONFLICT);
    expect(toHttpStatus('PAYMENT_GATEWAY_ERROR')).toBe(HttpStatus.BAD_GATEWAY);
  });

  it('maps unknown codes to internal server error', () => {
    expect(toHttpStatus('RANDOM_CODE')).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
