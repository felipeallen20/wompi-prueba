import { Result } from '../../shared/result.js';
import type {
  ProductRepository,
  ProductWithStock,
} from '../../domain/ports/product-repository.js';

export class ListProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(): Promise<Result<ProductWithStock[], never>> {
    const products = await this.productRepository.listWithStock();
    return Result.ok<ProductWithStock[], never>(products);
  }
}
