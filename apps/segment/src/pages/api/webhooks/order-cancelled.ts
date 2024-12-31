import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";

import { SegmentNotConfiguredError } from "@/errors";
import { OrderUpdatedSubscriptionPayloadFragment } from "@/generated/graphql";
import { createLogger } from "@/logger";
import { loggerContext } from "@/logger-context";
import { createSegmentClientForWebhookContext } from "@/modules/create-segment-client-for-webhook-context";
import { trackingEventFactory } from "@/modules/tracking-events/tracking-events";
import { orderCancelledAsyncWebhook } from "@/modules/webhooks/definitions/order-cancelled";

export const config = {
  api: {
    bodyParser: false,
  },
};

const logger = createLogger("orderCancelledAsyncWebhook");

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

    logger.info("Sending order cancelled event to Segment");

    await segmentEventTracker.trackEvent(
      trackingEventFactory.createOrderCancelledEvent(payload.order),
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
  orderCancelledAsyncWebhook.createHandler(handler),
  loggerContext,
);
