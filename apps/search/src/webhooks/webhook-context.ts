import { AuthData } from "@saleor/app-sdk/APL";
import { getAlgoliaConfiguration } from "../lib/algolia/getAlgoliaConfiguration";
import { createGraphQLClient } from "@saleor/apps-shared";
import { ChannelsDocument } from "../../generated/graphql";
import { AlgoliaSearchProvider } from "../lib/algolia/algoliaSearchProvider";

/**
 * Fetches and creates all shared entities required by webhook to proceed
 */
export const createWebhookContext = async ({ authData }: { authData: AuthData }) => {
  const { settings, errors } = await getAlgoliaConfiguration({ authData });
  const apiClient = createGraphQLClient({
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
  });
  const { data: channelsData } = await apiClient.query(ChannelsDocument, {}).toPromise();
  const channels = channelsData?.channels || [];

  if (!settings || errors) {
    let errorMessage = "Error fetching settings";

    if (errors && errors.length > 0 && errors[0].message) {
      errorMessage = errors[0].message;
    }

    throw new Error(errorMessage);
  }

  if (!settings.appConfig) {
    throw new Error("App not configured");
  }

  const algoliaClient = new AlgoliaSearchProvider({
    appId: settings.appConfig?.appId,
    apiKey: settings.appConfig?.secretKey,
    indexNamePrefix: settings.appConfig?.indexNamePrefix,
    channels,
    enabledKeys: settings.fieldsMapping.enabledAlgoliaFields,
  });

  return {
    apiClient,
    channels,
    settings,
    algoliaClient,
  };
};
