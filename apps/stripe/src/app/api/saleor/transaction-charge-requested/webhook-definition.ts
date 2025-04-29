import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";

import {
  TransactionChargeRequested,
  TransactionChargeRequestedDocument,
} from "@/generated/graphql";
import { saleorApp } from "@/lib/saleor-app";

export const transactionChargeRequestedWebhookDefinition =
  new SaleorSyncWebhook<TransactionChargeRequested>({
    apl: saleorApp.apl,
    event: "TRANSACTION_CHARGE_REQUESTED",
    name: "Stripe Transaction Charge Requested",
    isActive: true,
    query: TransactionChargeRequestedDocument,
    webhookPath: "api/saleor/transaction-charge-requested",
  });
