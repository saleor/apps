import { attachLoggerVercelBuildtimeTransport } from "@saleor/apps-logger/src/logger-vercel-buildtime-transport";
import { rootLogger } from "@saleor/apps-logger/src/root-logger";

rootLogger.settings.maskValuesOfKeys = ["username", "password", "token"];

attachLoggerVercelBuildtimeTransport(rootLogger);

export const createMigrationScriptLogger = (name: string, params?: Record<string, unknown>) =>
  rootLogger.getSubLogger(
    {
      name: name,
    },
    params,
  );
