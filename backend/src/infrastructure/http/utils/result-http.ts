import { HttpException } from '@nestjs/common';
import type { Result } from '../../../shared/result.js';
import { toHttpStatus } from '../errors/http-error.js';

export class ApiError extends HttpException {
  constructor(status: number, code: string, message: string) {
    super({ statusCode: status, code, message }, status);
  }
}

/**
 * Transport glue between the ROP result of a use case and an HTTP response.
 * On an `Err` it throws a consistent HttpException carrying the business code.
 */
export function unwrapOrThrow<T, E extends { code: string; message: string }>(
  result: Result<T, E>,
): T {
  if (result.isErr()) {
    const error = result.getError() as E;
    throw new ApiError(toHttpStatus(error.code), error.code, error.message);
  }

  return result.unwrapOr(undefined as T);
}
