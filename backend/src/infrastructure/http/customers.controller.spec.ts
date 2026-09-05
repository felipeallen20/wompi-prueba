import { jest } from '@jest/globals';
import { Result } from '../../shared/result.js';
import type { CreateCustomerUseCase } from '../../application/create-customer/create-customer.use-case.js';
import { CustomersController } from './customers.controller.js';

const customer = {
  id: 'c1',
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '+57 300 000 0000',
};

describe('CustomersController', () => {
  const createCustomer = {
    execute: jest.fn(),
  } as unknown as CreateCustomerUseCase;
  const controller = new CustomersController(createCustomer);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a customer', async () => {
    createCustomer.execute.mockResolvedValue(Result.ok(customer));

    const dto = {
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '+57 300 000 0000',
    };
    await expect(controller.create(dto)).resolves.toEqual(customer);
    expect(createCustomer.execute).toHaveBeenCalledWith(dto);
  });

  it('returns 400 when the customer data is invalid', async () => {
    createCustomer.execute.mockResolvedValue(
      Result.err({ code: 'INVALID_INPUT', message: 'missing fullName' }),
    );

    const promise = controller.create({
      fullName: '',
      email: 'bad',
      phone: '',
    });
    await expect(promise).rejects.toMatchObject({
      status: 400,
      response: { code: 'INVALID_INPUT' },
    });
  });
});
