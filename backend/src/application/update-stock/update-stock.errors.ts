export type UpdateStockError =
  | { readonly code: 'INVALID_INPUT'; readonly message: string }
  | { readonly code: 'TRANSACTION_NOT_FOUND'; readonly message: string }
  | { readonly code: 'TRANSACTION_NOT_APPROVED'; readonly message: string }
  | { readonly code: 'INSUFFICIENT_STOCK'; readonly message: string };
