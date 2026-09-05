import { Product } from './product.js';

describe('Product', () => {
  it('creates a product with the given attributes', () => {
    const product = new Product(
      'product-1',
      'Wireless Mouse',
      'A comfortable wireless mouse',
      45000,
      'https://example.com/mouse.png',
    );

    expect(product.id).toBe('product-1');
    expect(product.name).toBe('Wireless Mouse');
    expect(product.description).toBe('A comfortable wireless mouse');
    expect(product.price).toBe(45000);
    expect(product.imageUrl).toBe('https://example.com/mouse.png');
  });
});
