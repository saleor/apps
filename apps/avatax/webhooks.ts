import { checkoutCalculateTaxesSyncWebhook } from "./src/modules/webhooks/definitions/checkout-calculate-taxes";
import { orderCalculateTaxesSyncWebhook } from "./src/modules/webhooks/definitions/order-calculate-taxes";
import { orderCancelledAsyncWebhook } from "./src/modules/webhooks/definitions/order-cancelled";
import { orderConfirmedAsyncWebhook } from "./src/modules/webhooks/definitions/order-confirmed";
import { checkoutCalculateTaxesSyncWebhook2 } from "@/wh";

export const appWebhooks = [
  // checkoutCalculateTaxesSyncWebhook,
  orderCalculateTaxesSyncWebhook,
  orderCancelledAsyncWebhook,
  orderConfirmedAsyncWebhook,
  checkoutCalculateTaxesSyncWebhook2,
];
