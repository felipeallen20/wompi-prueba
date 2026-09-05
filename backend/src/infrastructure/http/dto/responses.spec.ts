import {
  CustomerResponse,
  DeliveryResponse,
  ErrorResponse,
  ProductResponse,
  TransactionResponse,
} from './responses.js';

describe('API response models', () => {
  it('mirror the product JSON shape returned by the API', () => {
    const payload = Object.assign(new ProductResponse(), {
      id: 'product-1',
      name: 'Mechanical Keyboard',
      description: 'RGB backlit mechanical keyboard',
      price: 350000,
      imageUrl: 'https://cdn.example.com/keyboard.png',
      stock: { productId: 'product-1', quantityAvailable: 3 },
    });

    expect(payload).toEqual({
      id: 'product-1',
      name: 'Mechanical Keyboard',
      description: 'RGB backlit mechanical keyboard',
      price: 350000,
      imageUrl: 'https://cdn.example.com/keyboard.png',
      stock: { productId: 'product-1', quantityAvailable: 3 },
    });
  });

  it('mirror the customer JSON shape returned by the API', () => {
    const payload = Object.assign(new CustomerResponse(), {
      id: 'customer-1',
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '+573001234567',
    });

    expect(payload).toEqual({
      id: 'customer-1',
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '+573001234567',
    });
  });

  it('mirror the delivery JSON shape returned by the API', () => {
    const payload = Object.assign(new DeliveryResponse(), {
      id: 'delivery-1',
      customerId: 'customer-1',
      address: 'Cra 15 # 123-45, Apartamento 401',
      city: 'Bogota',
      status: 'PENDING',
    });

    expect(payload).toEqual({
      id: 'delivery-1',
      customerId: 'customer-1',
      address: 'Cra 15 # 123-45, Apartamento 401',
      city: 'Bogota',
      status: 'PENDING',
    });
  });

  it('mirror the transaction JSON shape returned by the API', () => {
    const createdAt = new Date('2026-09-05T00:00:00.000Z');
    const payload = Object.assign(new TransactionResponse(), {
      id: 'transaction-1',
      productId: 'product-1',
      customerId: 'customer-1',
      deliveryId: null,
      status: 'APPROVED',
      amount: 385000,
      baseFee: 35000,
      deliveryFee: 0,
      gatewayReference: 'sandbox-transaction-1-ref',
      createdAt,
      updatedAt: createdAt,
    });

    expect(payload).toEqual({
      id: 'transaction-1',
      productId: 'product-1',
      customerId: 'customer-1',
      deliveryId: null,
      status: 'APPROVED',
      amount: 385000,
      baseFee: 35000,
      deliveryFee: 0,
      gatewayReference: 'sandbox-transaction-1-ref',
      createdAt,
      updatedAt: createdAt,
    });
  });

  it('mirror the error JSON shape returned by the API', () => {
    const payload = Object.assign(new ErrorResponse(), {
      statusCode: 404,
      code: 'PRODUCT_NOT_FOUND',
      message: 'Product product-1 was not found',
    });

    expect(payload).toEqual({
      statusCode: 404,
      code: 'PRODUCT_NOT_FOUND',
      message: 'Product product-1 was not found',
    });
  });
});
