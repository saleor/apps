import { createSegmentClientForWebhookContext } from "@/modules/create-segment-client-for-webhook-context";
import { trackingEventFactory } from "@/modules/tracking-events/tracking-events";
import { saleorApp } from "@/saleor-app";
import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  OrderCancelledDocument,
  OrderUpdatedSubscriptionPayloadFragment,
} from "../../../../generated/graphql";

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

const handler: NextWebhookApiHandler<OrderUpdatedSubscriptionPayloadFragment> = async (
  req,
  res,
  context,
) => {
  const { authData, payload } = context;

  if (!payload.order) {
    return res.status(400).end(); // todo send error and log and sentry
  }

  try {
    const segmentEventTracker = await createSegmentClientForWebhookContext({ authData });

    await segmentEventTracker.trackEvent(
      trackingEventFactory.createOrderCancelledEvent(payload.order),
    );

    return res.status(200).end();
  } catch (e) {
    return res.status(500).end(); // todo send error and log
  }
};

export default orderCancelledWebhook.createHandler(handler);
