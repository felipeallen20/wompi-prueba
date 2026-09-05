import { randomUUID } from 'node:crypto';
import { Result } from '../../shared/result.js';
import { Customer } from '../../domain/entities/customer.js';
import type { CustomerRepository } from '../../domain/ports/customer-repository.js';
import type { CreateCustomerCommand } from './create-customer.command.js';
import type { CreateCustomerError } from './create-customer.errors.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export class CreateCustomerUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(
    command: CreateCustomerCommand,
  ): Promise<Result<Customer, CreateCustomerError>> {
    if (!hasValidInput(command)) {
      return Result.err<Customer, CreateCustomerError>({
        code: 'INVALID_INPUT',
        message: 'fullName, a valid email and phone are required',
      });
    }

    const customer = new Customer(
      randomUUID(),
      command.fullName.trim(),
      command.email.trim(),
      command.phone.trim(),
    );

    const saved = await this.customerRepository.save(customer);
    return Result.ok<Customer, CreateCustomerError>(saved);
  }
}

function hasValidInput(command: CreateCustomerCommand): boolean {
  return (
    isNonEmptyString(command?.fullName) &&
    EMAIL_PATTERN.test(command?.email?.trim() ?? '') &&
    isNonEmptyString(command?.phone)
  );
}

function isNonEmptyString(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}
