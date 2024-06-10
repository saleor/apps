import { createProtectedHandler, NextProtectedApiHandler } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { FetchOwnWebhooksDocument, OwnWebhookFragment } from "../../../generated/graphql";
import { createLogger } from "../../lib/logger";
import { Client } from "urql";
import { isWebhookUpdateNeeded } from "../../lib/algolia/is-webhook-update-needed";
import { withOtel } from "@saleor/apps-otel";
import { createInstrumentedGraphqlClient } from "../../lib/create-instrumented-graphql-client";
import { loggerContext } from "../../lib/logger-context";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";

const logger = createLogger("webhooksStatusHandler");

/**
 * Simple dependency injection - factory injects all services, in tests everything can be configured without mocks
 */
type FactoryProps = {
  graphqlClientFactory: (saleorApiUrl: string, token: string) => Pick<Client, "query" | "mutation">;
};

export type WebhooksStatusResponse = {
  webhooks: OwnWebhookFragment[];
  isUpdateNeeded: boolean;
};

export const webhooksStatusHandlerFactory =
  ({ graphqlClientFactory }: FactoryProps): NextProtectedApiHandler<WebhooksStatusResponse> =>
  async (req, res, { authData }) => {
    /**
     * Initialize services
     */
    const client = graphqlClientFactory(authData.saleorApiUrl, authData.token);

    logger.info("Fetched settings");

    try {
      logger.info("Will fetch Webhooks from Saleor");

      const webhooks = await client
        .query(FetchOwnWebhooksDocument, { id: authData.appId })
        .toPromise()
        .then((r) => r.data?.app?.webhooks);

      if (!webhooks) {
        logger.error("Failed to fetch webhooks from Saleor - webhooks missing");

        return res.status(500).end();
      }

      const isUpdateNeeded = isWebhookUpdateNeeded({
        existingWebhookNames: webhooks.map((w) => w.name),
      });

      return res.status(200).json({
        webhooks,
        isUpdateNeeded,
      });
    } catch (e) {
      logger.error("Failed to fetch webhooks from Saleor - unhandled", { error: e });

      return res.status(500).end();
    }
  };

export default wrapWithLoggerContext(
  withOtel(
    createProtectedHandler(
      webhooksStatusHandlerFactory({
        graphqlClientFactory(saleorApiUrl: string, token: string) {
          return createInstrumentedGraphqlClient({
            saleorApiUrl,
            token,
          });
        },
      }),
      saleorApp.apl,
      ["MANAGE_APPS"],
    ),
    "api/webhooks-status",
  ),
  loggerContext,
);
