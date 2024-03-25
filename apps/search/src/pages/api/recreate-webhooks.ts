import { createProtectedHandler, NextProtectedApiHandler } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { createSettingsManager } from "../../lib/metadata";
import {
  IWebhookActivityTogglerService,
  WebhookActivityTogglerService,
} from "../../domain/WebhookActivityToggler.service";
import { createLogger } from "../../lib/logger";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { getAppBaseUrl } from "@saleor/apps-shared";
import { Client } from "urql";
import { isConfigured } from "../../lib/algolia/is-configured";
import { AppConfigMetadataManager } from "../../modules/configuration/app-config-metadata-manager";
import { withOtel } from "@saleor/apps-otel";
import { createInstrumentedGraphqlClient } from "../../lib/create-instrumented-graphql-client";

const logger = createLogger("recreateWebhooksHandler");

/**
 * Simple dependency injection - factory injects all services, in tests everything can be configured without mocks
 */
type FactoryProps = {
  settingsManagerFactory: (client: Client, appId: string) => SettingsManager;
  webhookActivityTogglerFactory: (appId: string, client: Client) => IWebhookActivityTogglerService;
  graphqlClientFactory: (saleorApiUrl: string, token: string) => Client;
};

export const recreateWebhooksHandlerFactory =
  ({
    settingsManagerFactory,
    webhookActivityTogglerFactory,
    graphqlClientFactory,
  }: FactoryProps): NextProtectedApiHandler =>
  async (req, res, { authData }) => {
    if (req.method !== "POST") {
      logger.debug("Request method is different than POST, returning 405");
      return res.status(405).end();
    }

    logger.debug("Fetching settings");
    const client = graphqlClientFactory(authData.saleorApiUrl, authData.token);
    const webhooksToggler = webhookActivityTogglerFactory(authData.appId, client);
    const settingsManager = settingsManagerFactory(client, authData.appId);

    const configManager = new AppConfigMetadataManager(settingsManager);

    const config = (await configManager.get(authData.saleorApiUrl)).getConfig();

    logger.debug("fetched settings");

    const baseUrl = getAppBaseUrl(req.headers);
    const enableWebhooks = isConfigured({
      configuration: {
        appId: config.appConfig?.appId,
        secretKey: config.appConfig?.secretKey,
      },
    });

    try {
      logger.debug("Running webhooks recreation");
      await webhooksToggler.recreateOwnWebhooks({ baseUrl: baseUrl, enableWebhooks });
      logger.debug("Webhooks recreated");
      return res.status(200).end();
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  };

export default withOtel(
  createProtectedHandler(
    recreateWebhooksHandlerFactory({
      settingsManagerFactory: createSettingsManager,
      webhookActivityTogglerFactory: function (appId, client) {
        return new WebhookActivityTogglerService(appId, client);
      },
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
  "/api/recreate-webhooks",
);
