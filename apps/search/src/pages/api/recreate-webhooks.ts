import { createProtectedHandler, NextProtectedApiHandler } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { createSettingsManager } from "../../lib/metadata";
import {
  IWebhookActivityTogglerService,
  WebhookActivityTogglerService,
} from "../../domain/WebhookActivityToggler.service";
import { createLogger } from "../../lib/logger";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { createGraphQLClient } from "@saleor/apps-shared";
import { Client } from "urql";
import { getBaseUrl } from "../../lib/getBaseUrl";
import { isConfigured } from "../../lib/algolia/is-configured";

const logger = createLogger({
  service: "recreateWebhooksHandler",
});

/**
 * Simple dependency injection - factory injects all services, in tests everything can be configured without mocks
 */
type FactoryProps = {
  settingsManagerFactory: (client: Client) => SettingsManager;
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
    const settingsManager = settingsManagerFactory(client);

    const domain = new URL(authData.saleorApiUrl).host;

    const [secretKey, appId] = await Promise.all([
      settingsManager.get("secretKey", domain),
      settingsManager.get("appId", domain),
    ]);

    const settings = { secretKey, appId };

    logger.debug(settings, "fetched settings");

    const baseUrl = getBaseUrl(req.headers);
    const enableWebhooks = isConfigured({
      configuration: {
        appId: appId,
        secretKey: secretKey,
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

export default createProtectedHandler(
  recreateWebhooksHandlerFactory({
    settingsManagerFactory: createSettingsManager,
    webhookActivityTogglerFactory: function (appId, client) {
      return new WebhookActivityTogglerService(appId, client);
    },
    graphqlClientFactory(saleorApiUrl: string, token: string) {
      return createGraphQLClient({ saleorApiUrl, token });
    },
  }),
  saleorApp.apl,
  [],
);
