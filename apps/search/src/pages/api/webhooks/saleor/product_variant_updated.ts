import { NextJsWebhookHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";

import { ProductVariantUpdated } from "../../../../../generated/graphql";
import {
  AlgoliaErrorParser,
  createRecordSizeErrorMessage,
} from "../../../../lib/algolia/algolia-error-parser";
import { createLogger } from "../../../../lib/logger";
import { loggerContext } from "../../../../lib/logger-context";
import { webhookProductVariantUpdated } from "../../../../webhooks/definitions/product-variant-updated";
import { createWebhookContext } from "../../../../webhooks/webhook-context";

export const config = {
  api: {
    bodyParser: false,
  },
};

const logger = createLogger("webhookProductVariantUpdatedWebhookHandler");

export const handler: NextJsWebhookHandler<ProductVariantUpdated> = async (req, res, context) => {
  const { event, authData } = context;

  logger.info(`New event received: ${event} (${context.payload?.__typename})`, {
    saleorApiUrl: authData.saleorApiUrl,
  });

  const { productVariant } = context.payload;

  if (!productVariant) {
    logger.warn("Webhook did not receive expected product data in the payload.");

    return res.status(200).end();
  }

  try {
    const { algoliaClient } = await createWebhookContext({ authData });

    try {
      await algoliaClient.updateProductVariant(productVariant);

      res.status(200).end();

      return;
    } catch (e) {
      if (AlgoliaErrorParser.isRecordSizeTooBigError(e)) {
        const errorDetails = AlgoliaErrorParser.parseRecordSizeError(e);
        const errorMessage = createRecordSizeErrorMessage(errorDetails, {
          productId: productVariant.product.id,
          variantId: productVariant.id,
        });

        // Use warn instead of error - this is an expected error that shouldn't trigger Sentry alerts
        logger.warn("Product variant exceeds Algolia record size limit", {
          productId: productVariant.product.id,
          variantId: productVariant.id,
          actualSize: errorDetails?.actualSize,
          maxSize: errorDetails?.maxSize,
        });

        return res.status(413).send(errorMessage);
      }

      logger.error(
        "Failed to execute product_variant_updated webhook (algoliaClient.updateProductVariant)",
        { error: e },
      );

      return res.status(500).send("Operation failed due to error");
    }
  } catch (e) {
    logger.error("Failed to execute product_variant_updated webhook (createWebhookContext)", {
      error: e,
    });

    return res.status(400).json({
      message: (e as Error).message,
    });
  }
};

export default wrapWithLoggerContext(
  withSpanAttributes(webhookProductVariantUpdated.createHandler(handler)),
  loggerContext,
);
