import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { Logger, createLogger } from "../../src/lib/logger";
import { TaxProvidersPrivateMetadataManagerV1 } from "./tax-providers-metadata-manager-v1";
import { TaxProvidersPrivateMetadataManagerV2 } from "./tax-providers-metadata-manager-v2";
import { TaxProvidersV1ToV2Transformer } from "./tax-providers-transform-v1-to-v2";
import { TaxChannelsPrivateMetadataManagerV1 } from "./tax-channels-metadata-manager-v1";

export class TaxProvidersMigrationV1toV2Manager {
  private logger: Logger;
  constructor(private metadataManager: SettingsManager, private saleorApiUrl: string) {
    this.logger = createLogger({
      location: "TaxProvidersMigrationV1toV2Manager",
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
      this.logger.info("Migration is not necessary, we have current config.");
      return currentTaxProvidersConfig;
    }

    this.logger.info("Current config not found.");

    const previousTaxProvidersConfig = await taxProvidersManagerV1.getConfig();
    const previousChannelConfig = await taxChannelsManagerV1.getConfig();

    if (!previousTaxProvidersConfig || !previousChannelConfig) {
      throw new Error("Previous config not found. Migration not possible.");
    }

    this.logger.info("Previous config found. Migrating...");

    const transformer = new TaxProvidersV1ToV2Transformer();
    const nextConfig = transformer.transform(previousTaxProvidersConfig, previousChannelConfig);

    await taxProvidersManagerV2.setConfig(nextConfig);
  }
}
