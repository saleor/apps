import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";

import { verifyWebhookSignature } from "@/app/api/webhooks/saleor/verify-signature";
import {
  TransactionProcessSessionDocument,
  TransactionProcessSessionEventFragment,
} from "@/generated/graphql";
import { saleorApp } from "@/lib/saleor-app";

export const transactionProcessSessionWebhookDefinition =
  new SaleorSyncWebhook<TransactionProcessSessionEventFragment>({
    apl: saleorApp.apl,
    event: "TRANSACTION_PROCESS_SESSION",
    name: "PayPal Transaction Process Session",
    isActive: true,
    query: TransactionProcessSessionDocument,
    webhookPath: "api/webhooks/saleor/transaction-process-session",
    verifySignatureFn: (jwks, signature, rawBody) => {
      return verifyWebhookSignature(jwks, signature, rawBody);
    },
  });