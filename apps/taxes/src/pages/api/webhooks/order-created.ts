import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  OrderCreatedEventSubscriptionFragment,
  OrderStatus,
  UntypedOrderCreatedSubscriptionDocument,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { createLogger } from "../../../lib/logger";
import { getActiveConnectionService } from "../../../modules/taxes/get-active-connection-service";
import { WebhookResponse } from "../../../modules/app/webhook-response";
import { createGraphQLClient } from "@saleor/apps-shared";
import { OrderMetadataManager } from "../../../modules/app/order-metadata-manager";

export const config = {
  api: {
    bodyParser: false,
  },
};

type OrderCreatedPayload = Extract<
  OrderCreatedEventSubscriptionFragment,
  { __typename: "OrderCreated" }
>;

/**
 * @deprecated This handler is deprecated and will be removed in the future.
 */
export const orderCreatedAsyncWebhook = new SaleorAsyncWebhook<OrderCreatedPayload>({
  name: "OrderCreated",
  apl: saleorApp.apl,
  event: "ORDER_CREATED",
  query: UntypedOrderCreatedSubscriptionDocument,
  webhookPath: "/api/webhooks/order-created",
});

export default orderCreatedAsyncWebhook.createHandler(async (req, res, ctx) => {
  const logger = createLogger({ event: ctx.event });
  const { payload, authData } = ctx;
  const { saleorApiUrl, token } = authData;
  const webhookResponse = new WebhookResponse(res);

  logger.info("Handler called with payload");

  try {
    const appMetadata = payload.recipient?.privateMetadata ?? [];
    const channelSlug = payload.order?.channel.slug;
    const taxProvider = getActiveConnectionService(channelSlug, appMetadata, ctx.authData);

    // todo: figure out what fields are needed and add validation
    if (!payload.order) {
      return webhookResponse.error(new Error("Insufficient order data"));
    }

    if (payload.order.status === OrderStatus.Fulfilled) {
      return webhookResponse.error(new Error("Skipping fulfilled order to prevent duplication"));
    }

    logger.info("Creating order...");

    const createdOrder = await taxProvider.createOrder(payload.order);

    logger.info({ createdOrder }, "Order created");
    const client = createGraphQLClient({
      saleorApiUrl,
      token,
    });

    const orderMetadataManager = new OrderMetadataManager(client);

    await orderMetadataManager.updateOrderMetadataWithExternalId(payload.order.id, createdOrder.id);
    logger.info("Updated order metadata with externalId");

    return webhookResponse.success();
  } catch (error) {
    logger.error({ error });
    return webhookResponse.error(error);
  }
});
