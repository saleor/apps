import { createProtectedHandler, NextJsProtectedApiHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";
import { Client } from "urql";

import { FetchOwnWebhooksDocument, OwnWebhookFragment } from "../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";
import { createInstrumentedGraphqlClient } from "../../lib/create-instrumented-graphql-client";
import { createLogger } from "../../lib/logger";
import { loggerContext } from "../../lib/logger-context";
import { createTraceEffect } from "../../lib/trace-effect";

const logger = createLogger("webhooksStatusHandler");

const traceFetchWebhooks = createTraceEffect({ name: "Saleor fetchOwnWebhooks" });

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
  ({ graphqlClientFactory }: FactoryProps): NextJsProtectedApiHandler<WebhooksStatusResponse> =>
  async (req, res, { authData }) => {
    /**
     * Initialize services
     */
    const client = graphqlClientFactory(authData.saleorApiUrl, authData.token);

    logger.info("Fetched settings");

    try {
      logger.info("Will fetch Webhooks from Saleor");

      const webhooks = await traceFetchWebhooks(
        () => client.query(FetchOwnWebhooksDocument, { id: authData.appId }).toPromise(),
        { appId: authData.appId },
      ).then((r) => r.data?.app?.webhooks);

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
  withSpanAttributes(
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
  ),
  loggerContext,
);
