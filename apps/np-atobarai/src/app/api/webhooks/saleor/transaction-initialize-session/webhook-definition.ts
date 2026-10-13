import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";

import {
  TransactionInitializeSessionDocument,
  type TransactionInitializeSessionEventFragment,
} from "@/generated/graphql";
import { createWebhookErrorHandler } from "@/lib/create-webhook-error-handler";
import { saleorApp } from "@/lib/saleor-app";

export const transactionInitializeSessionWebhookDefinition =
  new SaleorSyncWebhook<TransactionInitializeSessionEventFragment>({
    apl: saleorApp.apl,
    event: "TRANSACTION_INITIALIZE_SESSION",
    name: "NP Atobarai Transaction Initialize Session",
    isActive: true,
    query: TransactionInitializeSessionDocument,
    webhookPath: "api/webhooks/saleor/transaction-initialize-session",
    onError: createWebhookErrorHandler("TRANSACTION_INITIALIZE_SESSION webhook"),
  });
