import { Body, Controller, Post } from '@nestjs/common';
import { CreateDeliveryUseCase } from '../../application/create-delivery/create-delivery.use-case.js';
import { CreateDeliveryDto } from './dto/create-delivery.dto.js';
import { unwrapOrThrow } from './utils/result-http.js';

@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly createDelivery: CreateDeliveryUseCase) {}

  @Post()
  async create(@Body() dto: CreateDeliveryDto): Promise<unknown> {
    return unwrapOrThrow(await this.createDelivery.execute(dto));
  }
}
