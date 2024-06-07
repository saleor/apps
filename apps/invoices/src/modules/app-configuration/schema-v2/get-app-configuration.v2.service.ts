import { createLogger } from "../../../logger";
import { createSettingsManager, SimpleGraphqlClient } from "../metadata-manager";
import { AppConfigV2 } from "./app-config";
import { AppConfigV2MetadataManager } from "./app-config-v2-metadata-manager";

export class GetAppConfigurationV2Service {
  private logger = createLogger("GetAppConfigurationV2Service");
  appConfigMetadataManager: AppConfigV2MetadataManager;

  constructor(
    private settings: {
      apiClient: SimpleGraphqlClient;
      saleorApiUrl: string;
    },
  ) {
    this.appConfigMetadataManager = new AppConfigV2MetadataManager(
      createSettingsManager(settings.apiClient),
    );
  }

  async getConfiguration() {
    const stringMetadata = await this.appConfigMetadataManager.get();

    if (stringMetadata) {
      this.logger.debug("Found app configuration v2 metadata");
      return AppConfigV2.parse(stringMetadata);
    } else {
      this.logger.debug("v2 metadata not found");
      return null;
    }
  }
}
