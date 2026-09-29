import { type NextJsWebhookHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";

import { AlgoliaErrorParser } from "../../../../lib/algolia/algolia-error-parser";
import { createLogger } from "../../../../lib/logger";
import { loggerContext } from "../../../../lib/logger-context";
import { type CategoryDeleted } from "../../../../lib/webhook-event-types";
import { createSearchProblemReporter } from "../../../../modules/app-problems";
import { webhookCategoryDeleted } from "../../../../webhooks/definitions/category-deleted";
import { handleAlgoliaWebhookError } from "../../../../webhooks/handle-algolia-webhook-error";
import { handleInvalidAppIdError } from "../../../../webhooks/handle-invalid-app-id-error";
import { handleWebhookContextError } from "../../../../webhooks/handle-webhook-context-error";
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

      return handleAlgoliaWebhookError({
        error: e,
        logger,
        message: "Failed to execute category_deleted webhook (algoliaClient.deleteCategory)",
        res,
      });
    }
  } catch (e) {
    return handleWebhookContextError({
      error: e,
      logger,
      message: "Failed to execute category_deleted webhook (createWebhookContext)",
      res,
    });
  }
};

export default wrapWithLoggerContext(
  withSpanAttributes(webhookCategoryDeleted.createHandler(handler)),
  loggerContext,
);
