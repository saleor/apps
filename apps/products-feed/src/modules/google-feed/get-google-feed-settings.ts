import { AuthData } from "@saleor/app-sdk/APL";
import { AppConfigMetadataManager } from "../app-configuration/app-config-metadata-manager";
import { createSettingsManager } from "../../lib/metadata-manager";
import { AppConfig } from "../app-configuration/app-config";
import { createInstrumentedGraphqlClient } from "../../lib/create-instrumented-graphql-client";
import { createLogger } from "../../logger";

export class GoogleFeedSettingsFetcher {
  private logger = createLogger("GoogleFeedSettingsFetcher");

  static createFromAuthData(authData: AuthData) {
    const client = createInstrumentedGraphqlClient({
      saleorApiUrl: authData.saleorApiUrl,
      token: authData.token,
    });

    return new GoogleFeedSettingsFetcher({
      settingsManager: new AppConfigMetadataManager(createSettingsManager(client)),
    });
  }

  settingsManager: Pick<AppConfigMetadataManager, "get">;

  constructor(params: { settingsManager: Pick<AppConfigMetadataManager, "get"> }) {
    this.settingsManager = params.settingsManager;
  }

  async fetch(channelSlug: string) {
    this.logger.trace("Fetching Google Feed settings");

    const configString = await this.settingsManager.get();

    if (!configString) {
      throw new Error("App is not configured");
    }

    const appConfig = AppConfig.parse(configString);
    const channelConfig = appConfig.getUrlsForChannel(channelSlug);

    if (!channelConfig) {
      throw new Error("Channel is not configured");
    }

    const storefrontUrl = channelConfig.storefrontUrl;
    const productStorefrontUrl = channelConfig.productStorefrontUrl;

    if (!storefrontUrl.length || !productStorefrontUrl.length) {
      throw new Error("Storefront URLs are not configured");
    }

    const settings = {
      storefrontUrl,
      productStorefrontUrl,
      s3BucketConfiguration: appConfig.getS3Config(),
      attributeMapping: appConfig.getAttributeMapping(),
      titleTemplate: appConfig.getTitleTemplate(),
      imageSize: appConfig.getImageSize(),
    };

    this.logger.debug("Google Feed settings fetched successfully", { settings });

    return settings;
  }
}
