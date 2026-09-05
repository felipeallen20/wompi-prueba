import { Result } from '../../shared/result.js';
import type {
  ProductRepository,
  ProductWithStock,
} from '../../domain/ports/product-repository.js';
import type { GetProductError } from './get-product.errors.js';

export class GetProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(
    id: string,
  ): Promise<Result<ProductWithStock, GetProductError>> {
    if (!isNonEmptyString(id)) {
      return Result.err<ProductWithStock, GetProductError>({
        code: 'INVALID_INPUT',
        message: 'a product id is required',
      });
    }

    const product = await this.productRepository.findById(id);
    if (product === null) {
      return Result.err<ProductWithStock, GetProductError>({
        code: 'PRODUCT_NOT_FOUND',
        message: `Product with id ${id} was not found`,
      });
    }

    return Result.ok<ProductWithStock, GetProductError>(product);
  }
}

function isNonEmptyString(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}
