import { createProtectedHandler, NextProtectedApiHandler } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { createSettingsManager } from "../../lib/metadata";
import { createLogger } from "../../lib/logger";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { Client } from "urql";
import { ChannelsDocument } from "../../../generated/graphql";
import { AlgoliaSearchProvider } from "../../lib/algolia/algoliaSearchProvider";
import { AppConfigMetadataManager } from "../../modules/configuration/app-config-metadata-manager";
import { withOtel } from "@saleor/apps-otel";
import { createInstrumentedGraphqlClient } from "../../lib/create-instrumented-graphql-client";
import { loggerContext } from "../../lib/logger-context";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";

const logger = createLogger("setupIndicesHandler");

/**
 * Simple dependency injection - factory injects all services, in tests everything can be configured without mocks
 */
type FactoryProps = {
  settingsManagerFactory: (client: Client, appId: string) => SettingsManager;
  graphqlClientFactory: (saleorApiUrl: string, token: string) => Client;
};

export const setupIndicesHandlerFactory =
  ({ settingsManagerFactory, graphqlClientFactory }: FactoryProps): NextProtectedApiHandler =>
  async (req, res, { authData }) => {
    if (req.method !== "POST") {
      logger.debug("Request method is different than POST, returning 405");

      return res.status(405).end();
    }

    logger.info("Fetching settings");

    const client = graphqlClientFactory(authData.saleorApiUrl, authData.token);
    const settingsManager = settingsManagerFactory(client, authData.appId);
    const configManager = new AppConfigMetadataManager(settingsManager);

    const [config, channelsRequest] = await Promise.all([
      configManager.get(authData.saleorApiUrl),
      client.query(ChannelsDocument, {}).toPromise(),
    ]);

    const configData = config.getConfig();

    if (!configData.appConfig) {
      logger.info("Missing config, returning 400");

      return res.status(400).end();
    }

    const channels = channelsRequest.data?.channels || [];

    const algoliaClient = new AlgoliaSearchProvider({
      appId: configData.appConfig.appId,
      apiKey: configData.appConfig.secretKey,
      indexNamePrefix: configData.appConfig.indexNamePrefix,
      channels,
      enabledKeys: configData.fieldsMapping.enabledAlgoliaFields,
    });

    try {
      logger.info("Running indices update");

      await algoliaClient.updateIndicesSettings();

      logger.info("Indices updated");

      return res.status(200).end();
    } catch (e) {
      logger.error("Failed to update Algolia indicies", { error: e });

      return res.status(500).end();
    }
  };

export default wrapWithLoggerContext(
  withOtel(
    createProtectedHandler(
      setupIndicesHandlerFactory({
        settingsManagerFactory: createSettingsManager,
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
    "api/setup-indices",
  ),
  loggerContext,
);
