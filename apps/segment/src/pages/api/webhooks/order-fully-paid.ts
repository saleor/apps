import { createSegmentClientForWebhookContext } from "@/modules/create-segment-client-for-webhook-context";
import { trackingEventFactory } from "@/modules/tracking-events/tracking-events";
import { saleorApp } from "@/saleor-app";
import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  OrderFullyPaidDocument,
  OrderFullyPaidSubscriptionPayloadFragment,
} from "../../../../generated/graphql";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const orderFullyPaidWebhook =
  new SaleorAsyncWebhook<OrderFullyPaidSubscriptionPayloadFragment>({
    name: "Order Fully Paid  v1",
    webhookPath: "api/webhooks/order-fully-paid",
    event: "ORDER_FULLY_PAID",
    apl: saleorApp.apl,
    query: OrderFullyPaidDocument,
  });

const handler: NextWebhookApiHandler<OrderFullyPaidSubscriptionPayloadFragment> = async (
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
      trackingEventFactory.createOrderCompletedEvent(payload.order),
    );

    return res.status(200).end();
  } catch (e) {
    return res.status(500).end(); // todo send error and log
  }
};

export default orderFullyPaidWebhook.createHandler(handler);
