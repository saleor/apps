import { createProtectedHandler, NextJsProtectedApiHandler } from "@saleor/app-sdk/handlers/next";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";
import { Client } from "urql";

import { ChannelsDocument } from "../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";
import { AlgoliaSearchProvider } from "../../lib/algolia/algoliaSearchProvider";
import { createInstrumentedGraphqlClient } from "../../lib/create-instrumented-graphql-client";
import { createLogger } from "../../lib/logger";
import { loggerContext } from "../../lib/logger-context";
import { createSettingsManager } from "../../lib/metadata";
import { createTraceEffect } from "../../lib/trace-effect";
import { AppConfigMetadataManager } from "../../modules/configuration/app-config-metadata-manager";

const logger = createLogger("setupIndicesHandler");

const traceGetMetadata = createTraceEffect({ name: "Saleor getAppMetadata" });
const traceFetchChannels = createTraceEffect({ name: "Saleor fetchChannels" });

/**
 * Simple dependency injection - factory injects all services, in tests everything can be configured without mocks
 */
type FactoryProps = {
  settingsManagerFactory: (client: Client, appId: string) => SettingsManager;
  graphqlClientFactory: (saleorApiUrl: string, token: string) => Client;
};

export const setupIndicesHandlerFactory =
  ({ settingsManagerFactory, graphqlClientFactory }: FactoryProps): NextJsProtectedApiHandler =>
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
      traceGetMetadata(() => configManager.get(authData.saleorApiUrl), {
        saleorApiUrl: authData.saleorApiUrl,
      }),
      traceFetchChannels(() => client.query(ChannelsDocument, {}).toPromise(), {
        saleorApiUrl: authData.saleorApiUrl,
      }),
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
      logger.error("Failed to update Algolia indices", { error: e });

      return res.status(500).end();
    }
  };

export default wrapWithLoggerContext(
  withSpanAttributes(
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
  ),
  loggerContext,
);
