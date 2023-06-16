import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  OrderCreatedEventSubscriptionFragment,
  OrderStatus,
  UntypedOrderCreatedSubscriptionDocument,
  UpdateMetadataDocument,
  UpdateMetadataMutation,
  UpdateMetadataMutationVariables,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { createLogger } from "../../../lib/logger";
import { getActiveConnection } from "../../../modules/taxes/active-connection";
import { createClient } from "../../../lib/graphql";
import { Client } from "urql";
import { WebhookResponse } from "../../../modules/app/webhook-response";
import { PROVIDER_ORDER_ID_KEY } from "../../../modules/avatax/order-fulfilled/avatax-order-fulfilled-payload-transformer";

export const config = {
  api: {
    bodyParser: false,
  },
};

type OrderCreatedPayload = Extract<
  OrderCreatedEventSubscriptionFragment,
  { __typename: "OrderCreated" }
>;

export const orderCreatedAsyncWebhook = new SaleorAsyncWebhook<OrderCreatedPayload>({
  name: "OrderCreated",
  apl: saleorApp.apl,
  event: "ORDER_CREATED",
  query: UntypedOrderCreatedSubscriptionDocument,
  webhookPath: "/api/webhooks/order-created",
});

/**
 * We need to store the provider order id in the Saleor order metadata so that we can
 * update the provider order when the Saleor order is fulfilled.
 */
async function updateOrderMetadataWithExternalId(
  client: Client,
  orderId: string,
  externalId: string
) {
  const variables: UpdateMetadataMutationVariables = {
    id: orderId,
    input: [
      {
        key: PROVIDER_ORDER_ID_KEY,
        value: externalId,
      },
    ],
  };
  const { error } = await client
    .mutation<UpdateMetadataMutation>(UpdateMetadataDocument, variables)
    .toPromise();

  if (error) {
    throw error;
  }

  return { ok: true };
}

export default orderCreatedAsyncWebhook.createHandler(async (req, res, ctx) => {
  const logger = createLogger({ event: ctx.event });
  const { payload, authData } = ctx;
  const { saleorApiUrl, token } = authData;
  const webhookResponse = new WebhookResponse(res);

  logger.info({ orderId: payload?.order?.id }, "Handler called with order ID");

  try {
    const appMetadata = payload.recipient?.privateMetadata ?? [];
    const channelSlug = payload.order?.channel.slug;
    const taxProvider = getActiveConnection(channelSlug, appMetadata);

    logger.info("Fetched taxProvider");

    // todo: figure out what fields are needed and add validation
    if (!payload.order) {
      return webhookResponse.error(new Error("Insufficient order data"));
    }

    if (payload.order.status === OrderStatus.Fulfilled) {
      return webhookResponse.error(new Error("Skipping fulfilled order to prevent duplication"));
    }

    const createdOrder = await taxProvider.createOrder(payload.order);

    logger.info({ createdOrderID: createdOrder.id }, "Order created");
    const client = createClient(saleorApiUrl, async () => Promise.resolve({ token }));

    await updateOrderMetadataWithExternalId(client, payload.order.id, createdOrder.id);
    logger.info("Updated order metadata with externalId");

    return webhookResponse.success();
  } catch (error) {
    logger.error({
      error: { message: (error as Error).message, stack: (error as Error).stack },
    });
    return webhookResponse.error(new Error("Error while creating order in tax provider"));
  }
});
