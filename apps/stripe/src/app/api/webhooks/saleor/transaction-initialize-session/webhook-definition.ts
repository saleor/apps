import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";

import { verifyWebhookSignature } from "@/app/api/webhooks/saleor/verify-signature";
import {
  TransactionInitializeSessionDocument,
  TransactionInitializeSessionEventFragment,
} from "@/generated/graphql";
import { saleorApp } from "@/lib/saleor-app";

export const transactionInitializeSessionWebhookDefinition =
  new SaleorSyncWebhook<TransactionInitializeSessionEventFragment>({
    apl: saleorApp.apl,
    event: "TRANSACTION_INITIALIZE_SESSION",
    name: "Stripe Transaction Initialize Session",
    isActive: true,
    query: TransactionInitializeSessionDocument,
    webhookPath: "api/webhooks/saleor/transaction-initialize-session",
    verifySignatureFn: (jwks, signature, rawBody) => {
      return verifyWebhookSignature(jwks, signature, rawBody);
    },
  });
