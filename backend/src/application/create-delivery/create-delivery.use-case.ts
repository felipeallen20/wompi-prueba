import { randomUUID } from 'node:crypto';
import { Result } from '../../shared/result.js';
import { Delivery } from '../../domain/entities/delivery.js';
import type { CustomerRepository } from '../../domain/ports/customer-repository.js';
import type { DeliveryRepository } from '../../domain/ports/delivery-repository.js';
import type { CreateDeliveryCommand } from './create-delivery.command.js';
import type { CreateDeliveryError } from './create-delivery.errors.js';

export class CreateDeliveryUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly deliveryRepository: DeliveryRepository,
  ) {}

  async execute(
    command: CreateDeliveryCommand,
  ): Promise<Result<Delivery, CreateDeliveryError>> {
    if (!hasValidInput(command)) {
      return Result.err<Delivery, CreateDeliveryError>({
        code: 'INVALID_INPUT',
        message: 'customerId, address and city are required',
      });
    }

    const customer = await this.customerRepository.findById(command.customerId);
    if (customer === null) {
      return Result.err<Delivery, CreateDeliveryError>({
        code: 'CUSTOMER_NOT_FOUND',
        message: `Customer with id ${command.customerId} was not found`,
      });
    }

    const delivery = new Delivery(
      randomUUID(),
      command.customerId,
      command.address.trim(),
      command.city.trim(),
      'PENDING',
    );

    const saved = await this.deliveryRepository.save(delivery);
    return Result.ok<Delivery, CreateDeliveryError>(saved);
  }
}

function hasValidInput(command: CreateDeliveryCommand): boolean {
  return (
    isNonEmptyString(command?.customerId) &&
    isNonEmptyString(command?.address) &&
    isNonEmptyString(command?.city)
  );
}

function isNonEmptyString(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}
