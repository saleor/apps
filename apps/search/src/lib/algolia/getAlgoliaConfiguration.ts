import { AuthData } from "@saleor/app-sdk/APL";
import { createSettingsManager } from "../metadata";
import { AppConfigMetadataManager } from "../../modules/configuration/app-config-metadata-manager";
import { createLogger } from "../logger";
import { createInstrumentedGraphqlClient } from "../create-instrumented-graphql-client";

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
    const config = await configManager.get(authData.saleorApiUrl);

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
    logger.error("Failed to fetch configuration from metadata");

    return {
      errors: [
        {
          message: "Failed to load configuration",
        },
      ],
    };
  }
};
