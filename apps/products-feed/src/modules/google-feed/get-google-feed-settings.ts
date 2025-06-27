import { AuthData } from "@saleor/app-sdk/APL";

import { createInstrumentedGraphqlClient } from "../../lib/create-instrumented-graphql-client";
import { createSettingsManager } from "../../lib/metadata-manager";
import { createLogger } from "../../logger";
import { AppConfig } from "../app-configuration/app-config";
import { AppConfigMetadataManager } from "../app-configuration/app-config-metadata-manager";

export class GoogleFeedSettingsFetcher {
  private logger = createLogger("GoogleFeedSettingsFetcher");
  private cachedConfig: AppConfig | null = null;

  static createFromAuthData(authData: Pick<AuthData, "saleorApiUrl" | "token">) {
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

  private async fetchAppConfig() {
    const configString = await this.settingsManager.get();

    if (!configString) {
      throw new Error("App is not configured");
    }

    const appConfig = AppConfig.parse(configString);

    return appConfig;
  }

  async fetch(channelSlug: string) {
    this.logger.trace("Fetching Google Feed settings");

    const appConfig = this.cachedConfig ?? (await this.fetchAppConfig());

    this.cachedConfig = appConfig;

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
