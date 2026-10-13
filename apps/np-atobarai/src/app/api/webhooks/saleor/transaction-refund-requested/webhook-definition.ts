import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";

import {
  TransactionRefundRequestedDocument,
  type TransactionRefundRequestedEventFragment,
} from "@/generated/graphql";
import { createWebhookErrorHandler } from "@/lib/create-webhook-error-handler";
import { saleorApp } from "@/lib/saleor-app";

export const transactionRefundRequestedWebhookDefinition =
  new SaleorSyncWebhook<TransactionRefundRequestedEventFragment>({
    apl: saleorApp.apl,
    event: "TRANSACTION_REFUND_REQUESTED",
    name: "NP Atobarai Transaction Refund Requested",
    isActive: true,
    query: TransactionRefundRequestedDocument,
    webhookPath: "api/webhooks/saleor/transaction-refund-requested",
    onError: createWebhookErrorHandler("TRANSACTION_REFUND_REQUESTED webhook"),
  });
