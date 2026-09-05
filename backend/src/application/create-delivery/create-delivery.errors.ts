export type CreateDeliveryError =
  | { readonly code: 'INVALID_INPUT'; readonly message: string }
  | { readonly code: 'CUSTOMER_NOT_FOUND'; readonly message: string };
