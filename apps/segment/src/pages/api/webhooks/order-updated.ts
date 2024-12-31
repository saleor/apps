import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";

import { SegmentNotConfiguredError } from "@/errors";
import { OrderUpdatedSubscriptionPayloadFragment } from "@/generated/graphql";
import { createLogger } from "@/logger";
import { loggerContext, wrapWithLoggerContext } from "@/logger-context";
import { createSegmentClientForWebhookContext } from "@/modules/create-segment-client-for-webhook-context";
import { trackingEventFactory } from "@/modules/tracking-events/tracking-events";
import { orderUpdatedAsyncWebhook } from "@/modules/webhooks/definitions/order-updated";

export const config = {
  api: {
    bodyParser: false,
  },
};

const logger = createLogger("orderUpdatedAsyncWebhook");

const handler: NextWebhookApiHandler<OrderUpdatedSubscriptionPayloadFragment> = async (
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

    logger.info("Sending order updated event to Segment");

    await segmentEventTracker.trackEvent(
      trackingEventFactory.createOrderUpdatedEvent(payload.order),
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
  orderUpdatedAsyncWebhook.createHandler(handler),
  loggerContext,
);
