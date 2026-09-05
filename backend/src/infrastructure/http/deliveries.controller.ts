import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateDeliveryUseCase } from '../../application/create-delivery/create-delivery.use-case.js';
import { CreateDeliveryDto } from './dto/create-delivery.dto.js';
import { DeliveryResponse, ErrorResponse } from './dto/responses.js';
import { unwrapOrThrow } from './utils/result-http.js';

@ApiTags('deliveries')
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly createDelivery: CreateDeliveryUseCase) {}

  @ApiOperation({ summary: 'Register a delivery address for a customer' })
  @ApiCreatedResponse({
    description: 'Delivery created',
    type: DeliveryResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid delivery data',
    type: ErrorResponse,
  })
  @ApiNotFoundResponse({
    description: 'Customer not found',
    type: ErrorResponse,
  })
  @Post()
  async create(@Body() dto: CreateDeliveryDto): Promise<unknown> {
    return unwrapOrThrow(await this.createDelivery.execute(dto));
  }
}
