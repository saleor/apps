import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";

import { ProductVariantOutOfStock } from "../../../../../generated/graphql";
import { createLogger } from "../../../../lib/logger";
import { loggerContext } from "../../../../lib/logger-context";
import { webhookProductVariantOutOfStock } from "../../../../webhooks/definitions/product-variant-out-of-stock";
import { createWebhookContext } from "../../../../webhooks/webhook-context";

export const config = {
  api: {
    bodyParser: false,
  },
};

const logger = createLogger("webhookProductVariantOutOfStockWebhookHandler");

export const handler: NextWebhookApiHandler<ProductVariantOutOfStock> = async (
  req,
  res,
  context,
) => {
  const { event, authData } = context;

  logger.info(`New event received: ${event} (${context.payload?.__typename})`, {
    saleorApiUrl: authData.saleorApiUrl,
  });

  const { productVariant } = context.payload;

  if (!productVariant) {
    logger.error("Webhook did not received expected product data in the payload.");
    return res.status(200).end();
  }

  try {
    const { algoliaClient, apiClient } = await createWebhookContext({ authData });

    try {
      await algoliaClient.updateProductVariant(productVariant);

      res.status(200).end();
      return;
    } catch (e) {
      logger.error(
        "Failed to execute product_variant_out_of_stock webhook (algoliaClient.updateProductVariant)",
        { error: e },
      );

      return res.status(500).send("Operation failed due to error");
    }
  } catch (e) {
    logger.error("Failed to execute product_variant_out_of_stock webhook (createWebhookContext)", {
      error: e,
    });

    return res.status(400).json({
      message: (e as Error).message,
    });
  }
};

export default wrapWithLoggerContext(
  withOtel(
    webhookProductVariantOutOfStock.createHandler(handler),
    "api/webhooks/saleor/product_variant_out_of_stock",
  ),
  loggerContext,
);
