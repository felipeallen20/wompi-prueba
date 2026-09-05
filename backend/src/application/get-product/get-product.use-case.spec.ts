import { jest } from '@jest/globals';
import { Product } from '../../domain/entities/product.js';
import { Stock } from '../../domain/entities/stock.js';
import type {
  ProductRepository,
  ProductWithStock,
} from '../../domain/ports/product-repository.js';
import { GetProductUseCase } from './get-product.use-case.js';

const product: ProductWithStock = {
  ...new Product('p1', 'Desk', 'A desk', 500, '/img.png'),
  stock: new Stock('p1', 3),
};

const productRepository = {
  findById: jest.fn(async (id: string) => (id === 'p1' ? product : null)),
} as unknown as ProductRepository;

describe('GetProductUseCase', () => {
  const useCase = new GetProductUseCase(productRepository);

  it('returns a product by id', async () => {
    const result = await useCase.execute('p1');

    expect(result.isOk()).toBe(true);
    expect(result.unwrapOr(null)).toEqual(product);
  });

  it('fails when the id is empty', async () => {
    const result = await useCase.execute('  ');

    expect(result.isErr()).toBe(true);
    expect(result.getError()?.code).toBe('INVALID_INPUT');
  });

  it('fails when the product does not exist', async () => {
    const result = await useCase.execute('missing');

    expect(result.isErr()).toBe(true);
    expect(result.getError()?.code).toBe('PRODUCT_NOT_FOUND');
  });
});
