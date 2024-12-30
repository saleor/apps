import { createSegmentClientForWebhookContext } from "@/modules/create-segment-client-for-webhook-context";
import { trackingEventFactory } from "@/modules/tracking-events/tracking-events";
import { saleorApp } from "@/saleor-app";
import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  OrderRefundedDocument,
  OrderRefundedSubscriptionPayloadFragment,
} from "../../../../generated/graphql";

import { SegmentNotConfiguredError } from "@/errors";
import { createLogger } from "@/logger";
import { loggerContext } from "@/logger-context";
import { wrapWithLoggerContext } from "@/logger-context";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const orderRefundedWebhook =
  new SaleorAsyncWebhook<OrderRefundedSubscriptionPayloadFragment>({
    name: "Order Refunded v1",
    webhookPath: "api/webhooks/order-refunded",
    event: "ORDER_REFUNDED",
    apl: saleorApp.apl,
    query: OrderRefundedDocument,
  });

const logger = createLogger("orderRefundedAsyncWebhook");

const handler: NextWebhookApiHandler<OrderRefundedSubscriptionPayloadFragment> = async (
  req,
  res,
  context,
) => {
  const { authData, payload } = context;

  if (!payload.order) {
    return res.status(400).end();
  }

  try {
    const segmentEventTracker = await createSegmentClientForWebhookContext({ authData });

    logger.info("Sending order refunded event to Segment");

    await segmentEventTracker.trackEvent(
      trackingEventFactory.createOrderRefundedEvent(payload.order),
    );

    return res.status(200).end();
  } catch (e) {
    if (e instanceof SegmentNotConfiguredError) {
      // todo disable webhooks if not configured

      return res.status(200).end();
    }

    return res.status(500).end();
  }
};

export default wrapWithLoggerContext(orderRefundedWebhook.createHandler(handler), loggerContext);
