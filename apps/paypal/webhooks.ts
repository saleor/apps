import { transactionChargeRequestedWebhookDefinition } from "./src/app/api/webhooks/saleor/transaction-charge-requested/webhook-definition";
import { transactionCancelationRequestedWebhookDefinition } from "./src/app/api/webhooks/saleor/transaction-cancelation-requested/webhook-definition";
import { transactionRefundRequestedWebhookDefinition } from "./src/app/api/webhooks/saleor/transaction-refund-requested/webhook-definition";
import { transactionInitializeSessionWebhookDefinition } from "./src/app/api/webhooks/saleor/transaction-initialize-session/webhook-definition";
import { transactionProcessSessionWebhookDefinition } from "./src/app/api/webhooks/saleor/transaction-process-session/webhook-definition";
import { paymentGatewayInitializeSessionWebhookDefinition } from "./src/app/api/webhooks/saleor/payment-gateway-initialize-session/webhook-definition";

export const webhooks = [
  transactionChargeRequestedWebhookDefinition,
  transactionCancelationRequestedWebhookDefinition,
  transactionRefundRequestedWebhookDefinition,
  transactionInitializeSessionWebhookDefinition,
  transactionProcessSessionWebhookDefinition,
  paymentGatewayInitializeSessionWebhookDefinition,
] as const;