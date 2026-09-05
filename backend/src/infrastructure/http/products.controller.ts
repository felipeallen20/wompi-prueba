import { Controller, Get, Param } from '@nestjs/common';
import { ListProductsUseCase } from '../../application/list-products/list-products.use-case.js';
import { GetProductUseCase } from '../../application/get-product/get-product.use-case.js';
import { unwrapOrThrow } from './utils/result-http.js';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly listProducts: ListProductsUseCase,
    private readonly getProduct: GetProductUseCase,
  ) {}

  @Get()
  async list(): Promise<unknown> {
    return unwrapOrThrow(await this.listProducts.execute());
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<unknown> {
    return unwrapOrThrow(await this.getProduct.execute(id));
  }
}
