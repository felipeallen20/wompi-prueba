export type ProcessPaymentError =
  | { readonly code: 'INVALID_INPUT'; readonly message: string }
  | { readonly code: 'TRANSACTION_NOT_FOUND'; readonly message: string }
  | { readonly code: 'CUSTOMER_NOT_FOUND'; readonly message: string }
  | { readonly code: 'TRANSACTION_ALREADY_PROCESSED'; readonly message: string }
  | { readonly code: 'PAYMENT_GATEWAY_ERROR'; readonly message: string };
