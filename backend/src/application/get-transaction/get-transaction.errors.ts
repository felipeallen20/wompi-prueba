export type GetTransactionError =
  | { readonly code: 'INVALID_INPUT'; readonly message: string }
  | { readonly code: 'TRANSACTION_NOT_FOUND'; readonly message: string };
