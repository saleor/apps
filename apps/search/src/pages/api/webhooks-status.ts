import { createProtectedHandler, NextProtectedApiHandler } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { createClient } from "../../lib/graphql";
import { FetchOwnWebhooksDocument } from "../../../generated/graphql";
import { AlgoliaSearchProvider } from "../../lib/algolia/algoliaSearchProvider";
import { createSettingsManager } from "../../lib/metadata";
import { WebhookActivityTogglerService } from "../../domain/WebhookActivityToggler.service";
import { createLogger } from "../../lib/logger";

const logger = createLogger({
  service: "webhooksStatusHandler",
});

export const webhooksStatusHandler: NextProtectedApiHandler = async (req, res, ctx) => {
  const { authData } = ctx;
  const client = createClient(authData.saleorApiUrl, async () => ({
    token: authData.token,
  }));
  const webhooksToggler = new WebhookActivityTogglerService(authData.appId, client);

  const settingsManager = createSettingsManager(client);
  const domain = new URL(authData.saleorApiUrl).host;

  const settings = {
    secretKey: await settingsManager.get("secretKey", domain),
    appId: await settingsManager.get("appId", domain),
  };

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
    const algoliaService = new AlgoliaSearchProvider({
      appId: settings.appId,
      apiKey: settings.secretKey,
    });

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
    return res.status(500).end();
  }
};

export default createProtectedHandler(webhooksStatusHandler, saleorApp.apl, []);
