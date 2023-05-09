import { createLogger } from "@saleor/apps-shared";
import { AppConfigV2MetadataManager } from "./app-config-v2-metadata-manager";
import { createSettingsManager, SimpleGraphqlClient } from "../metadata-manager";
import { AppConfigV2 } from "./app-config";

export class GetAppConfigurationV2Service {
  appConfigMetadataManager: AppConfigV2MetadataManager;

  constructor(
    private settings: {
      apiClient: SimpleGraphqlClient;
      saleorApiUrl: string;
    }
  ) {
    this.appConfigMetadataManager = new AppConfigV2MetadataManager(
      createSettingsManager(settings.apiClient)
    );
  }

  async getConfiguration() {
    const logger = createLogger({
      service: "GetAppConfigurationV2Service",
      saleorApiUrl: this.settings.saleorApiUrl,
    });

    const stringMetadata = await this.appConfigMetadataManager.get();

    if (stringMetadata) {
      logger.debug("Found app configuration v2 metadata");
      return AppConfigV2.parse(stringMetadata);
    } else {
      logger.debug("v2 metadata not found");
      return null;
    }
  }
}
