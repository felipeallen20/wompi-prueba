import type { Product } from '../entities/product.js';
import type { Stock } from '../entities/stock.js';

export type ProductWithStock = Product & { readonly stock: Stock };

export interface ProductRepository {
  listWithStock(): Promise<ProductWithStock[]>;
  findById(id: string): Promise<ProductWithStock | null>;
  findStockByProductId(productId: string): Promise<Stock | null>;
  decrementStock(productId: string, quantity: number): Promise<boolean>;
}
