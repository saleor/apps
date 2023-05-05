import { Client } from "urql";
import { createLogger } from "@saleor/apps-shared";
import { AppConfigV2MetadataManager } from "./app-config-v2-metadata-manager";
import { createSettingsManager } from "../metadata-manager";
import { AppConfigV2 } from "./app-config";

// todo test
export class GetAppConfigurationV2Service {
  constructor(
    private settings: {
      apiClient: Client;
      saleorApiUrl: string;
    }
  ) {}

  async getConfiguration() {
    const logger = createLogger({
      service: "GetAppConfigurationV2Service",
      saleorApiUrl: this.settings.saleorApiUrl,
    });

    const { apiClient } = this.settings;

    const metadataManager = new AppConfigV2MetadataManager(createSettingsManager(apiClient));

    const stringMetadata = await metadataManager.get();

    if (stringMetadata) {
      return AppConfigV2.parse(stringMetadata);
    } else {
      return new AppConfigV2();
    }
  }
}
