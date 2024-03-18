import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import { createLogger } from "../../../logger";
import { loggerContext } from "../../../logger-context";
import { WebhookResponse } from "../../../modules/app/webhook-response";
import { getActiveConnectionService } from "../../../modules/taxes/get-active-connection-service";
import { orderCancelledAsyncWebhook } from "../../../modules/webhooks/definitions/order-cancelled";
export const config = {
  api: {
    bodyParser: false,
  },
};

export default wrapWithLoggerContext(
  withOtel(
    orderCancelledAsyncWebhook.createHandler(async (req, res, ctx) => {
      const logger = createLogger("orderCancelledAsyncWebhook", {
        saleorApiUrl: ctx.authData.saleorApiUrl,
      });
      const { payload } = ctx;
      const webhookResponse = new WebhookResponse(res);

      logger.info("Handler called with payload");

      if (!payload.order) {
        return webhookResponse.error(new Error("Insufficient order data"));
      }

      try {
        const appMetadata = payload.recipient?.privateMetadata ?? [];
        const channelSlug = payload.order.channel.slug;
        const taxProviderResult = getActiveConnectionService(
          channelSlug,
          appMetadata,
          ctx.authData,
        );

        logger.info("Cancelling order...");

        if (taxProviderResult.isOk()) {
          await taxProviderResult.value.cancelOrder(payload);

          logger.info("Order cancelled");

          return webhookResponse.success();
        }

        if (taxProviderResult.isErr()) {
          // TODO: Map errors
          return webhookResponse.error(taxProviderResult.error);
        }
      } catch (error) {
        return webhookResponse.error(error);
      }
    }),
    "/api/webhooks/order-cancelled",
  ),
  loggerContext,
);
