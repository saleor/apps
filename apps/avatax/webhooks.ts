import { checkoutCalculateTaxesSyncWebhook } from "./src/modules/webhooks/definitions/checkout-calculate-taxes";
import { orderCalculateTaxesSyncWebhook } from "./src/modules/webhooks/definitions/order-calculate-taxes";
import { orderCancelledAsyncWebhook } from "./src/modules/webhooks/definitions/order-cancelled";
import { orderConfirmedAsyncWebhook } from "./src/modules/webhooks/definitions/order-confirmed";
// import { OrderCalculateTaxesWebhook } from "./src/modules/calculate-taxes/order-calculate-taxes/order-calculate-taxes.webhook";

export const appWebhooks = [
  checkoutCalculateTaxesSyncWebhook,
  // orderCalculateTaxesSyncWebhook, // todo -> refactor to v2
  orderCancelledAsyncWebhook,
  orderConfirmedAsyncWebhook,
  orderCalculateTaxesSyncWebhook,
];
