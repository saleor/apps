import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";

import {
  TransactionRefundRequestedEventSubscriptionFragment,
  UntypedTransactionRefundRequestedSubscriptionDocument,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { createLogger } from "../../../lib/logger";
import { WebhookResponse } from "../../../modules/app/webhook-response";
import { getActiveConnectionService } from "../../../modules/taxes/get-active-connection-service";

export const config = {
  api: {
    bodyParser: false,
  },
};

export type TransactionRefundRequestedPayload = Extract<
  TransactionRefundRequestedEventSubscriptionFragment,
  { __typename: "TransactionRefundRequested" }
>;

export const transactionRefundRequestedSyncWebhook =
  new SaleorSyncWebhook<TransactionRefundRequestedPayload>({
    name: "TransactionRefundRequested",
    apl: saleorApp.apl,
    event: "TRANSACTION_REFUND_REQUESTED",
    query: UntypedTransactionRefundRequestedSubscriptionDocument,
    webhookPath: "/api/webhooks/transaction-refund-requested",
  });

export default transactionRefundRequestedSyncWebhook.createHandler(async (req, res, ctx) => {
  const logger = createLogger({ event: ctx.event });
  const { payload, authData } = ctx;
  const webhookResponse = new WebhookResponse(res);

  logger.info("Handler called with payload");

  try {
    const order = payload.transaction?.sourceObject;

    if (!order) {
      throw new Error("Insufficient order data");
    }

    const appMetadata = payload.recipient?.privateMetadata ?? [];
    const channelSlug = order.channel.slug;
    const taxProvider = getActiveConnectionService(channelSlug, appMetadata, ctx.authData);

    logger.info("Refunding transaction...");

    const confirmedOrder = await taxProvider.refundTransaction(payload);

    logger.info({ confirmedOrder }, "Transaction refunded");

    return webhookResponse.success();
  } catch (error) {
    logger.error({ error });
    return webhookResponse.error(error);
  }
});
