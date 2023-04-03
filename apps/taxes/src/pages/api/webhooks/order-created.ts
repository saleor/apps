import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { z } from "zod";
import {
  OrderCreatedEventSubscriptionFragment,
  UntypedOrderCreatedSubscriptionDocument,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { createLogger } from "../../../lib/logger";
import { ActiveTaxProviderService } from "../../../modules/taxes/active-tax-provider.service";

export const config = {
  api: {
    bodyParser: false,
  },
};

type ExpectedWebhookPayload = Extract<
  OrderCreatedEventSubscriptionFragment,
  { __typename: "OrderCreated" }
>;

export const orderCreatedAsyncWebhook = new SaleorAsyncWebhook<ExpectedWebhookPayload>({
  name: "OrderCreated",
  apl: saleorApp.apl,
  event: "ORDER_CREATED",
  query: UntypedOrderCreatedSubscriptionDocument,
  webhookPath: "/api/webhooks/order-created",
});

export default orderCreatedAsyncWebhook.createHandler(async (req, res, ctx) => {
  const logger = createLogger({ event: ctx.event });
  const { payload } = ctx;
  logger.info({ payload }, "Handler called with payload");

  try {
    const appMetadata = payload.recipient?.privateMetadata ?? [];
    const channelSlug = payload.order?.channel.slug;

    const activeTaxProviderService = new ActiveTaxProviderService();
    const taxProvider = await activeTaxProviderService.get(channelSlug, appMetadata);
    logger.info({ taxProvider }, "Fetched activeTaxProvider");

    // todo: figure out what fields are needed and add validation
    if (!payload.order) {
      logger.error("Insufficient order data");
      return res.status(400);
    }

    const createdOrder = await taxProvider.createOrder(payload.order);
    logger.info({ createdOrder }, "Order created");

    return res.status(200);
  } catch (error) {
    logger.error({ error }, "Error while creating tax provider order");
    // todo: add error message
    return res.status(400);
  }
});
