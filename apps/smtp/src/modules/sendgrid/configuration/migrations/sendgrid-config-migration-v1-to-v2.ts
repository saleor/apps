import { AppConfigPrivateMetadataManager } from "../../../app-configuration/app-config-metadata-manager";
import { SendgridPrivateMetadataManagerV1 } from "../sendgrid-metadata-manager-v1";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { sendgridTransformV1toV2 } from "./sendgrid-transform-v1-to-v2";
import { createLogger } from "../../../../logger";

const logger = createLogger("sendgridConfigMigrationV1ToV2");

interface SendgridConfigMigrationV1ToV1Args {
  settingsManager: SettingsManager;
  saleorApiUrl: string;
}

export const sendgridConfigMigrationV1ToV2 = async ({
  settingsManager,
  saleorApiUrl,
}: SendgridConfigMigrationV1ToV1Args) => {
  logger.debug("Detect if theres data to migrate");

  const appConfigManager = new AppConfigPrivateMetadataManager(settingsManager, saleorApiUrl);
  const metadataManagerV1 = new SendgridPrivateMetadataManagerV1(settingsManager, saleorApiUrl);

  const configV1 = await metadataManagerV1.getConfig();

  if (!configV1) {
    logger.debug("No migration required - no previous data");
    return undefined;
  }

  logger.debug("Migrating data");
  const appConfigV1 = await appConfigManager.getConfig();
  const migratedConfigurationRoot = sendgridTransformV1toV2({ configV1, appConfigV1 });

  logger.debug("Data transformed");
  return migratedConfigurationRoot;
};
