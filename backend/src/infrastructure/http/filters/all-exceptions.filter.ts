import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { codeForStatus } from '../errors/http-error.js';

interface ErrorBody {
  readonly statusCode: number;
  readonly code: string;
  readonly message: string;
}

const INTERNAL_ERROR: ErrorBody = {
  statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  code: 'INTERNAL_ERROR',
  message: 'Internal server error',
};

/**
 * Single entry point for every HTTP error. Business errors already carry a
 * code (ApiError); generic HttpExceptions are normalized to the same shape
 * and unexpected exceptions become a generic 500 that never leaks internals.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const { status, body } = this.resolve(exception);

    if (status >= 500) {
      this.logger.error(describe(exception));
    }

    response.status(status).json(body);
  }

  private resolve(exception: unknown): { status: number; body: ErrorBody } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      return { status, body: toErrorBody(status, exception.getResponse()) };
    }

    return { status: HttpStatus.INTERNAL_SERVER_ERROR, body: INTERNAL_ERROR };
  }
}

function toErrorBody(status: number, raw: string | object): ErrorBody {
  if (typeof raw === 'string') {
    return { statusCode: status, code: codeForStatus(status), message: raw };
  }

  const code = raw['code'];
  const message = raw['message'];
  const error = raw['error'];
  if (typeof code === 'string' && typeof message === 'string') {
    return { statusCode: status, code, message };
  }

  return {
    statusCode: status,
    code: codeForStatus(status),
    message:
      typeof message === 'string'
        ? message
        : typeof error === 'string'
          ? error
          : reason(status),
  };
}

function reason(status: number): string {
  return HttpStatus[status] ?? 'Http error';
}

function describe(exception: unknown): string {
  if (exception instanceof Error) {
    return exception.stack ?? exception.message;
  }
  return String(exception);
}
