import { type NextJsWebhookHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";

import { AlgoliaErrorParser } from "../../../../lib/algolia/algolia-error-parser";
import { createLogger } from "../../../../lib/logger";
import { loggerContext } from "../../../../lib/logger-context";
import { type PageDeleted } from "../../../../lib/webhook-event-types";
import { createSearchProblemReporter } from "../../../../modules/app-problems";
import { webhookPageDeleted } from "../../../../webhooks/definitions/page-deleted";
import { handleInvalidAppIdError } from "../../../../webhooks/handle-invalid-app-id-error";
import { createWebhookContext } from "../../../../webhooks/webhook-context";

export const config = {
  api: {
    bodyParser: false,
  },
};

const logger = createLogger("webhookPageDeletedHandler");

export const handler: NextJsWebhookHandler<PageDeleted> = async (req, res, context) => {
  const { event, authData } = context;

  logger.info(`New event received: ${event} (${context.payload?.__typename})`, {
    saleorApiUrl: authData.saleorApiUrl,
  });

  const { page } = context.payload;

  if (!page) {
    logger.error("Webhook did not receive expected page data in the payload.");

    return res.status(200).end();
  }

  try {
    const { algoliaClient, settings } = await createWebhookContext({ authData });

    const allowedPageTypeIds = settings.pageTypesFilter?.pageTypeIds ?? [];

    if (allowedPageTypeIds.length === 0) {
      logger.info("No page types configured for indexing, skipping");

      return res.status(200).end();
    }

    if (!allowedPageTypeIds.includes(page.pageType.id)) {
      logger.info("Page type not in allowed list, skipping", {
        pageTypeId: page.pageType.id,
      });

      return res.status(200).end();
    }

    try {
      await algoliaClient.deletePage(page.id);

      logger.info("Algolia deletePage success");

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

      logger.error("Failed to execute page_deleted webhook (algoliaClient.deletePage)", {
        error: e,
      });

      return res.status(500).send("Operation failed due to error");
    }
  } catch (e) {
    logger.error("Failed to execute page_deleted webhook (createWebhookContext)", { error: e });

    return res.status(400).send((e as Error).message);
  }
};

export default wrapWithLoggerContext(
  withSpanAttributes(webhookPageDeleted.createHandler(handler)),
  loggerContext,
);
