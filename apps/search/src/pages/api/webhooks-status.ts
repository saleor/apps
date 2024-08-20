import { createProtectedHandler, NextProtectedApiHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import { Client } from "urql";

import { FetchOwnWebhooksDocument, OwnWebhookFragment } from "../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";
import { createInstrumentedGraphqlClient } from "../../lib/create-instrumented-graphql-client";
import { createLogger } from "../../lib/logger";
import { loggerContext } from "../../lib/logger-context";

const logger = createLogger("webhooksStatusHandler");

/**
 * Simple dependency injection - factory injects all services, in tests everything can be configured without mocks
 */
type FactoryProps = {
  graphqlClientFactory: (saleorApiUrl: string, token: string) => Pick<Client, "query" | "mutation">;
};

export type WebhooksStatusResponse = {
  webhooks: OwnWebhookFragment[];
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

      return res.status(200).json({
        webhooks,
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
