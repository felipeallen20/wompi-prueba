import { Result } from '../../shared/result.js';
import type { Delivery } from '../../domain/entities/delivery.js';
import type { DeliveryRepository } from '../../domain/ports/delivery-repository.js';
import type { TransactionRepository } from '../../domain/ports/transaction-repository.js';
import type { AssignDeliveryCommand } from './assign-delivery.command.js';
import type { AssignDeliveryError } from './assign-delivery.errors.js';

export class AssignDeliveryUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly deliveryRepository: DeliveryRepository,
  ) {}

  async execute(
    command: AssignDeliveryCommand,
  ): Promise<Result<Delivery, AssignDeliveryError>> {
    if (!isNonEmpty(command.transactionId)) {
      return Result.err<Delivery, AssignDeliveryError>({
        code: 'INVALID_INPUT',
        message: 'transactionId is required',
      });
    }

    const transaction = await this.transactionRepository.findById(
      command.transactionId,
    );
    if (transaction === null) {
      return Result.err<Delivery, AssignDeliveryError>({
        code: 'TRANSACTION_NOT_FOUND',
        message: `Transaction with id ${command.transactionId} was not found`,
      });
    }

    if (transaction.status !== 'APPROVED') {
      return Result.err<Delivery, AssignDeliveryError>({
        code: 'TRANSACTION_NOT_APPROVED',
        message: `Transaction ${transaction.id} is not approved`,
      });
    }

    if (transaction.deliveryId === null) {
      return Result.err<Delivery, AssignDeliveryError>({
        code: 'DELIVERY_NOT_FOUND',
        message: `Transaction ${transaction.id} has no delivery attached`,
      });
    }

    const delivery = await this.deliveryRepository.findById(
      transaction.deliveryId,
    );
    if (delivery === null) {
      return Result.err<Delivery, AssignDeliveryError>({
        code: 'DELIVERY_NOT_FOUND',
        message: `Delivery with id ${transaction.deliveryId} was not found`,
      });
    }

    if (delivery.customerId !== transaction.customerId) {
      return Result.err<Delivery, AssignDeliveryError>({
        code: 'DELIVERY_CUSTOMER_MISMATCH',
        message: `Delivery ${delivery.id} does not belong to customer ${transaction.customerId}`,
      });
    }

    return Result.ok<Delivery, AssignDeliveryError>(delivery);
  }
}

function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}
