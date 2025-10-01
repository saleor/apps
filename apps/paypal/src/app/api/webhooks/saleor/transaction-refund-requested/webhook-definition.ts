import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";

import {
  TransactionRefundRequestedDocument,
  TransactionRefundRequestedEventFragment,
} from "@/generated/graphql";
import { saleorApp } from "@/lib/saleor-app";
import { verifyWebhookSignature } from "../verify-signature";

export const transactionRefundRequestedWebhookDefinition =
  new SaleorSyncWebhook<TransactionRefundRequestedEventFragment>({
    apl: saleorApp.apl,
    event: "TRANSACTION_REFUND_REQUESTED",
    name: "PayPal Transaction Refund Requested",
    isActive: true,
    query: TransactionRefundRequestedDocument,
    webhookPath: "api/webhooks/saleor/transaction-refund-requested",
    verifySignatureFn: (jwks, signature, rawBody) => {
      return verifyWebhookSignature(jwks, signature, rawBody);
    },
  });
