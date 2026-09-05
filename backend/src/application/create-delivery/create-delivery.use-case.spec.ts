import { jest } from '@jest/globals';
import type { CustomerRepository } from '../../domain/ports/customer-repository.js';
import type { DeliveryRepository } from '../../domain/ports/delivery-repository.js';
import type { Customer } from '../../domain/entities/customer.js';
import type { Delivery } from '../../domain/entities/delivery.js';
import { CreateDeliveryUseCase } from './create-delivery.use-case.js';

const customerRepository = {
  findById: jest.fn(async (id: string) =>
    id === 'customer-1' ? ({ id, fullName: 'Ada' } as Customer) : null,
  ),
} as unknown as CustomerRepository;

const deliveryRepository = {
  save: jest.fn(async (delivery: Delivery) => delivery),
} as unknown as DeliveryRepository;

const useCase = new CreateDeliveryUseCase(
  customerRepository,
  deliveryRepository,
);

const COMMAND = {
  customerId: 'customer-1',
  address: 'Carrera 9 # 90 - 10',
  city: 'Bogota',
};

describe('CreateDeliveryUseCase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a PENDING delivery for an existing customer', async () => {
    const result = await useCase.execute(COMMAND);

    expect(result.isOk()).toBe(true);
    const delivery = result.unwrapOr(null);
    expect(delivery?.customerId).toBe('customer-1');
    expect(delivery?.status).toBe('PENDING');
    expect(delivery?.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('fails without a customer reference', async () => {
    const result = await useCase.execute({ ...COMMAND, customerId: '' });

    expect(result.isErr()).toBe(true);
    expect(result.getError()?.code).toBe('INVALID_INPUT');
  });

  it('fails when the customer does not exist', async () => {
    const result = await useCase.execute({
      ...COMMAND,
      customerId: 'unknown-customer',
    });

    expect(result.isErr()).toBe(true);
    expect(result.getError()?.code).toBe('CUSTOMER_NOT_FOUND');
    expect(deliveryRepository.save).not.toHaveBeenCalled();
  });

  it('fails when the address is missing', async () => {
    const result = await useCase.execute({ ...COMMAND, address: ' ' });

    expect(result.isErr()).toBe(true);
    expect(result.getError()?.code).toBe('INVALID_INPUT');
  });
});
