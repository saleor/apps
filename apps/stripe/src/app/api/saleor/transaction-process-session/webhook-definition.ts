import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";

import { TransactionProcessSession, TransactionProcessSessionDocument } from "@/generated/graphql";
import { saleorApp } from "@/lib/saleor-app";

export const transactionProcessSessionWebhookDefinition =
  new SaleorSyncWebhook<TransactionProcessSession>({
    apl: saleorApp.apl,
    event: "TRANSACTION_INITIALIZE_SESSION",
    name: "Stripe Transaction Initialize Session",
    isActive: true, // TODO: disable in production
    query: TransactionProcessSessionDocument,
    webhookPath: "api/saleor/transaction-process-session",
  });
