import { AuthData } from "@saleor/app-sdk/APL";
import { AppConfigMetadataManager } from "../app-configuration/app-config-metadata-manager";
import { GraphqlClientFactory } from "../../lib/create-graphql-client";
import { createSettingsManager } from "../../lib/metadata-manager";
import { AppConfig } from "../app-configuration/app-config";

export class GoogleFeedSettingsFetcher {
  static createFromAuthData(authData: AuthData) {
    return new GoogleFeedSettingsFetcher({
      settingsManager: new AppConfigMetadataManager(
        createSettingsManager(GraphqlClientFactory.fromAuthData(authData)),
      ),
    });
  }

  settingsManager: Pick<AppConfigMetadataManager, "get">;

  constructor(params: { settingsManager: Pick<AppConfigMetadataManager, "get"> }) {
    this.settingsManager = params.settingsManager;
  }

  async fetch(channelSlug: string) {
    const configString = await this.settingsManager.get();

    if (!configString) {
      throw new Error("App is not configured");
    }

    const appConfig = AppConfig.parse(configString);
    const channelConfig = appConfig.getUrlsForChannel(channelSlug);

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
      attributeMapping: appConfig.getAttributeMapping(),
      titleTemplate: appConfig.getTitleTemplate(),
      imageSize: appConfig.getImageSize(),
    };
  }
}
