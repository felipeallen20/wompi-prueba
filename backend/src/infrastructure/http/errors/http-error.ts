import { HttpStatus } from '@nestjs/common';

export interface HttpErrorBody {
  readonly statusCode: number;
  readonly code: string;
  readonly message: string;
}

const CODE_TO_STATUS: Readonly<Record<string, HttpStatus>> = {
  INVALID_INPUT: HttpStatus.BAD_REQUEST,
  PRODUCT_NOT_FOUND: HttpStatus.NOT_FOUND,
  TRANSACTION_NOT_FOUND: HttpStatus.NOT_FOUND,
  CUSTOMER_NOT_FOUND: HttpStatus.NOT_FOUND,
  DELIVERY_NOT_FOUND: HttpStatus.NOT_FOUND,
  DELIVERY_CUSTOMER_MISMATCH: HttpStatus.CONFLICT,
  TRANSACTION_ALREADY_PROCESSED: HttpStatus.CONFLICT,
  TRANSACTION_NOT_APPROVED: HttpStatus.CONFLICT,
  INSUFFICIENT_STOCK: HttpStatus.CONFLICT,
  PAYMENT_GATEWAY_ERROR: HttpStatus.BAD_GATEWAY,
};

export function toHttpStatus(code: string): number {
  return CODE_TO_STATUS[code] ?? HttpStatus.INTERNAL_SERVER_ERROR;
}
