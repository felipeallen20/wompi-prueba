import { jest } from '@jest/globals';
import { Product } from '../../../domain/entities/product.js';
import { Stock } from '../../../domain/entities/stock.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { PrismaProductRepository } from './prisma-product.repository.js';

describe('PrismaProductRepository', () => {
  const productRow = {
    id: 'product-1',
    name: 'Wireless Mouse',
    description: 'A comfortable wireless mouse',
    price: 45000,
    imageUrl: 'https://shop.example.com/mouse.png',
    stock: { productId: 'product-1', quantityAvailable: 10 },
  };

  let prisma: {
    product: {
      findMany: ReturnType<typeof jest.fn>;
      findUnique: ReturnType<typeof jest.fn>;
      upsert: ReturnType<typeof jest.fn>;
    };
    stock: {
      findUnique: ReturnType<typeof jest.fn>;
      updateMany: ReturnType<typeof jest.fn>;
    };
  };

  let repository: PrismaProductRepository;

  beforeEach(() => {
    prisma = {
      product: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      stock: {
        findUnique: jest.fn(),
        updateMany: jest.fn(),
      },
    };
    repository = new PrismaProductRepository(
      prisma as unknown as PrismaService,
    );
  });

  it('maps rows with stock to domain objects', async () => {
    prisma.product.findMany.mockResolvedValue([productRow]);

    const products = await repository.listWithStock();

    expect(products).toEqual([
      {
        ...new Product(
          'product-1',
          'Wireless Mouse',
          'A comfortable wireless mouse',
          45000,
          'https://shop.example.com/mouse.png',
        ),
        stock: new Stock('product-1', 10),
      },
    ]);
    expect(prisma.product.findMany).toHaveBeenCalledWith({
      include: { stock: true },
    });
  });

  it('defaults missing stock to zero on list', async () => {
    prisma.product.findMany.mockResolvedValue([{ ...productRow, stock: null }]);

    const products = await repository.listWithStock();

    expect(products[0].stock.quantityAvailable).toBe(0);
  });

  it('finds an existing product by id', async () => {
    prisma.product.findUnique.mockResolvedValue(productRow);

    const product = await repository.findById('product-1');

    expect(product?.id).toBe('product-1');
    expect(product?.stock.quantityAvailable).toBe(10);
    expect(prisma.product.findUnique).toHaveBeenCalledWith({
      where: { id: 'product-1' },
      include: { stock: true },
    });
  });

  it('returns null when the product does not exist', async () => {
    prisma.product.findUnique.mockResolvedValue(null);

    const product = await repository.findById('product-x');

    expect(product).toBeNull();
  });

  it('finds stock by product id', async () => {
    prisma.stock.findUnique.mockResolvedValue({
      productId: 'product-1',
      quantityAvailable: 7,
    });

    const stock = await repository.findStockByProductId('product-1');

    expect(stock).toEqual(new Stock('product-1', 7));
    expect(prisma.stock.findUnique).toHaveBeenCalledWith({
      where: { productId: 'product-1' },
    });
  });

  it('returns null when there is no stock row', async () => {
    prisma.stock.findUnique.mockResolvedValue(null);

    const stock = await repository.findStockByProductId('product-x');

    expect(stock).toBeNull();
  });

  it('decrements stock atomically when enough is available', async () => {
    prisma.stock.updateMany.mockResolvedValue({ count: 1 });

    const decremented = await repository.decrementStock('product-1', 1);

    expect(decremented).toBe(true);
    expect(prisma.stock.updateMany).toHaveBeenCalledWith({
      where: { productId: 'product-1', quantityAvailable: { gte: 1 } },
      data: { quantityAvailable: { decrement: 1 } },
    });
  });

  it('does not decrement when stock is below the requested quantity', async () => {
    prisma.stock.updateMany.mockResolvedValue({ count: 0 });

    const decremented = await repository.decrementStock('product-1', 1);

    expect(decremented).toBe(false);
  });
});
