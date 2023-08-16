import { createSegmentClientForWebhookContext } from "@/modules/create-segment-client-for-webhook-context";
import { trackingEventFactory } from "@/modules/tracking-events/tracking-events";
import { saleorApp } from "@/saleor-app";
import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  OrderCreatedDocument,
  OrderCreatedSubscriptionPayloadFragment,
} from "../../../../generated/graphql";
import { SegmentNotConfiguredError } from "@/errors";
import * as Sentry from "@sentry/nextjs";
import { createLogger } from "@saleor/apps-shared";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const orderCreatedWebhook = new SaleorAsyncWebhook<OrderCreatedSubscriptionPayloadFragment>({
  name: "Order Created v1",
  webhookPath: "api/webhooks/order-created",
  event: "ORDER_CREATED",
  apl: saleorApp.apl,
  query: OrderCreatedDocument,
});

const logger = createLogger({ name: "orderCreatedWebhook" });

const handler: NextWebhookApiHandler<OrderCreatedSubscriptionPayloadFragment> = async (
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

    Sentry.captureException(e);

    return res.status(500).end();
  }
};

export default orderCreatedWebhook.createHandler(handler);
