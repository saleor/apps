import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";

import { SegmentNotConfiguredError } from "@/errors";
import { createLogger } from "@/logger";
import { loggerContext, wrapWithLoggerContext } from "@/logger-context";
import { createSegmentClientForWebhookContext } from "@/modules/create-segment-client-for-webhook-context";
import { trackingEventFactory } from "@/modules/tracking-events/tracking-events";
import { saleorApp } from "@/saleor-app";

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

const logger = createLogger("orderFullyPaidAsyncWebhook");

const handler: NextWebhookApiHandler<OrderFullyPaidSubscriptionPayloadFragment> = async (
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

    logger.info("Sending order fully paid event to Segment");

    await segmentEventTracker.trackEvent(
      trackingEventFactory.createOrderCompletedEvent(payload.order),
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

export default wrapWithLoggerContext(orderFullyPaidWebhook.createHandler(handler), loggerContext);
