import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateTransactionUseCase } from '../../application/create-transaction/create-transaction.use-case.js';
import { GetTransactionUseCase } from '../../application/get-transaction/get-transaction.use-case.js';
import { ProcessCheckoutUseCase } from '../../application/process-checkout/process-checkout.use-case.js';
import type { CreateTransactionDto } from './dto/create-transaction.dto.js';
import type { ProcessPaymentDto } from './dto/process-payment.dto.js';
import { unwrapOrThrow } from './utils/result-http.js';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransaction: CreateTransactionUseCase,
    private readonly getTransaction: GetTransactionUseCase,
    private readonly processCheckout: ProcessCheckoutUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateTransactionDto): Promise<unknown> {
    return unwrapOrThrow(
      await this.createTransaction.execute({
        productId: dto.productId,
        customerId: dto.customerId,
        deliveryId: dto.deliveryId ?? null,
      }),
    );
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<unknown> {
    return unwrapOrThrow(await this.getTransaction.execute(id));
  }

  @Post(':id/process')
  async process(
    @Param('id') id: string,
    @Body() dto: ProcessPaymentDto,
  ): Promise<unknown> {
    return unwrapOrThrow(
      await this.processCheckout.execute({
        transactionId: id,
        cardNumber: dto.cardNumber,
        cardExpiryMonth: dto.cardExpiryMonth,
        cardExpiryYear: dto.cardExpiryYear,
        cardCvv: dto.cardCvv,
      }),
    );
  }
}
