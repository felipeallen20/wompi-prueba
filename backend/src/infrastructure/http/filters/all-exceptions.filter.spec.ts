import { jest } from '@jest/globals';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import type { Response } from 'express';
import { ApiError } from '../utils/result-http.js';
import { AllExceptionsFilter } from './all-exceptions.filter.js';

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();

  const json = jest.fn();
  const status = jest.fn(() => ({ json }));

  function buildHost(): ArgumentsHost {
    const response = { status } as unknown as Response;
    return {
      switchToHttp: () => ({
        getResponse: () => response,
      }),
    } as unknown as ArgumentsHost;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes business errors through with their original code', () => {
    const exception = new ApiError(404, 'PRODUCT_NOT_FOUND', 'missing product');

    filter.catch(exception, buildHost());

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({
      statusCode: 404,
      code: 'PRODUCT_NOT_FOUND',
      message: 'missing product',
    });
  });

  it('normalizes a generic HttpException to the consistent shape', () => {
    const exception = new ForbiddenException('Access denied');

    filter.catch(exception, buildHost());

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({
      statusCode: 403,
      code: 'FORBIDDEN',
      message: 'Access denied',
    });
  });

  it('normalizes a string-only HttpException', () => {
    const exception = new HttpException('Route not found', 404);

    filter.catch(exception, buildHost());

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: 'Route not found',
    });
  });

  it('hides unexpected exceptions behind a generic 500', () => {
    const exception = new Error('database connection lost');

    filter.catch(exception, buildHost());

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  });

  it('normalizes a validation-style error body without leaking classifiers', () => {
    const exception = new BadRequestException(['name should not be empty']);

    filter.catch(exception, buildHost());

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      statusCode: 400,
      code: 'BAD_REQUEST',
      message: 'Bad Request',
    });
  });
});
