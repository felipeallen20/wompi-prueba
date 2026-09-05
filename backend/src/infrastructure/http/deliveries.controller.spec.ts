import { jest } from '@jest/globals';
import { Result } from '../../shared/result.js';
import type { CreateDeliveryUseCase } from '../../application/create-delivery/create-delivery.use-case.js';
import { DeliveriesController } from './deliveries.controller.js';

const delivery = {
  id: 'd1',
  customerId: 'c1',
  address: 'Carrera 9 # 90 - 10',
  city: 'Bogota',
  status: 'PENDING',
};

describe('DeliveriesController', () => {
  const createDelivery = {
    execute: jest.fn(),
  } as unknown as CreateDeliveryUseCase;
  const controller = new DeliveriesController(createDelivery);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a delivery', async () => {
    createDelivery.execute.mockResolvedValue(Result.ok(delivery));

    const dto = {
      customerId: 'c1',
      address: 'Carrera 9 # 90 - 10',
      city: 'Bogota',
    };
    await expect(controller.create(dto)).resolves.toEqual(delivery);
    expect(createDelivery.execute).toHaveBeenCalledWith(dto);
  });

  it('returns 404 when the customer does not exist', async () => {
    createDelivery.execute.mockResolvedValue(
      Result.err({ code: 'CUSTOMER_NOT_FOUND', message: 'missing customer' }),
    );

    const promise = controller.create({
      customerId: 'c9',
      address: 'a',
      city: 'b',
    });
    await expect(promise).rejects.toMatchObject({
      status: 404,
      response: { code: 'CUSTOMER_NOT_FOUND' },
    });
  });
});
