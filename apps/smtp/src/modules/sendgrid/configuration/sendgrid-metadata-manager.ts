import { SendgridConfig } from "./sendgrid-config-schema";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { SendgridPrivateMetadataManagerV2 } from "./sendgrid-metadata-manager-v2";
import { sendgridConfigMigrationV1ToV2 } from "./migrations/sendgrid-config-migration-v1-to-v2";
import { createLogger } from "../../../logger";

const logger = createLogger("SendgridPrivateMetadataManager");

export class SendgridPrivateMetadataManager {
  private metadataKey = "sendgrid-config-v2";

  constructor(
    private metadataManager: SettingsManager,
    private saleorApiUrl: string,
  ) {}

  async getConfig() {
    logger.debug("Fetching config in the current version");

    const currentVersionManager = new SendgridPrivateMetadataManagerV2(
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
    const migratedSchema = await sendgridConfigMigrationV1ToV2({
      saleorApiUrl: this.saleorApiUrl,
      settingsManager: this.metadataManager,
    });

    return migratedSchema;
  }

  setConfig(config: SendgridConfig): Promise<void> {
    return this.metadataManager.set({
      key: this.metadataKey,
      value: JSON.stringify(config),
      domain: this.saleorApiUrl,
    });
  }
}
