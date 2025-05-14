import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";

import {
  TransactionRefundRequestedDocument,
  TransactionRefundRequestedEventFragment,
} from "@/generated/graphql";
import { saleorApp } from "@/lib/saleor-app";

export const transactionRefundRequestedWebhookDefinition =
  new SaleorSyncWebhook<TransactionRefundRequestedEventFragment>({
    apl: saleorApp.apl,
    event: "TRANSACTION_REFUND_REQUESTED",
    name: "Stripe Transaction Refund Requested",
    isActive: true,
    query: TransactionRefundRequestedDocument,
    webhookPath: "api/webhooks/saleor/transaction-refund-requested",
  });
