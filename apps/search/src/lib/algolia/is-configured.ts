import { AppConfigurationFields, AppConfigurationSchema } from "../../domain/configuration";

interface isConfiguredArgs {
  configuration: Partial<AppConfigurationFields> | undefined;
}

// Checks if the app configuration is set up
export const isConfigured = ({ configuration }: isConfiguredArgs) => {
  if (!configuration) {
    return false;
  }
  return AppConfigurationSchema.safeParse(configuration).success;
};
