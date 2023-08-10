import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  OrderBaseFragment,
  OrderCreatedDocument,
  OrderCreatedSubscriptionPayloadFragment,
} from "../../../../generated/graphql";
import { saleorApp } from "@/saleor-app";
import { AppConfigMetadataManager } from "@/modules/configuration/app-config-metadata-manager";
import { SegmentEventsTracker } from "@/modules/tracking-events/segment-events-tracker";
import { SegmentClient } from "@/modules/segment/segment.client";
import { trackingEventFactory } from "@/modules/tracking-events/tracking-events";

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

const handler: NextWebhookApiHandler<OrderCreatedSubscriptionPayloadFragment> = async (
  req,
  res,
  context,
) => {
  const { authData, payload } = context;

  const config = await AppConfigMetadataManager.createFromAuthData(authData).get();

  const segmentKey = config.getConfig()?.segmentWriteKey;

  if (!segmentKey) {
    return res.status(200).end(); // not configured
  }

  const segmentClient = new SegmentEventsTracker(
    new SegmentClient({
      segmentWriteKey: segmentKey,
    }),
  );

  if (!payload.order) {
    return res.status(200).end(); // some error, sentry
  }

  await segmentClient.trackEvent(trackingEventFactory.createOrderCreatedEvent(payload.order));

  return res.status(200).end();
};

export default orderCreatedWebhook.createHandler(handler);
