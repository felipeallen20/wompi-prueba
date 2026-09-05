import type { ProcessPaymentError } from '../process-payment/process-payment.errors.js';
import type { AssignDeliveryError } from '../assign-delivery/assign-delivery.errors.js';
import type { UpdateStockError } from '../update-stock/update-stock.errors.js';

export type ProcessCheckoutError =
  ProcessPaymentError | AssignDeliveryError | UpdateStockError;
