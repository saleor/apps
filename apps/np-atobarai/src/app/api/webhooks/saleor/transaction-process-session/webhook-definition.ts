import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";

import {
  TransactionProcessSessionDocument,
  TransactionProcessSessionEventFragment,
} from "@/generated/graphql";
import { createLogger } from "@/lib/logger";
import { saleorApp } from "@/lib/saleor-app";

export const transactionProcessSessionWebhookDefinition =
  new SaleorSyncWebhook<TransactionProcessSessionEventFragment>({
    apl: saleorApp.apl,
    event: "TRANSACTION_PROCESS_SESSION",
    name: "NP Atobarai Transaction Process Session",
    isActive: true,
    query: TransactionProcessSessionDocument,
    webhookPath: "api/webhooks/saleor/transaction-process-session",
    onError(error) {
      createLogger("TRANSACTION_PROCESS_SESSION webhook").error("Failed to execute webhook", {
        error,
      });
    },
  });
