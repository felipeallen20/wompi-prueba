import { jest } from '@jest/globals';
import { Result } from '../../shared/result.js';
import type { ListProductsUseCase } from '../../application/list-products/list-products.use-case.js';
import type { GetProductUseCase } from '../../application/get-product/get-product.use-case.js';
import { ProductsController } from './products.controller.js';

const product = {
  id: 'p1',
  name: 'Desk',
  description: 'A desk',
  price: 50000,
  imageUrl: '/img.png',
  stock: { productId: 'p1', quantityAvailable: 3 },
};

describe('ProductsController', () => {
  const listProducts = { execute: jest.fn() } as unknown as ListProductsUseCase;
  const getProduct = { execute: jest.fn() } as unknown as GetProductUseCase;
  const controller = new ProductsController(listProducts, getProduct);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists all products', async () => {
    listProducts.execute.mockResolvedValue(Result.ok([product]));

    await expect(controller.list()).resolves.toEqual([product]);
  });

  it('returns a single product by id', async () => {
    getProduct.execute.mockResolvedValue(Result.ok(product));

    await expect(controller.get('p1')).resolves.toEqual(product);
  });

  it('returns 404 when the product does not exist', async () => {
    getProduct.execute.mockResolvedValue(
      Result.err({ code: 'PRODUCT_NOT_FOUND', message: 'missing product' }),
    );

    const promise = controller.get('missing');
    await expect(promise).rejects.toMatchObject({
      status: 404,
      response: { code: 'PRODUCT_NOT_FOUND' },
    });
  });
});
