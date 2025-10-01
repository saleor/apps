import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";
import { saleorApp } from "@/lib/saleor-app";
import { verifyWebhookSignature } from "../verify-signature";

type TransactionCancelationRequestedEventFragment = any;
const TransactionCancelationRequestedDocument = "";

export const transactionCancelationRequestedWebhookDefinition =
  new SaleorSyncWebhook<TransactionCancelationRequestedEventFragment>({
    apl: saleorApp.apl,
    event: "TRANSACTION_CANCELATION_REQUESTED",
    name: "PayPal Transaction Cancelation Requested",
    isActive: true,
    query: TransactionCancelationRequestedDocument,
    webhookPath: "api/webhooks/saleor/transaction-cancelation-requested",
    verifySignatureFn: (jwks, signature, rawBody) => {
      return verifyWebhookSignature(jwks, signature, rawBody);
    },
  });
