import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { withOtel } from "@saleor/apps-otel";
import {
  OrderFullyRefundedEventSubscriptionFragment,
  UntypedOrderFullyRefundedSubscriptionDocument,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { createLogger } from "../../../logger";
import { WebhookResponse } from "../../../modules/app/webhook-response";
import { getActiveConnectionService } from "../../../modules/taxes/get-active-connection-service";

export const config = {
  api: {
    bodyParser: false,
  },
};

export type OrderFullyRefundedPayload = Extract<
  OrderFullyRefundedEventSubscriptionFragment,
  { __typename: "OrderFullyRefunded" }
>;

export const orderFullyRefundedAsyncWebhook = new SaleorAsyncWebhook<OrderFullyRefundedPayload>({
  name: "OrderFullyRefunded",
  apl: saleorApp.apl,
  event: "ORDER_FULLY_REFUNDED",
  query: UntypedOrderFullyRefundedSubscriptionDocument,
  webhookPath: "/api/webhooks/order-fully-refunded",
});

export default withOtel(
  orderFullyRefundedAsyncWebhook.createHandler(async (req, res, ctx) => {
    const logger = createLogger("orderFullyRefundedAsyncWebhook", {
      saleorApiUrl: ctx.authData.saleorApiUrl,
    });
    const { payload, authData } = ctx;
    const { saleorApiUrl, token } = authData;
    const webhookResponse = new WebhookResponse(res);

    logger.info("Handler called with payload");

    try {
      const appMetadata = payload.recipient?.privateMetadata ?? [];
      const channelSlug = payload.order?.channel.slug;
      const taxProviderResult = getActiveConnectionService(channelSlug, appMetadata, ctx.authData);

      if (!payload.order) {
        return webhookResponse.error(new Error("Insufficient order data"));
      }

      logger.info("Refundind transaction...");

      if (taxProviderResult.isOk()) {
        await taxProviderResult.value.refundTransaction(payload);

        logger.info("Transaction refunded");

        return webhookResponse.success();
      }

      // TODO: Map errors
      if (taxProviderResult.isErr()) {
        logger.error("Error refunding transaction", { error: taxProviderResult.error });

        return webhookResponse.error(taxProviderResult.error);
      }
    } catch (error) {
      logger.error("Error executing webhook", { error });
      return webhookResponse.error(error);
    }
  }),
  "/api/webhooks/order-fully-refunded",
);
