import { AuthData } from "@saleor/app-sdk/APL";
import { getTypesenseConfiguration } from "../lib/typesense/getTypesenseConfiguration";
import { ChannelsDocument } from "../../generated/graphql";
import { TypesenseSearchProvider } from "../lib/typesense/typesenseSearchProvider";
import { createInstrumentedGraphqlClient } from "../lib/create-instrumented-graphql-client";

/**
 * Fetches and creates all shared entities required by webhook to proceed
 */
export const createWebhookContext = async ({ authData }: { authData: AuthData }) => {
  const { settings, errors } = await getTypesenseConfiguration({ authData });
  const apiClient = createInstrumentedGraphqlClient({
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

  const typesenseClient = new TypesenseSearchProvider({
    apiKey: settings.appConfig.apiKey,
    host: settings.appConfig.host,
    port: settings.appConfig.port,
    protocol: settings.appConfig.protocol,
    connectionTimeoutSeconds: settings.appConfig.connectionTimeoutSeconds,
    channels,
    enabledKeys: settings.fieldsMapping.enabledTypesenseFields,
  });

  return {
    apiClient,
    channels,
    settings,
    typesenseClient,
  };
};
