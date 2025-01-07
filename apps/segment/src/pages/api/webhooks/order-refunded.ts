import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";

import { SegmentNotConfiguredError } from "@/errors";
import { OrderRefundedSubscriptionPayloadFragment } from "@/generated/graphql";
import { createLogger } from "@/logger";
import { loggerContext } from "@/logger-context";
import { createSegmentClientForWebhookContext } from "@/modules/create-segment-client-for-webhook-context";
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

export default wrapWithLoggerContext(
  orderRefundedAsyncWebhook.createHandler(handler),
  loggerContext,
);
