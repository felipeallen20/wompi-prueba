import { jest } from '@jest/globals';
import { Product } from '../../domain/entities/product.js';
import { Stock } from '../../domain/entities/stock.js';
import type {
  ProductRepository,
  ProductWithStock,
} from '../../domain/ports/product-repository.js';
import { ListProductsUseCase } from './list-products.use-case.js';

const products: ProductWithStock[] = [
  {
    ...new Product('p1', 'Desk', 'A desk', 500, '/img.png'),
    stock: new Stock('p1', 3),
  },
];

const productRepository = {
  listWithStock: jest.fn(async () => products),
} as unknown as ProductRepository;

describe('ListProductsUseCase', () => {
  const useCase = new ListProductsUseCase(productRepository);

  it('returns all products with their stock', async () => {
    const result = await useCase.execute();

    expect(result.isOk()).toBe(true);
    expect(result.unwrapOr([])).toEqual(products);
  });

  it('returns an empty list when there are no products', async () => {
    productRepository.listWithStock.mockResolvedValueOnce([]);

    const result = await useCase.execute();

    expect(result.isOk()).toBe(true);
    expect(result.unwrapOr(null)).toEqual([]);
  });
});
