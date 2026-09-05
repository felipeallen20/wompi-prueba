import { Stock } from './stock.js';

describe('Stock', () => {
  it('creates a stock record with the given attributes', () => {
    const stock = new Stock('product-1', 10);

    expect(stock.productId).toBe('product-1');
    expect(stock.quantityAvailable).toBe(10);
  });
});
