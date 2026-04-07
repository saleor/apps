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
import { handleInvalidAppIdError } from "../../../../webhooks/handle-invalid-app-id-error";
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
        const entity = { type: "category" as const, categoryId: category.id };
        const errorMessage = createRecordSizeErrorMessage(errorDetails, entity);

        logger.warn("Category exceeds Algolia record size limit", {
          categoryId: category.id,
        });

        await problemReporter.reportRecordTooLarge(entity);

        return res.status(413).send(errorMessage);
      }

      if (AlgoliaErrorParser.isAuthError(e)) {
        await problemReporter.reportAuthErrorAndDeactivate(authData.appId);

        return res.status(401).send("Algolia rejected due to invalid credentials");
      }

      const invalidAppIdResponse = await handleInvalidAppIdError({
        error: e,
        authData,
        res,
        logger,
      });

      if (invalidAppIdResponse) {
        return;
      }

      logger.error("Failed to execute category_created webhook (algoliaClient.createCategory)", {
        error: e,
      });

      return res.status(500).send("Operation failed due to error");
    }
  } catch (e) {
    logger.error("Failed to execute category_created webhook (createWebhookContext)", { error: e });

    return res.status(400).send((e as Error).message);
  }
};

export default wrapWithLoggerContext(
  withSpanAttributes(webhookCategoryCreated.createHandler(handler)),
  loggerContext,
);
