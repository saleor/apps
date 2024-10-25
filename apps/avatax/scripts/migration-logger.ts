// eslint-disable-next-line no-restricted-imports
import { attachLoggerVercelBuildTimeTransport, rootLogger } from "@saleor/apps-logger";

rootLogger.settings.maskValuesOfKeys = ["username", "password", "token"];

attachLoggerVercelBuildTimeTransport(rootLogger);

export const createMigrationScriptLogger = (name: string, params?: Record<string, unknown>) =>
  rootLogger.getSubLogger(
    {
      name: name,
    },
    params,
  );
