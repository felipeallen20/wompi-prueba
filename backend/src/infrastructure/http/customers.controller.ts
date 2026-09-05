import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCustomerUseCase } from '../../application/create-customer/create-customer.use-case.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { CustomerResponse, ErrorResponse } from './dto/responses.js';
import { unwrapOrThrow } from './utils/result-http.js';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly createCustomer: CreateCustomerUseCase) {}

  @ApiOperation({ summary: 'Register a customer' })
  @ApiCreatedResponse({
    description: 'Customer created',
    type: CustomerResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid customer data',
    type: ErrorResponse,
  })
  @Post()
  async create(@Body() dto: CreateCustomerDto): Promise<unknown> {
    return unwrapOrThrow(await this.createCustomer.execute(dto));
  }
}
