import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  OrderFulfilledEventSubscriptionFragment,
  UntypedOrderFulfilledSubscriptionDocument,
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
  OrderFulfilledEventSubscriptionFragment,
  { __typename: "OrderFulfilled" }
>;

export const orderFulfilledAsyncWebhook = new SaleorAsyncWebhook<ExpectedWebhookPayload>({
  name: "OrderFulfilled",
  apl: saleorApp.apl,
  event: "ORDER_FULFILLED",
  query: UntypedOrderFulfilledSubscriptionDocument,
  webhookPath: "/api/webhooks/order-fulfilled",
});

export default orderFulfilledAsyncWebhook.createHandler(async (req, res, ctx) => {
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

    const fulfilledOrder = await taxProvider.createOrder(payload.order);
    logger.info({ fulfilledOrder }, "Order fulfilled");

    return res.status(200);
  } catch (error) {
    logger.error({ error }, "Error while creating tax provider order");
    // todo: add error message
    return res.status(400);
  }
});
