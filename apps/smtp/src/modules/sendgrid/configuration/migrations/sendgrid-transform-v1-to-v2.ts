import { AppConfig } from "../../../app-configuration/app-config-schema";
import { getChannelsAssignedToConfigId } from "../../../app-configuration/migrations/get-channels-assigned-to-config-id";
import { SendgridConfigV1 } from "./sendgrid-config-schema-v1";
import { SendgridConfigV2 } from "./sendgrid-config-schema-v2";

interface SendgridTransformV1toV2Args {
  configV1: SendgridConfigV1;
  appConfigV1?: AppConfig;
}

export const sendgridTransformV1toV2 = ({ configV1, appConfigV1 }: SendgridTransformV1toV2Args) => {
  const migratedConfigurationRoot: SendgridConfigV2 = {
    configurations: [],
  };

  configV1.configurations.forEach((config) => {
    const channels = getChannelsAssignedToConfigId(config.id, "sendgrid", appConfigV1);

    migratedConfigurationRoot.configurations.push({
      id: config.id,
      name: config.configurationName,
      active: config.active,
      apiKey: config.apiKey,
      channels,
      sandboxMode: config.sandboxMode,
      senderEmail: config.senderEmail,
      senderName: config.senderName,
      events: config.events,
    });
  });

  return migratedConfigurationRoot;
};
