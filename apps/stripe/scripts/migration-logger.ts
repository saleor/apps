import { attachLoggerVercelBuildtimeTransport, rootLogger } from "@saleor/apps-logger";

rootLogger.settings.maskValuesOfKeys = ["username", "password", "token"];

attachLoggerVercelBuildtimeTransport(rootLogger);

export const createMigrationScriptLogger = (name: string, params?: Record<string, unknown>) =>
  rootLogger.getSubLogger(
    {
      name: name,
    },
    params,
  );
