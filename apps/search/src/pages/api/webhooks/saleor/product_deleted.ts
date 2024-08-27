import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";

import { ProductDeleted } from "../../../../../generated/graphql";
import { createLogger } from "../../../../lib/logger";
import { loggerContext } from "../../../../lib/logger-context";
import { webhookProductDeleted } from "../../../../webhooks/definitions/product-deleted";
import { createWebhookContext } from "../../../../webhooks/webhook-context";

export const config = {
  api: {
    bodyParser: false,
  },
};

const logger = createLogger("webhookProductDeletedWebhookHandler");

export const handler: NextWebhookApiHandler<ProductDeleted> = async (req, res, context) => {
  const { event, authData } = context;

  logger.info(`New event received: ${event} (${context.payload?.__typename})`, {
    saleorApiUrl: authData.saleorApiUrl,
  });

  const { product } = context.payload;

  if (!product) {
    logger.error("Webhook did not received expected product data in the payload.");
    return res.status(200).end();
  }

  try {
    const { algoliaClient, apiClient } = await createWebhookContext({ authData });

    try {
      await algoliaClient.deleteProduct(product);

      logger.info("Algolia deleteProduct success");

      res.status(200).end();
      return;
    } catch (e) {
      logger.error("Failed to execute product_deleted webhook (algoliaClient.deleteProduct)", {
        error: e,
      });

      return res.status(500).send("Operation failed due to error");
    }
  } catch (e) {
    logger.error("Failed to execute product_deleted webhook (createWebhookContext)", { error: e });

    return res.status(400).json({
      message: (e as Error).message,
    });
  }
};

export default wrapWithLoggerContext(
  withOtel(webhookProductDeleted.createHandler(handler), "api/webhooks/saleor/product_deleted"),
  loggerContext,
);
