import { type NextJsWebhookHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";

import { AlgoliaErrorParser } from "../../../../lib/algolia/algolia-error-parser";
import { createLogger } from "../../../../lib/logger";
import { loggerContext } from "../../../../lib/logger-context";
import { type CategoryDeleted } from "../../../../lib/webhook-event-types";
import { createSearchProblemReporter } from "../../../../modules/app-problems";
import { webhookCategoryDeleted } from "../../../../webhooks/definitions/category-deleted";
import { handleInvalidAppIdError } from "../../../../webhooks/handle-invalid-app-id-error";
import { createWebhookContext } from "../../../../webhooks/webhook-context";

export const config = {
  api: {
    bodyParser: false,
  },
};

const logger = createLogger("webhookCategoryDeletedHandler");

export const handler: NextJsWebhookHandler<CategoryDeleted> = async (req, res, context) => {
  const { event, authData } = context;

  logger.info(`New event received: ${event} (${context.payload?.__typename})`, {
    saleorApiUrl: authData.saleorApiUrl,
  });

  const { category } = context.payload;

  if (!category) {
    logger.error("Webhook did not receive expected category data in the payload.");

    return res.status(200).end();
  }

  try {
    const { algoliaClient } = await createWebhookContext({ authData });

    try {
      await algoliaClient.deleteCategory(category.id);

      logger.info("Algolia deleteCategory success");

      res.status(200).end();

      return;
    } catch (e) {
      if (AlgoliaErrorParser.isAuthError(e)) {
        const problemReporter = createSearchProblemReporter(authData);

        await problemReporter.reportAuthError();

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

      logger.error("Failed to execute category_deleted webhook (algoliaClient.deleteCategory)", {
        error: e,
      });

      return res.status(500).send("Operation failed due to error");
    }
  } catch (e) {
    logger.error("Failed to execute category_deleted webhook (createWebhookContext)", { error: e });

    return res.status(400).send((e as Error).message);
  }
};

export default wrapWithLoggerContext(
  withSpanAttributes(webhookCategoryDeleted.createHandler(handler)),
  loggerContext,
);
