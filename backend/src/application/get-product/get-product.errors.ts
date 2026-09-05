export type GetProductError =
  | { readonly code: 'INVALID_INPUT'; readonly message: string }
  | { readonly code: 'PRODUCT_NOT_FOUND'; readonly message: string };
