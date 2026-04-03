import { type AuthData } from "@saleor/app-sdk/APL";

import { AppConfigMetadataManager } from "../../modules/configuration/app-config-metadata-manager";
import { createInstrumentedGraphqlClient } from "../create-instrumented-graphql-client";
import { createLogger } from "../logger";
import { createSettingsManager } from "../metadata";
import { createTraceEffect } from "../trace-effect";

const traceSaleorMetadata = createTraceEffect({ name: "Saleor getAppMetadata" });

interface GetAlgoliaConfigurationArgs {
  authData: AuthData;
}

const logger = createLogger("getAlgoliaConfiguration");

export const getAlgoliaConfiguration = async ({ authData }: GetAlgoliaConfigurationArgs) => {
  const client = createInstrumentedGraphqlClient({
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
  });

  const settings = createSettingsManager(client, authData.appId);
  const configManager = new AppConfigMetadataManager(settings);

  try {
    const config = await traceSaleorMetadata(() => configManager.get(authData.saleorApiUrl), {
      saleorApiUrl: authData.saleorApiUrl,
    });

    if (config.getConfig()) {
      return {
        settings: config.getConfig(),
      };
    } else {
      return {
        errors: [
          {
            message: "App is not configued. Please configue the app first",
          },
        ],
      };
    }
  } catch (e) {
    const networkError =
      e instanceof Error && "networkError" in e && e.networkError instanceof Error
        ? e.networkError
        : undefined;

    logger.error("Failed to fetch configuration from metadata", {
      errorMessage: e instanceof Error ? e.message : String(e),
      networkErrorMessage: networkError?.message,
      networkErrorCause: networkError?.cause,
    });

    return {
      errors: [
        {
          message: "Failed to load configuration",
          cause: e,
        },
      ],
    };
  }
};
