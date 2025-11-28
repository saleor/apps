import { NextJsWebhookHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";

import { ProductUpdated } from "../../../../../generated/graphql";
import {
  AlgoliaErrorParser,
  createRecordSizeErrorMessage,
} from "../../../../lib/algolia/algolia-error-parser";
import { createLogger } from "../../../../lib/logger";
import { loggerContext } from "../../../../lib/logger-context";
import { webhookProductUpdated } from "../../../../webhooks/definitions/product-updated";
import { createWebhookContext } from "../../../../webhooks/webhook-context";

export const config = {
  api: {
    bodyParser: false,
  },
};

const logger = createLogger("webhookProductUpdatedWebhookHandler");

export const handler: NextJsWebhookHandler<ProductUpdated> = async (req, res, context) => {
  const { event, authData } = context;

  logger.info(`New event received: ${event} (${context.payload?.__typename})`, {
    saleorApiUrl: authData.saleorApiUrl,
  });

  const { product } = context.payload;

  if (!product) {
    logger.warn("Webhook did not receive expected product data in the payload.");

    return res.status(200).end();
  }

  try {
    const { algoliaClient } = await createWebhookContext({ authData });

    try {
      await algoliaClient.updateProduct(product);

      res.status(200).end();

      return;
    } catch (e) {
      if (AlgoliaErrorParser.isRecordSizeTooBigError(e)) {
        const errorDetails = AlgoliaErrorParser.parseRecordSizeError(e);
        const errorMessage = createRecordSizeErrorMessage(errorDetails, {
          productId: product.id,
        });

        // Use warn instead of error - this is an expected error that shouldn't trigger Sentry alerts
        logger.warn("Product exceeds Algolia record size limit", {
          productId: product.id,
          actualSize: errorDetails?.actualSize,
          maxSize: errorDetails?.maxSize,
        });

        return res.status(413).send(errorMessage);
      }

      logger.error("Failed to execute product_updated webhook (algoliaClient.updateProduct)", {
        error: e,
      });

      return res.status(500).send("Operation failed due to error");
    }
  } catch (e) {
    logger.error("Failed to execute product_updated webhook (createWebhookContext)", { error: e });

    return res.status(400).json({
      message: (e as Error).message,
    });
  }
};

export default wrapWithLoggerContext(
  withSpanAttributes(webhookProductUpdated.createHandler(handler)),
  loggerContext,
);
