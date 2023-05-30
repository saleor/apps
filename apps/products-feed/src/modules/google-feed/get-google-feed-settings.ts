import { AuthData } from "@saleor/app-sdk/APL";
import { AppConfigMetadataManager } from "../app-configuration/app-config-metadata-manager";
import { createClient } from "../../lib/create-graphq-client";
import { createSettingsManager } from "../../lib/metadata-manager";
import { AppConfig } from "../app-configuration/app-config";

interface GetGoogleFeedSettingsArgs {
  authData: AuthData;
  channel: string;
}

/**
 * TODO Test
 */
export const getGoogleFeedSettings = async ({ authData, channel }: GetGoogleFeedSettingsArgs) => {
  // todo extract some helper to create this "context" in one place
  const client = createClient(authData.saleorApiUrl, async () =>
    Promise.resolve({ token: authData.token })
  );

  const metadataManager = new AppConfigMetadataManager(createSettingsManager(client));

  const configString = await metadataManager.get();

  if (!configString) {
    throw new Error("App is not configured");
  }

  const appConfig = AppConfig.parse(configString);
  const channelConfig = appConfig.getUrlsForChannel(channel);

  if (!channelConfig) {
    throw new Error("App is not configured");
  }

  const storefrontUrl = channelConfig.storefrontUrl;

  const productStorefrontUrl = channelConfig.productStorefrontUrl;

  if (!storefrontUrl.length || !productStorefrontUrl.length) {
    throw new Error("The application has not been configured");
  }

  return {
    storefrontUrl,
    productStorefrontUrl,
    s3BucketConfiguration: appConfig.getS3Config(),
  };
};
