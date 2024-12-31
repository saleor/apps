import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";

import { SegmentNotConfiguredError } from "@/errors";
import { OrderCreatedSubscriptionPayloadFragment } from "@/generated/graphql";
import { createLogger } from "@/logger";
import { loggerContext, wrapWithLoggerContext } from "@/logger-context";
import { createSegmentClientForWebhookContext } from "@/modules/create-segment-client-for-webhook-context";
import { trackingEventFactory } from "@/modules/tracking-events/tracking-events";
import { orderCreatedAsyncWebhook } from "@/modules/webhooks/definitions/order-created";

export const config = {
  api: {
    bodyParser: false,
  },
};

const logger = createLogger("orderCreatedSyncWebhook");

const handler: NextWebhookApiHandler<OrderCreatedSubscriptionPayloadFragment> = async (
  req,
  res,
  context,
) => {
  const { authData, payload } = context;

  if (!payload.order) {
    return res.status(200).end();
  }

  try {
    const segmentEventTracker = await createSegmentClientForWebhookContext({ authData });

    logger.info("Sending order created event to Segment");

    await segmentEventTracker.trackEvent(
      trackingEventFactory.createOrderCreatedEvent(payload.order),
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
  orderCreatedAsyncWebhook.createHandler(handler),
  loggerContext,
);
