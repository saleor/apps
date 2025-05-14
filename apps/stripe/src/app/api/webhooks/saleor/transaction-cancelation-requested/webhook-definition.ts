import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";

import {
  TransactionCancelationRequestedDocument,
  TransactionCancelationRequestedEventFragment,
} from "@/generated/graphql";
import { saleorApp } from "@/lib/saleor-app";

export const transactionCancelationRequestedWebhookDefinition =
  new SaleorSyncWebhook<TransactionCancelationRequestedEventFragment>({
    apl: saleorApp.apl,
    event: "TRANSACTION_CANCELATION_REQUESTED",
    name: "Stripe Transaction Cancelation Requested",
    isActive: true,
    query: TransactionCancelationRequestedDocument,
    webhookPath: "api/webhooks/saleor/transaction-cancelation-requested",
  });
