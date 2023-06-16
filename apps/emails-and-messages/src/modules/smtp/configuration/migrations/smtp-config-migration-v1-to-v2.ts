import { AppConfigPrivateMetadataManager } from "../../../app-configuration/app-config-metadata-manager";
import { AppConfig } from "../../../app-configuration/app-config-schema";
import { ChannelConfiguration } from "../../../channels/channel-configuration-schema";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { MjmlPrivateMetadataManager } from "../mjml-metadata-manager";
import { SmtpConfigV2 } from "./smtp-config-schema-v2";
import { getChannelsAssignedToConfigId } from "../../../app-configuration/migrations/get-channels-assigned-to-config-id";
import { smtpTransformV1toV2 } from "./smtp-transform-v1-to-v2";
import { createLogger } from "@saleor/apps-shared";

const logger = createLogger({
  name: "smtpConfigMigrationV1ToV2",
});

interface SmtpConfigMigrationV1ToV1Args {
  settingsManager: SettingsManager;
  saleorApiUrl: string;
}

export const smtpConfigMigrationV1ToV2 = async ({
  settingsManager,
  saleorApiUrl,
}: SmtpConfigMigrationV1ToV1Args) => {
  logger.debug("Hello, I'm migrating smtp config from v1 to v2");

  const appConfigManager = new AppConfigPrivateMetadataManager(settingsManager, saleorApiUrl);
  const metadataManagerV1 = new MjmlPrivateMetadataManager(settingsManager, saleorApiUrl);

  const configV1 = await metadataManagerV1.getConfig();

  if (!configV1) {
    logger.debug("No migration required - no previous data");
    return undefined;
  }

  const appConfigV1 = await appConfigManager.getConfig();

  const migratedConfigurationRoot = smtpTransformV1toV2({
    configV1,
    appConfigV1,
  });

  logger.debug("Migrated config v1 to v2!");
  return migratedConfigurationRoot;
};
