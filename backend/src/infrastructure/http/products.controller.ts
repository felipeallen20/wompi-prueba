import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ListProductsUseCase } from '../../application/list-products/list-products.use-case.js';
import { GetProductUseCase } from '../../application/get-product/get-product.use-case.js';
import { unwrapOrThrow } from './utils/result-http.js';
import { ErrorResponse, ProductResponse } from './dto/responses.js';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly listProducts: ListProductsUseCase,
    private readonly getProduct: GetProductUseCase,
  ) {}

  @ApiOperation({ summary: 'List products with available stock' })
  @ApiOkResponse({
    description: 'Catalog with available quantities',
    type: [ProductResponse],
  })
  @Get()
  async list(): Promise<unknown> {
    return unwrapOrThrow(await this.listProducts.execute());
  }

  @ApiOperation({ summary: 'Get a single product with its stock' })
  @ApiParam({ name: 'id', description: 'Product identifier' })
  @ApiOkResponse({ type: ProductResponse })
  @ApiNotFoundResponse({
    description: 'Product not found',
    type: ErrorResponse,
  })
  @Get(':id')
  async get(@Param('id') id: string): Promise<unknown> {
    return unwrapOrThrow(await this.getProduct.execute(id));
  }
}
