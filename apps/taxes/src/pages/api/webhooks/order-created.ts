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
import { getActiveTaxProvider } from "../../../modules/taxes/active-tax-provider";
import { createClient } from "../../../lib/graphql";
import { Client } from "urql";
import { WebhookResponse } from "../../../modules/app/webhook-response";
import { PROVIDER_ORDER_ID_KEY } from "../../../modules/avatax/maps/avatax-order-fulfilled-map";

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

  logger.info({ payload }, "Handler called with payload");

  try {
    const appMetadata = payload.recipient?.privateMetadata ?? [];
    const channelSlug = payload.order?.channel.slug;
    const activeTaxProvider = getActiveTaxProvider(channelSlug, appMetadata);

    if (!activeTaxProvider.ok) {
      logger.info("Returning no data");
      return webhookResponse.failure(activeTaxProvider.error);
    }

    logger.info({ activeTaxProvider }, "Fetched activeTaxProvider");
    const taxProvider = activeTaxProvider.data;

    // todo: figure out what fields are needed and add validation
    if (!payload.order) {
      return webhookResponse.failure("Insufficient order data");
    }

    if (payload.order.status === OrderStatus.Fulfilled) {
      return webhookResponse.failure("Skipping fulfilled order to prevent duplication");
    }

    const createdOrder = await taxProvider.createOrder(payload.order);

    logger.info({ createdOrder }, "Order created");
    const client = createClient(saleorApiUrl, async () => Promise.resolve({ token }));

    await updateOrderMetadataWithExternalId(client, payload.order.id, createdOrder.id);
    logger.info("Updated order metadata with externalId");

    return webhookResponse.success();
  } catch (error) {
    logger.error({ error });
    return webhookResponse.failure("Error while creating order in tax provider");
  }
});
