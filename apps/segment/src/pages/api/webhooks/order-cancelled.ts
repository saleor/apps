import { createSegmentClientForWebhookContext } from "@/modules/create-segment-client-for-webhook-context";
import { trackingEventFactory } from "@/modules/tracking-events/tracking-events";
import { saleorApp } from "@/saleor-app";
import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  OrderCancelledDocument,
  OrderUpdatedSubscriptionPayloadFragment,
} from "../../../../generated/graphql";
import * as Sentry from "@sentry/nextjs";
import { SegmentNotConfiguredError } from "@/errors";
import { createLogger } from "@saleor/apps-shared";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const orderCancelledWebhook =
  new SaleorAsyncWebhook<OrderUpdatedSubscriptionPayloadFragment>({
    name: "Order Cancelled v1",
    webhookPath: "api/webhooks/order-cancelled",
    event: "ORDER_CANCELLED",
    apl: saleorApp.apl,
    query: OrderCancelledDocument,
  });

const logger = createLogger({ name: "orderCancelledWebhook" });

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

    Sentry.captureException(e);

    return res.status(500).end();
  }
};

export default orderCancelledWebhook.createHandler(handler);
