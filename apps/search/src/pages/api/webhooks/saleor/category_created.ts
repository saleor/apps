import { type NextJsWebhookHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";

import {
  AlgoliaErrorParser,
  createRecordSizeErrorMessage,
} from "../../../../lib/algolia/algolia-error-parser";
import { createLogger } from "../../../../lib/logger";
import { loggerContext } from "../../../../lib/logger-context";
import { type CategoryCreated } from "../../../../lib/webhook-event-types";
import { createSearchProblemReporter } from "../../../../modules/app-problems";
import { webhookCategoryCreated } from "../../../../webhooks/definitions/category-created";
import { createWebhookContext } from "../../../../webhooks/webhook-context";

export const config = {
  api: {
    bodyParser: false,
  },
};

const logger = createLogger("webhookCategoryCreatedHandler");

export const handler: NextJsWebhookHandler<CategoryCreated> = async (req, res, context) => {
  const { event, authData } = context;

  logger.info(`New event received: ${event} (${context.payload?.__typename})`, {
    saleorApiUrl: authData.saleorApiUrl,
  });

  const { category } = context.payload;

  if (!category) {
    logger.warn("Webhook did not receive expected category data in the payload.");

    return res.status(200).end();
  }

  try {
    const { algoliaClient } = await createWebhookContext({ authData });

    try {
      await algoliaClient.createCategory(category);

      logger.info("Algolia createCategory success");

      res.status(200).end();

      return;
    } catch (e) {
      const problemReporter = createSearchProblemReporter(authData);

      if (AlgoliaErrorParser.isRecordSizeTooBigError(e)) {
        const errorDetails = AlgoliaErrorParser.parseRecordSizeError(e);
        const errorMessage = createRecordSizeErrorMessage(errorDetails, {
          productId: category.id,
        });

        logger.warn("Category exceeds Algolia record size limit", {
          categoryId: category.id,
        });

        await problemReporter.reportRecordTooLarge({ productId: category.id });

        return res.status(413).send(errorMessage);
      }

      if (AlgoliaErrorParser.isAuthError(e)) {
        await problemReporter.reportAuthError();

        return res.status(401).send("Algolia rejected due to invalid credentials");
      }

      logger.error("Failed to execute category_created webhook (algoliaClient.createCategory)", {
        error: e,
      });

      return res.status(500).send("Operation failed due to error");
    }
  } catch (e) {
    logger.error("Failed to execute category_created webhook (createWebhookContext)", { error: e });

    return res.status(400).json({
      message: (e as Error).message,
    });
  }
};

export default wrapWithLoggerContext(
  withSpanAttributes(webhookCategoryCreated.createHandler(handler)),
  loggerContext,
);
