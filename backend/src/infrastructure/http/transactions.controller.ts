import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTransactionUseCase } from '../../application/create-transaction/create-transaction.use-case.js';
import { GetTransactionUseCase } from '../../application/get-transaction/get-transaction.use-case.js';
import { ProcessCheckoutUseCase } from '../../application/process-checkout/process-checkout.use-case.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { ProcessPaymentDto } from './dto/process-payment.dto.js';
import { ErrorResponse, TransactionResponse } from './dto/responses.js';
import { unwrapOrThrow } from './utils/result-http.js';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransaction: CreateTransactionUseCase,
    private readonly getTransaction: GetTransactionUseCase,
    private readonly processCheckout: ProcessCheckoutUseCase,
  ) {}

  @ApiOperation({ summary: 'Quote a transaction for a product and customer' })
  @ApiCreatedResponse({
    description: 'Pending transaction created with the total to pay',
    type: TransactionResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid transaction data',
    type: ErrorResponse,
  })
  @ApiNotFoundResponse({
    description: 'Product or customer not found',
    type: ErrorResponse,
  })
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

  @ApiOperation({ summary: 'Get a transaction by id' })
  @ApiParam({ name: 'id', description: 'Transaction identifier' })
  @ApiOkResponse({ type: TransactionResponse })
  @ApiNotFoundResponse({
    description: 'Transaction not found',
    type: ErrorResponse,
  })
  @Get(':id')
  async get(@Param('id') id: string): Promise<unknown> {
    return unwrapOrThrow(await this.getTransaction.execute(id));
  }

  @ApiOperation({ summary: 'Process a pending transaction with a card' })
  @ApiParam({ name: 'id', description: 'Transaction identifier' })
  @ApiOkResponse({
    description:
      'Processing result. On approval the delivery is assigned and stock reduced.',
    type: TransactionResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid card data',
    type: ErrorResponse,
  })
  @ApiNotFoundResponse({
    description: 'Transaction not found',
    type: ErrorResponse,
  })
  @ApiConflictResponse({
    description: 'Transaction is not pending or there is not enough stock',
    type: ErrorResponse,
  })
  @ApiBadGatewayResponse({
    description: 'Payment gateway unavailable',
    type: ErrorResponse,
  })
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
