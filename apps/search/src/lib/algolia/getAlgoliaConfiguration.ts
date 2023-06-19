import { AuthData } from "@saleor/app-sdk/APL";
import { createDebug } from "../debug";
import { createSettingsManager } from "../metadata";
import { createGraphQLClient } from "@saleor/apps-shared";

interface GetAlgoliaConfigurationArgs {
  authData: AuthData;
}

const debug = createDebug("getAlgoliaConfiguration");

export const getAlgoliaConfiguration = async ({ authData }: GetAlgoliaConfigurationArgs) => {
  const client = createGraphQLClient({
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
  });

  const settings = createSettingsManager(client);

  try {
    const secretKey = await settings.get("secretKey", authData.domain);

    if (!secretKey?.length) {
      return {
        errors: [
          {
            message:
              "Missing secret key to the Algolia API. Please, configure the application first.",
          },
        ],
      };
    }

    const appId = await settings.get("appId", authData.domain);

    if (!appId?.length) {
      return {
        errors: [
          {
            message: "Missing App ID to the Algolia API. Please, configure the application first.",
          },
        ],
      };
    }

    const indexNamePrefix = (await settings.get("indexNamePrefix", authData.domain)) || "";

    debug("Configuration fetched");
    return {
      settings: {
        appId,
        secretKey,
        indexNamePrefix,
      },
    };
  } catch (error) {
    debug("Unexpected error during fetching the configuration");
    if (error instanceof Error) {
      debug(error.message);
    }
    return {
      errors: [{ message: "Couldn't fetch the settings from the API" }],
    };
  }
};
