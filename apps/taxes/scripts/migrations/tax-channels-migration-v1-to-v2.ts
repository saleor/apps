import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { Logger, createLogger } from "../../src/lib/logger";
import { TaxChannelsPrivateMetadataManagerV1 } from "./tax-channels-metadata-manager-v1";
import { TaxChannelsPrivateMetadataManagerV2 } from "./tax-channels-metadata-manager-v2";
import { TaxChannelsTransformV1toV2 } from "./tax-channels-transform-v1-to-v2";

export class TaxChannelsV1toV2MigrationManager {
  private logger: Logger;
  constructor(
    private metadataManager: SettingsManager,
    private saleorApiUrl: string,
    private options: { mode: "report" | "migrate" } = { mode: "migrate" }
  ) {
    this.logger = createLogger({
      name: "TaxChannelsV1toV2MigrationManager",
    });
  }

  async migrateIfNeeded() {
    const taxChannelsManagerV1 = new TaxChannelsPrivateMetadataManagerV1(
      this.metadataManager,
      this.saleorApiUrl
    );

    const taxChannelsManagerV2 = new TaxChannelsPrivateMetadataManagerV2(
      this.metadataManager,
      this.saleorApiUrl
    );

    const currentConfig = await taxChannelsManagerV2.getConfig();

    if (currentConfig) {
      this.logger.info("Migration is not necessary, we have current config.");
      return currentConfig;
    }

    const previousChannelConfig = await taxChannelsManagerV1.getConfig();

    if (!previousChannelConfig) {
      this.logger.info("Previous config not found. Migration not possible.");
      return;
    }

    this.logger.info("Previous config found. Migrating...");

    const transformer = new TaxChannelsTransformV1toV2();
    const nextConfig = transformer.transform(previousChannelConfig);

    if (this.options.mode === "migrate") {
      await taxChannelsManagerV2.setConfig(nextConfig);
    }

    return nextConfig;
  }
}
