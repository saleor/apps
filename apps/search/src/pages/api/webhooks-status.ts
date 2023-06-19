import { createProtectedHandler, NextProtectedApiHandler } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { FetchOwnWebhooksDocument } from "../../../generated/graphql";
import { AlgoliaSearchProvider } from "../../lib/algolia/algoliaSearchProvider";
import { createSettingsManager } from "../../lib/metadata";
import {
  IWebhookActivityTogglerService,
  WebhookActivityTogglerService,
} from "../../domain/WebhookActivityToggler.service";
import { createLogger } from "../../lib/logger";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { SearchProvider } from "../../lib/searchProvider";
import { createGraphQLClient } from "@saleor/apps-shared";
import { Client } from "urql";

const logger = createLogger({
  service: "webhooksStatusHandler",
});

/**
 * Simple dependency injection - factory injects all services, in tests everything can be configured without mocks
 */
type FactoryProps = {
  settingsManagerFactory: (client: Client) => SettingsManager;
  webhookActivityTogglerFactory: (appId: string, client: Client) => IWebhookActivityTogglerService;
  algoliaSearchProviderFactory: (appId: string, apiKey: string) => Pick<SearchProvider, "ping">;
  graphqlClientFactory: (saleorApiUrl: string, token: string) => Client;
};

export const webhooksStatusHandlerFactory =
  ({
    settingsManagerFactory,
    webhookActivityTogglerFactory,
    algoliaSearchProviderFactory,
    graphqlClientFactory,
  }: FactoryProps): NextProtectedApiHandler =>
  async (req, res, { authData }) => {
    /**
     * Initialize services
     */
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

    /**
     * If settings are incomplete, disable webhooks
     *
     * TODO Extract config operations to domain/
     */
    if (!settings.appId || !settings.secretKey) {
      logger.debug("Settings not set, will disable webhooks");

      await webhooksToggler.disableOwnWebhooks();
    } else {
      /**
       * Otherwise, if settings are set, check in Algolia if tokens are valid
       */
      const algoliaService = algoliaSearchProviderFactory(settings.appId, settings.secretKey);

      try {
        logger.debug("Settings set, will ping Algolia");

        await algoliaService.ping();
      } catch (e) {
        logger.debug("Algolia ping failed, will disable webhooks");
        /**
         * If credentials are invalid, also disable webhooks
         */
        await webhooksToggler.disableOwnWebhooks();
      }
    }

    try {
      logger.debug("Settings and Algolia are correct, will fetch Webhooks from Saleor");

      const webhooks = await client
        .query(FetchOwnWebhooksDocument, { id: authData.appId })
        .toPromise()
        .then((r) => r.data?.app?.webhooks);

      if (!webhooks) {
        return res.status(500).end();
      }

      return res.status(200).json(webhooks);
    } catch (e) {
      console.error(e);
      return res.status(500).end();
    }
  };

export default createProtectedHandler(
  webhooksStatusHandlerFactory({
    settingsManagerFactory: createSettingsManager,
    webhookActivityTogglerFactory: function (appId, client) {
      return new WebhookActivityTogglerService(appId, client);
    },
    algoliaSearchProviderFactory(appId, apiKey) {
      return new AlgoliaSearchProvider({ appId, apiKey });
    },
    graphqlClientFactory(saleorApiUrl: string, token: string) {
      return createGraphQLClient({ saleorApiUrl, token });
    },
  }),
  saleorApp.apl,
  []
);
