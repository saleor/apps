import { AppConfig } from "../../../app-configuration/app-config-schema";
import { getChannelsAssignedToConfigId } from "../../../app-configuration/migrations/get-channels-assigned-to-config-id";
import { MjmlConfig } from "./mjml-config-schema-v1";
import { SmtpConfigV2 } from "./smtp-config-schema-v2";

interface SmtpTransformV1toV2Args {
  configV1: MjmlConfig;
  appConfigV1?: AppConfig;
}

export const smtpTransformV1toV2 = ({ configV1, appConfigV1 }: SmtpTransformV1toV2Args) => {
  const migratedConfigurationRoot: SmtpConfigV2 = {
    configurations: [],
  };

  configV1.configurations.forEach((config) => {
    const channels = getChannelsAssignedToConfigId(config.id, "mjml", appConfigV1);

    migratedConfigurationRoot.configurations.push({
      id: config.id,
      name: config.configurationName,
      active: config.active,
      channels,
      senderEmail: config.senderEmail,
      senderName: config.senderName,
      events: config.events,
      encryption: config.encryption,
      smtpHost: config.smtpHost,
      smtpPort: config.smtpPort,
      smtpPassword: config.smtpPassword,
      smtpUser: config.smtpUser,
    });
  });

  return migratedConfigurationRoot;
};
