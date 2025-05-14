import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";

import {
  TransactionChargeRequestedDocument,
  TransactionChargeRequestedEventFragment,
} from "@/generated/graphql";
import { saleorApp } from "@/lib/saleor-app";

export const transactionChargeRequestedWebhookDefinition =
  new SaleorSyncWebhook<TransactionChargeRequestedEventFragment>({
    apl: saleorApp.apl,
    event: "TRANSACTION_CHARGE_REQUESTED",
    name: "Stripe Transaction Charge Requested",
    isActive: true,
    query: TransactionChargeRequestedDocument,
    webhookPath: "api/webhooks/saleor/transaction-charge-requested",
  });
