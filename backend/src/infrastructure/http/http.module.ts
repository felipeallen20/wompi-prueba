import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import helmet from 'helmet';
import { PersistenceModule } from '../persistence/persistence.module.js';
import { PaymentGatewayModule } from '../payment-gateway/payment-gateway.module.js';
import { buildValidationPipe } from './validation/validation.pipe.js';
import { AllExceptionsFilter } from './filters/all-exceptions.filter.js';
import {
  CUSTOMER_REPOSITORY,
  DELIVERY_REPOSITORY,
  PRODUCT_REPOSITORY,
  TRANSACTION_REPOSITORY,
} from '../persistence/persistence.tokens.js';
import { PAYMENT_GATEWAY } from '../payment-gateway/payment-gateway.tokens.js';
import type { CustomerRepository } from '../../domain/ports/customer-repository.js';
import type { DeliveryRepository } from '../../domain/ports/delivery-repository.js';
import type { ProductRepository } from '../../domain/ports/product-repository.js';
import type { TransactionRepository } from '../../domain/ports/transaction-repository.js';
import type { PaymentGateway } from '../../domain/ports/payment-gateway.js';
import { CreateTransactionUseCase } from '../../application/create-transaction/create-transaction.use-case.js';
import { ProcessPaymentUseCase } from '../../application/process-payment/process-payment.use-case.js';
import { UpdateStockUseCase } from '../../application/update-stock/update-stock.use-case.js';
import { AssignDeliveryUseCase } from '../../application/assign-delivery/assign-delivery.use-case.js';
import { CreateCustomerUseCase } from '../../application/create-customer/create-customer.use-case.js';
import { CreateDeliveryUseCase } from '../../application/create-delivery/create-delivery.use-case.js';
import { ListProductsUseCase } from '../../application/list-products/list-products.use-case.js';
import { GetProductUseCase } from '../../application/get-product/get-product.use-case.js';
import { GetTransactionUseCase } from '../../application/get-transaction/get-transaction.use-case.js';
import { ProcessCheckoutUseCase } from '../../application/process-checkout/process-checkout.use-case.js';
import { HealthController } from './health.controller.js';
import { ProductsController } from './products.controller.js';
import { CustomersController } from './customers.controller.js';
import { TransactionsController } from './transactions.controller.js';
import { DeliveriesController } from './deliveries.controller.js';

@Module({
  imports: [PersistenceModule, PaymentGatewayModule],
  controllers: [
    HealthController,
    ProductsController,
    CustomersController,
    TransactionsController,
    DeliveriesController,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_PIPE, useFactory: () => buildValidationPipe() },
    {
      provide: CreateTransactionUseCase,
      useFactory: (
        productRepository: ProductRepository,
        transactionRepository: TransactionRepository,
      ) =>
        new CreateTransactionUseCase(productRepository, transactionRepository),
      inject: [PRODUCT_REPOSITORY, TRANSACTION_REPOSITORY],
    },
    {
      provide: ProcessPaymentUseCase,
      useFactory: (
        transactionRepository: TransactionRepository,
        customerRepository: CustomerRepository,
        paymentGateway: PaymentGateway,
      ) =>
        new ProcessPaymentUseCase(
          transactionRepository,
          customerRepository,
          paymentGateway,
        ),
      inject: [TRANSACTION_REPOSITORY, CUSTOMER_REPOSITORY, PAYMENT_GATEWAY],
    },
    {
      provide: UpdateStockUseCase,
      useFactory: (
        transactionRepository: TransactionRepository,
        productRepository: ProductRepository,
      ) => new UpdateStockUseCase(transactionRepository, productRepository),
      inject: [TRANSACTION_REPOSITORY, PRODUCT_REPOSITORY],
    },
    {
      provide: AssignDeliveryUseCase,
      useFactory: (
        transactionRepository: TransactionRepository,
        deliveryRepository: DeliveryRepository,
      ) => new AssignDeliveryUseCase(transactionRepository, deliveryRepository),
      inject: [TRANSACTION_REPOSITORY, DELIVERY_REPOSITORY],
    },
    {
      provide: CreateCustomerUseCase,
      useFactory: (customerRepository: CustomerRepository) =>
        new CreateCustomerUseCase(customerRepository),
      inject: [CUSTOMER_REPOSITORY],
    },
    {
      provide: CreateDeliveryUseCase,
      useFactory: (
        customerRepository: CustomerRepository,
        deliveryRepository: DeliveryRepository,
      ) => new CreateDeliveryUseCase(customerRepository, deliveryRepository),
      inject: [CUSTOMER_REPOSITORY, DELIVERY_REPOSITORY],
    },
    {
      provide: ListProductsUseCase,
      useFactory: (productRepository: ProductRepository) =>
        new ListProductsUseCase(productRepository),
      inject: [PRODUCT_REPOSITORY],
    },
    {
      provide: GetProductUseCase,
      useFactory: (productRepository: ProductRepository) =>
        new GetProductUseCase(productRepository),
      inject: [PRODUCT_REPOSITORY],
    },
    {
      provide: GetTransactionUseCase,
      useFactory: (transactionRepository: TransactionRepository) =>
        new GetTransactionUseCase(transactionRepository),
      inject: [TRANSACTION_REPOSITORY],
    },
    {
      provide: ProcessCheckoutUseCase,
      useFactory: (
        processPayment: ProcessPaymentUseCase,
        assignDelivery: AssignDeliveryUseCase,
        updateStock: UpdateStockUseCase,
      ) =>
        new ProcessCheckoutUseCase(processPayment, assignDelivery, updateStock),
      inject: [
        ProcessPaymentUseCase,
        AssignDeliveryUseCase,
        UpdateStockUseCase,
      ],
    },
  ],
})
export class HttpModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(
        helmet({
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              objectSrc: ["'none'"],
              scriptSrc: ["'self'", "'unsafe-inline'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
            },
          },
        }),
      )
      .forRoutes('*');
  }
}
