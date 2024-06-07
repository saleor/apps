import { SegmentNotConfiguredError } from "@/errors";
import { loggerContext } from "@/logger-context";
import { createSegmentClientForWebhookContext } from "@/modules/create-segment-client-for-webhook-context";
import { trackingEventFactory } from "@/modules/tracking-events/tracking-events";
import { saleorApp } from "@/saleor-app";
import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { createLogger } from "@saleor/apps-logger";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import * as Sentry from "@sentry/nextjs";
import {
  OrderUpdatedDocument,
  OrderUpdatedSubscriptionPayloadFragment,
} from "../../../../generated/graphql";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const orderUpdatedWebhook = new SaleorAsyncWebhook<OrderUpdatedSubscriptionPayloadFragment>({
  name: "Order Updated v1",
  webhookPath: "api/webhooks/order-updated",
  event: "ORDER_UPDATED",
  apl: saleorApp.apl,
  query: OrderUpdatedDocument,
});

const logger = createLogger("orderUpdatedAsyncWebhook");

const handler: NextWebhookApiHandler<OrderUpdatedSubscriptionPayloadFragment> = async (
  req,
  res,
  context,
) => {
  const { authData, payload } = context;

  if (!payload.order) {
    Sentry.captureException(new Error("Order not found in payload. This should not happen."));

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

    Sentry.captureException(e);

    return res.status(500).end();
  }
};

export default wrapWithLoggerContext(orderUpdatedWebhook.createHandler(handler), loggerContext);
