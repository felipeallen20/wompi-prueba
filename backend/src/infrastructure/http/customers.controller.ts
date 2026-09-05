import { Body, Controller, Post } from '@nestjs/common';
import { CreateCustomerUseCase } from '../../application/create-customer/create-customer.use-case.js';
import type { CreateCustomerDto } from './dto/create-customer.dto.js';
import { unwrapOrThrow } from './utils/result-http.js';

@Controller('customers')
export class CustomersController {
  constructor(private readonly createCustomer: CreateCustomerUseCase) {}

  @Post()
  async create(@Body() dto: CreateCustomerDto): Promise<unknown> {
    return unwrapOrThrow(await this.createCustomer.execute(dto));
  }
}
