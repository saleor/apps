import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { Logger, createLogger } from "../../src/lib/logger";
import { TaxProvidersPrivateMetadataManagerV1 } from "./tax-providers-metadata-manager-v1";
import { TaxProvidersPrivateMetadataManagerV2 } from "./tax-providers-metadata-manager-v2";
import { TaxProvidersV1ToV2Transformer } from "./tax-providers-transform-v1-to-v2";
import { TaxChannelsPrivateMetadataManagerV1 } from "./tax-channels-metadata-manager-v1";

export class TaxProvidersV1toV2MigrationManager {
  private logger: Logger;
  constructor(
    private metadataManager: SettingsManager,
    private saleorApiUrl: string,
    private options: { mode: "report" | "migrate" } = { mode: "migrate" }
  ) {
    this.logger = createLogger({
      name: "TaxProvidersV1toV2MigrationManager",
    });
  }

  async migrateIfNeeded() {
    const taxProvidersManagerV1 = new TaxProvidersPrivateMetadataManagerV1(
      this.metadataManager,
      this.saleorApiUrl
    );
    const taxProvidersManagerV2 = new TaxProvidersPrivateMetadataManagerV2(
      this.metadataManager,
      this.saleorApiUrl
    );

    const taxChannelsManagerV1 = new TaxChannelsPrivateMetadataManagerV1(
      this.metadataManager,
      this.saleorApiUrl
    );

    const currentTaxProvidersConfig = await taxProvidersManagerV2.getConfig();

    if (currentTaxProvidersConfig) {
      this.logger.info("Migration is not necessary, the config is up to date.");
      return;
    }

    this.logger.info("Current config not found.");

    const previousTaxProvidersConfig = await taxProvidersManagerV1.getConfig();
    const previousChannelConfig = await taxChannelsManagerV1.getConfig();

    if (!previousTaxProvidersConfig || !previousChannelConfig) {
      this.logger.info(
        { previousChannelConfig, previousTaxProvidersConfig },
        "Previous config not found. Migration not possible."
      );
      return;
    }

    this.logger.info("Previous config found. Migrating...");

    const transformer = new TaxProvidersV1ToV2Transformer();
    const nextConfig = transformer.transform(previousTaxProvidersConfig, previousChannelConfig);

    if (this.options.mode === "migrate") {
      await taxProvidersManagerV2.setConfig(nextConfig);
    }

    return nextConfig;
  }
}
