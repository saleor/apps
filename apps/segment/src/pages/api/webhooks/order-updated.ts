import { createSegmentClientForWebhookContext } from "@/modules/create-segment-client-for-webhook-context";
import { trackingEventFactory } from "@/modules/tracking-events/tracking-events";
import { saleorApp } from "@/saleor-app";
import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
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
      trackingEventFactory.createOrderUpdatedEvent(payload.order),
    );

    return res.status(200).end();
  } catch (e) {
    return res.status(500).end(); // todo send error and log
  }
};

export default orderUpdatedWebhook.createHandler(handler);
