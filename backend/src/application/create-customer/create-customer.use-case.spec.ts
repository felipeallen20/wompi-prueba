import { jest } from '@jest/globals';
import type { CustomerRepository } from '../../domain/ports/customer-repository.js';
import type { Customer } from '../../domain/entities/customer.js';
import { CreateCustomerUseCase } from './create-customer.use-case.js';

const repository = {
  save: jest.fn(async (customer: Customer) => customer),
} as unknown as CustomerRepository;

const useCase = new CreateCustomerUseCase(repository);

const COMMAND = {
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '+57 300 000 0000',
};

describe('CreateCustomerUseCase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a customer trimming the input', async () => {
    const result = await useCase.execute({
      ...COMMAND,
      fullName: '  Ada Lovelace  ',
      email: '  ada@example.com ',
      phone: ' +57 300 000 0000 ',
    });

    expect(result.isOk()).toBe(true);
    const customer = result.unwrapOr(null);
    expect(customer).not.toBeNull();
    expect(customer?.fullName).toBe('Ada Lovelace');
    expect(customer?.email).toBe('ada@example.com');
    expect(customer?.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('fails when the full name is missing', async () => {
    const result = await useCase.execute({ ...COMMAND, fullName: '' });

    expect(result.isErr()).toBe(true);
    expect(result.getError()?.code).toBe('INVALID_INPUT');
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('fails when the email is not valid', async () => {
    const result = await useCase.execute({
      ...COMMAND,
      email: 'not-an-email',
    });

    expect(result.isErr()).toBe(true);
    expect(result.getError()?.code).toBe('INVALID_INPUT');
  });

  it('fails when the phone is missing', async () => {
    const result = await useCase.execute({ ...COMMAND, phone: ' ' });

    expect(result.isErr()).toBe(true);
    expect(result.getError()?.code).toBe('INVALID_INPUT');
  });
});
