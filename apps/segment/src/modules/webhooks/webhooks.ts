import { orderCancelledAsyncWebhook } from "./definitions/order-cancelled";
import { orderConfirmedAsyncWebhook } from "./definitions/order-confirmed";
import { orderRefundedAsyncWebhook } from "./definitions/order-refunded";
import { orderUpdatedAsyncWebhook } from "./definitions/order-updated";

export const appWebhooks = [
  orderCancelledAsyncWebhook,
  orderConfirmedAsyncWebhook,
  orderRefundedAsyncWebhook,
  orderUpdatedAsyncWebhook,
];
