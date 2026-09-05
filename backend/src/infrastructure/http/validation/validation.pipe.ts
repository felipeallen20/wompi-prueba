import { ValidationPipe } from '@nestjs/common';
import type { ValidationError } from '@nestjs/common';
import { ApiError } from '../utils/result-http.js';

export const VALIDATION_ERROR_CODE = 'INVALID_INPUT';

/**
 * Global input-validation pipe. Rejects unknown properties (whitelist),
 * transforms the plain body into the DTO class instance and normalizes
 * validation failures into the same ApiError shape used everywhere else.
 */
export function buildValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors: ValidationError[]): ApiError => {
      const messages = collectMessages(errors);
      return new ApiError(400, VALIDATION_ERROR_CODE, messages.join('; '));
    },
  });
}

function collectMessages(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => [
    ...Object.values(error.constraints ?? {}),
    ...collectMessages(error.children ?? []),
  ]);
}
