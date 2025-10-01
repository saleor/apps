import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";

import { saleorApp } from "@/lib/saleor-app";

import { verifyWebhookSignature } from "../verify-signature";

// Temporary placeholder - will be replaced by generated types
type TransactionChargeRequestedEventFragment = any;
const TransactionChargeRequestedDocument = "";

export const transactionChargeRequestedWebhookDefinition =
  new SaleorSyncWebhook<TransactionChargeRequestedEventFragment>({
    apl: saleorApp.apl,
    event: "TRANSACTION_CHARGE_REQUESTED",
    name: "PayPal Transaction Charge Requested",
    isActive: true,
    query: TransactionChargeRequestedDocument,
    webhookPath: "api/webhooks/saleor/transaction-charge-requested",
    verifySignatureFn: (jwks, signature, rawBody) => {
      return verifyWebhookSignature(jwks, signature, rawBody);
    },
  });
