import { type NextJsWebhookHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";

import { AlgoliaErrorParser } from "../../../../lib/algolia/algolia-error-parser";
import { createLogger } from "../../../../lib/logger";
import { loggerContext } from "../../../../lib/logger-context";
import { type PageDeleted } from "../../../../lib/webhook-event-types";
import { createSearchProblemReporter } from "../../../../modules/app-problems";
import { webhookPageDeleted } from "../../../../webhooks/definitions/page-deleted";
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
    const { algoliaClient } = await createWebhookContext({ authData });

    try {
      await algoliaClient.deletePage(page.id);

      logger.info("Algolia deletePage success");

      res.status(200).end();

      return;
    } catch (e) {
      if (AlgoliaErrorParser.isAuthError(e)) {
        const problemReporter = createSearchProblemReporter(authData);

        await problemReporter.reportAuthError();

        return res.status(401).send("Algolia rejected due to invalid credentials");
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
