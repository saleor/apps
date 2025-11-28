import { NextJsWebhookHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";

import { ProductCreated } from "../../../../../generated/graphql";
import {
  AlgoliaErrorParser,
  createRecordSizeErrorMessage,
} from "../../../../lib/algolia/algolia-error-parser";
import { createLogger } from "../../../../lib/logger";
import { loggerContext } from "../../../../lib/logger-context";
import { webhookProductCreated } from "../../../../webhooks/definitions/product-created";
import { createWebhookContext } from "../../../../webhooks/webhook-context";

export const config = {
  api: {
    bodyParser: false,
  },
};

const logger = createLogger("webhookProductCreatedWebhookHandler");

export const handler: NextJsWebhookHandler<ProductCreated> = async (req, res, context) => {
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
      await algoliaClient.createProduct(product);

      logger.info("Algolia createProduct success");

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

      logger.error("Failed to execute product_created webhook (algoliaClient.createProduct)", {
        error: e,
      });

      return res.status(500).send("Operation failed due to error");
    }
  } catch (e) {
    logger.error("Failed to execute product_created webhook (createWebhookContext)", { error: e });

    return res.status(400).json({
      message: (e as Error).message,
    });
  }
};

export default wrapWithLoggerContext(
  withSpanAttributes(webhookProductCreated.createHandler(handler)),
  loggerContext,
);
