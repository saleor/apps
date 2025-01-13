import { orderCancelledAsyncWebhook } from "./definitions/order-cancelled";
import { orderCreatedAsyncWebhook } from "./definitions/order-created";
import { orderFullyPaidAsyncWebhook } from "./definitions/order-fully-paid";
import { orderRefundedAsyncWebhook } from "./definitions/order-refunded";
import { orderUpdatedAsyncWebhook } from "./definitions/order-updated";

export const appWebhooks = [
  orderCancelledAsyncWebhook,
  orderCreatedAsyncWebhook,
  orderFullyPaidAsyncWebhook,
  orderRefundedAsyncWebhook,
  orderUpdatedAsyncWebhook,
];
