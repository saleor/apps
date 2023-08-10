import { createSegmentClientForWebhookContext } from "@/modules/create-segment-client-for-webhook-context";
import { trackingEventFactory } from "@/modules/tracking-events/tracking-events";
import { saleorApp } from "@/saleor-app";
import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  OrderRefundedSubscriptionPayloadFragment,
  OrderUpdatedDocument,
} from "../../../../generated/graphql";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const orderRefundedWebhook =
  new SaleorAsyncWebhook<OrderRefundedSubscriptionPayloadFragment>({
    name: "Order Refunded v1",
    webhookPath: "api/webhooks/order-refunded",
    event: "ORDER_REFUNDED",
    apl: saleorApp.apl,
    query: OrderUpdatedDocument,
  });

const handler: NextWebhookApiHandler<OrderRefundedSubscriptionPayloadFragment> = async (
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
      trackingEventFactory.createOrderRefundedEvent(payload.order),
    );

    return res.status(200).end();
  } catch (e) {
    return res.status(500).end(); // todo send error and log
  }
};

export default orderRefundedWebhook.createHandler(handler);
