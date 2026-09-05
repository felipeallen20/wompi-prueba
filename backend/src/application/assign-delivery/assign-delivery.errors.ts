export type AssignDeliveryError =
  | { readonly code: 'INVALID_INPUT'; readonly message: string }
  | { readonly code: 'TRANSACTION_NOT_FOUND'; readonly message: string }
  | { readonly code: 'TRANSACTION_NOT_APPROVED'; readonly message: string }
  | { readonly code: 'DELIVERY_NOT_FOUND'; readonly message: string }
  | { readonly code: 'DELIVERY_CUSTOMER_MISMATCH'; readonly message: string };
