import { AuthData } from "@saleor/app-sdk/APL";
import { AppConfigMetadataManager } from "../app-configuration/app-config-metadata-manager";
import { createSettingsManager } from "../../lib/metadata-manager";
import { AppConfig } from "../app-configuration/app-config";
import { createInstrumentedGraphqlClient } from "../../lib/create-instrumented-graphql-client";
import { createLogger } from "../../logger";

const logger = createLogger("GoogleFeedSettingsFetcher");

export class GoogleFeedSettingsFetcher {
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
    logger.debug("Fetching Google Feed settings");

    const configString = await this.settingsManager.get();

    if (!configString) {
      logger.error("The application has not been configured");
      throw new Error("App is not configured");
    }

    const appConfig = AppConfig.parse(configString);
    const channelConfig = appConfig.getUrlsForChannel(channelSlug);

    if (!channelConfig) {
      logger.error("Channel is not configured");
      throw new Error("App is not configured");
    }

    const storefrontUrl = channelConfig.storefrontUrl;
    const productStorefrontUrl = channelConfig.productStorefrontUrl;

    if (!storefrontUrl.length || !productStorefrontUrl.length) {
      logger.error("Storefront URLs are not configured");
      throw new Error("The application has not been configured");
    }

    const settings = {
      storefrontUrl,
      productStorefrontUrl,
      s3BucketConfiguration: appConfig.getS3Config(),
      attributeMapping: appConfig.getAttributeMapping(),
      titleTemplate: appConfig.getTitleTemplate(),
      imageSize: appConfig.getImageSize(),
    };

    logger.debug("Google Feed settings fetched successfully", { settings });

    return settings;
  }
}
