import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { SmtpConfig } from "./smtp-config-schema";
import { SmtpPrivateMetadataManagerV2 } from "./smtp-metadata-manager-v2";
import { smtpConfigMigrationV1ToV2 } from "./migrations/smtp-config-migration-v1-to-v2";
import { createLogger } from "../../../logger";

const logger = createLogger("SmtpPrivateMetadataManager");

export class SmtpPrivateMetadataManager {
  private metadataKey = "smtp-config-v2";

  constructor(
    private metadataManager: SettingsManager,
    private saleorApiUrl: string,
  ) {}

  async getConfig() {
    logger.debug("Fetching config in the current version");

    const currentVersionManager = new SmtpPrivateMetadataManagerV2(
      this.metadataManager,
      this.saleorApiUrl,
    );

    const currentVersionConfig = await currentVersionManager.getConfig();

    if (currentVersionConfig) {
      // We have the current version, no need to migrate so we can return it
      return currentVersionConfig;
    }

    logger.debug("No config in the current version, trying to migrate from v1");
    // TODO: MIGRATION CODE FROM CONFIG VERSION V1. REMOVE AFTER MIGRATION
    const migratedSchema = await smtpConfigMigrationV1ToV2({
      saleorApiUrl: this.saleorApiUrl,
      settingsManager: this.metadataManager,
    });

    return migratedSchema;
  }

  setConfig(config: SmtpConfig): Promise<void> {
    return this.metadataManager.set({
      key: this.metadataKey,
      value: JSON.stringify(config),
      domain: this.saleorApiUrl,
    });
  }
}
