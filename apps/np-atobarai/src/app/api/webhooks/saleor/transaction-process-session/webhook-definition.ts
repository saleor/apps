import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";

import {
  TransactionProcessSessionDocument,
  type TransactionProcessSessionEventFragment,
} from "@/generated/graphql";
import { createWebhookErrorHandler } from "@/lib/create-webhook-error-handler";
import { saleorApp } from "@/lib/saleor-app";

export const transactionProcessSessionWebhookDefinition =
  new SaleorSyncWebhook<TransactionProcessSessionEventFragment>({
    apl: saleorApp.apl,
    event: "TRANSACTION_PROCESS_SESSION",
    name: "NP Atobarai Transaction Process Session",
    isActive: true,
    query: TransactionProcessSessionDocument,
    webhookPath: "api/webhooks/saleor/transaction-process-session",
    onError: createWebhookErrorHandler("TRANSACTION_PROCESS_SESSION webhook"),
  });
