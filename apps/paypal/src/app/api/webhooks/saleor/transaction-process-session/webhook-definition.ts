import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";

import {
  TransactionProcessSessionDocument,
  TransactionProcessSessionEventFragment,
} from "@/generated/graphql";
import { saleorApp } from "@/lib/saleor-app";

import { verifyWebhookSignature } from "../verify-signature";

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
