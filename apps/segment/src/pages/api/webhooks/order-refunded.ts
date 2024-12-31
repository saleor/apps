import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";

import { OrderRefundedSubscriptionPayloadFragment } from "@/generated/graphql";
import { createLogger } from "@/logger";
import { loggerContext } from "@/logger-context";
import {
  createSegmentClientForWebhookContext,
  SegmentWriteKeyNotFoundError,
} from "@/modules/create-segment-client-for-webhook-context";
import { trackingEventFactory } from "@/modules/tracking-events/tracking-events";
import { orderRefundedAsyncWebhook } from "@/modules/webhooks/definitions/order-refunded";

export const config = {
  api: {
    bodyParser: false,
  },
};

const logger = createLogger("orderRefundedAsyncWebhook");

const handler: NextWebhookApiHandler<OrderRefundedSubscriptionPayloadFragment> = async (
  req,
  res,
  context,
) => {
  const { authData, payload } = context;

  if (!payload.order) {
    logger.info("Payload does not contain order data. Skipping.");

    return res
      .status(200)
      .json({ message: "Payload does not contain order data. It will be skipped by app" });
  }

  loggerContext.set(ObservabilityAttributes.ORDER_ID, payload.order.id);

  try {
    const segmentEventTracker = await createSegmentClientForWebhookContext({ authData });

    await segmentEventTracker.trackEvent(
      trackingEventFactory.createOrderRefundedEvent(payload.order),
    );

    logger.info("Order refunded event successfully sent to Segment");

    return res.status(200).json({ message: "Order refunded event successfully sent to Segment" });
  } catch (e) {
    if (e instanceof SegmentWriteKeyNotFoundError) {
      // todo disable webhooks if not configured

      logger.warn(
        "Segment write key is not set in app configuration. Contact client to fix the issue.",
      );

      return res.status(200).json({
        message: "Segment write key is not set in app configuration. Cannot send event to Segment.",
      });
    }

    logger.error("Error while sending order refunded event to Segment", { error: e });

    return res.status(500).json({ message: "Error while sending order refunded event to Segment" });
  }
};

export default wrapWithLoggerContext(
  orderRefundedAsyncWebhook.createHandler(handler),
  loggerContext,
);
